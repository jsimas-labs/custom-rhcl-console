"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsColumn = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_2 = require("react");
const Dropdown_1 = require('@patternfly/react-core/dist/js/components/Dropdown');
const Button_1 = require('@patternfly/react-core/dist/js/components/Button');
const Divider_1 = require('@patternfly/react-core/dist/js/components/Divider');
const MenuToggle_1 = require('@patternfly/react-core/dist/js/components/MenuToggle');
const ellipsis_v_icon_1 = tslib_1.__importDefault(require('@patternfly/react-icons/dist/js/icons/ellipsis-v-icon'));
const Tooltip_1 = require('@patternfly/react-core/dist/js/components/Tooltip');
const ActionsColumnBase = (_a) => {
    var { items, isDisabled, rowData, extraData, actionsToggle, popperProps = {
        position: 'end',
        direction: 'down'
    }, innerRef, firstActionItemRef, isOnOpenChangeDisabled = false } = _a, props = tslib_1.__rest(_a, ["items", "isDisabled", "rowData", "extraData", "actionsToggle", "popperProps", "innerRef", "firstActionItemRef", "isOnOpenChangeDisabled"]);
    const [isOpen, setIsOpen] = (0, react_2.useState)(false);
    const onToggle = () => {
        setIsOpen(!isOpen);
    };
    const onActionClick = (event, onClick) => {
        // Only prevent default if onClick is provided.  This allows href support.
        if (onClick) {
            event.preventDefault();
            // tslint:disable-next-line:no-unused-expression
            onClick(event, extraData && extraData.rowIndex, rowData, extraData);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(react_2.Fragment, { children: [items
                .filter((item) => item.isOutsideDropdown)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .map((_a, key) => {
                var { title, itemKey, onClick, isOutsideDropdown } = _a, props = tslib_1.__rest(_a, ["title", "itemKey", "onClick", "isOutsideDropdown"]);
                return typeof title === 'string' ? ((0, react_1.createElement)(Button_1.Button, Object.assign({ onClick: (event) => onActionClick(event, onClick) }, props, { isDisabled: isDisabled, key: itemKey || `outside_dropdown_${key}`, "data-key": itemKey || `outside_dropdown_${key}` }), title)) : ((0, react_2.cloneElement)(title, Object.assign({ onClick, isDisabled }, props)));
            }), (0, jsx_runtime_1.jsx)(Dropdown_1.Dropdown, Object.assign({ isOpen: isOpen, onOpenChange: !isOnOpenChangeDisabled ? (isOpen) => setIsOpen(isOpen) : undefined, toggle: (toggleRef) => actionsToggle ? (actionsToggle({ onToggle, isOpen, isDisabled, toggleRef })) : ((0, jsx_runtime_1.jsx)(MenuToggle_1.MenuToggle, { "aria-label": "Kebab toggle", ref: toggleRef, onClick: onToggle, isExpanded: isOpen, isDisabled: isDisabled, variant: "plain", icon: (0, jsx_runtime_1.jsx)(ellipsis_v_icon_1.default, {}) })) }, (rowData && rowData.actionProps), { ref: innerRef }, props, { popperProps: popperProps, children: (0, jsx_runtime_1.jsx)(Dropdown_1.DropdownList, { children: items
                        .filter((item) => !item.isOutsideDropdown)
                        .map((_a, index) => {
                        var { title, itemKey, onClick, tooltipProps, isSeparator, shouldCloseOnClick = true } = _a, props = tslib_1.__rest(_a, ["title", "itemKey", "onClick", "tooltipProps", "isSeparator", "shouldCloseOnClick"]);
                        if (isSeparator) {
                            return (0, jsx_runtime_1.jsx)(Divider_1.Divider, { "data-key": itemKey || index }, itemKey || index);
                        }
                        const item = ((0, react_1.createElement)(Dropdown_1.DropdownItem, Object.assign({ onClick: (event) => {
                                onActionClick(event, onClick);
                                shouldCloseOnClick && onToggle();
                            } }, props, { key: itemKey || index, "data-key": itemKey || index, ref: index === 0 ? firstActionItemRef : undefined }), title));
                        if (tooltipProps === null || tooltipProps === void 0 ? void 0 : tooltipProps.content) {
                            return ((0, jsx_runtime_1.jsx)(Tooltip_1.Tooltip, Object.assign({}, tooltipProps, { children: item }), itemKey || index));
                        }
                        else {
                            return item;
                        }
                    }) }) }))] }));
};
exports.ActionsColumn = (0, react_2.forwardRef)((props, ref) => ((0, jsx_runtime_1.jsx)(ActionsColumnBase, Object.assign({}, props, { innerRef: ref }))));
exports.ActionsColumn.displayName = 'ActionsColumn';
//# sourceMappingURL=ActionsColumn.js.map