/**
 * body-row.tsx
 *
 * Forked from reactabular-table version 8.14.0
 * https://github.com/reactabular/reactabular/tree/v8.14.0/packages/reactabular-table/src
 */
import { Component } from 'react';
import { ColumnsType, RowType, RendererType } from '../../../../components/Table/base/types';
export interface BodyRowProps {
    columns: ColumnsType;
    renderers: RendererType;
    onRow?: Function;
    rowIndex: number;
    rowData: RowType;
    rowKey: string;
}
declare class BodyRow extends Component<BodyRowProps, {}> {
    static displayName: string;
    static defaultProps: {
        onRow: (...args: any) => {};
    };
    shouldComponentUpdate(nextProps: BodyRowProps): boolean;
    render(): import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
}
export { BodyRow };
//# sourceMappingURL=body-row.d.ts.map