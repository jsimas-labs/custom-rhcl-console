import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from 'react';
import { css } from '@patternfly/react-styles';
import { Select, SelectList } from '@patternfly/react-core/dist/esm/components/Select';
import { MenuToggle } from '@patternfly/react-core/dist/esm/components/MenuToggle';
import inlineStyles from '@patternfly/react-styles/css/components/InlineEdit/inline-edit.mjs';
import formStyles from '@patternfly/react-styles/css/components/Form/form.mjs';
export const EditableSelectInputCell = ({ value, rowIndex, cellIndex, onSelect = () => { }, clearSelection, isOpen = false, isPlaceholder = false, onToggle = () => { }, selections = [''], options = [], props }) => {
    const onSelectHandler = (event, newValue) => {
        onSelect(event, newValue, rowIndex, cellIndex, isPlaceholder);
    };
    const onClear = (event) => {
        clearSelection(event, rowIndex, cellIndex);
    };
    const select = (_jsx(Select, Object.assign({ onSelect: onSelectHandler }, (clearSelection && { onClear }), { isOpen: isOpen, selected: selections, toggle: (toggleRef) => (_jsx(MenuToggle, { ref: toggleRef, onClick: onToggle, isExpanded: isOpen, isPlaceholder: isPlaceholder, children: isOpen ? 'Expanded' : 'Collapsed' })) }, props.editableSelectProps, { children: _jsx(SelectList, { children: options }) })));
    return (_jsxs(Fragment, { children: [_jsx("div", { className: inlineStyles.inlineEditValue, children: Array.isArray(value) ? value.join(', ') : value }), _jsxs("div", { className: inlineStyles.inlineEditInput, children: [select, _jsx("div", { className: css(formStyles.formHelperText), "aria-live": "polite", children: props.errorText })] })] }));
};
EditableSelectInputCell.displayName = 'EditableSelectInputCell';
//# sourceMappingURL=EditableSelectInputCell.js.map