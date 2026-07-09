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

export interface RouteRule {
  id: string;
  method: string; // 'ANY' | 'GET' | ...
  path: string;
  /** PathPrefix vs Exact */
  matchType: 'PathPrefix' | 'Exact';
}

export interface WizardState {
  template: TemplateId | null;

  // Step 2 — Backend
  namespace: string;
  serviceName: string;
  servicePort: number | null;
  protocol: 'HTTP' | 'HTTPS' | 'GRPC';

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

export function defaultState(): WizardState {
  return {
    template: null,
    namespace: '',
    serviceName: '',
    servicePort: null,
    protocol: 'HTTP',
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
  };
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
  { key: 'backend', label: 'Backend', done: (s) => !!(s.namespace && s.serviceName && s.servicePort) },
  {
    key: 'gateway',
    label: 'Gateway',
    done: (s) =>
      s.useExistingGateway ? !!s.existingGatewayName : !!(s.gatewayName && s.hostname),
  },
  { key: 'route', label: 'Route', done: (s) => s.routes.length > 0 && s.routes.every((r) => !!r.path) },
  { key: 'auth', label: 'Authentication', done: (s) => s.authMode !== 'anonymous' || true, applicable: () => true },
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

/** Slug used as metadata.name for the generated resources. */
export function apiSlug(s: WizardState): string {
  const base = (s.displayName || s.serviceName || 'my-api')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'my-api';
}
