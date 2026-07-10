/**
 * Manifest generators — pure functions WizardState → K8s objects.
 *
 * Every generator returns `null` when the state says the resource
 * shouldn't exist (e.g. no DNSPolicy for internal APIs), so callers
 * can `filter(Boolean)` the full list to know exactly what the wizard
 * will create. The same list feeds three surfaces: the sidebar's
 * Generated Resources, the Review screen's YAML and the final
 * k8sCreate() loop — one source of truth, no drift.
 */
import { dump } from 'js-yaml';
import { WizardState, apiSlug } from './wizardTypes';

export interface GeneratedResource {
  kind: string;
  name: string;
  namespace?: string;
  /** apiGroup + apiVersion for the k8sCreate model. */
  apiGroup: string;
  apiVersion: string;
  plural: string;
  manifest: Record<string, unknown>;
}

function gatewayNamespace(s: WizardState): string {
  return s.useExistingGateway
    ? s.existingGatewayNamespace || 'rhcl-gateways'
    : s.namespace || 'rhcl-gateways';
}

function gatewayName(s: WizardState): string {
  return s.useExistingGateway ? s.existingGatewayName : s.gatewayName || `${apiSlug(s)}-gw`;
}

// ---------------------------------------------------------------------------

export function genGateway(s: WizardState): GeneratedResource | null {
  if (s.useExistingGateway) return null;
  const name = gatewayName(s);
  const ns = gatewayNamespace(s);
  const listeners: Record<string, unknown>[] = [
    {
      name: s.listenerProtocol === 'HTTPS' ? 'https' : 'http',
      hostname: s.hostname || undefined,
      port: s.listenerPort,
      protocol: s.listenerProtocol,
      allowedRoutes: { namespaces: { from: 'All' } },
      ...(s.tlsEnabled && s.listenerProtocol === 'HTTPS'
        ? { tls: { mode: 'Terminate', certificateRefs: [{ name: `${name}-tls` }] } }
        : {}),
    },
  ];
  return {
    kind: 'Gateway',
    name,
    namespace: ns,
    apiGroup: 'gateway.networking.k8s.io',
    apiVersion: 'v1',
    plural: 'gateways',
    manifest: {
      apiVersion: 'gateway.networking.k8s.io/v1',
      kind: 'Gateway',
      metadata: { name, namespace: ns },
      spec: {
        gatewayClassName: 'istio',
        listeners,
      },
    },
  };
}

