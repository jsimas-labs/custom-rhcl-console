# Release Notes — Custom RHCL Console

## v1.3.0 — 2026-07-10

Image: `quay.io/jsimas/custom-rhcl-console:1.3.0`

Everything below landed since the 1.2 image (package tree 0.1.0),
including the merge of the
`feat/overview-operational-dashboard` line and the TLS/DNS operational pages.

### Highlights

**Overview — operational dashboard**
- Overview page rebuilt around real cluster data (mock data removed):
  environment health, gateway operational cards, needs-attention panel,
  policy impact table, route/backend traffic and recent events.
- Namespace filter (`?namespace=`) — bookmarkable, cached in localStorage.
- Gateway data-plane pod health surfaced next to the Kuadrant CR view
  (restart storms, sustained not-ready, recent Warning events).

**TLS**
- New **TLS Overview** page — certificate health control tower across
  gateways (expiry, issuer, listener/cert mismatches), preferring the
  HTTPS listener.
- New **TLS Troubleshooting** page — end-to-end lifecycle view, backed by a
  live HTTPS handshake probe on the dns-prober companion service.

**DNS**
- New **DNS Troubleshooting** page: real DNSRecord state, cross-resolver
  table (via the optional external prober), region-grouped resolver view,
  multi-site co-ownership detection (tells single-cluster ELB round-robin
  apart from real multi-site), Grafana/Prometheus links.
- Companion **dns-prober** (Quarkus) service moved into this repo; serves
  HTTPS on 8443 for the ConsolePlugin proxy and ships in the same Quay repo.

**Policies**
- Per-policy detail pages: AuthPolicy, DNSPolicy, TLSPolicy,
  TokenRateLimitPolicy — plus the existing RateLimitPolicy — on a shared
  layout (summary, operational status, affected resources, troubleshooting).
- "Partially enforced" is now explained: covered vs overshadowed routes.
- RateLimit forms expose the actual counter/predicate CEL.

**Create / Edit / Delete (CRUD)**
- Create + Edit for Gateway / HTTPRoute / policy CRs via a shared editor
  modal (guided form + YAML tabs); delete with confirmation on every CR,
  using the same K8sModel shape as create (fixes opaque 404s).
- **API Publishing Wizard** (`/connectivity-link/create-api`) with OpenAPI
  import, YAML preview and AuthPolicy/RateLimitPolicy steps.
- GRPCRoutes list page.

**Cost Monitoring (BETA)**
- Per-consumer usage over 24h with tier pricing read from a ConfigMap
  (req018), including AI token accounting.

**Integrations**
- Runtime config via ConfigMap — point deep links at the customer's
  Grafana / Tempo without rebuilding the image.
- "Open in Grafana" deep links across detail pages; "View trace" deep links
  into Tempo; Tempo trace search from API product pages.
- Optional sidebar links: customer Developer Portal and Internal Developer
  Hub (req029) — both gated by feature flags driven by the ConfigMap.

### Fixes & polish
- i18n: repaired keys mangled/zeroed by i18next-parser and added the 152
  keys missing after the dashboard merge (namespace filter, cost page,
  nav section) — no more missing-key spam in the browser console.
- Navigation stays inside the plugin after create/delete (no more full
  console page loads); `.rhcl-plugin-root` dark surface kept on all
  loading/early-return paths (no black flash).
- Victory chart widths pinned to their container; metric labels readable.
- Grafana deep links land on the right dropdown entry (dropped trailing `.*`).
- HTTPRoute status read across **all** parent gateways, not just the first.

### Compatibility
- Built with `@openshift-console/dynamic-plugin-sdk` 4.21 — targets
  OpenShift Console 4.21 (validated locally against `origin-console:4.21`
  and cluster 4.21.19).
- React 18 / react-router 7 (+ v5-compat shims federated by the console).

---

## v1.0–1.2 (package 0.1.0) — 2026-05/06

Initial series: Gateways, HTTPRoutes, Policies and API Products list/detail
pages, topology view, API keys and plans, Grafana-backed traffic panels.
