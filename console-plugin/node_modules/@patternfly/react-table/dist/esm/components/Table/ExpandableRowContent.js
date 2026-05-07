import { __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Table/table.mjs';
export const ExpandableRowContent = (_a) => {
    var { children = null, hasNoBackground } = _a, props = __rest(_a, ["children", "hasNoBackground"]);
    return (_jsx("div", Object.assign({}, props, { className: css(styles.tableExpandableRowContent, hasNoBackground && styles.modifiers.noBackground), children: children })));
};
ExpandableRowContent.displayName = 'ExpandableRowContent';
//# sourceMappingURL=ExpandableRowContent.js.map