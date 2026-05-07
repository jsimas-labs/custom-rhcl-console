import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from 'react';
import { TextInput } from '@patternfly/react-core/dist/esm/components/TextInput';
import inlineStyles from '@patternfly/react-styles/css/components/InlineEdit/inline-edit.mjs';
import formStyles from '@patternfly/react-styles/css/components/Form/form.mjs';
import { css } from '@patternfly/react-styles';
export const EditableTextCell = ({ value, rowIndex, cellIndex, props, handleTextInputChange, inputAriaLabel, isDisabled = false }) => (_jsxs(Fragment, { children: [_jsx("div", { className: inlineStyles.inlineEditValue, children: value }), _jsxs("div", { className: inlineStyles.inlineEditInput, children: [_jsx(TextInput, { isDisabled: isDisabled, value: props.editableValue !== undefined ? props.editableValue : value, validated: props.isValid !== false ? 'default' : 'error', type: "text", onChange: (event, newValue) => {
                        handleTextInputChange(newValue, event, rowIndex, cellIndex);
                    }, "aria-label": inputAriaLabel }), _jsx("div", { className: css(formStyles.formHelperText), "aria-live": "polite", children: props.errorText })] })] }));
EditableTextCell.displayName = 'EditableTextCell';
//# sourceMappingURL=EditableTextCell.js.map