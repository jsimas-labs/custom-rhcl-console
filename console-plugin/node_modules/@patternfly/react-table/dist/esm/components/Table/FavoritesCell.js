import { __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from '@patternfly/react-core/dist/esm/components/Button';
export const FavoritesCell = (_a) => {
    var { className = '', onFavorite, isFavorited, rowIndex } = _a, props = __rest(_a, ["className", "onFavorite", "isFavorited", "rowIndex"]);
    const ariaProps = rowIndex === undefined
        ? {}
        : {
            id: `favorites-button-${rowIndex}`,
            'aria-labelledby': `favorites-button-${rowIndex}`
        };
    return (_jsx(Button, Object.assign({ variant: "plain", className: className, type: "button", "aria-label": isFavorited ? 'Starred' : 'Not starred', onClick: onFavorite, isFavorite: true, isFavorited: isFavorited }, ariaProps, props)));
};
FavoritesCell.displayName = 'FavoritesCell';
//# sourceMappingURL=FavoritesCell.js.map