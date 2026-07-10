/**
 * API Publishing Wizard — state model.
 *
 * One flat state object drives the whole wizard. Every step reads and
 * writes slices of it; the manifest generators in `manifests.ts` are
 * pure functions of this state, so the Generated-Resources sidebar and
 * the Review screen always reflect the current answers with no extra
 * bookkeeping.
 */

export type AuthMode = 'api-key' | 'jwt' | 'oidc' | 'anonymous';
export type TemplateId = 'public-rest' | 'protected-rest' | 'ai-gateway' | 'internal' | 'empty';

/**
 * Bucket dimension for a RateLimitPolicy — drives what Kuadrant/Limitador
 * counts as a "consumer" when incrementing counters. `per-consumer` is
 * the classic API-key identity path; `global` shares one bucket across
 * everyone; the rest key off IP, header, endpoint, or the consumer's
 * plan tier. See manifests.ts:genRateLimitPolicy for how each turns into
 * `counters` / `when` predicates on the CR.
 */
export type RateLimitScope =
  | 'per-consumer'
  | 'global'
  | 'per-ip'
  | 'per-ip-range'
  | 'per-header'
  | 'per-endpoint'
  | 'per-plan';

export interface RateLimitScopeOption {
  id: RateLimitScope;
  label: string;
  hint: string;
  /** When set, PoliciesStep exposes a text field so the user can supply
   *  the CIDR / header name / path prefix that qualifies the scope. */
  needsValue?: 'cidr' | 'header' | 'path';
}

export const RATE_LIMIT_SCOPES: RateLimitScopeOption[] = [
  {
    id: 'per-consumer',
    label: 'Per consumer',
    hint: 'One bucket per API-key (auth.identity.userid). Requires an AuthPolicy that populates the identity.',
  },
  {
    id: 'global',
    label: 'Global',
    hint: 'A single bucket shared by every request hitting the target. Cheap; no consumer discrimination.',
  },
  {
    id: 'per-ip',
    label: 'Per IP',
    hint: 'One bucket per source.remote_address. Useful against anonymous abuse.',
  },
  {
    id: 'per-ip-range',
    label: 'Per IP range (CIDR)',
    hint: 'Buckets aggregate whole subnets — a client behind carrier-grade NAT shares the quota.',
    needsValue: 'cidr',
  },
  {
    id: 'per-header',
    label: 'Per header',
    hint: 'Bucket per header value (e.g. X-Tenant, X-Region). Multi-tenant SaaS pattern.',
    needsValue: 'header',
  },
  {
    id: 'per-endpoint',
    label: 'Per endpoint',
    hint: 'Separate rate per path prefix — useful when one endpoint (e.g. /transfers) needs a tighter limit than the rest.',
    needsValue: 'path',
  },
  {
    id: 'per-plan',
    label: 'Per plan',
    hint: 'Reads auth.identity.plan (gold/silver/bronze) and applies the tier-specific limit. Requires plans in the identity payload.',
  },
];

/**
 * Backend pool entry. The wizard used to configure a single service
 * (namespace/name/port/protocol at the top level of WizardState); it
 * now maintains a list so operators can express weighted split
 * (canary / blue-green), cross-namespace fanout, and per-path
 * routing. Each entry has a stable local `id` — never rendered in
 * YAML — that RouteRule uses to pin a rule to a specific subset of
 * the pool.
 */
export interface BackendPoolEntry {
  id: string;
  namespace: string;
  name: string;
  port: number | null;
  protocol: 'HTTP' | 'HTTPS' | 'GRPC';
  /** Relative weight in the split. Not normalised in state — manifest
   *  generation divides by the sum so `[100, 100]` renders as 50/50
   *  and `[80, 20]` renders as 80/20. */
  weight: number;
}

export interface RouteRule {
  id: string;
  method: string; // 'ANY' | 'GET' | ...
  path: string;
  /** PathPrefix vs Exact */
  matchType: 'PathPrefix' | 'Exact';
  /**
   * When `undefined` or empty: the rule uses the ENTIRE backend pool
   * with its declared weights (default weighted-split behaviour).
   * When set: only the referenced pool entries serve this rule —
   * enables "/api/v1 → svc-a" / "/api/v2 → svc-b" per-path routing.
   * Entries not present in the pool anymore are dropped silently.
   */
  backendIds?: string[];
}

