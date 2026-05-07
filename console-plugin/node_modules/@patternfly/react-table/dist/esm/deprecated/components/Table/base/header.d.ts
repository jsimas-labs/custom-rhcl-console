/// <reference types="react" />
import { RowsType, ColumnsType, RenderersTypes } from '../../../../components/Table/base/types';
export interface HeaderProps {
    headerRows?: RowsType[] | ColumnsType;
    children?: React.ReactNode;
    columns?: ColumnsType;
    renderers?: RenderersTypes['renderers'];
    onRow?: Function;
    className?: string;
}
export declare const Header: (props: HeaderProps) => import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=header.d.ts.map