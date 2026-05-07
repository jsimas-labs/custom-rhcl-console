"use strict";
(self["webpackChunkcustom_rhcl_console"] = self["webpackChunkcustom_rhcl_console"] || []).push([["exposed-PolicyListPage"],{

/***/ "./components/common/FilterToolbar.tsx"
/*!*********************************************!*\
  !*** ./components/common/FilterToolbar.tsx ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Toolbar__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Toolbar */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Toolbar/@patternfly/react-core/dist/dynamic/components/Toolbar");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_SearchInput__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/SearchInput */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/SearchInput/@patternfly/react-core/dist/dynamic/components/SearchInput");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_MenuToggle__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/MenuToggle */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/MenuToggle/@patternfly/react-core/dist/dynamic/components/MenuToggle");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Select__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Select */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Select/@patternfly/react-core/dist/dynamic/components/Select");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_5__);
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}









var FilterToolbar = function FilterToolbar(param) {
    var searchValue = param.searchValue, onSearchChange = param.onSearchChange, searchPlaceholder = param.searchPlaceholder, namespaces = param.namespaces, selectedNamespace = param.selectedNamespace, onNamespaceChange = param.onNamespaceChange, statusOptions = param.statusOptions, _param_selectedStatuses = param.selectedStatuses, selectedStatuses = _param_selectedStatuses === void 0 ? [] : _param_selectedStatuses, onStatusChange = param.onStatusChange;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_5__.useTranslation)('plugin__custom-rhcl-console').t;
    var _React_useState = _sliced_to_array(react__WEBPACK_IMPORTED_MODULE_0__.useState(false), 2), nsOpen = _React_useState[0], setNsOpen = _React_useState[1];
    var _React_useState1 = _sliced_to_array(react__WEBPACK_IMPORTED_MODULE_0__.useState(false), 2), statusOpen = _React_useState1[0], setStatusOpen = _React_useState1[1];
    var nsToggleRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
    var statusToggleRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Toolbar__WEBPACK_IMPORTED_MODULE_1__.Toolbar, {
        clearAllFilters: function clearAllFilters() {
            onSearchChange('');
            onNamespaceChange === null || onNamespaceChange === void 0 ? void 0 : onNamespaceChange('');
            onStatusChange === null || onStatusChange === void 0 ? void 0 : onStatusChange([]);
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Toolbar__WEBPACK_IMPORTED_MODULE_1__.ToolbarContent, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Toolbar__WEBPACK_IMPORTED_MODULE_1__.ToolbarItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_SearchInput__WEBPACK_IMPORTED_MODULE_2__.SearchInput, {
        placeholder: searchPlaceholder || t('Search by name or hostname'),
        value: searchValue,
        onChange: function onChange(_e, val) {
            return onSearchChange(val);
        },
        onClear: function onClear() {
            return onSearchChange('');
        }
    })), namespaces && onNamespaceChange && /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Toolbar__WEBPACK_IMPORTED_MODULE_1__.ToolbarItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Select__WEBPACK_IMPORTED_MODULE_4__.Select, {
        isOpen: nsOpen,
        onOpenChange: setNsOpen,
        toggle: function toggle(toggleRef) {
            return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_MenuToggle__WEBPACK_IMPORTED_MODULE_3__.MenuToggle, {
                ref: toggleRef || nsToggleRef,
                onClick: function onClick() {
                    return setNsOpen(!nsOpen);
                },
                isExpanded: nsOpen
            }, selectedNamespace || t('All namespaces'));
        },
        onSelect: function onSelect(_e, value) {
            onNamespaceChange(value);
            setNsOpen(false);
        },
        selected: selectedNamespace
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Select__WEBPACK_IMPORTED_MODULE_4__.SelectOption, {
        value: ""
    }, t('All namespaces')), namespaces.map(function(ns) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Select__WEBPACK_IMPORTED_MODULE_4__.SelectOption, {
            key: ns,
            value: ns
        }, ns);
    }))), statusOptions && onStatusChange && /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Toolbar__WEBPACK_IMPORTED_MODULE_1__.ToolbarItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Select__WEBPACK_IMPORTED_MODULE_4__.Select, {
        isOpen: statusOpen,
        onOpenChange: setStatusOpen,
        toggle: function toggle(toggleRef) {
            return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_MenuToggle__WEBPACK_IMPORTED_MODULE_3__.MenuToggle, {
                ref: toggleRef || statusToggleRef,
                onClick: function onClick() {
                    return setStatusOpen(!statusOpen);
                },
                isExpanded: statusOpen
            }, selectedStatuses.length > 0 ? "".concat(selectedStatuses.length, " selected") : t('All statuses'));
        },
        onSelect: function onSelect(_e, value) {
            var val = value;
            if (selectedStatuses.includes(val)) {
                onStatusChange(selectedStatuses.filter(function(s) {
                    return s !== val;
                }));
            } else {
                onStatusChange(_to_consumable_array(selectedStatuses).concat([
                    val
                ]));
            }
        }
    }, statusOptions.map(function(status) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Select__WEBPACK_IMPORTED_MODULE_4__.SelectOption, {
            key: status,
            value: status,
            hasCheckbox: true,
            isSelected: selectedStatuses.includes(status)
        }, t(status));
    })))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FilterToolbar);


