import { jsx as _jsx } from "react/jsx-runtime";
import { HeaderCellInfoWrapper } from '../../HeaderCellInfoWrapper';
import styles from '@patternfly/react-styles/css/components/Table/table.mjs';
export const info = ({ tooltip, tooltipProps, popover, popoverProps, className, ariaLabel }) => {
    const infoObj = (value) => ({
        className: styles.modifiers.help,
        children: tooltip ? (_jsx(HeaderCellInfoWrapper, { variant: "tooltip", info: tooltip, tooltipProps: tooltipProps, ariaLabel: ariaLabel, className: className, children: value })) : (_jsx(HeaderCellInfoWrapper, { variant: "popover", info: popover, popoverProps: popoverProps, ariaLabel: ariaLabel, className: className, children: value }))
    });
    return infoObj;
};
//# sourceMappingURL=info.js.map