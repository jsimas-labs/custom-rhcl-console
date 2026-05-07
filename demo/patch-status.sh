#!/usr/bin/env bash
#
# Patches status subresources that cannot be set via oc apply.
# Run after: oc apply -f demo/
#
set -euo pipefail

NS="console-demo-resources"

echo "Patching APIProduct status..."
oc patch apiproduct demo-petstore-api -n "$NS" \
  --type merge --subresource=status \
  --patch '{
    "status": {
      "discoveredPlans": [
        {
          "tier": "Free",
          "limits": { "daily": 1000 }
        },
        {
          "tier": "Pro",
          "limits": { "daily": 50000, "monthly": 1000000 }
        }
      ],
      "conditions": [
        {
          "type": "Ready",
          "status": "True",
          "reason": "Reconciled",
          "message": "API product is published and available",
          "lastTransitionTime": "2026-05-07T12:00:00Z"
        }
      ]
    }
  }'

echo "Patching APIKey statuses..."
oc patch apikey demo-key-alice -n "$NS" \
  --type merge --subresource=status \
  --patch '{"status": {"phase": "Approved", "reviewedAt": "2026-05-06T10:00:00Z", "reviewedBy": "admin"}}'

oc patch apikey demo-key-bob -n "$NS" \
  --type merge --subresource=status \
  --patch '{"status": {"phase": "Pending"}}'

oc patch apikey demo-key-carol -n "$NS" \
  --type merge --subresource=status \
  --patch '{"status": {"phase": "Rejected", "reviewedAt": "2026-05-05T15:30:00Z", "reviewedBy": "admin"}}'

echo "Done. Status subresources patched."
