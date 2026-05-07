"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectColumn = exports.RowSelectVariant = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Tooltip_1 = require('@patternfly/react-core/dist/js/components/Tooltip');
var RowSelectVariant;
(function (RowSelectVariant) {
    RowSelectVariant["radio"] = "radio";
    RowSelectVariant["checkbox"] = "checkbox";
})(RowSelectVariant || (exports.RowSelectVariant = RowSelectVariant = {}));
const SelectColumn = (_a) => {
    var { children = null, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    className, onSelect = null, selectVariant, tooltip, tooltipProps } = _a, props = tslib_1.__rest(_a, ["children", "className", "onSelect", "selectVariant", "tooltip", "tooltipProps"]);
    const inputRef = (0, react_1.createRef)();
    const content = ((0, jsx_runtime_1.jsxs)(react_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("label", { children: (0, jsx_runtime_1.jsx)("input", Object.assign({}, props, { ref: inputRef, type: selectVariant, onChange: onSelect })) }), children] }));
    return tooltip ? ((0, jsx_runtime_1.jsx)(Tooltip_1.Tooltip, Object.assign({ triggerRef: inputRef, content: tooltip }, tooltipProps, { children: content }))) : (content);
};
exports.SelectColumn = SelectColumn;
exports.SelectColumn.displayName = 'SelectColumn';
//# sourceMappingURL=SelectColumn.js.map