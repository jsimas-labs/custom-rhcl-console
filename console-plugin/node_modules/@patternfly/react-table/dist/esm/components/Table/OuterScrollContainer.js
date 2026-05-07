import { __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Table/table-scrollable.mjs';
export const OuterScrollContainer = (_a) => {
    var { children, className } = _a, props = __rest(_a, ["children", "className"]);
    return (_jsx("div", Object.assign({ className: css(className, styles.scrollOuterWrapper) }, props, { children: children })));
};
OuterScrollContainer.displayName = 'OuterScrollContainer';
//# sourceMappingURL=OuterScrollContainer.js.map