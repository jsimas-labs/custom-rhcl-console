import { __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { Tooltip } from '@patternfly/react-core/dist/esm/components/Tooltip';
import { Bullseye } from '@patternfly/react-core/dist/esm/layouts/Bullseye';
import { EmptyState } from '@patternfly/react-core/dist/esm/components/EmptyState';
import { Td } from '../../../components';
export const BodyCell = (_a) => {
    var { 'data-label': dataLabel = '', className = '', colSpan, component = 'td', isVisible, parentId, textCenter = false, tooltip: tooltipProp = '', onMouseEnter: onMouseEnterProp = () => { }, children, 
    /* eslint-disable @typescript-eslint/no-unused-vars */
    errorText, isValid, isOpen, ariaControls, editableValue, editableSelectProps, options, isSelectOpen, value, name } = _a, 
    /* eslint-enable @typescript-eslint/no-unused-vars */
    props = __rest(_a, ['data-label', "className", "colSpan", "component", "isVisible", "parentId", "textCenter", "tooltip", "onMouseEnter", "children", "errorText", "isValid", "isOpen", "ariaControls", "editableValue", "editableSelectProps", "options", "isSelectOpen", "value", "name"]);
    const [tooltip, setTooltip] = useState('');
    const onMouseEnter = (event) => {
        if (event.target.offsetWidth < event.target.scrollWidth) {
            if (tooltipProp) {
                setTooltip(tooltipProp);
            }
            else if (typeof children === 'string') {
                setTooltip(children);
            }
        }
        else {
            setTooltip('');
        }
        onMouseEnterProp(event);
    };
    let isEmptyStateCell = false;
    if (children) {
        isEmptyStateCell =
            (children.type === Bullseye &&
                children.props.children &&
                children.props.children.type === EmptyState) ||
                children.type === EmptyState;
    }
    const cell = (_jsx(Td, Object.assign({ className: className, component: component, dataLabel: dataLabel && parentId == null && !isEmptyStateCell ? dataLabel : null, onMouseEnter: onMouseEnter, textCenter: textCenter, colSpan: colSpan }, props, { children: children })));
    const bodyCell = tooltip !== '' ? (_jsx(Tooltip, { content: tooltip, isVisible: true, children: cell })) : (cell);
    return (parentId !== undefined && colSpan === undefined) || !isVisible ? null : bodyCell;
};
BodyCell.displayName = 'BodyCell';
//# sourceMappingURL=BodyCell.js.map