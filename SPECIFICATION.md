# Custom RHCL Console — Specification

> Specification-driven design document for a replacement / complement to the
> default Red Hat Connectivity Link (RHCL / Kuadrant) operator console view.
> All implementation work in this directory must follow this spec; deviations
> require updating the spec first.

---

## 1. Overview

### 1.1 Problem statement

The default RHCL console plugin shipped by the Kuadrant operator gives a flat,
list-only overview that hides operationally critical information. Concrete pain
points observed in the current PoC cluster:

- The "Gateways — Traffic Analysis" landing surfaces total/successful/error
  counters but no per-`HTTPRoute` hostname, no per-listener hostname, and no
  link from a route to the FQDN that actually receives traffic.
- Policy attachment is shown as a bare list (`Policies` table) with no visual
  link between a policy and the `Gateway` / `HTTPRoute` it targets, no
  resolution of overrides (`Overridden (Not Enforced)` shows up without
  pointing at the policy that overrides it), and no merge view per route.
- TLS, DNS, and Auth health are scattered across separate CRDs (`Certificate`,
  `DNSPolicy` / `DNSRecord`, `AuthPolicy`) with no consolidated per-`Gateway`
  health card.
- The plugin lists all resources the cluster-admin token can see; there is no
  user-scoped view that mirrors the RBAC of the logged-in OpenShift user.

### 1.2 Goal

Deliver a custom console for RHCL that:

1. Surfaces the operationally important data (hostnames, attached policies,
   effective policy after merge/override, TLS/DNS/auth health, traffic) on
   a single screen.
2. Executes every read against the cluster API with the **logged-in
   OpenShift user's bearer token**, so the user only sees the resources their
   RBAC allows.
3. Is deployable on the same OpenShift `4.19+` clusters used by the rest of
   this PoC (`automation/` Ansible tree).

### 1.3 Non-goals

- Multi-cluster aggregation (single cluster per console instance in v1).
- Replacing the OpenShift built-in `Networking → Routes` / `Gateways` views.
- Editing or creating arbitrary CRs (v1 is read-only; see FR-013 for the
  narrowly scoped edit flow).
- Long-term metric storage. The console queries the in-cluster
  Thanos/Prometheus that user-workload monitoring already exposes.
- Replacing observability stacks (Grafana, Kiali, etc.) — the console links
  out to them where relevant.

---

## 2. Personas

| Persona | Goal | RBAC profile | Primary interface |
|---|---|---|---|
| Platform SRE | See cluster-wide RHCL state, debug enforcement | cluster-admin or namespace-scoped admin across all gateway / app namespaces | Technical Resources |
| App team operator | See only their own namespace's `HTTPRoute`s and the policies that affect them | `view` / `edit` on a single app namespace, plus `get` on the gateway namespace | Technical Resources |
| API product owner | See traffic, error rate, and auth/rate-limit posture for their product | `view` on app namespaces | **API Products** |
| PoC reviewer (Banco do Brasil) | Demo the platform without OpenShift CLI | `view` cluster-wide | **API Products** |

The console provides two interfaces — **Technical Resources** (Gateways,
HTTPRoutes, Policies, Topology, YAML) and **API Products** (APIProduct list,
API Overview, Traffic, Plans, API Keys). Both interfaces respect the user's
RBAC; the visible resource set differs purely as a consequence of RBAC, not of
UI gating. Users can switch between interfaces via a nav toggle (FR-024).

---

## 3. Architecture options

Two architectures both satisfy the user-RBAC requirement. The primary
recommendation is option A; option B is documented as a contingency.

### 3.1 Option A — OpenShift Console Dynamic Plugin (recommended)

The console is packaged as a `ConsolePlugin` (dynamic plugin) and runs **inside**
the OpenShift web console. Auth, routing, theming, and Kubernetes API
client are inherited from the host console.

