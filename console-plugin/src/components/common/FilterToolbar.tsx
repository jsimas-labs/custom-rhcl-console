import * as React from 'react';
import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  MenuToggle,
  Select,
  SelectOption,
  MenuToggleElement,
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

  const nsToggleRef = React.useRef<MenuToggleElement>(null);
  const statusToggleRef = React.useRef<MenuToggleElement>(null);

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
              onOpenChange={setNsOpen}
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef || nsToggleRef}
                  onClick={() => setNsOpen(!nsOpen)}
                  isExpanded={nsOpen}
                >
                  {selectedNamespace || t('All namespaces')}
                </MenuToggle>
              )}
              onSelect={(_e, value) => {
                onNamespaceChange(value as string);
                setNsOpen(false);
              }}
              selected={selectedNamespace}
            >
              <SelectOption value="">{t('All namespaces')}</SelectOption>
              {namespaces.map((ns) => (
                <SelectOption key={ns} value={ns}>
                  {ns}
                </SelectOption>
              ))}
            </Select>
          </ToolbarItem>
        )}

        {statusOptions && onStatusChange && (
          <ToolbarItem>
            <Select
              isOpen={statusOpen}
              onOpenChange={setStatusOpen}
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef || statusToggleRef}
                  onClick={() => setStatusOpen(!statusOpen)}
                  isExpanded={statusOpen}
                >
                  {selectedStatuses.length > 0
                    ? `${selectedStatuses.length} selected`
                    : t('All statuses')}
                </MenuToggle>
              )}
              onSelect={(_e, value) => {
                const val = value as string;
                if (selectedStatuses.includes(val)) {
                  onStatusChange(selectedStatuses.filter((s) => s !== val));
                } else {
                  onStatusChange([...selectedStatuses, val]);
                }
              }}
            >
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
            </Select>
          </ToolbarItem>
        )}
      </ToolbarContent>
    </Toolbar>
  );
};

export default FilterToolbar;
