# Demo Resources

Sample Kubernetes manifests that populate every major view of the Connectivity Link console plugin.

## What is included

| Resource | Kind | Name |
|----------|------|------|
| Namespace | `Namespace` | `console-demo-resources` |
| Gateway | `Gateway` | `demo-gateway` |
| HTTPRoute | `HTTPRoute` | `demo-api-route` |
| Service | `Service` | `demo-api-svc` |
| Auth policy | `AuthPolicy` | `demo-auth` |
| Rate-limit policy | `RateLimitPolicy` | `demo-rate-limit` |
| TLS policy | `TLSPolicy` | `demo-tls` |
| DNS policy | `DNSPolicy` | `demo-dns` |
| API product | `APIProduct` | `demo-petstore-api` |
| API key (approved) | `APIKey` | `demo-key-alice` |
| API key (pending) | `APIKey` | `demo-key-bob` |
| API key (rejected) | `APIKey` | `demo-key-carol` |

## Apply

```bash
oc apply -f demo/namespace.yaml
oc apply -f demo/
./demo/patch-status.sh
```

The `patch-status.sh` script populates status subresources (plans, auth scheme, API key phases) that cannot be set via `oc apply`.

## Clean up

```bash
oc delete -f demo/
```