/***/ },

/***/ "./components/common/StatusLabel.tsx"
/*!*******************************************!*\
  !*** ./components/common/StatusLabel.tsx ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Label */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Label/@patternfly/react-core/dist/dynamic/components/Label");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_check_circle_icon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/check-circle-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/check-circle-icon/@patternfly/react-icons/dist/dynamic/icons/check-circle-icon");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_exclamation_circle_icon__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon/@patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_exclamation_triangle_icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/exclamation-triangle-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/exclamation-triangle-icon/@patternfly/react-icons/dist/dynamic/icons/exclamation-triangle-icon");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_in_progress_icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/in-progress-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/in-progress-icon/@patternfly/react-icons/dist/dynamic/icons/in-progress-icon");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_unknown_icon__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/unknown-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/unknown-icon/@patternfly/react-icons/dist/dynamic/icons/unknown-icon");
/* harmony import */ var _utils_status__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../utils/status */ "./utils/status.ts");








var SEVERITY_ICONS = {
    healthy: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_check_circle_icon__WEBPACK_IMPORTED_MODULE_2__.CheckCircleIcon, null),
    warning: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_exclamation_triangle_icon__WEBPACK_IMPORTED_MODULE_4__.ExclamationTriangleIcon, null),
    critical: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_exclamation_circle_icon__WEBPACK_IMPORTED_MODULE_3__.ExclamationCircleIcon, null),
    progressing: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_in_progress_icon__WEBPACK_IMPORTED_MODULE_5__.InProgressIcon, null),
    unknown: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_unknown_icon__WEBPACK_IMPORTED_MODULE_6__.UnknownIcon, null)
};
var SEVERITY_LABELS = {
    healthy: 'Healthy',
    warning: 'Degraded',
    critical: 'Critical',
    progressing: 'Progressing',
    unknown: 'Unknown'
};
var StatusLabel = function StatusLabel(param) {
    var conditions = param.conditions, severityOverride = param.severity, label = param.label;
    var severity = severityOverride !== null && severityOverride !== void 0 ? severityOverride : (0,_utils_status__WEBPACK_IMPORTED_MODULE_7__.getWorstConditionSeverity)(conditions);
    var displayLabel = label !== null && label !== void 0 ? label : SEVERITY_LABELS[severity];
    var color = (0,_utils_status__WEBPACK_IMPORTED_MODULE_7__.severityToLabelColor)(severity);
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_1__.Label, {
        color: color,
        icon: SEVERITY_ICONS[severity]
    }, displayLabel);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (StatusLabel);


/***/ },

/***/ "./components/policies/PolicyListPage.tsx"
/*!************************************************!*\
  !*** ./components/policies/PolicyListPage.tsx ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-router */ "webpack/sharing/consume/default/react-router");
