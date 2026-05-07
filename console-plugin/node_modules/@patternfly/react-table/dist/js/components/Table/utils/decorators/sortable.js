"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortable = exports.sortableFavorites = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_styles_1 = require("@patternfly/react-styles");
const table_1 = tslib_1.__importDefault(require("@patternfly/react-styles/css/components/Table/table"));
const SortColumn_1 = require("../../SortColumn");
const star_icon_1 = tslib_1.__importDefault(require('@patternfly/react-icons/dist/js/icons/star-icon'));
const sortableFavorites = (sort) => () => {
    var _a;
    return (0, exports.sortable)((0, jsx_runtime_1.jsx)(star_icon_1.default, {}), {
        columnIndex: sort.columnIndex,
        className: table_1.default.tableFavorite,
        ariaLabel: (_a = sort.ariaLabel) !== null && _a !== void 0 ? _a : 'Sort favorites',
        column: {
            extraParams: {
                sortBy: sort.sortBy,
                onSort: sort.onSort,
                favoriteButtonProps: sort.favoriteButtonProps
            }
        },
        tooltip: sort.tooltip,
        tooltipProps: sort.tooltipProps,
        tooltipHasDefaultBehavior: true
    });
};
exports.sortableFavorites = sortableFavorites;
const sortable = (label, { columnIndex, column, property, className, ariaLabel, tooltip, tooltipProps, tooltipHasDefaultBehavior }) => {
    const { extraParams: { sortBy, onSort, favoriteButtonProps } } = column;
    const extraData = {
        columnIndex,
        column,
        property
    };
    const isSortedBy = sortBy && columnIndex === sortBy.index;
    /**
     * @param {React.MouseEvent} event - React mouse event
     */
    function sortClicked(event) {
        let reversedDirection;
        if (!isSortedBy) {
            reversedDirection = sortBy.defaultDirection ? sortBy.defaultDirection : SortColumn_1.SortByDirection.asc;
        }
        else {
            reversedDirection = sortBy.direction === SortColumn_1.SortByDirection.asc ? SortColumn_1.SortByDirection.desc : SortColumn_1.SortByDirection.asc;
        }
        // tslint:disable-next-line:no-unused-expression
        onSort && onSort(event, columnIndex, reversedDirection, extraData);
    }
    return Object.assign(Object.assign({ className: (0, react_styles_1.css)(table_1.default.tableSort, isSortedBy && table_1.default.modifiers.selected, className) }, (isSortedBy && { 'aria-sort': `${sortBy.direction}ending` })), { children: ((0, jsx_runtime_1.jsx)(SortColumn_1.SortColumn, { isSortedBy: isSortedBy, sortDirection: isSortedBy ? sortBy.direction : '', onSort: sortClicked, "aria-label": ariaLabel, tooltip: tooltip, tooltipProps: tooltipProps, tooltipHasDefaultBehavior: tooltipHasDefaultBehavior, favoriteButtonProps: favoriteButtonProps, children: label })) });
};
exports.sortable = sortable;
//# sourceMappingURL=sortable.js.map