import * as React from 'react';
import { useNavigate } from 'react-router';
import { SearchInput, Popper, Menu, MenuContent, MenuList, MenuItem } from '@patternfly/react-core';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { HTTPRouteGVK, GatewayGVK } from '../../models';
import { Gateway, HTTPRoute } from '../../types';
import { matchesHostnameSearch, getGatewayExternalHostnames } from '../../utils/hostname';

interface SearchResult {
  kind: 'Gateway' | 'HTTPRoute';
  name: string;
  namespace: string;
  hostname: string;
}

const HostnameSearch: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const [gateways] = useK8sWatchResource<Gateway[]>({
    groupVersionKind: GatewayGVK,
    isList: true,
  });

  const [httpRoutes] = useK8sWatchResource<HTTPRoute[]>({
    groupVersionKind: HTTPRouteGVK,
    isList: true,
  });

  const results = React.useMemo((): SearchResult[] => {
    if (!searchValue || searchValue.length < 2) return [];

    const matches: SearchResult[] = [];

    for (const gw of gateways || []) {
      const hostnames = getGatewayExternalHostnames(gw);
      if (matchesHostnameSearch(hostnames, searchValue)) {
        for (const h of hostnames.filter((hn) => hn.toLowerCase().includes(searchValue.toLowerCase()))) {
          matches.push({
            kind: 'Gateway',
            name: gw.metadata?.name || '',
            namespace: gw.metadata?.namespace || '',
            hostname: h,
          });
        }
      }
    }

    for (const route of httpRoutes || []) {
      const hostnames = route.spec.hostnames || [];
      if (matchesHostnameSearch(hostnames, searchValue)) {
        for (const h of hostnames.filter((hn) => hn.toLowerCase().includes(searchValue.toLowerCase()))) {
          matches.push({
            kind: 'HTTPRoute',
            name: route.metadata?.name || '',
            namespace: route.metadata?.namespace || '',
            hostname: h,
          });
        }
      }
    }

    return matches.slice(0, 20);
  }, [searchValue, gateways, httpRoutes]);

  const onSelect = (result: SearchResult) => {
    const basePath = result.kind === 'Gateway' ? 'gateways' : 'httproutes';
    navigate(`/connectivity-link/${basePath}/${result.namespace}/${result.name}`);
    setSearchValue('');
    setIsOpen(false);
  };

  const menu = (
    <div ref={menuRef}>
      <Menu onSelect={(_e, itemId) => {
        const result = results[itemId as number];
        if (result) onSelect(result);
      }}>
        <MenuContent>
          <MenuList>
            {results.map((r, i) => (
              <MenuItem key={`${r.kind}-${r.namespace}-${r.name}-${r.hostname}`} itemId={i}>
                {r.kind}: {r.namespace}/{r.name} ({r.hostname})
              </MenuItem>
            ))}
          </MenuList>
        </MenuContent>
      </Menu>
    </div>
  );

  return (
    <div ref={searchInputRef}>
      <SearchInput
        placeholder={t('Search by hostname')}
        value={searchValue}
        onChange={(_e, val) => {
          setSearchValue(val);
          setIsOpen(val.length >= 2 && results.length > 0);
        }}
        onClear={() => {
          setSearchValue('');
          setIsOpen(false);
        }}
        onFocus={() => {
          if (results.length > 0) setIsOpen(true);
        }}
      />
      <Popper
        triggerRef={searchInputRef}
        popper={menu}
        popperRef={menuRef}
        isVisible={isOpen && results.length > 0}
        appendTo={() => document.body}
      />
    </div>
  );
};

export default HostnameSearch;
