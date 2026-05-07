import { __rest } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from 'react';
import AngleDownIcon from '@patternfly/react-icons/dist/esm/icons/angle-down-icon';
import { css } from '@patternfly/react-styles';
import { Button } from '@patternfly/react-core/dist/esm/components/Button';
import styles from '@patternfly/react-styles/css/components/Table/table.mjs';
export const CollapseColumn = (_a) => {
    var { className = '', children = null, isOpen, onToggle, variant } = _a, props = __rest(_a, ["className", "children", "isOpen", "onToggle", "variant"]);
    return (_jsxs(Fragment, { children: [isOpen !== undefined && (_jsx(Button, Object.assign({ className: css(className, isOpen && styles.modifiers.expanded), size: variant === 'compact' ? 'sm' : undefined }, props, { variant: "plain", "aria-label": props['aria-label'] || 'Details', onClick: onToggle, "aria-expanded": isOpen, icon: _jsx("div", { className: css(styles.tableToggleIcon), children: _jsx(AngleDownIcon, {}) }) }))), children] }));
};
CollapseColumn.displayName = 'CollapseColumn';
//# sourceMappingURL=CollapseColumn.js.map