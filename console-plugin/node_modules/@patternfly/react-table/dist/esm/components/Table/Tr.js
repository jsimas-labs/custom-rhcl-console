import { __rest } from "tslib";
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { forwardRef, useContext, useEffect, useState } from 'react';
import { useOUIAProps } from '@patternfly/react-core/dist/esm/helpers';
import styles from '@patternfly/react-styles/css/components/Table/table.mjs';
import inlineStyles from '@patternfly/react-styles/css/components/InlineEdit/inline-edit.mjs';
import { css } from '@patternfly/react-styles';
import { TableContext } from './Table';
const TrBase = (_a) => {
    var { children, className, isExpanded, isContentExpanded, isEditable, isHidden = false, isClickable = false, isRowSelected = false, isStriped = false, isBorderRow = false, isControlRow = false, innerRef, ouiaId, ouiaSafe = true, resetOffset = false, onRowClick, isSelectable, 'aria-label': passedAriaLabel } = _a, props = __rest(_a, ["children", "className", "isExpanded", "isContentExpanded", "isEditable", "isHidden", "isClickable", "isRowSelected", "isStriped", "isBorderRow", "isControlRow", "innerRef", "ouiaId", "ouiaSafe", "resetOffset", "onRowClick", "isSelectable", 'aria-label']);
    const ouiaProps = useOUIAProps('TableRow', ouiaId, ouiaSafe);
    const [computedAriaLabel, setComputedAriaLabel] = useState('');
    let onKeyDown = null;
    if (onRowClick) {
        onKeyDown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                onRowClick(e);
                e.preventDefault();
            }
        };
    }
    const rowIsHidden = isHidden || (isExpanded !== undefined && !isExpanded);
    const { registerSelectableRow, hasAnimations } = useContext(TableContext);
    useEffect(() => {
        if (isSelectable && !rowIsHidden) {
            setComputedAriaLabel(`${isRowSelected ? 'Row selected' : ''}`);
            registerSelectableRow();
        }
        else {
            setComputedAriaLabel(undefined);
        }
    }, [isRowSelected, isSelectable, registerSelectableRow, rowIsHidden]);
    const ariaLabel = passedAriaLabel || computedAriaLabel;
    return (_jsx(_Fragment, { children: _jsx("tr", Object.assign({ className: css(styles.tableTr, className, isExpanded !== undefined && styles.tableExpandableRow, (isExpanded || isContentExpanded) && styles.modifiers.expanded, isEditable && inlineStyles.modifiers.inlineEditable, isClickable && styles.modifiers.clickable, isRowSelected && styles.modifiers.selected, isStriped && styles.modifiers.striped, isBorderRow && styles.modifiers.borderRow, isControlRow && styles.tableControlRow, resetOffset && styles.modifiers.firstCellOffsetReset), hidden: rowIsHidden }, (isClickable && { tabIndex: 0 }), { "aria-label": ariaLabel, ref: innerRef }, (hasAnimations && rowIsHidden && { inert: '' }), (onRowClick && { onClick: onRowClick, onKeyDown }), ouiaProps, props, { children: children })) }));
};
export const Tr = forwardRef((props, ref) => (_jsx(TrBase, Object.assign({}, props, { innerRef: ref }))));
Tr.displayName = 'Tr';
//# sourceMappingURL=Tr.js.map