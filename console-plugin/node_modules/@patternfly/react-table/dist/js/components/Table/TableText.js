"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableText = exports.WrapModifier = exports.TableTextVariant = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const table_1 = tslib_1.__importDefault(require("@patternfly/react-styles/css/components/Table/table"));
const react_styles_1 = require("@patternfly/react-styles");
const Tooltip_1 = require('@patternfly/react-core/dist/js/components/Tooltip');
var TableTextVariant;
(function (TableTextVariant) {
    TableTextVariant["div"] = "div";
    TableTextVariant["nav"] = "nav";
})(TableTextVariant || (exports.TableTextVariant = TableTextVariant = {}));
var WrapModifier;
(function (WrapModifier) {
    WrapModifier["wrap"] = "wrap";
    WrapModifier["nowrap"] = "nowrap";
    WrapModifier["truncate"] = "truncate";
    WrapModifier["breakWord"] = "breakWord";
    WrapModifier["fitContent"] = "fitContent";
})(WrapModifier || (exports.WrapModifier = WrapModifier = {}));
const TableText = (_a) => {
    var { children = null, className = '', variant = 'span', wrapModifier = null, tooltip: tooltipProp = '', tooltipProps = {}, onMouseEnter: onMouseEnterProp = () => { }, focused = false, tooltipHasDefaultBehavior = false } = _a, props = tslib_1.__rest(_a, ["children", "className", "variant", "wrapModifier", "tooltip", "tooltipProps", "onMouseEnter", "focused", "tooltipHasDefaultBehavior"]);
    const Component = variant;
    const textRef = (0, react_1.createRef)();
    const [tooltip, setTooltip] = (0, react_1.useState)(tooltipProp);
    const onMouseEnter = (event) => {
        if (event.target.offsetWidth < event.target.scrollWidth) {
            setTooltip(tooltipProp || event.target.innerText);
        }
        else {
            setTooltip('');
        }
        onMouseEnterProp(event);
    };
    const onFocus = (element) => {
        if (element.offsetWidth < element.scrollWidth) {
            setTooltip(tooltipProp || element.innerText);
        }
        else {
            setTooltip('');
        }
    };
    const text = ((0, jsx_runtime_1.jsx)(Component, Object.assign({ ref: textRef, onMouseEnter: !tooltipHasDefaultBehavior ? onMouseEnter : undefined, className: (0, react_styles_1.css)(className, wrapModifier && table_1.default.modifiers[wrapModifier], table_1.default.tableText) }, props, { children: children })));
    (0, react_1.useEffect)(() => {
        if (!tooltipHasDefaultBehavior) {
            if (focused) {
                onFocus(textRef.current);
            }
            else {
                setTooltip('');
            }
        }
    }, [focused, tooltipHasDefaultBehavior]);
    return tooltip !== '' ? ((0, jsx_runtime_1.jsx)(Tooltip_1.Tooltip, Object.assign({ triggerRef: textRef, content: tooltip }, (!tooltipHasDefaultBehavior && { isVisible: true }), tooltipProps, { children: text }))) : (text);
};
exports.TableText = TableText;
exports.TableText.displayName = 'TableText';
//# sourceMappingURL=TableText.js.map