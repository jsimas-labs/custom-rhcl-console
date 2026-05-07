import { jsx as _jsx } from "react/jsx-runtime";
import { DraggableCell } from '../../DraggableCell';
export const draggable = (value, { rowData }) => {
    const { id } = rowData;
    return {
        className: '',
        children: _jsx(DraggableCell, { id: id })
    };
};
//# sourceMappingURL=draggable.js.map