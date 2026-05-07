"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritesCell = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = require('@patternfly/react-core/dist/js/components/Button');
const FavoritesCell = (_a) => {
    var { className = '', onFavorite, isFavorited, rowIndex } = _a, props = tslib_1.__rest(_a, ["className", "onFavorite", "isFavorited", "rowIndex"]);
    const ariaProps = rowIndex === undefined
        ? {}
        : {
            id: `favorites-button-${rowIndex}`,
            'aria-labelledby': `favorites-button-${rowIndex}`
        };
    return ((0, jsx_runtime_1.jsx)(Button_1.Button, Object.assign({ variant: "plain", className: className, type: "button", "aria-label": isFavorited ? 'Starred' : 'Not starred', onClick: onFavorite, isFavorite: true, isFavorited: isFavorited }, ariaProps, props)));
};
exports.FavoritesCell = FavoritesCell;
exports.FavoritesCell.displayName = 'FavoritesCell';
//# sourceMappingURL=FavoritesCell.js.map