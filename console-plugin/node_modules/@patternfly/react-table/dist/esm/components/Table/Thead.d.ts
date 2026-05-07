/// <reference types="react" />
export interface TheadProps extends React.HTMLProps<HTMLTableSectionElement> {
    /** Content rendered inside the <thead> row group */
    children?: React.ReactNode;
    /** Additional classes added to the <thead> element */
    className?: string;
    /** Won't wrap the table head if true */
    noWrap?: boolean;
    /** @hide Forwarded ref */
    innerRef?: React.Ref<any>;
    /** Indicates the <thead> contains a nested header */
    hasNestedHeader?: boolean;
}
export declare const Thead: import("react").ForwardRefExoticComponent<Omit<TheadProps, "ref"> & import("react").RefAttributes<HTMLTableSectionElement>>;
//# sourceMappingURL=Thead.d.ts.map