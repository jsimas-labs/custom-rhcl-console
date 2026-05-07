"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Body = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * body.tsx
 *
 * Forked from reactabular-table version 8.14.0
 * https://github.com/reactabular/reactabular/tree/v8.14.0/packages/reactabular-table/src
 */
const react_1 = require("react");
const isEqual_1 = tslib_1.__importDefault(require("lodash/isEqual"));
const provider_1 = require("../../../../components/Table/base/provider");
const resolve_row_key_1 = require("./resolve-row-key");
const body_row_1 = require("./body-row");
class BaseBody extends react_1.Component {
    constructor() {
        super(...arguments);
        this.omitOnRow = (props) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { onRow } = props, ret = tslib_1.__rest(props, ["onRow"]);
            return ret;
        };
    }
    shouldComponentUpdate(nextProps) {
        // Skip checking props against `onRow` since that can be bound at render().
        // That's not particularly good practice but you never know how the users
        // prefer to define the handler.
        // Check for wrapper based override.
        const { renderers } = nextProps;
        if (renderers &&
            renderers.body &&
            renderers.body.wrapper &&
            renderers.body.wrapper.shouldComponentUpdate) {
            if (typeof renderers.body.wrapper.shouldComponentUpdate === 'function') {
                return renderers.body.wrapper.shouldComponentUpdate.call(this, nextProps, {}, {});
            }
            return true;
        }
        return !(0, isEqual_1.default)(this.omitOnRow(this.props), this.omitOnRow(nextProps));
    }
    render() {
        const _a = this.props, { onRow, rows, rowKey, columns, renderers } = _a, props = tslib_1.__rest(_a, ["onRow", "rows", "rowKey", "columns", "renderers"]);
        const children = rows.map((rowData, index) => {
            const key = (0, resolve_row_key_1.resolveRowKey)({ rowData, rowIndex: index, rowKey });
            return (0, react_1.createElement)(body_row_1.BodyRow, {
                key,
                renderers: renderers.body,
                onRow,
                rowKey: key,
                rowIndex: index,
                rowData,
                columns
            });
        });
        return (0, react_1.createElement)(renderers.body.wrapper, props, children);
    }
}
BaseBody.defaultProps = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRow: (...args) => ({})
};
const Body = (props) => ((0, jsx_runtime_1.jsx)(provider_1.ProviderContext.Consumer, { children: ({ columns, renderers }) => (0, jsx_runtime_1.jsx)(BaseBody, Object.assign({ columns: columns, renderers: renderers }, props)) }));
exports.Body = Body;
//# sourceMappingURL=body.js.map