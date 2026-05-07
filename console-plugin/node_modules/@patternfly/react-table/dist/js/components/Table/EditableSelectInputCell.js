"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditableSelectInputCell = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_styles_1 = require("@patternfly/react-styles");
const Select_1 = require('@patternfly/react-core/dist/js/components/Select');
const MenuToggle_1 = require('@patternfly/react-core/dist/js/components/MenuToggle');
const inline_edit_1 = tslib_1.__importDefault(require("@patternfly/react-styles/css/components/InlineEdit/inline-edit"));
const form_1 = tslib_1.__importDefault(require("@patternfly/react-styles/css/components/Form/form"));
const EditableSelectInputCell = ({ value, rowIndex, cellIndex, onSelect = () => { }, clearSelection, isOpen = false, isPlaceholder = false, onToggle = () => { }, selections = [''], options = [], props }) => {
    const onSelectHandler = (event, newValue) => {
        onSelect(event, newValue, rowIndex, cellIndex, isPlaceholder);
    };
    const onClear = (event) => {
        clearSelection(event, rowIndex, cellIndex);
    };
    const select = ((0, jsx_runtime_1.jsx)(Select_1.Select, Object.assign({ onSelect: onSelectHandler }, (clearSelection && { onClear }), { isOpen: isOpen, selected: selections, toggle: (toggleRef) => ((0, jsx_runtime_1.jsx)(MenuToggle_1.MenuToggle, { ref: toggleRef, onClick: onToggle, isExpanded: isOpen, isPlaceholder: isPlaceholder, children: isOpen ? 'Expanded' : 'Collapsed' })) }, props.editableSelectProps, { children: (0, jsx_runtime_1.jsx)(Select_1.SelectList, { children: options }) })));
    return ((0, jsx_runtime_1.jsxs)(react_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: inline_edit_1.default.inlineEditValue, children: Array.isArray(value) ? value.join(', ') : value }), (0, jsx_runtime_1.jsxs)("div", { className: inline_edit_1.default.inlineEditInput, children: [select, (0, jsx_runtime_1.jsx)("div", { className: (0, react_styles_1.css)(form_1.default.formHelperText), "aria-live": "polite", children: props.errorText })] })] }));
};
exports.EditableSelectInputCell = EditableSelectInputCell;
exports.EditableSelectInputCell.displayName = 'EditableSelectInputCell';
//# sourceMappingURL=EditableSelectInputCell.js.map