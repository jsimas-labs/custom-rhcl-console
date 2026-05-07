/// <reference types="react" />
import { RowsType, RendererType } from '../../../../components/Table/base/types';
export interface HeaderRowProps {
    rowData: RowsType;
    rowIndex: number;
    renderers: RendererType;
    onRow?: Function;
}
export declare const HeaderRow: React.FunctionComponent<HeaderRowProps>;
//# sourceMappingURL=header-row.d.ts.map