export interface WizardState {
  template: TemplateId | null;

  // Step 2 — Backends. Pool of one or more services the HTTPRoute
  // will target. When >1 entry, the manifest emits a weighted split
  // on every rule that hasn't overridden it via RouteRule.backendIds.
  backends: BackendPoolEntry[];
  /** Backwards-compat mirror of `backends[0].namespace` — kept so the
   *  many places that read `state.namespace` (Gateway defaults, DNS
   *  suffix inference, APIProduct namespace, slug derivation) can
   *  continue to compile while the migration lands. Updated by the
   *  patch() layer whenever backends[0] changes. */
  namespace: string;

  // Step 3 — Gateway
  /** true = attach to an existing Gateway; false = create a new one. */
  useExistingGateway: boolean;
  existingGatewayName: string;
  existingGatewayNamespace: string;
  gatewayName: string;
  hostname: string;
  listenerPort: number;
  listenerProtocol: 'HTTP' | 'HTTPS';
  tlsEnabled: boolean;

  // Step 4 — Routes
  routes: RouteRule[];

  // Step 5 — Security
  authMode: AuthMode;
  apiKeyHeader: string;
  jwtIssuer: string;
  jwtAudience: string;
  jwksUrl: string;
  oidcDiscoveryUrl: string;
  oidcClientId: string;
  oidcScopes: string;

  // Step 6 — Policies
  rateLimitEnabled: boolean;
  rateLimit: number;
  rateWindow: string; // '1m' etc
  /**
   * How the RateLimitPolicy counts hits — see RATE_LIMIT_SCOPES for the
   * catalogue. Different scopes emit different `counters` (per-consumer
   * / per-IP / per-header) or `when` predicates (per-endpoint) or plan
   * lookups on `spec.limits`. Falls back to `per-consumer` since that's
   * the most common Kuadrant PoC ask.
   */
  rateLimitScope: RateLimitScope;
  /** Only used when scope is per-ip-range, per-header, or per-endpoint. */
  rateLimitScopeValue: string;
  dnsEnabled: boolean;
  tlsPolicyEnabled: boolean;
  tlsIssuerName: string;
  tokenLimitEnabled: boolean;
  tokenLimit: number;
  tokenWindow: string;

  // Step 7 — API Product
  productEnabled: boolean;
  displayName: string;
  description: string;
  version: string;
  tags: string[];
  openApiUrl: string;
  approvalMode: 'AUTOMATIC' | 'MANUAL';
  visibility: 'PUBLIC' | 'INTERNAL';

  // Step 8 — Review / test key. When authMode === 'api-key', an
  // optional Secret is emitted with a random 32-byte URL-safe base64
  // value labeled to be picked up by the wizard's AuthPolicy
  // selector. Populates the success screen's curl example with the
  // literal key so the operator can paste + run without a second trip
  // to the developer portal.
  generateTestApiKey: boolean;
  /** The value used for both the Secret and the success-screen curl.
   *  Generated once via `crypto.getRandomValues` when the operator
   *  enables the toggle so switching pages doesn't churn a new key. */
  testApiKeyValue: string;
}

export const STEP_IDS = [
  'template',
  'backend',
  'gateway',
  'routes',
  'security',
  'policies',
  'product',
  'review',
] as const;
export type StepId = (typeof STEP_IDS)[number];

export const STEP_LABELS: Record<StepId, string> = {
  template: 'Template',
  backend: 'Backend',
  gateway: 'Gateway',
  routes: 'Routes',
  security: 'Security',
  policies: 'Policies',
  product: 'API Product',
  review: 'Review',
};

let seq = 0;
export function newRouteId(): string {
  seq += 1;
  return `r${seq}`;
}
let bseq = 0;
export function newBackendId(): string {
  bseq += 1;
  return `b${bseq}`;
}

/** Convenience — the first backend, used everywhere we still need to
 *  answer "which service is this API published against?" in singular
 *  terms (slug derivation, DNS suffix, APIProduct namespace, etc.). */
export function primaryBackend(state: WizardState): BackendPoolEntry | null {
  return state.backends[0] || null;
}