```
Browser ── OpenShift Console (host) ──► dynamic plugin bundle (this project)
                       │                       │
                       └─────► /api/kubernetes/* (user bearer token) ◄────┘
                       └─────► /api/prometheus/* (user bearer token) ◄────┘
```

Pros:
- Zero auth code. The host console's bearer token is already the logged-in
  user's, with the user's full RBAC.
- Native PatternFly 5 look & feel — matches the existing screenshot exactly.
- `useK8sWatchResource`, `useK8sModel`, `useAccessReview`, and the prometheus
  hooks are first-class, so the implementation reduces to React components
  and resource definitions.
- Same deployment shape the Kuadrant operator already uses, so the cluster
  install path is well understood.
- Extending the Console nav is the supported customization path on
  OpenShift `4.19+`.

Cons:
- Requires the OpenShift Console to be available (true on every target
  cluster of this PoC).
- Plugin lives in the Console iframe; cannot be embedded in third-party
  portals without extra work.

### 3.2 Option B — Standalone SPA with OpenShift OAuth

A separate `Deployment` exposes a static SPA via an OpenShift `Route`. An
`oauth2-proxy` (or `kube-rbac-proxy`) sidecar handles OpenShift OAuth and
forwards the resulting bearer token to the SPA / BFF.

```
Browser ── Route (TLS) ── oauth2-proxy ── SPA ── /apis/...  (user bearer token)
                                          └──── /api/v1/...
                                          └──── Thanos query API
```

Pros:
- Independent of the OpenShift Console; can be embedded anywhere.
- Free choice of UI framework (we still recommend React + PatternFly for
  visual parity).

Cons:
- We have to implement OAuth client registration (`OAuthClient` CR), token
  forwarding, refresh handling, CSRF, and content-security policy ourselves.
- Two TLS surfaces to maintain (Route + Console) and two OAuth clients to
  rotate.
- No native PatternFly Console hooks; have to re-implement watch/list/RBAC
  affordances.

### 3.3 Decision

**Adopt Option A as the primary architecture.** Build the console as an
OpenShift Console dynamic plugin. Do not start Option B until and unless a
concrete requirement falsifies Option A (none today).

---

## 4. Technology stack

The stack is fixed by the architecture decision above; deviations require
updating section 3.3.

| Layer | Choice | Notes |
|---|---|---|
| Language | TypeScript 5.x (strict mode) | Required by the dynamic plugin SDK |
| UI framework | React 18 | Required by the dynamic plugin SDK |
| UI library | PatternFly 5 | Same library used by OpenShift Console |
| Plugin SDK | `@openshift-console/dynamic-plugin-sdk` | Provides `useK8sWatchResource`, `useAccessReview`, `usePrometheusPoll`, etc. |
| Bundler | Webpack 5 with module federation | Required by the SDK; do not switch to Vite |
| State | React Query (`@tanstack/react-query`) for derived/aggregated state, SDK hooks for raw resources | Avoid Redux unless a concrete need appears |
| Topology graph | `@patternfly/react-topology` | For the policy-attachment graph (FR-006) |
| Charts | `@patternfly/react-charts` (Victory) | For traffic/error panels (FR-005) |
| Tests | Jest + React Testing Library | Unit + component tests |
| E2E | Playwright against a live cluster (optional, gated by env var) | Only on demand |
| Lint / format | ESLint with `@typescript-eslint`, Prettier | Match existing project conventions |
| Container | Build via OpenShift `BuildConfig` (S2I or Dockerfile) | Same pattern as `apps/backend/banking-api` |

No backend service is introduced in v1. All data comes from the host
Console's proxied Kubernetes / Prometheus endpoints.

---

## 5. Functional requirements

Each requirement is testable. Wording follows RFC 2119 (`MUST`, `SHOULD`,
`MAY`).

- **FR-001** The console MUST display a Gateways view that lists every
  `gateway.networking.k8s.io/Gateway` the user has `list` access to, with
  columns: name, namespace, gatewayClass, programmed status, listener count,
  attached-policy count, and the **resolved external hostname(s)**.