/** Gateway API requires absolute paths — normalise whatever the user typed. */
function normalizePath(p: string): string {
  const trimmed = (p || '').trim();
  if (!trimmed || trimmed === '/') return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/** Namespace where the HTTPRoute lives — first backend's namespace. */
function httpRouteNamespace(s: WizardState): string {
  return s.backends[0]?.namespace || '';
}

/**
 * Render one `backendRefs[]` list for a rule, resolving:
 *
 *   - which pool entries serve this rule (all if no override; the
 *     subset in `rule.backendIds` otherwise)
 *   - whether each entry is cross-namespace (emit `namespace:` on the
 *     ref; a ReferenceGrant will be generated in that remote namespace)
 *   - the weight — omitted when the resolved list has one entry
 *     (avoids YAML noise on the common single-backend case)
 */
function backendRefsForRule(
  s: WizardState,
  rule: WizardState['routes'][number],
): Array<Record<string, unknown>> {
  const routeNs = httpRouteNamespace(s);
  const pool =
    rule.backendIds && rule.backendIds.length > 0
      ? s.backends.filter((b) => rule.backendIds!.includes(b.id))
      : s.backends;
  if (pool.length === 0) return [];
  const single = pool.length === 1;
  return pool.map((b) => {
    const ref: Record<string, unknown> = { name: b.name, port: b.port ?? 80 };
    if (b.namespace && b.namespace !== routeNs) {
      ref.namespace = b.namespace;
    }
    if (!single) ref.weight = b.weight || 1;
    return ref;
  });
}

export function genHTTPRoute(s: WizardState): GeneratedResource | null {
  if (s.backends.length === 0 || !s.backends.every((b) => b.name)) return null;
  const name = `${apiSlug(s)}-route`;
  const ns = httpRouteNamespace(s);
  const rules = s.routes.map((r) => ({
    matches: [
      {
        path: { type: r.matchType, value: normalizePath(r.path) },
        ...(r.method !== 'ANY' ? { method: r.method } : {}),
      },
    ],
    backendRefs: backendRefsForRule(s, r),
  }));
  return {
    kind: 'HTTPRoute',
    name,
    namespace: ns,
    apiGroup: 'gateway.networking.k8s.io',
    apiVersion: 'v1',
    plural: 'httproutes',
    manifest: {
      apiVersion: 'gateway.networking.k8s.io/v1',
      kind: 'HTTPRoute',
      metadata: { name, namespace: ns },
      spec: {
        parentRefs: [
          {
            name: gatewayName(s),
            namespace: gatewayNamespace(s),
          },
        ],
        ...(s.hostname ? { hostnames: [s.hostname] } : {}),
        rules,
      },
    },
  };
}

/**
 * Gateway API cross-namespace policy: an HTTPRoute in namespace A that
 * references a Service in namespace B needs the Service's namespace to
 * grant it. One ReferenceGrant per remote namespace, allowing HTTPRoute
 * in the origin namespace to reference Service.
 */
export function genReferenceGrants(s: WizardState): GeneratedResource[] {
  if (s.backends.length === 0) return [];
  const originNs = httpRouteNamespace(s);
  const remotes = new Set<string>();
  for (const b of s.backends) {
    if (b.namespace && b.namespace !== originNs) remotes.add(b.namespace);
  }
  const grants: GeneratedResource[] = [];
  for (const remoteNs of remotes) {
    const name = `rg-${originNs}-${apiSlug(s)}`;
    grants.push({
      kind: 'ReferenceGrant',
      name,
      namespace: remoteNs,
      apiGroup: 'gateway.networking.k8s.io',
      apiVersion: 'v1beta1',
      plural: 'referencegrants',
      manifest: {
        apiVersion: 'gateway.networking.k8s.io/v1beta1',
        kind: 'ReferenceGrant',
        metadata: { name, namespace: remoteNs },
        spec: {
          from: [
            {
              group: 'gateway.networking.k8s.io',
              kind: 'HTTPRoute',
              namespace: originNs,
            },
          ],
          to: [{ group: '', kind: 'Service' }],
        },
      },
    });
  }
  return grants;
}

export function genAuthPolicy(s: WizardState): GeneratedResource | null {
  if (s.backends.length === 0) return null;
  const name = `${apiSlug(s)}-auth`;
  const ns = s.namespace;

  let authentication: Record<string, unknown>;
  if (s.authMode === 'anonymous') {
    // Explicit anonymous AuthPolicy on the HTTPRoute — needed even for
    // "Public REST API" templates. Kuadrant policies attached to the
    // Gateway propagate to every attached HTTPRoute by default; on
    // shared gateways (openshift-ingress/rhcl-apps-gateway et al.) the
    // parent typically carries a \`deny-all\` AuthPolicy for safety, and
    // without an explicit route-level override the freshly-published
    // "public" API 401s in production. Emitting an anonymous policy on
    // the HTTPRoute overrides the parent per Gateway API GEP-713
    // policy-attachment defaults semantics. This is exactly the
    // pattern Kuadrant docs recommend for public routes on shared
    // gateways.
    authentication = {
      public: { anonymous: {} },
    };
  } else if (s.authMode === 'api-key') {
    authentication = {
      'api-key-users': {
        apiKey: {
          selector: { matchLabels: { app: `${apiSlug(s)}-apikey` } },
          allNamespaces: true,
        },
        credentials: { customHeader: { name: s.apiKeyHeader || 'api-key' } },
      },
    };
  } else if (s.authMode === 'jwt') {
    authentication = {
      jwt: {
        jwt: {
          issuerUrl: s.jwtIssuer,
          ...(s.jwksUrl ? { jwksUrl: s.jwksUrl } : {}),
        },
        ...(s.jwtAudience ? { audiences: [s.jwtAudience] } : {}),
      },
    };
  } else {
    // oidc
    authentication = {
      oidc: {
        jwt: { issuerUrl: s.oidcDiscoveryUrl },
      },
    };
  }

  return {
    kind: 'AuthPolicy',
    name,
    namespace: ns,
    apiGroup: 'kuadrant.io',
    apiVersion: 'v1',
    plural: 'authpolicies',
    manifest: {
      apiVersion: 'kuadrant.io/v1',
      kind: 'AuthPolicy',
      metadata: { name, namespace: ns },
      spec: {
        targetRef: {
          group: 'gateway.networking.k8s.io',
          kind: 'HTTPRoute',
          name: `${apiSlug(s)}-route`,
        },
        rules: { authentication },
      },
    },
  };
}

/**
 * Build the `limits` map for a RateLimitPolicy from the wizard's
 * scope + optional value. Each scope translates to a distinct shape:
 *
 *   - per-consumer  → counters keyed on `auth.identity.userid`
 *   - global        → no counters (single bucket for the target)
 *   - per-ip        → counters keyed on `source.remote_address`
 *   - per-ip-range  → `when` predicate matching the CIDR + IP counter
 *   - per-header    → counters keyed on the request header
 *   - per-endpoint  → `when` predicate on `request.path` for the prefix
 *   - per-plan      → multiple named limits, one per plan tier, each
 *                     gated by a `when` predicate on `auth.identity.plan`
 *
 * The output slots into `spec.limits`. Keeping the mapping here (vs
 * inline in the caller) means the wizard, the RateLimitPolicy form
 * modal, and the review-YAML preview all read the same source of truth.
 */
function buildRateLimitLimits(s: WizardState): Record<string, unknown> {
  const rates = [{ limit: s.rateLimit, window: s.rateWindow }];
  switch (s.rateLimitScope) {
    case 'per-consumer':
      return {
        default: {
          rates,
          counters: [{ expression: 'auth.identity.userid' }],
        },
      };
    case 'global':
      return {
        default: { rates },
      };
    case 'per-ip':
      return {
        default: {
          rates,
          counters: [{ expression: 'source.remote_address' }],
        },
      };
    case 'per-ip-range': {
      const cidr = s.rateLimitScopeValue || '0.0.0.0/0';
      return {
        default: {
          rates,
          counters: [{ expression: 'source.remote_address' }],
          when: [
            {
              // CEL: `source.remote_address` is a string like "10.0.0.5:53023",
              // so we split the port off before matching. `.startsWith` on the
              // CIDR base is a pragmatic approximation of subnet membership —
              // exact match is via `ipMatch()` if Limitador ships the ext.
              predicate: `source.remote_address.split(":")[0].startsWith("${cidr.split('/')[0]}")`,
            },
          ],
        },
      };
    }
    case 'per-header': {
      const header = s.rateLimitScopeValue || 'X-Tenant';
      return {
        default: {
          rates,
          counters: [{ expression: `request.headers.${header.toLowerCase()}` }],
        },
      };
    }
    case 'per-endpoint': {
      const path = s.rateLimitScopeValue || '/';
      return {
        [`limit-${path.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'root'}`]: {
          rates,
          when: [{ predicate: `request.path.startsWith("${path}")` }],
        },
      };
    }
    case 'per-plan':
      // One named limit per common plan tier so the operator sees the
      // shape and can rename / add tiers. Each is gated on
      // `auth.identity.plan`. Limits inherit the same `rates` since the
      // wizard only asks for one — customer can raise/lower per plan in
      // the YAML tab after review.
      return {
        gold: {
          rates,
          when: [{ predicate: 'auth.identity.plan == "gold"' }],
        },
        silver: {
          rates: [{ limit: Math.max(1, Math.floor(s.rateLimit / 2)), window: s.rateWindow }],
          when: [{ predicate: 'auth.identity.plan == "silver"' }],
        },
        bronze: {
          rates: [{ limit: Math.max(1, Math.floor(s.rateLimit / 4)), window: s.rateWindow }],
          when: [{ predicate: 'auth.identity.plan == "bronze"' }],
        },
      };
  }
}

export function genRateLimitPolicy(s: WizardState): GeneratedResource | null {
  if (!s.rateLimitEnabled || s.backends.length === 0) return null;
  const name = `${apiSlug(s)}-ratelimit`;
  const ns = s.namespace;
  return {
    kind: 'RateLimitPolicy',
    name,
    namespace: ns,
    apiGroup: 'kuadrant.io',
    apiVersion: 'v1',
    plural: 'ratelimitpolicies',
    manifest: {
      apiVersion: 'kuadrant.io/v1',
      kind: 'RateLimitPolicy',
      metadata: { name, namespace: ns },
      spec: {
        targetRef: {
          group: 'gateway.networking.k8s.io',
          kind: 'HTTPRoute',
          name: `${apiSlug(s)}-route`,
        },
        limits: buildRateLimitLimits(s),
      },
    },
  };
}

export function genTokenRateLimitPolicy(s: WizardState): GeneratedResource | null {
  if (!s.tokenLimitEnabled || s.backends.length === 0) return null;
  const name = `${apiSlug(s)}-tokenlimit`;
  const ns = s.namespace;
  return {
    kind: 'TokenRateLimitPolicy',
    name,
    namespace: ns,
    apiGroup: 'kuadrant.io',
    apiVersion: 'v1alpha1',
    plural: 'tokenratelimitpolicies',
    manifest: {
      apiVersion: 'kuadrant.io/v1alpha1',
      kind: 'TokenRateLimitPolicy',
      metadata: { name, namespace: ns },
      spec: {
        targetRef: {
          group: 'gateway.networking.k8s.io',
          kind: 'HTTPRoute',
          name: `${apiSlug(s)}-route`,
        },
        limits: {
          default: {
            rates: [{ limit: s.tokenLimit, window: s.tokenWindow }],
          },
        },
      },
    },
  };
}

/**
 * Skip DNSPolicy / TLSPolicy generation when the wizard is attaching to
 * an existing Gateway. Reasoning: on shared gateways (openshift-ingress
 * / rhcl-gateways) the DNS + TLS policies are almost always owned
 * centrally, one per Gateway. Adding a second policy that targets the
 * same Gateway lands as `Accepted=False Conflicted` — Kuadrant rejects
 * the newcomer because only one DNSPolicy / TLSPolicy can win. The
 * operator's actual intent when picking "attach to existing gateway"
 * is "inherit its DNS + TLS", not "clone them".
 */
function skipGatewayScopedPolicy(s: WizardState): boolean {
  return s.useExistingGateway;
}

export function genDNSPolicy(s: WizardState): GeneratedResource | null {
  if (skipGatewayScopedPolicy(s)) return null;
  if (!s.dnsEnabled) return null;
  const gwName = gatewayName(s);
  if (!gwName) return null;
  const name = `${apiSlug(s)}-dns`;
  const ns = gatewayNamespace(s);
  return {
    kind: 'DNSPolicy',
    name,
    namespace: ns,
    apiGroup: 'kuadrant.io',
    apiVersion: 'v1',
    plural: 'dnspolicies',
    manifest: {
      apiVersion: 'kuadrant.io/v1',
      kind: 'DNSPolicy',
      metadata: { name, namespace: ns },
      spec: {
        targetRef: {
          group: 'gateway.networking.k8s.io',
          kind: 'Gateway',
          name: gwName,
        },
        providerRefs: [{ name: 'dns-provider-credentials' }],
      },
    },
  };
}

export function genTLSPolicy(s: WizardState): GeneratedResource | null {
  if (skipGatewayScopedPolicy(s)) return null;
  if (!s.tlsPolicyEnabled) return null;
  const gwName = gatewayName(s);
  if (!gwName) return null;
  const name = `${apiSlug(s)}-tls`;
  const ns = gatewayNamespace(s);
  return {
    kind: 'TLSPolicy',
    name,
    namespace: ns,
    apiGroup: 'kuadrant.io',
    apiVersion: 'v1',
    plural: 'tlspolicies',
    manifest: {
      apiVersion: 'kuadrant.io/v1',
      kind: 'TLSPolicy',
      metadata: { name, namespace: ns },
      spec: {
        targetRef: {
          group: 'gateway.networking.k8s.io',
          kind: 'Gateway',
          name: gwName,
        },
        issuerRef: {
          group: 'cert-manager.io',
          kind: 'ClusterIssuer',
          name: s.tlsIssuerName || 'lets-encrypt',
        },
      },
    },
  };
}

/**
 * Optional test-key Secret. Emitted only when the operator picked
 * api-key auth AND toggled the "generate test key" switch on the
 * Review step. The Secret carries:
 *
 *   - the wizard's random value in `stringData.api_key` — Kuadrant's
 *     AuthPolicy reads that field via `credentials.customHeader`;
 *   - the `authorino.kuadrant.io/managed-by: authorino` label so
 *     Authorino picks it up as an API key credential;
 *   - the `app: <slug>-apikey` label so it matches the AuthPolicy's
 *     `apiKey.selector.matchLabels` — see genAuthPolicy above.
 *
 * The value is echoed on the success screen inside the curl example so
 * an operator can paste and hit the endpoint immediately, no round
 * trip to the developer portal.
 */
export function genTestApiKeySecret(s: WizardState): GeneratedResource | null {
  if (s.authMode !== 'api-key') return null;
  if (!s.generateTestApiKey) return null;
  if (!s.testApiKeyValue) return null;
  if (s.backends.length === 0) return null;
  const name = `${apiSlug(s)}-test-key`;
  const ns = s.namespace;
  return {
    kind: 'Secret',
    name,
    namespace: ns,
    apiGroup: '',
    apiVersion: 'v1',
    plural: 'secrets',
    manifest: {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name,
        namespace: ns,
        labels: {
          app: `${apiSlug(s)}-apikey`,
          'authorino.kuadrant.io/managed-by': 'authorino',
          'kuadrant.io/apikeys-by': 'api_key',
        },
        annotations: {
          'secret.kuadrant.io/user-id': 'test-user',
        },
      },
      type: 'Opaque',
      stringData: {
        api_key: s.testApiKeyValue,
      },
    },
  };
}

