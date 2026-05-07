import { __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { createElement as _createElement } from "react";
import { Fragment } from 'react';
import { mapOpenedRows } from '../../../components';
import { Tbody } from '../../../components';
export const BodyWrapper = (_a) => {
    var { mappedRows, tbodyRef, 
    /* eslint-disable @typescript-eslint/no-unused-vars */
    rows = [], onCollapse, headerRows } = _a, 
    /* eslint-enable @typescript-eslint/no-unused-vars */
    props = __rest(_a, ["mappedRows", "tbodyRef", "rows", "onCollapse", "headerRows"]);
    if (mappedRows && mappedRows.some((row) => row.hasOwnProperty('parent'))) {
        return (_jsx(Fragment, { children: mapOpenedRows(mappedRows, props.children).map((oneRow, key) => (_createElement(Tbody, Object.assign({}, props, { isExpanded: oneRow.isOpen, key: `tbody-${key}`, ref: tbodyRef }), oneRow.rows))) }));
    }
    return _jsx(Tbody, Object.assign({}, props, { ref: tbodyRef }));
};
BodyWrapper.displayName = 'BodyWrapper';
//# sourceMappingURL=BodyWrapper.js.map