/* harmony import */ var react_router__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_router__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Page */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Page/@patternfly/react-core/dist/dynamic/components/Page");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Title */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Title/@patternfly/react-core/dist/dynamic/components/Title");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Spinner */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Spinner/@patternfly/react-core/dist/dynamic/components/Spinner");
/* harmony import */ var _patternfly_react_core_dist_dynamic_layouts_Bullseye__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/layouts/Bullseye */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/layouts/Bullseye/@patternfly/react-core/dist/dynamic/layouts/Bullseye");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Label */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Label/@patternfly/react-core/dist/dynamic/components/Label");
/* harmony import */ var _patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @patternfly/react-table/dist/dynamic/components/Table */ "webpack/sharing/consume/default/@patternfly/react-table/dist/dynamic/components/Table/@patternfly/react-table/dist/dynamic/components/Table");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @openshift-console/dynamic-plugin-sdk */ "webpack/sharing/consume/default/@openshift-console/dynamic-plugin-sdk");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../models */ "./models/index.ts");
/* harmony import */ var _utils_status__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../utils/status */ "./utils/status.ts");
/* harmony import */ var _common_StatusLabel__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../common/StatusLabel */ "./components/common/StatusLabel.tsx");
/* harmony import */ var _common_FilterToolbar__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../common/FilterToolbar */ "./components/common/FilterToolbar.tsx");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}



















