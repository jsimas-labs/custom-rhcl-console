import { __rest } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createRef, Fragment } from 'react';
import { Tooltip } from '@patternfly/react-core/dist/esm/components/Tooltip';
export var RowSelectVariant;
(function (RowSelectVariant) {
    RowSelectVariant["radio"] = "radio";
    RowSelectVariant["checkbox"] = "checkbox";
})(RowSelectVariant || (RowSelectVariant = {}));
export const SelectColumn = (_a) => {
    var { children = null, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    className, onSelect = null, selectVariant, tooltip, tooltipProps } = _a, props = __rest(_a, ["children", "className", "onSelect", "selectVariant", "tooltip", "tooltipProps"]);
    const inputRef = createRef();
    const content = (_jsxs(Fragment, { children: [_jsx("label", { children: _jsx("input", Object.assign({}, props, { ref: inputRef, type: selectVariant, onChange: onSelect })) }), children] }));
    return tooltip ? (_jsx(Tooltip, Object.assign({ triggerRef: inputRef, content: tooltip }, tooltipProps, { children: content }))) : (content);
};
SelectColumn.displayName = 'SelectColumn';
//# sourceMappingURL=SelectColumn.js.map