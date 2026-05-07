import { __rest } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import LongArrowAltUpIcon from '@patternfly/react-icons/dist/esm/icons/long-arrow-alt-up-icon';
import LongArrowAltDownIcon from '@patternfly/react-icons/dist/esm/icons/long-arrow-alt-down-icon';
import ArrowsAltVIcon from '@patternfly/react-icons/dist/esm/icons/arrows-alt-v-icon';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Table/table.mjs';
import { TableText } from './TableText';
import { ActionList, ActionListItem } from '@patternfly/react-core/dist/esm/components/ActionList';
import { Button } from '@patternfly/react-core/dist/esm/components/Button';
export var SortByDirection;
(function (SortByDirection) {
    SortByDirection["asc"] = "asc";
    SortByDirection["desc"] = "desc";
})(SortByDirection || (SortByDirection = {}));
export const SortColumn = (_a) => {
    var { children = null, className = '', isSortedBy = false, onSort = null, sortDirection = '', type = 'button', tooltip, tooltipProps, tooltipHasDefaultBehavior, favoriteButtonProps } = _a, props = __rest(_a, ["children", "className", "isSortedBy", "onSort", "sortDirection", "type", "tooltip", "tooltipProps", "tooltipHasDefaultBehavior", "favoriteButtonProps"]);
    let SortedByIcon;
    const [focused, setFocused] = useState(false);
    if (isSortedBy) {
        SortedByIcon = sortDirection === SortByDirection.asc ? LongArrowAltUpIcon : LongArrowAltDownIcon;
    }
    else {
        SortedByIcon = ArrowsAltVIcon;
    }
    if (favoriteButtonProps) {
        const { favorited } = favoriteButtonProps, rest = __rest(favoriteButtonProps, ["favorited"]);
        return (_jsxs(ActionList, { isIconList: true, children: [_jsx(ActionListItem, { children: _jsx(Button, Object.assign({ variant: "plain", isFavorite: true, isFavorited: favorited }, rest)) }), _jsx(ActionListItem, { children: _jsx(Button, Object.assign({ variant: "plain", icon: _jsx("span", { className: css(styles.tableSortIndicator), children: _jsx(SortedByIcon, {}) }), onClick: (event) => onSort && onSort(event) }, props)) })] }));
    }
    return (_jsx("button", Object.assign({}, props, { type: type, className: css(className, styles.tableButton), onClick: (event) => onSort && onSort(event), onFocus: () => setFocused(true), onBlur: () => setFocused(false), children: _jsxs("div", { className: css(className, styles.tableButtonContent), children: [_jsx(TableText, { tooltip: tooltip, tooltipProps: tooltipProps, tooltipHasDefaultBehavior: tooltipHasDefaultBehavior, focused: focused, children: children }), _jsx("span", { className: css(styles.tableSortIndicator), children: _jsx(SortedByIcon, {}) })] }) })));
};
SortColumn.displayName = 'SortColumn';
//# sourceMappingURL=SortColumn.js.map