var PolicyListPage = function PolicyListPage() {
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_9__.useTranslation)('plugin__custom-rhcl-console').t;
    var _React_useState = _sliced_to_array(react__WEBPACK_IMPORTED_MODULE_0__.useState(''), 2), searchValue = _React_useState[0], setSearchValue = _React_useState[1];
    var _React_useState1 = _sliced_to_array(react__WEBPACK_IMPORTED_MODULE_0__.useState(''), 2), selectedNamespace = _React_useState1[0], setSelectedNamespace = _React_useState1[1];
    var _React_useState2 = _sliced_to_array(react__WEBPACK_IMPORTED_MODULE_0__.useState([]), 2), selectedStatuses = _React_useState2[0], setSelectedStatuses = _React_useState2[1];
    var _useK8sWatchResource = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_8__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_10__.AuthPolicyGVK,
        isList: true
    }), 2), authPolicies = _useK8sWatchResource[0], authLoaded = _useK8sWatchResource[1];
    var _useK8sWatchResource1 = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_8__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_10__.RateLimitPolicyGVK,
        isList: true
    }), 2), rlPolicies = _useK8sWatchResource1[0], rlLoaded = _useK8sWatchResource1[1];
    var _useK8sWatchResource2 = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_8__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_10__.TokenRateLimitPolicyGVK,
        isList: true
    }), 2), trlPolicies = _useK8sWatchResource2[0], trlLoaded = _useK8sWatchResource2[1];
    var _useK8sWatchResource3 = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_8__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_10__.DNSPolicyGVK,
        isList: true
    }), 2), dnsPolicies = _useK8sWatchResource3[0], dnsLoaded = _useK8sWatchResource3[1];
    var _useK8sWatchResource4 = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_8__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_10__.TLSPolicyGVK,
        isList: true
    }), 2), tlsPolicies = _useK8sWatchResource4[0], tlsLoaded = _useK8sWatchResource4[1];
    var loaded = authLoaded && rlLoaded && trlLoaded && dnsLoaded && tlsLoaded;
    var allPolicies = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(function() {
        var rows = [];
        var addRows = function addRows(items, kind) {
            var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
            try {
                for(var _iterator = (items || [])[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                    var p = _step.value;
                    var ref = p.spec.targetRef;
                    rows.push({
                        policy: p,
                        policyKind: kind,
                        targetRef: ref
                    });
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally{
                try {
                    if (!_iteratorNormalCompletion && _iterator.return != null) {
                        _iterator.return();
                    }
                } finally{
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        };
        addRows(authPolicies, 'AuthPolicy');
        addRows(rlPolicies, 'RateLimitPolicy');
        addRows(trlPolicies, 'TokenRateLimitPolicy');
        addRows(dnsPolicies, 'DNSPolicy');
        addRows(tlsPolicies, 'TLSPolicy');
        return rows;
    }, [
        authPolicies,
        rlPolicies,
        trlPolicies,
        dnsPolicies,
        tlsPolicies
    ]);
    var namespaces = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(function() {
        return _to_consumable_array(new Set(allPolicies.map(function(r) {
            var _r_policy_metadata;
            return ((_r_policy_metadata = r.policy.metadata) === null || _r_policy_metadata === void 0 ? void 0 : _r_policy_metadata.namespace) || '';
        }))).sort();
    }, [
        allPolicies
    ]);
    var filtered = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(function() {
        var items = allPolicies;
        if (selectedNamespace) {
            items = items.filter(function(r) {
                var _r_policy_metadata;
                return ((_r_policy_metadata = r.policy.metadata) === null || _r_policy_metadata === void 0 ? void 0 : _r_policy_metadata.namespace) === selectedNamespace;
            });
        }
        if (searchValue) {
            var lower = searchValue.toLowerCase();
            items = items.filter(function(r) {
                var _r_policy_metadata;
                var name = (((_r_policy_metadata = r.policy.metadata) === null || _r_policy_metadata === void 0 ? void 0 : _r_policy_metadata.name) || '').toLowerCase();
                var target = r.targetRef.name.toLowerCase();
                return name.includes(lower) || target.includes(lower);
            });
        }
        if (selectedStatuses.length > 0) {
            items = items.filter(function(r) {
                var _r_policy_status;
                var conditions = ((_r_policy_status = r.policy.status) === null || _r_policy_status === void 0 ? void 0 : _r_policy_status.conditions) || [];
                return selectedStatuses.some(function(s) {
                    if (s === 'Accepted') return (0,_utils_status__WEBPACK_IMPORTED_MODULE_11__.isConditionTrue)(conditions, 'Accepted');
                    if (s === 'Enforced') return (0,_utils_status__WEBPACK_IMPORTED_MODULE_11__.isConditionTrue)(conditions, 'Enforced');
                    if (s === 'Overridden') return (0,_utils_status__WEBPACK_IMPORTED_MODULE_11__.isConditionTrue)(conditions, 'Overridden');
                    if (s === 'Failing') {
                        var sev = (0,_utils_status__WEBPACK_IMPORTED_MODULE_11__.getWorstConditionSeverity)(conditions);
                        return sev === 'critical' || sev === 'warning';
                    }
                    return false;
                });
            });
        }
        return items;
    }, [
        allPolicies,
        selectedNamespace,
        searchValue,
        selectedStatuses
    ]);
    if (!loaded) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_2__.PageSection, {
            variant: "default"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_3__.Title, {
            headingLevel: "h1"
        }, t('Policies'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_2__.PageSection, {
            isFilled: true
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Bullseye__WEBPACK_IMPORTED_MODULE_5__.Bullseye, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_4__.Spinner, {
            size: "xl"
        }))));
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_2__.PageSection, {
        variant: "default"
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_3__.Title, {
        headingLevel: "h1"
    }, t('Policies'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_2__.PageSection, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_common_FilterToolbar__WEBPACK_IMPORTED_MODULE_13__["default"], {
        searchValue: searchValue,
        onSearchChange: setSearchValue,
        namespaces: namespaces,
        selectedNamespace: selectedNamespace,
        onNamespaceChange: setSelectedNamespace,
        statusOptions: [
            'Accepted',
            'Enforced',
            'Overridden',
            'Failing'
        ],
        selectedStatuses: selectedStatuses,
        onStatusChange: setSelectedStatuses
    }), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Table, {
        "aria-label": t('Policies')
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Thead, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Tr, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Th, null, t('Name')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Th, null, t('Namespace')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Th, null, t('Policy type')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Th, null, t('Target')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Th, null, t('Status')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Th, null, t('Condition')))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Tbody, null, filtered.map(function(row) {
        var _row_policy_metadata, _row_policy_metadata1, _row_policy_status, _row_policy_metadata2;
        var ns = ((_row_policy_metadata = row.policy.metadata) === null || _row_policy_metadata === void 0 ? void 0 : _row_policy_metadata.namespace) || '';
        var name = ((_row_policy_metadata1 = row.policy.metadata) === null || _row_policy_metadata1 === void 0 ? void 0 : _row_policy_metadata1.name) || '';
        var conditions = ((_row_policy_status = row.policy.status) === null || _row_policy_status === void 0 ? void 0 : _row_policy_status.conditions) || [];
        var overridden = (0,_utils_status__WEBPACK_IMPORTED_MODULE_11__.isConditionTrue)(conditions, 'Overridden');
        var targetPath = row.targetRef.kind === 'Gateway' ? "/connectivity-link/gateways/".concat(row.targetRef.namespace || ns, "/").concat(row.targetRef.name) : "/connectivity-link/httproutes/".concat(row.targetRef.namespace || ns, "/").concat(row.targetRef.name);
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Tr, {
            key: (_row_policy_metadata2 = row.policy.metadata) === null || _row_policy_metadata2 === void 0 ? void 0 : _row_policy_metadata2.uid
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Td, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", {
            href: (0,_models__WEBPACK_IMPORTED_MODULE_10__.policyResourceURL)(row.policyKind, ns, name)
        }, name)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Td, null, ns), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Td, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_6__.Label, {
            color: "blue"
        }, _models__WEBPACK_IMPORTED_MODULE_10__.POLICY_KIND_LABELS[row.policyKind] || row.policyKind)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Td, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router__WEBPACK_IMPORTED_MODULE_1__.Link, {
            to: targetPath
        }, row.targetRef.kind, "/", row.targetRef.name)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Td, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_common_StatusLabel__WEBPACK_IMPORTED_MODULE_12__["default"], {
            conditions: conditions
        })), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_7__.Td, null, overridden ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_6__.Label, {
            color: "orange"
        }, t('Overridden')) : (0,_utils_status__WEBPACK_IMPORTED_MODULE_11__.isConditionTrue)(conditions, 'Enforced') ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_6__.Label, {
            color: "green"
        }, t('Enforced')) : /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_6__.Label, {
            color: "grey"
        }, t('Accepted'))));
    })))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PolicyListPage);