export function defaultState(): WizardState {
  return {
    template: null,
    backends: [],
    namespace: '',
    useExistingGateway: true,
    existingGatewayName: '',
    existingGatewayNamespace: '',
    gatewayName: '',
    hostname: '',
    listenerPort: 443,
    listenerProtocol: 'HTTPS',
    tlsEnabled: true,
    routes: [{ id: newRouteId(), method: 'ANY', path: '/', matchType: 'PathPrefix' }],
    authMode: 'api-key',
    apiKeyHeader: 'api-key',
    jwtIssuer: '',
    jwtAudience: '',
    jwksUrl: '',
    oidcDiscoveryUrl: '',
    oidcClientId: '',
    oidcScopes: 'openid',
    rateLimitEnabled: true,
    rateLimit: 100,
    rateWindow: '1m',
    rateLimitScope: 'per-consumer',
    rateLimitScopeValue: '',
    dnsEnabled: true,
    tlsPolicyEnabled: true,
    tlsIssuerName: 'lets-encrypt',
    tokenLimitEnabled: false,
    tokenLimit: 50000,
    tokenWindow: '1h',
    productEnabled: true,
    displayName: '',
    description: '',
    version: 'v1',
    tags: [],
    openApiUrl: '',
    approvalMode: 'MANUAL',
    visibility: 'PUBLIC',
    generateTestApiKey: true,
    testApiKeyValue: '',
  };
}

/**
 * URL-safe base64 of 32 random bytes, stripped of padding — good
 * enough for a smoke-test key (matches what Kuadrant devportal picks
 * for provisioned APIKey Secrets). Uses the Web Crypto API; falls back
 * to `Math.random()` when unavailable so unit-testing environments
 * without a crypto shim don't blow up.
 */
export function generateApiKeyValue(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * A bullet on a template card. `tone` drives the icon in TemplateStep so
 * "No DNS" reads visually as a hard opt-out (banned) rather than yet
 * another green tick. Falls back to `'yes'` when omitted — matches the
 * historical shape where every bullet was just a string.
 */
export type BulletTone = 'yes' | 'no' | 'internal' | 'info';
export interface TemplateBullet {
  text: string;
  tone?: BulletTone;
}

export interface TemplateDef {
  id: TemplateId;
  title: string;
  audience: string;
  outcome: string;
  bullets: TemplateBullet[];
  /** Patch applied on top of defaultState() when the card is picked. */
  patch: Partial<WizardState>;
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'public-rest',
    title: 'Public REST API',
    audience: 'Teams exposing an open API to external consumers.',
    outcome: 'A publicly reachable endpoint with DNS + TLS, discoverable in the Developer Portal.',
    bullets: [
      { text: 'Public endpoint', tone: 'yes' },
      { text: 'DNS', tone: 'yes' },
      { text: 'TLS', tone: 'yes' },
      { text: 'API Product', tone: 'yes' },
    ],
    patch: {
      authMode: 'anonymous',
      rateLimitEnabled: false,
      dnsEnabled: true,
      tlsPolicyEnabled: true,
      tokenLimitEnabled: false,
      productEnabled: true,
      visibility: 'PUBLIC',
      approvalMode: 'AUTOMATIC',
    },
  },
  {
    id: 'protected-rest',
    title: 'Protected REST API',
    audience: 'The default choice for partner-facing or internal-facing product APIs.',
    outcome: 'API-key protected endpoint with per-consumer rate limits, DNS and TLS.',
    bullets: [
      { text: 'API Key', tone: 'yes' },
      { text: 'Rate Limits', tone: 'yes' },
      { text: 'DNS', tone: 'yes' },
      { text: 'TLS', tone: 'yes' },
    ],
    patch: {
      authMode: 'api-key',
      rateLimitEnabled: true,
      rateLimit: 100,
      dnsEnabled: true,
      tlsPolicyEnabled: true,
      tokenLimitEnabled: false,
      productEnabled: true,
      approvalMode: 'MANUAL',
    },
  },
  {
    id: 'ai-gateway',
    title: 'AI Gateway',
    audience: 'Teams putting an LLM or inference backend behind the gateway.',
    outcome: 'JWT-authenticated endpoint with token-based rate limits and cost monitoring.',
    bullets: [
      { text: 'JWT', tone: 'yes' },
      { text: 'Token Rate Limits', tone: 'yes' },
      { text: 'Cost Monitoring', tone: 'yes' },
      { text: 'AI Policies', tone: 'yes' },
    ],
    patch: {
      authMode: 'jwt',
      rateLimitEnabled: false,
      tokenLimitEnabled: true,
      tokenLimit: 50000,
      dnsEnabled: true,
      tlsPolicyEnabled: true,
      productEnabled: true,
      approvalMode: 'MANUAL',
      tags: ['ai'],
    },
  },
  {
    id: 'internal',
    title: 'Internal API',
    audience: 'Cluster-internal service-to-service traffic.',
    outcome: 'Route without public DNS, no portal entry — reachable only inside the mesh.',
    bullets: [
      { text: 'Internal only', tone: 'internal' },
      { text: 'No DNS', tone: 'no' },
      { text: 'No API Product', tone: 'no' },
    ],
    patch: {
      authMode: 'anonymous',
      rateLimitEnabled: false,
      dnsEnabled: false,
      tlsPolicyEnabled: false,
      tokenLimitEnabled: false,
      productEnabled: false,
      listenerProtocol: 'HTTP',
      listenerPort: 80,
      tlsEnabled: false,
      visibility: 'INTERNAL',
    },
  },
  {
    id: 'empty',
    title: 'Empty Template',
    audience: 'Advanced users who want to hand-pick every option.',
    outcome: 'Nothing pre-selected — walk through every step and decide as you go.',
    bullets: [
      { text: 'No defaults', tone: 'no' },
      { text: 'All steps editable', tone: 'info' },
    ],
    patch: {},
  },
];

