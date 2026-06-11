import { Gateway, GatewayStatusAddress } from '../types';

export function getGatewayExternalHostnames(gateway: Gateway): string[] {
  // Defensive against partial / cached Gateway objects (e.g. a watch that
  // delivered the resource before the API server filled status, or a stale
  // list entry where spec/status are not both present). The crash that
  // motivated this guard was "Cannot read properties of undefined (reading
  // 'addresses')" landing on `gateway.spec.addresses` when spec was absent
  // — `?.` everywhere we touch spec/status keeps us safe without changing
  // behaviour for normal Gateways.
  const hostnames: string[] = [];

  const addresses = gateway.status?.addresses || gateway.spec?.addresses || [];
  for (const addr of addresses) {
    if (addr.type === 'Hostname' || (!addr.type && !isIPAddress(addr.value))) {
      hostnames.push(addr.value);
    }
  }

  if (hostnames.length === 0) {
    for (const listener of gateway.spec?.listeners || []) {
      if (listener.hostname) {
        hostnames.push(listener.hostname);
      }
    }
  }

  if (hostnames.length === 0) {
    const ipAddresses = (gateway.status?.addresses as GatewayStatusAddress[]) || [];
    for (const addr of ipAddresses) {
      if (addr.type === 'IPAddress') {
        hostnames.push(addr.value);
      }
    }
  }

  return [...new Set(hostnames)];
}

export function truncateHostnames(hostnames: string[], maxLength = 60): string {
  if (hostnames.length === 0) return '-';
  const joined = hostnames.join(', ');
  if (joined.length <= maxLength) return joined;
  return `${joined.substring(0, maxLength)}...`;
}

export function hostnameToURL(hostname: string): string {
  if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
    return hostname;
  }
  return `https://${hostname}`;
}

export function matchesHostnameSearch(
  hostnames: string[],
  search: string,
): boolean {
  const lowerSearch = search.toLowerCase();
  return hostnames.some((h) => {
    const lowerH = h.toLowerCase();
    return lowerH.includes(lowerSearch) || lowerH.endsWith(lowerSearch);
  });
}

function isIPAddress(value: string): boolean {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value) || value.includes(':');
}