- **FR-002** Every `HTTPRoute` row MUST show its `spec.hostnames[]` joined and
  truncated with a hover tooltip exposing the full list. The detail page MUST
  render hostnames as clickable HTTPS links to the route's `/` (when the host
  is resolvable from the browser).
- **FR-003** The console MUST render a policy-attachment view per `Gateway`
  and per `HTTPRoute` showing each attached `AuthPolicy`,
  `RateLimitPolicy`, `TokenRateLimitPolicy`, `DNSPolicy`, `TLSPolicy`. For
  each attachment, show: targetRef kind/name, status condition
  (`Accepted`, `Enforced`, `Overridden`), and the reason / message string
  from the policy status.
- **FR-004** For a selected `HTTPRoute`, the console MUST compute and display
  the **effective policy stack** after merge/override resolution
  (gateway-level vs route-level, defaults vs overrides), in the same order
  the Kuadrant control plane evaluates them.
- **FR-005** For each `Gateway` and each `HTTPRoute`, the console MUST show:
  - Requests/sec (1m and 5m)
  - 2xx / 4xx / 5xx breakdown
  - p50 / p95 / p99 latency
  Data SHOULD come from the in-cluster user-workload Prometheus (the Envoy
  sidecar metrics already scraped by RHCL). When user-workload monitoring is
  not enabled (`MONITORING_ENABLE_USER_WORKLOAD=false`), the panels MUST
  degrade gracefully with an explanatory empty state, not error toasts.
- **FR-006** A single topology page MUST render `Gateway` → `HTTPRoute` →
  backend `Service` as a graph, with policies rendered as decorations on
  the edges/nodes they attach to. Use `@patternfly/react-topology`.
- **FR-007** All list views MUST support filtering by namespace, free-text
  search (matches name and hostname), and status (Programmed / Accepted /
  Enforced / Failing).
- **FR-008** Every list row MUST drill down to a detail page with: Overview,
  Policies, Routes (where applicable), Metrics, YAML, and Events tabs. The
  YAML tab is read-only in v1.
- **FR-009** Status surface — every CR-derived row MUST display the worst
  condition severity as a colored label and expose all `.status.conditions[]`
  in the detail page with timestamps.
- **FR-010** Hostname search — a global search box MUST allow searching by
  hostname (exact and suffix match) and resolve to the `HTTPRoute` /
  `Gateway` listener that owns it.
- **FR-011** TLS health — for every `Gateway` listener with TLS, show the
  backing `Certificate` resource, issuer, `NotAfter`, and renewal status. Tag
  certificates expiring in <14 days as warning, <3 days as critical.
- **FR-012** DNS health — for every `Gateway` with a `DNSPolicy`, show the
  managed zone, the `DNSRecord` status, and the propagation status.
- **FR-013** Read-only by default. The UI MAY expose `Edit` actions only when
  a `SelfSubjectAccessReview` confirms `update` on the resource. v1 ships
  edit affordances ONLY for: re-applying a stale policy (`oc apply`-like
  no-op) and toggling `enforced` on an `AuthPolicy`. Anything else is
  out-of-scope for v1.
- **FR-014** The console MUST register a top-level OpenShift Console nav
  group "Connectivity Link" with at least: Overview, Gateways, HTTPRoutes,
  Policies, Topology, and **API Products**. The nav group SHOULD visually
  separate Technical Resources items from the API Products item (e.g., via a
  divider or sub-grouping).
- **FR-015** Empty / unauthorized states — when a user has no access to any
  `Gateway`, the Overview MUST show an empty state explaining what RBAC role
  is needed (e.g. `view` on `gateway.networking.k8s.io`), not a blank page or
  a 403 toast.

### 5.1 API Products interface (FR-016 – FR-026)

The console provides a second interface centered on the `APIProduct` CRD
(`devportal.kuadrant.io/v1alpha1`) introduced in RHCL 1.3. This view targets
API product owners and PoC reviewers who need a business-friendly abstraction
without exposure to raw YAML or low-level status conditions.

