/**
 * provider.tsx
 *
 * Forked from reactabular-table version 8.14.0
 * https://github.com/reactabular/reactabular/tree/v8.14.0/packages/reactabular-table/src
 */
import { Component } from 'react';
import { RenderersTypes, ColumnsType } from './types';
export interface ProviderProps extends RenderersTypes {
    children?: React.ReactNode;
    role?: string;
    className?: string;
    variant?: 'compact';
    borders?: boolean;
}
export declare const ProviderContext: import("react").Context<{
    columns: ColumnsType;
    renderers: {
        table?: any;
        header?: import("./types").RendererType;
        body?: import("./types").RendererType;
    };
}>;
declare class Provider extends Component<ProviderProps, {}> {
    static displayName: string;
    static defaultProps: {
        renderers: {
            table: import("react").ForwardRefExoticComponent<Omit<import("..").TableProps, "ref"> & import("react").RefAttributes<HTMLTableElement>>;
            header: {
                wrapper: import("react").ForwardRefExoticComponent<Omit<import("..").TheadProps, "ref"> & import("react").RefAttributes<HTMLTableSectionElement>>;
                row: import("react").ForwardRefExoticComponent<Omit<import("..").TrProps, "ref"> & import("react").RefAttributes<HTMLTableRowElement>>;
                cell: import("react").ForwardRefExoticComponent<Omit<import("..").ThProps, "ref"> & import("react").RefAttributes<HTMLTableHeaderCellElement>>;
            };
            body: {
                wrapper: import("react").ForwardRefExoticComponent<Omit<import("..").TbodyProps, "ref"> & import("react").RefAttributes<HTMLTableSectionElement>>;
                row: import("react").ForwardRefExoticComponent<Omit<import("..").TrProps, "ref"> & import("react").RefAttributes<HTMLTableRowElement>>;
                cell: import("react").ForwardRefExoticComponent<Omit<import("..").TdProps, "ref"> & import("react").RefAttributes<HTMLTableDataCellElement>>;
            };
        };
    };
    render(): import("react/jsx-runtime").JSX.Element;
}
export { Provider };
//# sourceMappingURL=provider.d.ts.map