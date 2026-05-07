import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Table/table.mjs';
import stylesTreeView from '@patternfly/react-styles/css/components/Table/table-tree-view.mjs';
import { Button } from '@patternfly/react-core/dist/esm/components/Button';
import { Checkbox } from '@patternfly/react-core/dist/esm/components/Checkbox';
import AngleDownIcon from '@patternfly/react-icons/dist/esm/icons/angle-down-icon';
import EllipsisHIcon from '@patternfly/react-icons/dist/esm/icons/ellipsis-h-icon';
export const treeRow = (onCollapse, onCheckChange, onToggleRowDetails) => (value, { rowIndex, rowData }) => {
    const { isExpanded, isDetailsExpanded, 'aria-level': level, 'aria-setsize': setsize, toggleAriaLabel, checkAriaLabel, showDetailsAriaLabel, isChecked, checkboxId, icon } = rowData.props;
    const content = value.title || value;
    const text = (_jsxs("div", { className: css(stylesTreeView.tableTreeViewText), children: [icon && (_jsx("span", { className: css(stylesTreeView.tableTreeViewIcon), children: icon }, "tree-view-text-icon")), _jsx("span", { className: styles.tableText, children: content }, "table-text")] }, "tree-view-text"));
    const onChange = (isChecked, event) => {
        onCheckChange(event, isChecked, rowIndex, content, rowData);
    };
    return {
        component: 'th',
        className: stylesTreeView.tableTreeViewTitleCell,
        children: level !== undefined ? (_jsxs("div", { className: css(stylesTreeView.tableTreeViewMain), children: [setsize > 0 && (_jsx("span", { className: css(stylesTreeView.tableToggle), children: _jsx(Button, { variant: "plain", onClick: (event) => onCollapse && onCollapse(event, rowIndex, content, rowData), className: css(isExpanded && styles.modifiers.expanded), "aria-expanded": isExpanded, "aria-label": toggleAriaLabel || `${isExpanded ? 'Collapse' : 'Expand'} row ${rowIndex}`, icon: _jsx("div", { className: css(stylesTreeView.tableToggleIcon), children: _jsx(AngleDownIcon, {}) }) }) }, "table-toggle")), !!onCheckChange && (_jsx("span", { className: css(stylesTreeView.tableCheck), children: _jsx("label", { htmlFor: checkboxId || `checkbox_${rowIndex}`, children: _jsx(Checkbox, { id: checkboxId || `checkbox_${rowIndex}`, "aria-label": checkAriaLabel || `Row ${rowIndex} checkbox`, isChecked: isChecked, onChange: (event, checked) => onChange(checked, event) }) }) }, "table-check")), text, !!onToggleRowDetails && (_jsx("span", { className: css(stylesTreeView.tableTreeViewDetailsToggle), children: _jsx(Button, { variant: "plain", "aria-expanded": isDetailsExpanded, "aria-label": showDetailsAriaLabel || 'Show row details', onClick: (event) => onToggleRowDetails && onToggleRowDetails(event, rowIndex, content, rowData), icon: _jsx("span", { className: `${styles.table}__details-toggle-icon`, children: _jsx(EllipsisHIcon, {}) }) }) }, "view-details-toggle"))] })) : (text)
    };
};
//# sourceMappingURL=treeRow.js.map