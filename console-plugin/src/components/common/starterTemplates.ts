/**
 * Minimal starter manifests for the "Create" flow of every secondary
 * Kind the plugin surfaces (Gateway, HTTPRoute, GRPCRoute, and the five
 * Kuadrant policies). The values here are intentionally the shortest
 * valid skeleton the API server will accept — anything more elaborate
 * pretends to know the user's intent and gets in the way when the goal
 * is just "give me a template I can edit".
 *
 * `<KIND>` placeholders in string fields (name, targetRef.name) mark
 * where the user MUST type something. The YAML tab surfaces them as
 * visible tokens so a submit without editing fails fast with a
 * schema-side error rather than creating a resource literally named
 * "<name>".
 *
 * Kept separate from `src/components/wizard/manifests.ts` because that
 * file's generators are bound to `WizardState` — they're pure functions
 * of the wizard's guided-flow inputs, not standalone factories. Reusing
 * them here would either (a) require synthesizing a fake WizardState
 * for each Kind or (b) leak wizard concerns into the plain-Create path.
 * A ~100-line templates file is the cheaper cost.
 */
import { dump } from 'js-yaml';

export interface StarterTemplate {
  /** Minimal object the API server accepts. */
  manifest: Record<string, unknown>;
  /** Optional hint shown as help text under the YAML tab. */
  hint?: string;
}

const gateway = (ns: string): StarterTemplate => ({
  manifest: {
    apiVersion: 'gateway.networking.k8s.io/v1',
    kind: 'Gateway',
    metadata: {
      name: '<gateway-name>',
      namespace: ns,
    },
    spec: {
      gatewayClassName: 'istio',
      listeners: [
        {
          name: 'http',
          port: 80,
          protocol: 'HTTP',
          allowedRoutes: { namespaces: { from: 'All' } },
        },
      ],
    },
  },
  hint: 'Attach one or more listeners. For HTTPS add a `tls` block referencing a Secret in the same namespace.',
});

const httpRoute = (ns: string): StarterTemplate => ({
  manifest: {
    apiVersion: 'gateway.networking.k8s.io/v1',
    kind: 'HTTPRoute',
    metadata: {
      name: '<route-name>',
      namespace: ns,
    },
    spec: {
      parentRefs: [
        {
          name: '<gateway-name>',
          namespace: 'openshift-ingress',
        },
      ],
      hostnames: ['<host.example.com>'],
      rules: [
        {
          matches: [{ path: { type: 'PathPrefix', value: '/' } }],
          backendRefs: [
            {
              name: '<service-name>',
              port: 8080,
            },
          ],
        },
      ],
    },
  },
  hint: 'parentRefs picks the Gateway. Each rule pairs matches (path/method/headers) with backendRefs (Services in this namespace).',
});

const grpcRoute = (ns: string): StarterTemplate => ({
  manifest: {
    apiVersion: 'gateway.networking.k8s.io/v1',
    kind: 'GRPCRoute',
    metadata: {
      name: '<grpc-route-name>',
      namespace: ns,
    },
    spec: {
      parentRefs: [
        {
          name: '<gateway-name>',
          namespace: 'openshift-ingress',
        },
      ],
      hostnames: ['<grpc.example.com>'],
      rules: [
        {
          matches: [{ method: { service: 'my.package.MyService' } }],
          backendRefs: [
            {
              name: '<grpc-service-name>',
              port: 9000,
            },
          ],
        },
      ],
    },
  },
  hint: 'HTTP/2 required — the gateway listener must be HTTP or HTTPS with h2 enabled. Match by full service or per-method.',
});

const policyTargetRef = {
  group: 'gateway.networking.k8s.io',
  kind: 'Gateway',
  name: '<gateway-or-route-name>',
};

const authPolicy = (ns: string): StarterTemplate => ({
  manifest: {
    apiVersion: 'kuadrant.io/v1',
    kind: 'AuthPolicy',
    metadata: {
      name: '<authpolicy-name>',
      namespace: ns,
    },
    spec: {
      targetRef: policyTargetRef,
      rules: {
        authentication: {
          'api-key-users': {
            apiKey: {
              selector: {
                matchLabels: { app: '<app-label>' },
              },
            },
            credentials: {
              authorizationHeader: { prefix: 'APIKEY' },
            },
          },
        },
      },
    },
  },
  hint: 'targetRef can point at a Gateway (protects every route on it) or an HTTPRoute (per-route). rules.authentication supports apiKey/jwt/mtls/anonymous.',
});