/***/ },

/***/ "./models/index.ts"
/*!*************************!*\
  !*** ./models/index.ts ***!
  \*************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ALL_POLICY_GVKS: () => (/* binding */ ALL_POLICY_GVKS),
/* harmony export */   APIKeyGVK: () => (/* binding */ APIKeyGVK),
/* harmony export */   APIProductGVK: () => (/* binding */ APIProductGVK),
/* harmony export */   AuthPolicyGVK: () => (/* binding */ AuthPolicyGVK),
/* harmony export */   CertificateGVK: () => (/* binding */ CertificateGVK),
/* harmony export */   DNSPolicyGVK: () => (/* binding */ DNSPolicyGVK),
/* harmony export */   DNSRecordGVK: () => (/* binding */ DNSRecordGVK),
/* harmony export */   GatewayClassGVK: () => (/* binding */ GatewayClassGVK),
/* harmony export */   GatewayGVK: () => (/* binding */ GatewayGVK),
/* harmony export */   HTTPRouteGVK: () => (/* binding */ HTTPRouteGVK),
/* harmony export */   POLICY_KIND_LABELS: () => (/* binding */ POLICY_KIND_LABELS),
/* harmony export */   RateLimitPolicyGVK: () => (/* binding */ RateLimitPolicyGVK),
/* harmony export */   ServiceGVK: () => (/* binding */ ServiceGVK),
/* harmony export */   TLSPolicyGVK: () => (/* binding */ TLSPolicyGVK),
/* harmony export */   TokenRateLimitPolicyGVK: () => (/* binding */ TokenRateLimitPolicyGVK),
/* harmony export */   policyResourceURL: () => (/* binding */ policyResourceURL)
/* harmony export */ });
var GatewayGVK = {
    group: 'gateway.networking.k8s.io',
    version: 'v1',
    kind: 'Gateway'
};
var GatewayClassGVK = {
    group: 'gateway.networking.k8s.io',
    version: 'v1',
    kind: 'GatewayClass'
};
var HTTPRouteGVK = {
    group: 'gateway.networking.k8s.io',
    version: 'v1',
    kind: 'HTTPRoute'
};
var AuthPolicyGVK = {
    group: 'kuadrant.io',
    version: 'v1',
    kind: 'AuthPolicy'
};
var RateLimitPolicyGVK = {
    group: 'kuadrant.io',
    version: 'v1',
    kind: 'RateLimitPolicy'
};
var TokenRateLimitPolicyGVK = {
    group: 'kuadrant.io',
    version: 'v1alpha1',
    kind: 'TokenRateLimitPolicy'
};
var DNSPolicyGVK = {
    group: 'kuadrant.io',
    version: 'v1',
    kind: 'DNSPolicy'
};
var TLSPolicyGVK = {
    group: 'kuadrant.io',
    version: 'v1',
    kind: 'TLSPolicy'
};
var DNSRecordGVK = {
    group: 'kuadrant.io',
    version: 'v1alpha1',
    kind: 'DNSRecord'
};
var CertificateGVK = {
    group: 'cert-manager.io',
    version: 'v1',
    kind: 'Certificate'
};
var ServiceGVK = {
    group: '',
    version: 'v1',
    kind: 'Service'
};
var APIProductGVK = {
    group: 'devportal.kuadrant.io',
    version: 'v1alpha1',
    kind: 'APIProduct'
};
var APIKeyGVK = {
    group: 'devportal.kuadrant.io',
    version: 'v1alpha1',
    kind: 'APIKey'
};
var ALL_POLICY_GVKS = [
    AuthPolicyGVK,
    RateLimitPolicyGVK,
    TokenRateLimitPolicyGVK,
    DNSPolicyGVK,
    TLSPolicyGVK
];
var POLICY_KIND_LABELS = {
    AuthPolicy: 'Auth',
    RateLimitPolicy: 'Rate Limit',
    TokenRateLimitPolicy: 'Token Rate Limit',
    DNSPolicy: 'DNS',
    TLSPolicy: 'TLS'
};
var POLICY_KIND_TO_GVK = {
    AuthPolicy: AuthPolicyGVK,
    RateLimitPolicy: RateLimitPolicyGVK,
    TokenRateLimitPolicy: TokenRateLimitPolicyGVK,
    DNSPolicy: DNSPolicyGVK,
    TLSPolicy: TLSPolicyGVK
};
function policyResourceURL(policyKind, namespace, name) {
    var gvk = POLICY_KIND_TO_GVK[policyKind];
    if (!gvk) return '#';
    return "/k8s/ns/".concat(namespace, "/").concat(gvk.group, "~").concat(gvk.version, "~").concat(gvk.kind, "/").concat(name);
}


