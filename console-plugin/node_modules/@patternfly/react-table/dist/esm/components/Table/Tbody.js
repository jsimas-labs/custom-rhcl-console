import { __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Table/table.mjs';
const TbodyBase = (_a) => {
    var { children, className, isExpanded, innerRef, isEvenStriped = false, isOddStriped = false } = _a, props = __rest(_a, ["children", "className", "isExpanded", "innerRef", "isEvenStriped", "isOddStriped"]);
    return (_jsx("tbody", Object.assign({ role: "rowgroup", className: css(styles.tableTbody, className, isExpanded && styles.modifiers.expanded, isOddStriped && styles.modifiers.striped, isEvenStriped && styles.modifiers.stripedEven), ref: innerRef }, props, { children: children })));
};
export const Tbody = forwardRef((props, ref) => (_jsx(TbodyBase, Object.assign({}, props, { innerRef: ref }))));
Tbody.displayName = 'Tbody';
//# sourceMappingURL=Tbody.js.map