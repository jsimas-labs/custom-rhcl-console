"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpandableRowContent = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_styles_1 = require("@patternfly/react-styles");
const table_1 = tslib_1.__importDefault(require("@patternfly/react-styles/css/components/Table/table"));
const ExpandableRowContent = (_a) => {
    var { children = null, hasNoBackground } = _a, props = tslib_1.__rest(_a, ["children", "hasNoBackground"]);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({}, props, { className: (0, react_styles_1.css)(table_1.default.tableExpandableRowContent, hasNoBackground && table_1.default.modifiers.noBackground), children: children })));
};
exports.ExpandableRowContent = ExpandableRowContent;
exports.ExpandableRowContent.displayName = 'ExpandableRowContent';
//# sourceMappingURL=ExpandableRowContent.js.map