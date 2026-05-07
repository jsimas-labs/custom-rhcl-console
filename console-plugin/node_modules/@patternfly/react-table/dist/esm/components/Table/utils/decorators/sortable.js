import { jsx as _jsx } from "react/jsx-runtime";
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Table/table.mjs';
import { SortColumn, SortByDirection } from '../../SortColumn';
import StarIcon from '@patternfly/react-icons/dist/esm/icons/star-icon';
export const sortableFavorites = (sort) => () => {
    var _a;
    return sortable(_jsx(StarIcon, {}), {
        columnIndex: sort.columnIndex,
        className: styles.tableFavorite,
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
export const sortable = (label, { columnIndex, column, property, className, ariaLabel, tooltip, tooltipProps, tooltipHasDefaultBehavior }) => {
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
            reversedDirection = sortBy.defaultDirection ? sortBy.defaultDirection : SortByDirection.asc;
        }
        else {
            reversedDirection = sortBy.direction === SortByDirection.asc ? SortByDirection.desc : SortByDirection.asc;
        }
        // tslint:disable-next-line:no-unused-expression
        onSort && onSort(event, columnIndex, reversedDirection, extraData);
    }
    return Object.assign(Object.assign({ className: css(styles.tableSort, isSortedBy && styles.modifiers.selected, className) }, (isSortedBy && { 'aria-sort': `${sortBy.direction}ending` })), { children: (_jsx(SortColumn, { isSortedBy: isSortedBy, sortDirection: isSortedBy ? sortBy.direction : '', onSort: sortClicked, "aria-label": ariaLabel, tooltip: tooltip, tooltipProps: tooltipProps, tooltipHasDefaultBehavior: tooltipHasDefaultBehavior, favoriteButtonProps: favoriteButtonProps, children: label })) });
};
//# sourceMappingURL=sortable.js.map