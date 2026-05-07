# Custom RHCL Console

A custom OpenShift Console dynamic plugin for
[Red Hat Connectivity Link](https://docs.kuadrant.io) (RHCL / Kuadrant).
It surfaces operationally critical data — hostnames, attached policies,
effective policy resolution, TLS/DNS health, traffic metrics, and API
Products — on a single screen, using the logged-in user's RBAC throughout.

## What it provides

| Interface | Views | Audience |
|---|---|---|
| **Technical Resources** | Overview, Gateways, HTTPRoutes, Policies, Topology | Platform SREs, app operators |
| **API Products** | API Product list, API Overview (address, paths, plans, auth, traffic, API keys) | API product owners, PoC reviewers |

Key capabilities:

- Live-watched Gateway and HTTPRoute lists with hostname-first columns.
- Policy attachment view per resource, including effective policy stack
  after Kuadrant merge/override resolution.
- TLS certificate health (14-day warning / 3-day critical) and DNS
  propagation status per Gateway.
- Topology graph (Gateway → HTTPRoute → Service) with policy decorations.
- Traffic panels (req/s, 2xx/4xx/5xx, p50/p95/p99 latency) sourced from
  in-cluster Prometheus via Envoy sidecar metrics.
- Business-friendly API Products interface without YAML exposure, including
  plan cards, API key management with approve/reject flows, and traffic
  sparklines.
- RBAC-aware everywhere: empty states explain the missing permission
  instead of showing 403 toasts, action buttons are disabled with a tooltip
  when the user lacks the verb.

See [SPECIFICATION.md](SPECIFICATION.md) for the full requirements
(FR-001 through FR-026, NFR-001 through NFR-011).

## Prerequisites

| Requirement | Minimum version |
|---|---|
| OpenShift | 4.19+ |
| Kuadrant operator (RHCL) | Installed and configured with at least one Gateway |
| User-workload monitoring | Optional — metrics panels degrade gracefully without it |
| Node.js (local dev only) | 22+ |
| `oc` CLI | 4.19+ |
| Podman or Docker | For building the container image |

## Project layout

```
custom-rhcl-console/
├── SPECIFICATION.md          # Authoritative spec — all PRs cite FR/NFR
├── README.md                 # This file
└── console-plugin/           # OpenShift Console dynamic plugin (React/TS)
    ├── package.json          # consolePlugin metadata + dependencies
    ├── console-extensions.json
    ├── webpack.config.ts
    ├── tsconfig.json
    ├── Dockerfile
    ├── locales/en/            # i18n catalog (en; structured for pt-BR)
    └── src/
        ├── components/        # Page and shared UI components
        ├── hooks/             # useResourceWithRBAC, useAttachedPolicies, …
        ├── models/            # K8s GVK constants for all watched CRDs
        ├── types/             # TypeScript interfaces for Gateway API + Kuadrant CRDs
        └── utils/             # Policy merge, hostname helpers, PromQL builders
```

## Local development

You need two terminals — one for the plugin dev server, one for a local
OpenShift Console that loads the plugin.

**Terminal 1 — plugin dev server:**

```bash
cd console-plugin
npm install
npm run start          # webpack-dev-server on http://localhost:9001
```

**Terminal 2 — local OpenShift Console:**

```bash
oc login <cluster-api-url>
cd console-plugin
./start-console.sh     # pulls and runs the Console container image
```

This runs the OpenShift Console in a container (via Podman or Docker),
connected to your cluster's API server and loading the plugin from
`http://localhost:9001`. Open http://localhost:9000 in your browser.

> The script reads the cluster endpoint and token from your current
> `oc` session. Make sure you are logged in before running it.

### Other scripts

| Command | Description |
|---|---|
| `npm run build` | Production webpack build (output in `dist/`) |
| `npm run build-dev` | Development build (source maps, no minification) |
| `npm test` | Run Jest unit tests |
| `npm run lint` | ESLint with auto-fix |

## Building the container image

The plugin ships as an nginx container that serves the static webpack
output. Build it from the `console-plugin/` directory:

```bash
cd console-plugin

podman build -t quay.io/<org>/custom-rhcl-console:latest .
podman push quay.io/<org>/custom-rhcl-console:latest
```

The two-stage Dockerfile uses `ubi9/nodejs-22` for the build and
`ubi9/nginx-120` for the runtime image.

## Deploying to OpenShift

### 1. Create namespace and deploy the plugin server

```bash
export RHCL_CONSOLE_NS=custom-rhcl-console
export RHCL_CONSOLE_IMAGE=quay.io/<org>/custom-rhcl-console:latest

oc new-project "$RHCL_CONSOLE_NS" || true

cat <<EOF | oc apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: custom-rhcl-console
  namespace: $RHCL_CONSOLE_NS
  labels:
    app: custom-rhcl-console
spec:
  replicas: 1
  selector:
    matchLabels:
      app: custom-rhcl-console
  template:
    metadata:
      labels:
        app: custom-rhcl-console
    spec:
      containers:
        - name: custom-rhcl-console
          image: $RHCL_CONSOLE_IMAGE
          ports:
            - containerPort: 8080
              protocol: TCP
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 200m
              memory: 128Mi
---
apiVersion: v1
kind: Service
metadata:
  name: custom-rhcl-console
  namespace: $RHCL_CONSOLE_NS
  labels:
    app: custom-rhcl-console
spec:
  selector:
    app: custom-rhcl-console
  ports:
    - port: 9001
      targetPort: 8080
      protocol: TCP
EOF
```

### 2. Register the ConsolePlugin

```bash
cat <<EOF | oc apply -f -
apiVersion: console.openshift.io/v1
kind: ConsolePlugin
metadata:
  name: custom-rhcl-console
spec:
  displayName: Connectivity Link
  backend:
    type: Service
    service:
      name: custom-rhcl-console
      namespace: $RHCL_CONSOLE_NS
      port: 9001
      basePath: /
EOF
```

### 3. Enable the plugin on the cluster

```bash
oc patch console.operator.openshift.io cluster \
  --type=json \
  --patch='[{"op":"add","path":"/spec/plugins/-","value":"custom-rhcl-console"}]'
```

After a few seconds the OpenShift Console reloads and the
**Connectivity Link** section appears in the admin navigation sidebar.

### Verification

1. Open the OpenShift Console and navigate to **Connectivity Link → Overview**.
2. Confirm the gateway summary cards render (or an RBAC empty state if the
   user lacks `list` on `gateway.networking.k8s.io/gateways`).
3. Navigate to **Gateways** — hostnames should be visible inline on every row.
4. Navigate to **API Products** — the business-friendly interface should show
   without any YAML or raw Kubernetes terminology.

## Removing the plugin

```bash
# Remove the plugin from the console
oc patch console.operator.openshift.io cluster \
  --type=json \
  --patch='[{"op":"test","path":"/spec/plugins","value":["custom-rhcl-console"]},{"op":"remove","path":"/spec/plugins/0"}]' \
  2>/dev/null || \
oc get console.operator.openshift.io cluster -o json \
  | jq '.spec.plugins = [.spec.plugins[] | select(. != "custom-rhcl-console")]' \
  | oc apply -f -

# Delete the resources
oc delete consoleplugin custom-rhcl-console
oc delete deployment,service -n "$RHCL_CONSOLE_NS" -l app=custom-rhcl-console
oc delete project "$RHCL_CONSOLE_NS"
```

## RBAC requirements

The plugin itself carries **no service-account token** (NFR-001). Every API
call uses the logged-in user's bearer token via the Console's built-in
proxy. Users see only the resources their cluster RBAC allows.

| Persona | Minimum RBAC |
|---|---|
| Platform SRE | `cluster-admin` or namespace-scoped admin across gateway/app namespaces |
| App team operator | `view`/`edit` on their app namespace + `get` on the gateway namespace |
| API product owner | `view` on app namespaces |
| PoC reviewer | `view` cluster-wide |

## Technology stack

| Layer | Choice |
|---|---|
| Language | TypeScript 5.x (strict mode) |
| UI framework | React 18 |
| UI library | PatternFly 6 |
| Plugin SDK | `@openshift-console/dynamic-plugin-sdk` 4.22 |
| Bundler | Webpack 5 (module federation) |
| Topology graph | `@patternfly/react-topology` |
| Charts | `@patternfly/react-charts` |
| i18n | `react-i18next` (English; structured for pt-BR) |
| Tests | Jest + React Testing Library |

## License

Apache-2.0