/**
 * Readiness checklist — the sidebar's education panel. Each entry
 * resolves against the state so the % completes live as the user
 * answers.
 */
export interface ReadinessItem {
  key: string;
  label: string;
  done: (s: WizardState) => boolean;
  /** Entry doesn't apply for the state (e.g. DNS on internal APIs). */
  applicable?: (s: WizardState) => boolean;
}

export const READINESS: ReadinessItem[] = [
  {
    key: 'backend',
    label: 'Backend',
    done: (s) =>
      s.backends.length > 0 &&
      s.backends.every((b) => !!(b.namespace && b.name && b.port)),
  },
  {
    key: 'gateway',
    label: 'Gateway',
    done: (s) =>
      s.useExistingGateway ? !!s.existingGatewayName : !!(s.gatewayName && s.hostname),
  },
  { key: 'route', label: 'Route', done: (s) => s.routes.length > 0 && s.routes.every((r) => !!r.path) },
  {
    key: 'auth',
    label: 'Authentication',
    // Anonymous IS a valid explicit authentication decision now — the
    // wizard emits an explicit AuthPolicy with `authentication.public.
    // anonymous: {}` to override any deny-all on the parent Gateway. So
    // every authMode counts as "done" as long as the required knob for
    // that mode has been filled.
    done: (s) => {
      if (s.authMode === 'anonymous') return true;
      if (s.authMode === 'api-key') return true;
      if (s.authMode === 'jwt') return !!s.jwtIssuer;
      if (s.authMode === 'oidc') return !!s.oidcDiscoveryUrl;
      return false;
    },
    applicable: () => true,
  },
  {
    key: 'ratelimit',
    label: 'Rate Limit',
    done: (s) => s.rateLimitEnabled || s.tokenLimitEnabled,
    applicable: (s) => s.template !== 'public-rest' && s.template !== 'internal',
  },
  { key: 'tls', label: 'TLS', done: (s) => s.tlsPolicyEnabled, applicable: (s) => s.template !== 'internal' },
  { key: 'dns', label: 'DNS', done: (s) => s.dnsEnabled, applicable: (s) => s.template !== 'internal' },
  {
    key: 'product',
    label: 'API Product',
    done: (s) => s.productEnabled && !!s.displayName,
    applicable: (s) => s.template !== 'internal',
  },
];

export function readinessPct(s: WizardState): number {
  const applicable = READINESS.filter((r) => !r.applicable || r.applicable(s));
  if (applicable.length === 0) return 0;
  const done = applicable.filter((r) => r.done(s)).length;
  return Math.round((done / applicable.length) * 100);
}

/** Slug used as metadata.name for the generated resources. Falls back
 *  to the first backend's service name when the operator hasn't typed
 *  a display name yet. */
export function apiSlug(s: WizardState): string {
  const primary = primaryBackend(s);
  const base = (s.displayName || primary?.name || 'my-api')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'my-api';
}
