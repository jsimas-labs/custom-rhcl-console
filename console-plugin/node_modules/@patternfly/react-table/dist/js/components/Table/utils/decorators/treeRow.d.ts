import { IExtra, IFormatterValueType, OnCheckChange, OnTreeRowCollapse, OnToggleRowDetails } from '../../TableTypes';
export declare const treeRow: (onCollapse: OnTreeRowCollapse, onCheckChange?: OnCheckChange, onToggleRowDetails?: OnToggleRowDetails) => (value: IFormatterValueType, { rowIndex, rowData }: IExtra) => {
    component: string;
    className: "pf-v6-c-table__tree-view-title-cell";
    children: import("react/jsx-runtime").JSX.Element;
};
//# sourceMappingURL=treeRow.d.ts.map