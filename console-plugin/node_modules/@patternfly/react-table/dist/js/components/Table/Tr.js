"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tr = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const helpers_1 = require('@patternfly/react-core/dist/js/helpers');
const table_1 = tslib_1.__importDefault(require("@patternfly/react-styles/css/components/Table/table"));
const inline_edit_1 = tslib_1.__importDefault(require("@patternfly/react-styles/css/components/InlineEdit/inline-edit"));
const react_styles_1 = require("@patternfly/react-styles");
const Table_1 = require("./Table");
const TrBase = (_a) => {
    var { children, className, isExpanded, isContentExpanded, isEditable, isHidden = false, isClickable = false, isRowSelected = false, isStriped = false, isBorderRow = false, isControlRow = false, innerRef, ouiaId, ouiaSafe = true, resetOffset = false, onRowClick, isSelectable, 'aria-label': passedAriaLabel } = _a, props = tslib_1.__rest(_a, ["children", "className", "isExpanded", "isContentExpanded", "isEditable", "isHidden", "isClickable", "isRowSelected", "isStriped", "isBorderRow", "isControlRow", "innerRef", "ouiaId", "ouiaSafe", "resetOffset", "onRowClick", "isSelectable", 'aria-label']);
    const ouiaProps = (0, helpers_1.useOUIAProps)('TableRow', ouiaId, ouiaSafe);
    const [computedAriaLabel, setComputedAriaLabel] = (0, react_1.useState)('');
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
    const { registerSelectableRow, hasAnimations } = (0, react_1.useContext)(Table_1.TableContext);
    (0, react_1.useEffect)(() => {
        if (isSelectable && !rowIsHidden) {
            setComputedAriaLabel(`${isRowSelected ? 'Row selected' : ''}`);
            registerSelectableRow();
        }
        else {
            setComputedAriaLabel(undefined);
        }
    }, [isRowSelected, isSelectable, registerSelectableRow, rowIsHidden]);
    const ariaLabel = passedAriaLabel || computedAriaLabel;
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("tr", Object.assign({ className: (0, react_styles_1.css)(table_1.default.tableTr, className, isExpanded !== undefined && table_1.default.tableExpandableRow, (isExpanded || isContentExpanded) && table_1.default.modifiers.expanded, isEditable && inline_edit_1.default.modifiers.inlineEditable, isClickable && table_1.default.modifiers.clickable, isRowSelected && table_1.default.modifiers.selected, isStriped && table_1.default.modifiers.striped, isBorderRow && table_1.default.modifiers.borderRow, isControlRow && table_1.default.tableControlRow, resetOffset && table_1.default.modifiers.firstCellOffsetReset), hidden: rowIsHidden }, (isClickable && { tabIndex: 0 }), { "aria-label": ariaLabel, ref: innerRef }, (hasAnimations && rowIsHidden && { inert: '' }), (onRowClick && { onClick: onRowClick, onKeyDown }), ouiaProps, props, { children: children })) }));
};
exports.Tr = (0, react_1.forwardRef)((props, ref) => ((0, jsx_runtime_1.jsx)(TrBase, Object.assign({}, props, { innerRef: ref }))));
exports.Tr.displayName = 'Tr';
//# sourceMappingURL=Tr.js.map