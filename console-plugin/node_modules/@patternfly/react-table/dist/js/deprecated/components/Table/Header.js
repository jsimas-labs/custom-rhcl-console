"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableHeader = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const base_1 = require("./base");
const TableContext_1 = require("./TableContext");
const ContextHeader = (_a) => {
    var { className = '', headerRows = undefined } = _a, props = tslib_1.__rest(_a, ["className", "headerRows"]);
    return (0, jsx_runtime_1.jsx)(base_1.Header, Object.assign({}, props, { headerRows: headerRows, className: className }));
};
const TableHeader = (_a) => {
    var props = tslib_1.__rest(_a, []);
    return ((0, jsx_runtime_1.jsx)(TableContext_1.TableContext.Consumer, { children: ({ headerRows }) => (0, jsx_runtime_1.jsx)(ContextHeader, Object.assign({}, props, { headerRows: headerRows })) }));
};
exports.TableHeader = TableHeader;
exports.TableHeader.displayName = 'TableHeader';
//# sourceMappingURL=Header.js.map