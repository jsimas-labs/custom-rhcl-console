import { __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * header.tsx
 *
 * Forked from reactabular-table version 8.14.0
 * https://github.com/reactabular/reactabular/tree/v8.14.0/packages/reactabular-table/src
 */
import { Component, createElement } from 'react';
import { ProviderContext } from '../../../../components/Table/base/provider';
import { HeaderRow } from './header-row';
class BaseHeader extends Component {
    render() {
        const _a = this.props, { children, headerRows, onRow, renderers, columns } = _a, props = __rest(_a, ["children", "headerRows", "onRow", "renderers", "columns"]);
        // If headerRows aren't passed, default to bodyColumns as header rows
        return createElement(renderers.header.wrapper, props, [
            (headerRows || [columns]).map((rowData, rowIndex) => createElement(HeaderRow, {
                key: `${rowIndex}-header-row`,
                renderers: renderers.header,
                onRow,
                rowData,
                rowIndex
            }))
        ].concat(children));
    }
}
export const Header = (props) => (_jsx(ProviderContext.Consumer, { children: ({ columns, renderers }) => _jsx(BaseHeader, Object.assign({ columns: columns, renderers: renderers }, props)) }));
//# sourceMappingURL=header.js.map