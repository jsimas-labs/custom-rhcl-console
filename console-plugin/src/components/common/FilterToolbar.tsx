import * as React from 'react';
import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  Badge,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

interface FilterToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  namespaces?: string[];
  selectedNamespace?: string;
  onNamespaceChange?: (ns: string) => void;
  statusOptions?: string[];
  selectedStatuses?: string[];
  onStatusChange?: (statuses: string[]) => void;
}

const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  namespaces,
  selectedNamespace,
  onNamespaceChange,
  statusOptions,
  selectedStatuses = [],
  onStatusChange,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [nsOpen, setNsOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);

  const nsToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setNsOpen(!nsOpen)}
      isExpanded={nsOpen}
      style={{ minWidth: '150px' }}
    >
      {selectedNamespace || t('All namespaces')}
    </MenuToggle>
  );

  const statusToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setStatusOpen(!statusOpen)}
      isExpanded={statusOpen}
      style={{ minWidth: '150px' }}
    >
      {t('Status')}
      {selectedStatuses.length > 0 && (
        <Badge isRead style={{ marginLeft: '8px' }}>{selectedStatuses.length}</Badge>
      )}
    </MenuToggle>
  );

  return (
    <Toolbar clearAllFilters={() => {
      onSearchChange('');
      onNamespaceChange?.('');
      onStatusChange?.([]);
    }}>
      <ToolbarContent>
        <ToolbarItem>
          <SearchInput
            placeholder={searchPlaceholder || t('Search by name or hostname')}
            value={searchValue}
            onChange={(_e, val) => onSearchChange(val)}
            onClear={() => onSearchChange('')}
          />
        </ToolbarItem>

        {namespaces && onNamespaceChange && (
          <ToolbarItem>
            <Select
              isOpen={nsOpen}
              onOpenChange={(open) => setNsOpen(open)}
              onSelect={(_e, value) => {
                onNamespaceChange(value as string);
                setNsOpen(false);
              }}
              selected={selectedNamespace || ''}
              toggle={nsToggle}
            >
              <SelectList>
                <SelectOption value="">{t('All namespaces')}</SelectOption>
                {namespaces.map((ns) => (
                  <SelectOption key={ns} value={ns}>{ns}</SelectOption>
                ))}
              </SelectList>
            </Select>
          </ToolbarItem>
        )}

        {statusOptions && onStatusChange && (
          <ToolbarItem>
            <Select
              isOpen={statusOpen}
              onOpenChange={(open) => setStatusOpen(open)}
              onSelect={(_e, value) => {
                const val = value as string;
                if (selectedStatuses.includes(val)) {
                  onStatusChange(selectedStatuses.filter((s) => s !== val));
                } else {
                  onStatusChange([...selectedStatuses, val]);
                }
              }}
              selected={selectedStatuses}
              toggle={statusToggle}
            >
              <SelectList>
                {statusOptions.map((status) => (
                  <SelectOption
                    key={status}
                    value={status}
                    hasCheckbox
                    isSelected={selectedStatuses.includes(status)}
                  >
                    {t(status)}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </ToolbarItem>
        )}
      </ToolbarContent>
    </Toolbar>
  );
};

export default FilterToolbar;