- **FR-016** The console MUST display an "API Products" view listing every
  `APIProduct` the user has `list` access to, with columns: display name,
  version, publish status, approval mode, and tag count.
- **FR-017** Clicking an API Product row MUST navigate to an API Overview page
  showing: display name, description, version, contact info, documentation
  links, and tags — all derived from `APIProduct.spec`.
- **FR-018** The API Overview page MUST display the **API Address** (resolved
  from the referenced HTTPRoute's `spec.hostnames[]` and Gateway listener) as
  a clickable HTTPS link.
- **FR-019** The API Overview page MUST display **Accepted Paths** derived from
  the HTTPRoute's `spec.rules[].matches[].path` in a readable table (method,
  path pattern).
- **FR-020** The API Overview page MUST show **Plans** from
  `status.discoveredPlans` as cards with tier name and rate limits
  (daily/weekly/monthly), without exposing PlanPolicy YAML.
- **FR-021** The API Overview page MUST show **Authentication** status derived
  from `status.discoveredAuthScheme`, displaying auth type (API Key, OAuth,
  etc.) and whether auth is required.
- **FR-022** The API Overview page MUST include a **Traffic Summary** panel
  with: requests/sec (5m), success rate (%), and a simple sparkline or area
  chart of traffic over the last hour. Data from Prometheus using the same
  metrics as FR-005.
- **FR-023** The API Products view MUST NOT expose YAML tabs, raw resource
  definitions, or status conditions directly. Technical details are accessed
  via the Technical Resources interface.
- **FR-024** Navigation MUST provide a clear toggle or tab group to switch
  between "Technical Resources" and "API Products" views within the
  Connectivity Link nav section.
- **FR-025** The API Overview page MUST display an **API Keys** section listing
  all `APIKey` resources referencing this APIProduct (that the user has `list`
  access to), with columns: requester email, plan tier, phase
  (Pending/Approved/Rejected), and created date.
- **FR-026** For users with `update` access to `APIKey`, the API Keys section
  MUST provide Approve/Reject actions on Pending keys (when
  `approvalMode: manual`). The actual key secret value is NEVER displayed in
  the console.

---

## 6. Non-functional requirements

- **NFR-001 (auth)** All Kubernetes and Prometheus calls MUST go through the
  Console's `/api/kubernetes/` and `/api/prometheus/` proxies, which forward
  the logged-in user's bearer token. The plugin MUST NOT carry its own
  service-account token, MUST NOT request a service account at deploy time,
  and MUST NOT call any cluster API with elevated credentials.
- **NFR-002 (rbac UX)** Every action button MUST be gated behind a
  `useAccessReview` check. Buttons render as disabled (with reason in
  tooltip) when the user lacks the verb, instead of letting the click fail
  with a 403.
- **NFR-003 (live data)** Resource lists MUST use the SDK's watch hooks
  (`useK8sWatchResource`) so changes propagate without manual refresh.
  Prometheus panels MUST poll on a 30s default interval, configurable in the
  UI down to 5s and up to 5m.
- **NFR-004 (performance)** Initial render of the Overview page MUST be
  <2s (P95) on a cluster with up to 200 `Gateway`s, 1000 `HTTPRoute`s, and
  500 policies, on a stock OpenShift 4.19 cluster.
- **NFR-005 (a11y)** All custom components MUST conform to WCAG 2.1 AA. Use
  PatternFly primitives and never re-implement focus / keyboard handling.
- **NFR-006 (i18n)** All user-visible strings MUST be routed through the
  Console's `react-i18next` setup. Ship `en` only in v1; structure the
  catalog so `pt-BR` can be added without code changes for the  demo.
- **NFR-007 (compat)** Target OpenShift `4.19+`. The plugin's
  `consolePlugin.compatibleVersions` MUST express that constraint.
