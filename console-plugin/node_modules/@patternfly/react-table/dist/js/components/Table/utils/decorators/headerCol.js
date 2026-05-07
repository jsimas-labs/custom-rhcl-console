"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.headerCol = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const headerCol = (id = 'simple-node') => {
    const headerColObj = (value, { rowIndex } = {}) => {
        const result = typeof value === 'object' ? value.title : value;
        return {
            component: 'th',
            children: (0, jsx_runtime_1.jsx)("div", { id: `${id}${rowIndex}`, children: result })
        };
    };
    return headerColObj;
};
exports.headerCol = headerCol;
//# sourceMappingURL=headerCol.js.map