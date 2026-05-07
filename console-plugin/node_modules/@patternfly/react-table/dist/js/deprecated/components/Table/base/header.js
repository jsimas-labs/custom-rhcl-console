"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * header.tsx
 *
 * Forked from reactabular-table version 8.14.0
 * https://github.com/reactabular/reactabular/tree/v8.14.0/packages/reactabular-table/src
 */
const react_1 = require("react");
const provider_1 = require("../../../../components/Table/base/provider");
const header_row_1 = require("./header-row");
class BaseHeader extends react_1.Component {
    render() {
        const _a = this.props, { children, headerRows, onRow, renderers, columns } = _a, props = tslib_1.__rest(_a, ["children", "headerRows", "onRow", "renderers", "columns"]);
        // If headerRows aren't passed, default to bodyColumns as header rows
        return (0, react_1.createElement)(renderers.header.wrapper, props, [
            (headerRows || [columns]).map((rowData, rowIndex) => (0, react_1.createElement)(header_row_1.HeaderRow, {
                key: `${rowIndex}-header-row`,
                renderers: renderers.header,
                onRow,
                rowData,
                rowIndex
            }))
        ].concat(children));
    }
}
const Header = (props) => ((0, jsx_runtime_1.jsx)(provider_1.ProviderContext.Consumer, { children: ({ columns, renderers }) => (0, jsx_runtime_1.jsx)(BaseHeader, Object.assign({ columns: columns, renderers: renderers }, props)) }));
exports.Header = Header;
//# sourceMappingURL=header.js.map