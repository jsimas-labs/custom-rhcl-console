"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyWrapper = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_2 = require("react");
const components_1 = require("../../../components");
const components_2 = require("../../../components");
const BodyWrapper = (_a) => {
    var { mappedRows, tbodyRef, 
    /* eslint-disable @typescript-eslint/no-unused-vars */
    rows = [], onCollapse, headerRows } = _a, 
    /* eslint-enable @typescript-eslint/no-unused-vars */
    props = tslib_1.__rest(_a, ["mappedRows", "tbodyRef", "rows", "onCollapse", "headerRows"]);
    if (mappedRows && mappedRows.some((row) => row.hasOwnProperty('parent'))) {
        return ((0, jsx_runtime_1.jsx)(react_2.Fragment, { children: (0, components_1.mapOpenedRows)(mappedRows, props.children).map((oneRow, key) => ((0, react_1.createElement)(components_2.Tbody, Object.assign({}, props, { isExpanded: oneRow.isOpen, key: `tbody-${key}`, ref: tbodyRef }), oneRow.rows))) }));
    }
    return (0, jsx_runtime_1.jsx)(components_2.Tbody, Object.assign({}, props, { ref: tbodyRef }));
};
exports.BodyWrapper = BodyWrapper;
exports.BodyWrapper.displayName = 'BodyWrapper';
//# sourceMappingURL=BodyWrapper.js.map