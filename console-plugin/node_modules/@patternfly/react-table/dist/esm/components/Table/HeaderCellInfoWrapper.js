import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Table/table.mjs';
import { Tooltip } from '@patternfly/react-core/dist/esm/components/Tooltip';
import { Popover } from '@patternfly/react-core/dist/esm/components/Popover';
import { Button } from '@patternfly/react-core/dist/esm/components/Button';
import { TableText } from './TableText';
export const HeaderCellInfoWrapper = ({ children, info, className, variant = 'tooltip', popoverProps, tooltipProps, ariaLabel }) => (_jsxs("div", { className: css(styles.tableColumnHelp, className), children: [typeof children === 'string' ? _jsx(TableText, { children: children }) : children, _jsx("span", { className: css(styles.tableColumnHelpAction), children: variant === 'tooltip' ? (_jsx(Tooltip, Object.assign({ content: info }, tooltipProps, { children: _jsx(Button, { variant: "plain", hasNoPadding: true, "aria-label": ariaLabel || (typeof info === 'string' && info) || 'More info', icon: _jsx(HelpIcon, {}) }) }))) : (_jsx(Popover, Object.assign({ bodyContent: info }, popoverProps, { children: _jsx(Button, { variant: "plain", hasNoPadding: true, "aria-label": ariaLabel || (typeof info === 'string' && info) || 'More info', icon: _jsx(HelpIcon, {}) }) }))) })] }));
HeaderCellInfoWrapper.displayName = 'HeaderCellInfoWrapper';
//# sourceMappingURL=HeaderCellInfoWrapper.js.map