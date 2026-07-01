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

The plugin pod runs an nginx that serves the bundled assets over **HTTPS on
port 9001** using a service-CA-signed certificate the OpenShift platform
mints automatically. The Console requires HTTPS for plugin backends —
deploying without the TLS mount surfaces as "Failed to get a valid plugin
manifest" errors and is the most common first-time mistake.

### 1. Create namespace and deploy the plugin server

```bash
export RHCL_CONSOLE_NS=custom-rhcl-console
export RHCL_CONSOLE_IMAGE=quay.io/hodrigohamalho/custom-rhcl-console:latest

oc new-project "$RHCL_CONSOLE_NS" || true

cat <<EOF | oc apply -f -
apiVersion: v1
kind: Service
metadata:
  name: custom-rhcl-console
  namespace: $RHCL_CONSOLE_NS
  labels:
    app: custom-rhcl-console
  annotations:
    # Triggers the OpenShift service-CA operator to mint a TLS
    # cert+key Secret named below and rotate it before expiry.
    # The pod mounts the same Secret at /var/serving-cert.
    service.beta.openshift.io/serving-cert-secret-name: custom-rhcl-console-tls
spec:
  selector:
    app: custom-rhcl-console
  ports:
    - port: 9001
      targetPort: 9001
      protocol: TCP
---
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
          imagePullPolicy: Always
          ports:
            - name: https
              containerPort: 9001
              protocol: TCP
          volumeMounts:
            - name: serving-cert
              mountPath: /var/serving-cert
              readOnly: true
          resources:
            requests: { cpu: 50m, memory: 64Mi }
            limits:   { cpu: 200m, memory: 256Mi }
      volumes:
        - name: serving-cert
          secret:
            # Matches the Service annotation above. The Secret is
            # populated asynchronously by the service-CA operator; the
            # pod may CrashLoop briefly on the very first start while
            # the cert lands.
            secretName: custom-rhcl-console-tls
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

### 4. (Optional) Runtime configuration — point at the customer's Grafana / Tempo

By default the plugin's "Open in Grafana" and "View trace" deeplinks look
for the in-cluster instances provisioned by the
[rhcl-lab Ansible role](https://github.com/redhat-banco-do-brasil/rhcl-lab):

| Default | Namespace | Route |
|---|---|---|
| Grafana | `rhcl-grafana` | `rhcl-grafana-route` |
| Tempo gateway | `tempo` | `tempo-tempo-rhcl-gateway` |

On clusters where the customer already has Grafana / Tempo managed
out-of-band, create the following ConfigMap to point the plugin at those
instances instead — every field is optional, missing keys fall back to
the defaults above:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: custom-rhcl-console-config
  namespace: custom-rhcl-console
data:
  # Grafana — discover the route name with `oc get route -A | grep -i grafana`
  grafanaNamespace: monitoring
  grafanaRouteName: grafana
  grafanaDashboardPrefix: rhcl-     # leave default unless the imported JSONs were renamed

  # Tempo — discover with `oc get route -A | grep -i tempo`
  tempoNamespace: tempo
  tempoGatewayRouteName: tempo-tempo-rhcl-gateway
  tempoStackName: tempo-rhcl

  # Developer Portal — when set, adds a "Developer Portal" item to the
  # plugin sidebar that opens the URL in a new tab. Omit to hide the item.
  developerPortalUrl: https://developer-portal.bb.com.br
```

After applying, restart the plugin pod so the watch picks up the new
config immediately:

```bash
oc -n custom-rhcl-console rollout restart deploy/custom-rhcl-console
```

If the ConfigMap doesn't exist, the buttons stay functional pointing at
the defaults (or render disabled with a tooltip when the route is
missing) — nothing breaks.

### 5. (Optional) APIKey Secrets — demo subscribers

