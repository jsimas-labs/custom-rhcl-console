import { __rest } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, forwardRef, useEffect, useRef, useState } from 'react';
import styles from '@patternfly/react-styles/css/components/Table/table.mjs';
import stylesGrid from '@patternfly/react-styles/css/components/Table/table-grid.mjs';
import stylesTreeView from '@patternfly/react-styles/css/components/Table/table-tree-view.mjs';
import { css } from '@patternfly/react-styles';
import { toCamel } from './utils';
import { handleArrows, setTabIndex } from '@patternfly/react-core/dist/esm/helpers/KeyboardHandler';
import { KeyTypes } from '@patternfly/react-core/dist/esm/helpers/constants';
import { useOUIAProps } from '@patternfly/react-core/dist/esm/helpers/OUIA/ouia';
import { useHasAnimations } from '@patternfly/react-core/dist/esm/helpers';
import { TableGridBreakpoint } from './TableTypes';
export const TableContext = createContext({
    registerSelectableRow: () => { },
    hasAnimations: false,
    variant: undefined
});
const TableBase = (_a) => {
    var _b, _c;
    var { children, className, variant, borders = true, isStickyHeader = false, gridBreakPoint = TableGridBreakpoint.gridMd, 'aria-label': ariaLabel, role = 'grid', innerRef, ouiaId, ouiaSafe = true, isTreeTable = false, isNested = false, isStriped = false, isExpandable = false, hasAnimations: hasAnimationsProp, hasNoInset = false, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    nestedHeaderColumnSpans, selectableRowCaptionText } = _a, props = __rest(_a, ["children", "className", "variant", "borders", "isStickyHeader", "gridBreakPoint", 'aria-label', "role", "innerRef", "ouiaId", "ouiaSafe", "isTreeTable", "isNested", "isStriped", "isExpandable", "hasAnimations", "hasNoInset", "nestedHeaderColumnSpans", "selectableRowCaptionText"]);
    const hasAnimations = useHasAnimations(hasAnimationsProp);
    const ref = useRef(null);
    const tableRef = innerRef || ref;
    const [hasSelectableRows, setHasSelectableRows] = useState(false);
    const [tableCaption, setTableCaption] = useState();
    useEffect(() => {
        document.addEventListener('keydown', handleKeys);
        // sets up roving tab-index to tree tables only
        if (tableRef && tableRef.current && tableRef.current.classList.contains('pf-m-tree-view')) {
            const tbody = tableRef.current.querySelector('tbody');
            tbody && setTabIndex(Array.from(tbody.querySelectorAll('button, a, input')));
        }
        return function cleanup() {
            document.removeEventListener('keydown', handleKeys);
        };
    }, [tableRef, tableRef.current]);
    useEffect(() => {
        if (selectableRowCaptionText) {
            setTableCaption(_jsxs("caption", { children: [selectableRowCaptionText, _jsx("div", { className: "pf-v6-screen-reader", children: "This table has selectable rows. It can be navigated by row using tab, and each row can be selected using space or enter." })] }));
        }
        else {
            setTableCaption(_jsx("caption", { className: "pf-v6-screen-reader", children: "This table has selectable rows. It can be navigated by row using tab, and each row can be selected using space or enter." }));
        }
    }, [selectableRowCaptionText]);
    const ouiaProps = useOUIAProps('Table', ouiaId, ouiaSafe);
    const grid = (_b = stylesGrid.modifiers) === null || _b === void 0 ? void 0 : _b[toCamel(gridBreakPoint || '').replace(/-?2xl/, '_2xl')];
    const breakPointPrefix = `treeView${gridBreakPoint.charAt(0).toUpperCase() + gridBreakPoint.slice(1)}`;
    const treeGrid = (_c = stylesTreeView.modifiers) === null || _c === void 0 ? void 0 : _c[toCamel(breakPointPrefix || '').replace(/-?2xl/, '_2xl')];
    const handleKeys = (event) => {
        if (isNested ||
            !(tableRef && tableRef.current && tableRef.current.classList.contains(stylesTreeView.modifiers.treeView)) || // implements roving tab-index to tree tables only
            (tableRef && tableRef.current !== event.target.closest(`.${styles.table}:not(.pf-m-nested)`))) {
            return;
        }
        const activeElement = document.activeElement;
        const key = event.key;
        const rows = Array.from(tableRef.current.querySelectorAll('tbody tr')).filter((el) => !el.classList.contains('pf-m-disabled') && !el.hidden);
        if (key === KeyTypes.Space || key === KeyTypes.Enter) {
            activeElement.click();
            event.preventDefault();
        }
        const getFocusableElement = (element) => element.querySelectorAll('button:not(:disabled), input:not(:disabled), a:not(:disabled)')[0];
        handleArrows(event, rows, (element) => element === activeElement.closest('tr'), getFocusableElement, ['button', 'input', 'a'], undefined, false, true, false);
    };
    const registerSelectableRow = () => {
        !hasSelectableRows && setHasSelectableRows(true);
    };
    return (_jsx(TableContext.Provider, { value: { registerSelectableRow, hasAnimations, variant }, children: _jsxs("table", Object.assign({ "aria-label": ariaLabel, role: role, className: css(className, styles.table, isTreeTable ? treeGrid : grid, styles.modifiers[variant], !borders && styles.modifiers.noBorderRows, isStickyHeader && styles.modifiers.stickyHeader, isTreeTable && stylesTreeView.modifiers.treeView, isStriped && styles.modifiers.striped, isExpandable && styles.modifiers.expandable, hasNoInset && stylesTreeView.modifiers.noInset, isNested && 'pf-m-nested', hasAnimations && styles.modifiers.animateExpand), ref: tableRef }, (isTreeTable && { role: 'treegrid' }), ouiaProps, props, { children: [hasSelectableRows && tableCaption, children] })) }));
};
export const Table = forwardRef((props, ref) => (_jsx(TableBase, Object.assign({}, props, { innerRef: ref }))));
Table.displayName = 'Table';
//# sourceMappingURL=Table.js.map