- **NFR-008 (docs)** Per `AGENTS.md`: all repo content (code comments, docs,
  UI copy until i18n catalogs ship) is written in English.
- **NFR-009 (telemetry)** No off-cluster telemetry. The plugin MUST NOT make
  network calls to anything outside the host cluster.
- **NFR-010 (CSP)** No `eval`, no inline scripts, no remote font/CDN loads.
  All assets ship inside the plugin container image.
- **NFR-011 (size)** The plugin bundle (gzipped) SHOULD be under 1.5 MiB to
  keep cold-start latency reasonable.

---

## 7. Domain model

The resources surfaced by the console, grouped by API:

| API group | Kind | Purpose in the console |
|---|---|---|
| `gateway.networking.k8s.io/v1` | `GatewayClass` | Show which provider implements each Gateway |
| `gateway.networking.k8s.io/v1` | `Gateway` | Primary entity in the Overview / Topology |
| `gateway.networking.k8s.io/v1` | `HTTPRoute` | Hostname-bearing entity (FR-002) |
| `kuadrant.io/v1` | `AuthPolicy` | Policy attachment (FR-003) |
| `kuadrant.io/v1` | `RateLimitPolicy` | Policy attachment |
| `kuadrant.io/v1` | `TokenRateLimitPolicy` | Policy attachment |
| `kuadrant.io/v1` | `DNSPolicy` | DNS health (FR-012) |
| `kuadrant.io/v1` | `TLSPolicy` | TLS health (FR-011) |
| `kuadrant.io/v1alpha1` | `DNSRecord` | DNS health detail |
| `cert-manager.io/v1` | `Certificate` | TLS health detail |
| `monitoring.coreos.com/v1` | `ServiceMonitor` | Hint for "metrics not scraped" diagnostics |
| `core/v1` | `Service`, `Endpoints` | Backend leaf in Topology (FR-006) |
| `route.openshift.io/v1` | `Route` | Cross-link only; not a primary entity |
| `devportal.kuadrant.io/v1alpha1` | `APIProduct` | Primary entity in API Products view (FR-016) |
| `devportal.kuadrant.io/v1alpha1` | `PlanPolicy` | Discovered via APIProduct status (FR-020) |
| `devportal.kuadrant.io/v1alpha1` | `APIKey` | API key requests and approvals (FR-025, FR-026) |

Authoritative API versions MUST be discovered via `useK8sModel` rather than
hard-coded; the table above documents the current expectation only.

---

## 8. UX requirements

### 8.1 Technical Resources interface

- Single landing page ("Connectivity Link Overview") that answers, at a
  glance: how many gateways are healthy, where is traffic going, where is it
  failing, what TLS / DNS / auth issues exist right now.
- Hostname is a first-class column on every table that has one — never
  hidden behind a "details" click (this is the lesson from the screenshot).
- Status pills are colored from the worst-condition rollup, never from the
  CR's `metadata.generation` alone.
- Policy attachment is rendered as a graph node, not a flat table, on the
  Topology and on each `Gateway` / `HTTPRoute` detail page.
- Drill-down preserves filters via URL query string so SREs can share links.
- Empty states explain the RBAC verb that would unblock the user.

### 8.2 API Products interface

The API Products interface presents a business-friendly view without raw YAML
or Kubernetes-specific terminology where possible.

**API Products list page:**

- Columns: Display Name, Version, Status (Published/Draft), Approval Mode,
  Tags (count with hover expansion).
- Search by name or tag; filter by publish status.
- Clicking a row navigates to the API Overview page.

**API Overview page (detail):**