The plugin reads APIKey Secrets directly from the cluster. Create at
least one per subscriber to see the "API Keys" page populated:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: banking-api-key-alice
  namespace: rhcl-apps
  labels:
    # Kuadrant uses this label to discover api-key Secrets for the
    # AuthPolicy targeting the banking-api HTTPRoute. The label key
    # must match the AuthPolicy's `apiKey.selector.matchLabels`.
    kuadrant.io/apikeys-by: api-key
    app: banking-api
  annotations:
    secret.kuadrant.io/user-id: alice
    secret.kuadrant.io/plan-id: gold     # used by the plan-cards UI
stringData:
  api_key: alice-gold-secret             # demo value — change for real envs
type: Opaque
```

The Secrets are surfaced cluster-wide on the **API Keys** page (with
approve/reject actions when paired with `APIKey` CRs) and on each
APIProduct's detail page.

### Verification

1. Confirm the pod is **2/2 Running** (the second container is the
   service-CA-injected cert reload sidecar on some OCP versions — on a
   plain pod it's just `1/1`):

   ```bash
   oc -n custom-rhcl-console get pods
   oc -n custom-rhcl-console get secret custom-rhcl-console-tls   # cert+key materialized
   ```

2. Open the OpenShift Console and navigate to **Connectivity Link → Overview**.
3. Confirm the 5 Environment Health cards render (or an RBAC empty state
   if the user lacks `list` on `gateway.networking.k8s.io/gateways`).
4. Open a Gateway / HTTPRoute / APIProduct detail page and confirm the
   **Open in Grafana** and **View trace** buttons resolve:
   - Enabled and clickable when the in-cluster Grafana / Tempo exist
     (or the runtime ConfigMap in step 4 above is set).
   - Visible but disabled (with a tooltip) when neither is installed.
5. Navigate to **API Products** — the business-friendly interface should
   show without any YAML or raw Kubernetes terminology.

### Common first-time issues

| Symptom | Cause | Fix |
|---|---|---|
| Console shows "Failed to get a valid plugin manifest" | Pod is serving HTTP on 8080 instead of HTTPS on 9001 | Use the Deployment from step 1 — the manifest in OpenShift docs is HTTP, this plugin needs the TLS mount |
| Pod CrashLoopBackOff with `tls: no such file or directory` | service-CA hasn't materialized the Secret yet | Wait ~30s; if it persists, check the Service annotation matches the volume `secretName` |
| Pod runs but plugin doesn't appear in nav | Plugin not in `console.operator.openshift.io/cluster` | Re-run step 3, then `oc -n openshift-console rollout restart deploy/console` |
| "Open in Grafana" button disabled | Default route `rhcl-grafana/rhcl-grafana-route` not found | Either install the Ansible `grafana` role or create the ConfigMap in step 4 above |

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

# Delete the plugin manifest
oc delete consoleplugin custom-rhcl-console

# Delete the workload + Service (service-CA cleans the Secret automatically)
oc delete deployment,service,configmap \
  -n "$RHCL_CONSOLE_NS" \
  -l app=custom-rhcl-console
oc delete configmap custom-rhcl-console-config -n "$RHCL_CONSOLE_NS" --ignore-not-found
oc delete project "$RHCL_CONSOLE_NS"
```

The APIKey Secrets in `rhcl-apps` (step 5) are owned by your application,
not the plugin — leave them in place when removing the plugin only.

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

Additionally, **any signed-in user** the plugin renders for needs:

| Resource | Verb | Why |
|---|---|---|
| `route.openshift.io/routes` in `rhcl-grafana` (or override ns) | `get`, `watch` | Resolve "Open in Grafana" deeplink URL |
| `route.openshift.io/routes` in `tempo` (or override ns) | `get`, `watch` | Resolve "View trace" deeplink URL |
| `tempo.grafana.com/tempostacks` in `tempo` | `get`, `watch` | Read tenant name for the Tempo gateway URL |
| `configmaps` in `custom-rhcl-console` namespace, name `custom-rhcl-console-config` | `get`, `watch` | Read runtime configuration overrides (Grafana/Tempo namespace/route) |

These reads default to `system:authenticated` on a stock cluster and
generally don't need extra RoleBindings. On clusters with restrictive
default RBAC, you'll need to grant them explicitly.

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
