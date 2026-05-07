"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditableTextCell = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const TextInput_1 = require('@patternfly/react-core/dist/js/components/TextInput');
const inline_edit_1 = tslib_1.__importDefault(require("@patternfly/react-styles/css/components/InlineEdit/inline-edit"));
const form_1 = tslib_1.__importDefault(require("@patternfly/react-styles/css/components/Form/form"));
const react_styles_1 = require("@patternfly/react-styles");
const EditableTextCell = ({ value, rowIndex, cellIndex, props, handleTextInputChange, inputAriaLabel, isDisabled = false }) => ((0, jsx_runtime_1.jsxs)(react_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: inline_edit_1.default.inlineEditValue, children: value }), (0, jsx_runtime_1.jsxs)("div", { className: inline_edit_1.default.inlineEditInput, children: [(0, jsx_runtime_1.jsx)(TextInput_1.TextInput, { isDisabled: isDisabled, value: props.editableValue !== undefined ? props.editableValue : value, validated: props.isValid !== false ? 'default' : 'error', type: "text", onChange: (event, newValue) => {
                        handleTextInputChange(newValue, event, rowIndex, cellIndex);
                    }, "aria-label": inputAriaLabel }), (0, jsx_runtime_1.jsx)("div", { className: (0, react_styles_1.css)(form_1.default.formHelperText), "aria-live": "polite", children: props.errorText })] })] }));
exports.EditableTextCell = EditableTextCell;
exports.EditableTextCell.displayName = 'EditableTextCell';
//# sourceMappingURL=EditableTextCell.js.map