```
+------------------------------------------------------------------+
| < Back to API Products                                            |
+------------------------------------------------------------------+
| {displayName}                                    [{publishStatus}] |
| {description}                                       Version: {v}  |
+------------------------------------------------------------------+
|                                                                   |
| ADDRESS                          | TRAFFIC (last hour)           |
| https://{hostname}/{basePath}    | [====== sparkline ======]     |
|                                  | {req/s} req/s | {%} success   |
+------------------------------------------------------------------+
|                                                                   |
| ACCEPTED PATHS                   | AUTHENTICATION                |
| {method} {pathPattern}           | Type: {authType}              |
| ...                              | Required: {yes/no}            |
+------------------------------------------------------------------+
|                                                                   |
| PLANS                                                             |
| +-------------+  +-------------+  +-------------+                 |
| | {tierName}  |  | {tierName}  |  | {tierName}  |                 |
| | {limits}    |  | {limits}    |  | {limits}    |                 |
| +-------------+  +-------------+  +-------------+                 |
+------------------------------------------------------------------+
|                                                                   |
| API KEYS ({count} total)                              [+ Request] |
| Requester        | Plan      | Status   | Created                |
| {email}          | {tier}    | {phase}  | {date}  [Approve][Rej] |
+------------------------------------------------------------------+
|                                                                   |
| DOCUMENTATION                    | CONTACT                        |
| {docsURL} | {swaggerUI}          | Team: {team}                  |
| {gitRepository}                  | Email: {email}                |
+------------------------------------------------------------------+
```

- **Address** is a clickable HTTPS link derived from the HTTPRoute hostname.
- **Traffic** sparkline updates on a 30s poll (same cadence as FR-005).
- **Accepted Paths** table shows method + path from HTTPRoute rules.
- **Plans** render as cards; no PlanPolicy YAML exposed.
- **API Keys** table shows pending requests with Approve/Reject buttons for
  authorized users; approved keys show status only (secret value never shown).
- **Documentation** and **Contact** sections render links from
  `APIProduct.spec.documentation` and `APIProduct.spec.contact`.

---

## 9. Deployment & operations

- The plugin is delivered as a container image built by an OpenShift
  `BuildConfig` (S2I or Dockerfile, mirror `apps/backend/banking-api`).
- Installation is automated by a new Ansible role, `custom_rhcl_console`,
  under `automation/roles/`, with playbooks
  `playbooks/custom_rhcl_console-install.yml`, `-test.yml`, `-remove.yml`.
- The role applies: a `Namespace` (default `rhcl-console`), a `Deployment`,
  a `Service`, a `ConsolePlugin` CR, and the per-cluster patch that adds
  `rhcl-console` to `spec.plugins` of the `consoles.operator.openshift.io`
  `cluster` CR.
- Tunables follow the project convention (see `automation/README.md`):
  `RHCL_CONSOLE_NAMESPACE`, `RHCL_CONSOLE_IMAGE`,
  `RHCL_CONSOLE_NODE_SELECTOR`, etc.
- The role MUST be a no-op when re-run (idempotent) and MUST NOT delete
  existing entries in `spec.plugins` on remove — only its own.
- The aggregate `install-all.yml` / `remove-all.yml` are NOT updated in v1;
  the custom console is installed explicitly so PoC reviewers can compare
  with-and-without.

---

## 10. Milestones

The work is broken into vertical slices. Each slice is independently
deployable and observable.

| Milestone | Scope | Acceptance |
|---|---|---|
| M0 — Skeleton | Empty plugin registers in console nav, renders an empty Overview page, builds via S2I, deploys via Ansible | Plugin appears under the configured nav group; no console errors |
| M1 — Read flows | FR-001, FR-002, FR-007, FR-008, FR-009, FR-014, FR-015. NFR-001..003. | A user with `view` on `kuadrant-system` and one app namespace sees only those resources |
| M2 — Policy view | FR-003, FR-004 | Selecting an `HTTPRoute` shows the correct effective policy stack vs `oc get httproute -o yaml` policy-status block |
| M3 — Health | FR-011, FR-012, FR-013 (auth-policy enforced toggle only) | TLS expiry warnings fire in a synthetic test |
| M4 — Topology + metrics | FR-005, FR-006, FR-010 | Topology reflects the lab `banking-api` connectivity (Gateway → HTTPRoute → Service); requests/sec matches `oc -n openshift-monitoring exec ... curl thanos` |
| M5 — API Products | FR-016, FR-017, FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, FR-026 | API Products list shows all `APIProduct` CRs; clicking one shows API Overview with address, paths, plans, auth, traffic chart, and API Keys list; approve/reject actions work for manual-approval products; no YAML tabs visible in this interface |