/***/ },

/***/ "./utils/status.ts"
/*!*************************!*\
  !*** ./utils/status.ts ***!
  \*************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   findCondition: () => (/* binding */ findCondition),
/* harmony export */   getConditionMessage: () => (/* binding */ getConditionMessage),
/* harmony export */   getWorstConditionSeverity: () => (/* binding */ getWorstConditionSeverity),
/* harmony export */   isConditionTrue: () => (/* binding */ isConditionTrue),
/* harmony export */   severityToLabelColor: () => (/* binding */ severityToLabelColor)
/* harmony export */ });
function getWorstConditionSeverity(conditions) {
    if (!conditions || conditions.length === 0) return 'unknown';
    var hasFalse = false;
    var hasProgressing = false;
    var hasUnknown = false;
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = conditions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var c = _step.value;
            var isNegativeCondition = c.type === 'Degraded' || c.type === 'Error' || c.type === 'Failed';
            if (isNegativeCondition && c.status === 'True') return 'critical';
            var isPositiveCondition = c.type === 'Ready' || c.type === 'Programmed' || c.type === 'Accepted' || c.type === 'Enforced' || c.type === 'ResolvedRefs';
            if (isPositiveCondition && c.status === 'False') hasFalse = true;
            if (c.type === 'Progressing' && c.status === 'True') hasProgressing = true;
            if (c.status === 'Unknown') hasUnknown = true;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    if (hasFalse) return 'warning';
    if (hasProgressing) return 'progressing';
    if (hasUnknown) return 'unknown';
    return 'healthy';
}
function findCondition(conditions, type) {
    return conditions === null || conditions === void 0 ? void 0 : conditions.find(function(c) {
        return c.type === type;
    });
}
function isConditionTrue(conditions, type) {
    var c = findCondition(conditions, type);
    return (c === null || c === void 0 ? void 0 : c.status) === 'True';
}
function getConditionMessage(conditions, type) {
    var c = findCondition(conditions, type);
    return (c === null || c === void 0 ? void 0 : c.message) || '';
}
function severityToLabelColor(severity) {
    switch(severity){
        case 'healthy':
            return 'green';
        case 'warning':
            return 'orange';
        case 'critical':
            return 'red';
        case 'progressing':
            return 'blue';
        default:
            return 'grey';
    }
}


/***/ }

}]);
//# sourceMappingURL=exposed-PolicyListPage-chunk.js.map