const rateLimitPolicy = (ns: string): StarterTemplate => ({
  manifest: {
    apiVersion: 'kuadrant.io/v1',
    kind: 'RateLimitPolicy',
    metadata: {
      name: '<ratelimit-name>',
      namespace: ns,
    },
    spec: {
      targetRef: policyTargetRef,
      limits: {
        'default-rate': {
          rates: [{ limit: 100, window: '1m' }],
        },
      },
    },
  },
  hint: 'Each named limit is one bucket. Add `when` predicates or `counters` (e.g. auth.identity.userid) to key rates per-consumer.',
});

const tokenRateLimitPolicy = (ns: string): StarterTemplate => ({
  manifest: {
    apiVersion: 'kuadrant.io/v1alpha1',
    kind: 'TokenRateLimitPolicy',
    metadata: {
      name: '<token-limit-name>',
      namespace: ns,
    },
    spec: {
      targetRef: policyTargetRef,
      limits: {
        'default-token-limit': {
          rates: [{ limit: 10000, window: '1m' }],
        },
      },
    },
  },
  hint: 'Limits token counts (usage.total_tokens) rather than requests — meant for LLM-shaped backends. Requires Limitador with the wasm token counter.',
});

const dnsPolicy = (ns: string): StarterTemplate => ({
  manifest: {
    apiVersion: 'kuadrant.io/v1',
    kind: 'DNSPolicy',
    metadata: {
      name: '<dnspolicy-name>',
      namespace: ns,
    },
    spec: {
      targetRef: {
        group: 'gateway.networking.k8s.io',
        kind: 'Gateway',
        name: '<gateway-name>',
      },
      providerRefs: [{ name: '<dns-provider-secret>' }],
      loadBalancing: {
        weighted: { defaultWeight: 120 },
      },
    },
  },
  hint: 'providerRefs must reference a Secret with credentials for AWS Route53, Google Cloud DNS, or Azure DNS.',
});

const tlsPolicy = (ns: string): StarterTemplate => ({
  manifest: {
    apiVersion: 'kuadrant.io/v1',
    kind: 'TLSPolicy',
    metadata: {
      name: '<tlspolicy-name>',
      namespace: ns,
    },
    spec: {
      targetRef: {
        group: 'gateway.networking.k8s.io',
        kind: 'Gateway',
        name: '<gateway-name>',
      },
      issuerRef: {
        group: 'cert-manager.io',
        kind: 'ClusterIssuer',
        name: '<clusterissuer-name>',
      },
    },
  },
  hint: 'Requires cert-manager. issuerRef.kind may be ClusterIssuer or Issuer (namespaced). The plugin will not create the Issuer for you.',
});

const generators = {
  Gateway: gateway,
  HTTPRoute: httpRoute,
  GRPCRoute: grpcRoute,
  AuthPolicy: authPolicy,
  RateLimitPolicy: rateLimitPolicy,
  TokenRateLimitPolicy: tokenRateLimitPolicy,
  DNSPolicy: dnsPolicy,
  TLSPolicy: tlsPolicy,
} as const;

export type SupportedKind = keyof typeof generators;

/**
 * Return the starter template + serialised YAML for a given Kind and
 * target namespace. Namespace defaults to `rhcl-apps` — the lab's
 * conventional home for Kuadrant policies — but the caller should pass
 * whatever the current page's default is (usually the namespace
 * selector's active value).
 */
export function starterFor(
  kind: SupportedKind,
  namespace = 'rhcl-apps',
): { template: StarterTemplate; yaml: string } {
  const template = generators[kind](namespace);
  const yaml = dump(template.manifest, {
    lineWidth: 0,
    noRefs: true,
    sortKeys: false,
  });
  return { template, yaml };
}

export function isSupportedKind(kind: string): kind is SupportedKind {
  return kind in generators;
}
