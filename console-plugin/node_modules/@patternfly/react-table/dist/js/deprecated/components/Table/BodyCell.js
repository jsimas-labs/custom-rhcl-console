"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyCell = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Tooltip_1 = require('@patternfly/react-core/dist/js/components/Tooltip');
const Bullseye_1 = require('@patternfly/react-core/dist/js/layouts/Bullseye');
const EmptyState_1 = require('@patternfly/react-core/dist/js/components/EmptyState');
const components_1 = require("../../../components");
const BodyCell = (_a) => {
    var { 'data-label': dataLabel = '', className = '', colSpan, component = 'td', isVisible, parentId, textCenter = false, tooltip: tooltipProp = '', onMouseEnter: onMouseEnterProp = () => { }, children, 
    /* eslint-disable @typescript-eslint/no-unused-vars */
    errorText, isValid, isOpen, ariaControls, editableValue, editableSelectProps, options, isSelectOpen, value, name } = _a, 
    /* eslint-enable @typescript-eslint/no-unused-vars */
    props = tslib_1.__rest(_a, ['data-label', "className", "colSpan", "component", "isVisible", "parentId", "textCenter", "tooltip", "onMouseEnter", "children", "errorText", "isValid", "isOpen", "ariaControls", "editableValue", "editableSelectProps", "options", "isSelectOpen", "value", "name"]);
    const [tooltip, setTooltip] = (0, react_1.useState)('');
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
            (children.type === Bullseye_1.Bullseye &&
                children.props.children &&
                children.props.children.type === EmptyState_1.EmptyState) ||
                children.type === EmptyState_1.EmptyState;
    }
    const cell = ((0, jsx_runtime_1.jsx)(components_1.Td, Object.assign({ className: className, component: component, dataLabel: dataLabel && parentId == null && !isEmptyStateCell ? dataLabel : null, onMouseEnter: onMouseEnter, textCenter: textCenter, colSpan: colSpan }, props, { children: children })));
    const bodyCell = tooltip !== '' ? ((0, jsx_runtime_1.jsx)(Tooltip_1.Tooltip, { content: tooltip, isVisible: true, children: cell })) : (cell);
    return (parentId !== undefined && colSpan === undefined) || !isVisible ? null : bodyCell;
};
exports.BodyCell = BodyCell;
exports.BodyCell.displayName = 'BodyCell';
//# sourceMappingURL=BodyCell.js.map