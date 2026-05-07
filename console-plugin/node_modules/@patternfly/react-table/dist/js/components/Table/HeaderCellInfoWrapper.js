"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderCellInfoWrapper = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const help_icon_1 = tslib_1.__importDefault(require('@patternfly/react-icons/dist/js/icons/help-icon'));
const react_styles_1 = require("@patternfly/react-styles");
const table_1 = tslib_1.__importDefault(require("@patternfly/react-styles/css/components/Table/table"));
const Tooltip_1 = require('@patternfly/react-core/dist/js/components/Tooltip');
const Popover_1 = require('@patternfly/react-core/dist/js/components/Popover');
const Button_1 = require('@patternfly/react-core/dist/js/components/Button');
const TableText_1 = require("./TableText");
const HeaderCellInfoWrapper = ({ children, info, className, variant = 'tooltip', popoverProps, tooltipProps, ariaLabel }) => ((0, jsx_runtime_1.jsxs)("div", { className: (0, react_styles_1.css)(table_1.default.tableColumnHelp, className), children: [typeof children === 'string' ? (0, jsx_runtime_1.jsx)(TableText_1.TableText, { children: children }) : children, (0, jsx_runtime_1.jsx)("span", { className: (0, react_styles_1.css)(table_1.default.tableColumnHelpAction), children: variant === 'tooltip' ? ((0, jsx_runtime_1.jsx)(Tooltip_1.Tooltip, Object.assign({ content: info }, tooltipProps, { children: (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "plain", hasNoPadding: true, "aria-label": ariaLabel || (typeof info === 'string' && info) || 'More info', icon: (0, jsx_runtime_1.jsx)(help_icon_1.default, {}) }) }))) : ((0, jsx_runtime_1.jsx)(Popover_1.Popover, Object.assign({ bodyContent: info }, popoverProps, { children: (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "plain", hasNoPadding: true, "aria-label": ariaLabel || (typeof info === 'string' && info) || 'More info', icon: (0, jsx_runtime_1.jsx)(help_icon_1.default, {}) }) }))) })] }));
exports.HeaderCellInfoWrapper = HeaderCellInfoWrapper;
exports.HeaderCellInfoWrapper.displayName = 'HeaderCellInfoWrapper';
//# sourceMappingURL=HeaderCellInfoWrapper.js.map