"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Thead = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_styles_1 = require("@patternfly/react-styles");
const table_1 = tslib_1.__importDefault(require("@patternfly/react-styles/css/components/Table/table"));
const TheadBase = (_a) => {
    var { children, className, noWrap = false, innerRef, hasNestedHeader } = _a, props = tslib_1.__rest(_a, ["children", "className", "noWrap", "innerRef", "hasNestedHeader"]);
    return ((0, jsx_runtime_1.jsx)("thead", Object.assign({ className: (0, react_styles_1.css)(table_1.default.tableThead, className, noWrap && table_1.default.modifiers.nowrap, hasNestedHeader && table_1.default.modifiers.nestedColumnHeader), ref: innerRef }, props, { children: children })));
};
exports.Thead = (0, react_1.forwardRef)((props, ref) => ((0, jsx_runtime_1.jsx)(TheadBase, Object.assign({}, props, { innerRef: ref }))));
exports.Thead.displayName = 'Thead';
//# sourceMappingURL=Thead.js.map