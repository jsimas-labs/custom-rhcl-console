import * as React from 'react';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { ProbeResult } from './useProbeHistory';

interface ProbeOptions {
  namespace: string;
  serviceName: string;
  port: number;
  path: string;                       // include leading slash
  extraHeaders?: Record<string, string>;
  // Whether the Service is named `https` / appProtocol `https` — we prepend
  // the `https:` scheme in the kube-apiserver proxy URL so the proxy uses
  // TLS to talk to the pod. The cert doesn't need to be valid (the K8s
  // API server doesn't verify the upstream by default).
  https?: boolean;
}

/**
 * Fires a synthetic probe against a Kubernetes Service using the
 * **kube-apiserver Service proxy** path:
 *
 *   /api/kubernetes/api/v1/namespaces/<ns>/services/<svc>:<port>/proxy/<path>
 *
 * Why this instead of a browser fetch to the route's external hostname:
 *
 *   - **Bypasses CORS.** Same-origin against the Console; the browser
 *     doesn't care about the upstream's `Access-Control-Allow-Origin`.
 *   - **No TLS chain headache.** Cert-manager self-signed certs, custom
 *     CAs, or the gateway's own TLS termination don't block the probe.
 *   - **RBAC-correct.** The probe inherits the logged-in user's permissions.
 *     If they can `get` services in the target namespace, the probe runs.
 *
 * Tradeoff (worth surfacing in UI): the probe **does not traverse the
 * Envoy gateway** — it hits the backend Service directly through the K8s
 * API. So it answers "is the backend Service responding?", not "is the
 * end-to-end route via the gateway working?". The route's `Accepted` +
 * `ResolvedRefs` conditions already cover the gateway-side wiring; if
 * both are True and the backend responds via this probe, the operator
 * has strong evidence the full path works.
 *
 * For routes that need end-to-end testing (e.g. exercising an Envoy
 * filter), the UI offers a "Copy curl" companion below the probe.
 */
export function useServiceProbe(): {
  probe: (opts: ProbeOptions) => Promise<ProbeResult>;
} {
  const probe = React.useCallback(async (opts: ProbeOptions): Promise<ProbeResult> => {
    const { namespace, serviceName, port, path, extraHeaders, https } = opts;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // Service-target syntax: `<scheme>:<svcName>:<portName-or-number>`
    const target = `${https ? 'https:' : ''}${serviceName}:${port}`;
    const url = `/api/kubernetes/api/v1/namespaces/${encodeURIComponent(namespace)}/services/${encodeURIComponent(target)}/proxy${cleanPath}`;

    const t0 = performance.now();
    try {
      const response = await consoleFetch(url, {
        method: 'GET',
        headers: { ...(extraHeaders || {}) },
      });
      return {
        timestamp: Date.now(),
        status: response.status,
        durationMs: Math.round(performance.now() - t0),
        path: cleanPath,
      };
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      return {
        timestamp: Date.now(),
        status: 0,
        durationMs: Math.round(performance.now() - t0),
        path: cleanPath,
        error: err.message,
      };
    }
  }, []);

  return { probe };
}
