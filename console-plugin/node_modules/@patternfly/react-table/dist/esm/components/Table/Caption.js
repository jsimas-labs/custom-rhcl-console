import { __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import styles from '@patternfly/react-styles/css/components/Table/table.mjs';
import { css } from '@patternfly/react-styles';
export const Caption = (_a) => {
    var { children, className } = _a, props = __rest(_a, ["children", "className"]);
    return (_jsx("caption", Object.assign({ className: css(styles.tableCaption, className) }, props, { children: children })));
};
Caption.displayName = 'Caption';
//# sourceMappingURL=Caption.js.map