Milestones are not date-bound in this spec; sprint allocation belongs in
`sprint*/README.md`.

---

## 11. Acceptance criteria (v1 cut-line)

The console is GA-ready when, on a fresh `rhcl-lab` cluster:

1. A user with `cluster-admin` sees every gateway / route / policy via the
   custom console, with hostnames visible without expanding any row.
2. A user with `view` on a single app namespace and `get` on the gateway
   namespace sees ONLY their namespace's `HTTPRoute`s and the policies
   attached to them, with no 403 toasts.
3. The Topology page renders the lab's `banking-api-connectivity` route
   correctly attached to `rhcl-apps-gateway` with the
   `banking-api-connectivity-apikey` `AuthPolicy` and the `banking-api-10rps`
   `RateLimitPolicy` decorating the right edges.
4. Disabling user-workload monitoring (`MONITORING_ENABLE_USER_WORKLOAD=false`)
   leaves the rest of the console functional; only the metrics panels render
   their empty state.
5. `playbooks/custom_rhcl_console-remove.yml` cleanly removes the plugin and
   leaves no stale entries in `spec.plugins`.

---

## 12. Open questions

These must be resolved before / during M0; each links to the section it
will update.

- **Q1** Naming and namespace: `rhcl-console` vs `connectivity-link-console`
  vs reusing `kuadrant-system`. Decision affects sections 9 and 10.
- **Q2** Do we ship the plugin enabled-by-default in `install-all.yml`, or
  keep it opt-in for PoC comparison? Affects section 9.
- **Q3** Coexistence — does this plugin replace the upstream Kuadrant
  console plugin, or run side-by-side under a different nav label? If
  side-by-side, must avoid colliding `consolePlugin.name`.
- **Q4** v1 edit scope (FR-013) — confirm the "toggle `Enforced` on
  `AuthPolicy`" is the only edit affordance, or extend to creating a default
  `RateLimitPolicy` from a wizard.
- **Q5** Localization — English-only in v1 (per AGENTS.md), with `pt-BR` as
  a stretch goal for the  demo? Affects NFR-006.
- **Q6** Multi-cluster — confirm out-of-scope for v1 (per section 1.3).
- **Q7** Build pipeline — S2I (Node base image) or Dockerfile? Project
  convention is mixed (`banking-api` uses Quarkus S2I; `mobile-bank` is
  Flutter web). Recommend Dockerfile for deterministic webpack output.

---

## 13. Working agreement for this directory

- `SPECIFICATION.md` (this file) is authoritative. Implementation PRs MUST
  cite the FR / NFR they satisfy.
- Architectural changes amend section 3.3 first, then the impacted sections.
- Open questions in section 12 are resolved by appending a "Resolution"
  paragraph below each Q, dated, and removing the bullet from the open list
  once executed.
- Code lives under `custom-rhcl-console/console-plugin/` (frontend) and the
  Ansible role lives under `automation/roles/custom_rhcl_console/`.
- All UI copy and code comments in English (`AGENTS.md` rule).

---

## 14. References

- OpenShift Console Dynamic Plugin SDK:
  `https://github.com/openshift/console/tree/master/frontend/packages/console-dynamic-plugin-sdk`
- PatternFly: `https://www.patternfly.org`
- PatternFly React Topology:
  `https://github.com/patternfly/react-topology`
- Gateway API (sigs.k8s.io): `https://gateway-api.sigs.k8s.io`
- Kuadrant docs: `https://docs.kuadrant.io`
- Cert-manager: `https://cert-manager.io`
- Project conventions: `../AGENTS.md`, `../automation/README.md`,
  `../README.md`
