import { __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { Header } from './base';
import { TableContext } from './TableContext';
const ContextHeader = (_a) => {
    var { className = '', headerRows = undefined } = _a, props = __rest(_a, ["className", "headerRows"]);
    return _jsx(Header, Object.assign({}, props, { headerRows: headerRows, className: className }));
};
export const TableHeader = (_a) => {
    var props = __rest(_a, []);
    return (_jsx(TableContext.Consumer, { children: ({ headerRows }) => _jsx(ContextHeader, Object.assign({}, props, { headerRows: headerRows })) }));
};
TableHeader.displayName = 'TableHeader';
//# sourceMappingURL=Header.js.map