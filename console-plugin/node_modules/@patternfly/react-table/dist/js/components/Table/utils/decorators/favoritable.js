"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoritable = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_styles_1 = require("@patternfly/react-styles");
const table_1 = tslib_1.__importDefault(require("@patternfly/react-styles/css/components/Table/table"));
const FavoritesCell_1 = require("../../FavoritesCell");
const favoritable = (value, { rowIndex, columnIndex, rowData, column, property }) => {
    const { extraParams: { onFavorite } } = column;
    const extraData = {
        rowIndex,
        columnIndex,
        column,
        property
    };
    // this is a child row which should not display the favorites icon
    if (rowData && rowData.hasOwnProperty('parent') && !rowData.fullWidth) {
        return {
            component: 'td',
            isVisible: true
        };
    }
    /**
     * @param {React.MouseEvent} event - Mouse event
     */
    function favoritesClick(event) {
        // tslint:disable-next-line:no-unused-expression
        onFavorite && onFavorite(event, rowData && !rowData.favorited, rowIndex, rowData, extraData);
    }
    const additionalProps = rowData.favoritesProps || {};
    return {
        className: (0, react_styles_1.css)(table_1.default.tableFavorite, rowData && rowData.favorited && table_1.default.modifiers.favorited),
        isVisible: !rowData || !rowData.fullWidth,
        children: ((0, jsx_runtime_1.jsx)(FavoritesCell_1.FavoritesCell, Object.assign({ rowIndex: rowIndex, onFavorite: favoritesClick, isFavorited: rowData && rowData.favorited }, additionalProps)))
    };
};
exports.favoritable = favoritable;
//# sourceMappingURL=favoritable.js.map