export function genAPIProduct(s: WizardState): GeneratedResource | null {
  if (!s.productEnabled || s.backends.length === 0) return null;
  const name = apiSlug(s);
  const ns = s.namespace;
  return {
    kind: 'APIProduct',
    name,
    namespace: ns,
    apiGroup: 'devportal.kuadrant.io',
    apiVersion: 'v1alpha1',
    plural: 'apiproducts',
    manifest: {
      apiVersion: 'devportal.kuadrant.io/v1alpha1',
      kind: 'APIProduct',
      metadata: { name, namespace: ns },
      // Field set matches the 1.4.1 CRD exactly (approvalMode enum is
      // lowercase; `openAPIRef`/`visibility` are NOT in the schema —
      // sending them either fails validation or gets silently pruned).
      spec: {
        displayName: s.displayName || name,
        description: s.description || '',
        version: s.version || 'v1',
        ...(s.tags.length > 0 ? { tags: s.tags } : {}),
        approvalMode: s.approvalMode.toLowerCase(),
        targetRef: {
          group: 'gateway.networking.k8s.io',
          kind: 'HTTPRoute',
          name: `${apiSlug(s)}-route`,
        },
      },
    },
  };
}

/** Every resource the wizard will create, in apply order. */
export function generateAll(s: WizardState): GeneratedResource[] {
  return [
    genGateway(s),
    genHTTPRoute(s),
    // Zero or more ReferenceGrants — one per remote namespace hosting
    // a backend Service that the HTTPRoute points at.
    ...genReferenceGrants(s),
    genAuthPolicy(s),
    genRateLimitPolicy(s),
    genTokenRateLimitPolicy(s),
    genDNSPolicy(s),
    genTLSPolicy(s),
    genAPIProduct(s),
    genTestApiKeySecret(s),
  ].filter((r): r is GeneratedResource => r !== null);
}

export function toYaml(resources: GeneratedResource[]): string {
  return resources.map((r) => dump(r.manifest, { noRefs: true })).join('---\n');
}

/** Best-effort public URL of the API once created. */
export function exposedUrl(s: WizardState): string {
  const scheme = s.listenerProtocol === 'HTTPS' ? 'https' : 'http';
  const host = s.hostname || '<gateway-hostname>';
  const firstPath = s.routes[0]?.path || '/';
  return `${scheme}://${host}${firstPath}`;
}
