import { jsx as _jsx } from "react/jsx-runtime";
export const headerCol = (id = 'simple-node') => {
    const headerColObj = (value, { rowIndex } = {}) => {
        const result = typeof value === 'object' ? value.title : value;
        return {
            component: 'th',
            children: _jsx("div", { id: `${id}${rowIndex}`, children: result })
        };
    };
    return headerColObj;
};
//# sourceMappingURL=headerCol.js.map