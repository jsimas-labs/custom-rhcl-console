/// <reference types="react" />
import { TooltipProps } from '@patternfly/react-core/dist/esm/components/Tooltip';
import { FavoriteButtonProps } from './base/types';
export declare enum SortByDirection {
    asc = "asc",
    desc = "desc"
}
export interface SortColumnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    className?: string;
    isSortedBy?: boolean;
    onSort?: Function;
    sortDirection?: string;
    tooltip?: React.ReactNode;
    tooltipProps?: Omit<TooltipProps, 'content'>;
    tooltipHasDefaultBehavior?: boolean;
    favoriteButtonProps?: FavoriteButtonProps;
}
export declare const SortColumn: React.FunctionComponent<SortColumnProps>;
//# sourceMappingURL=SortColumn.d.ts.map