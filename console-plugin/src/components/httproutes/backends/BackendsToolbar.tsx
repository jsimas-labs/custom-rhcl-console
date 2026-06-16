import * as React from 'react';
import {
  Toolbar, ToolbarContent, ToolbarItem, ToolbarFilter, ToolbarGroup,
  SearchInput, MenuToggle, MenuToggleElement, Select, SelectList, SelectOption,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export interface BackendFilters {
  search: string;
  health: 'all' | 'ok' | 'warn' | 'bad';
  resolution: 'all' | 'resolved' | 'unresolved';
}

export const defaultFilters: BackendFilters = {
  search: '',
  health: 'all',
  resolution: 'all',
};

interface Props {
  filters: BackendFilters;
  onChange: (f: BackendFilters) => void;
  total: number;
}

/**
 * Search + two filter selects in a PF Toolbar. Filters show as removable
 * chips below the toolbar (PF default behaviour); "Clear filters" appears
 * when any non-default filter is active.
 *
 * Toolbar is intentionally lean — we don't want a row of action buttons
 * competing with the row click affordance.
 */
export const BackendsToolbar: React.FC<Props> = ({ filters, onChange, total }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const someActive =
    filters.search !== '' || filters.health !== 'all' || filters.resolution !== 'all';

  return (
    <Toolbar
      id="backends-toolbar"
      clearAllFilters={someActive ? () => onChange(defaultFilters) : undefined}
      clearFiltersButtonText={t('Clear all filters')}
    >
      <ToolbarContent>
        <ToolbarItem style={{ minWidth: 320 }}>
          <SearchInput
            placeholder={t('Search backends by name')}
            value={filters.search}
            onChange={(_e, v) => onChange({ ...filters, search: v })}
            onClear={() => onChange({ ...filters, search: '' })}
            aria-label={t('Search backends')}
          />
        </ToolbarItem>

        <ToolbarGroup variant="filter-group">
          <ToolbarFilter
            labels={filters.health !== 'all' ? [healthLabel(filters.health, t)] : []}
            categoryName={t('Health')}
            deleteLabel={() => onChange({ ...filters, health: 'all' })}
            deleteLabelGroup={() => onChange({ ...filters, health: 'all' })}
          >
            <HealthSelect value={filters.health} onChange={(v) => onChange({ ...filters, health: v })} />
          </ToolbarFilter>

          <ToolbarFilter
            labels={filters.resolution !== 'all' ? [resolutionLabel(filters.resolution, t)] : []}
            categoryName={t('Resolution')}
            deleteLabel={() => onChange({ ...filters, resolution: 'all' })}
            deleteLabelGroup={() => onChange({ ...filters, resolution: 'all' })}
          >
            <ResolutionSelect value={filters.resolution} onChange={(v) => onChange({ ...filters, resolution: v })} />
          </ToolbarFilter>
        </ToolbarGroup>

        <ToolbarItem align={{ default: 'alignEnd' }}>
          <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: 13 }}>
            {t('{{n}} backends', { n: total })}
          </span>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

// ── Helpers — small Select wrappers ─────────────────────────────────────────
// Wrapped inline (vs SimpleSelect from @patternfly/react-templates) so we
// don't add a new dependency just for two dropdowns. Same UX, ~25 lines each.

const HealthSelect: React.FC<{
  value: BackendFilters['health'];
  onChange: (v: BackendFilters['health']) => void;
}> = ({ value, onChange }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [open, setOpen] = React.useState(false);
  const opts: Array<{ v: BackendFilters['health']; label: string }> = [
    { v: 'all',  label: t('Health: All') },
    { v: 'ok',   label: t('Health: Healthy') },
    { v: 'warn', label: t('Health: Warning') },
    { v: 'bad',  label: t('Health: Error') },
  ];
  const current = opts.find((o) => o.v === value)?.label ?? opts[0].label;
  return (
    <Select
      isOpen={open}
      onOpenChange={setOpen}
      onSelect={(_e, v) => { onChange(v as BackendFilters['health']); setOpen(false); }}
      selected={value}
      toggle={(ref: React.Ref<MenuToggleElement>) => (
        <MenuToggle ref={ref} onClick={() => setOpen(!open)} isExpanded={open}>
          {current}
        </MenuToggle>
      )}
    >
      <SelectList>
        {opts.map((o) => (<SelectOption key={o.v} value={o.v}>{o.label}</SelectOption>))}
      </SelectList>
    </Select>
  );
};

const ResolutionSelect: React.FC<{
  value: BackendFilters['resolution'];
  onChange: (v: BackendFilters['resolution']) => void;
}> = ({ value, onChange }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [open, setOpen] = React.useState(false);
  const opts: Array<{ v: BackendFilters['resolution']; label: string }> = [
    { v: 'all',        label: t('Resolution: All') },
    { v: 'resolved',   label: t('Resolution: Resolved') },
    { v: 'unresolved', label: t('Resolution: Unresolved') },
  ];
  const current = opts.find((o) => o.v === value)?.label ?? opts[0].label;
  return (
    <Select
      isOpen={open}
      onOpenChange={setOpen}
      onSelect={(_e, v) => { onChange(v as BackendFilters['resolution']); setOpen(false); }}
      selected={value}
      toggle={(ref: React.Ref<MenuToggleElement>) => (
        <MenuToggle ref={ref} onClick={() => setOpen(!open)} isExpanded={open}>
          {current}
        </MenuToggle>
      )}
    >
      <SelectList>
        {opts.map((o) => (<SelectOption key={o.v} value={o.v}>{o.label}</SelectOption>))}
      </SelectList>
    </Select>
  );
};

function healthLabel(v: BackendFilters['health'], t: (k: string) => string): string {
  return v === 'ok' ? t('Healthy') : v === 'warn' ? t('Warning') : t('Error');
}
function resolutionLabel(v: BackendFilters['resolution'], t: (k: string) => string): string {
  return v === 'resolved' ? t('Resolved') : t('Unresolved');
}
