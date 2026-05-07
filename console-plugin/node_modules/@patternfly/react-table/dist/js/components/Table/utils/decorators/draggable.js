"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.draggable = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const DraggableCell_1 = require("../../DraggableCell");
const draggable = (value, { rowData }) => {
    const { id } = rowData;
    return {
        className: '',
        children: (0, jsx_runtime_1.jsx)(DraggableCell_1.DraggableCell, { id: id })
    };
};
exports.draggable = draggable;
//# sourceMappingURL=draggable.js.map