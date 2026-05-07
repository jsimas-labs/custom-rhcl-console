"use strict";
(self["webpackChunkcustom_rhcl_console"] = self["webpackChunkcustom_rhcl_console"] || []).push([["exposed-OverviewPage"],{

/***/ "./components/common/EmptyRBACState.tsx"
/*!**********************************************!*\
  !*** ./components/common/EmptyRBACState.tsx ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/EmptyState */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/EmptyState/@patternfly/react-core/dist/dynamic/components/EmptyState");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Button__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Button */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Button/@patternfly/react-core/dist/dynamic/components/Button");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_lock_icon__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/lock-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/lock-icon/@patternfly/react-icons/dist/dynamic/icons/lock-icon");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_4__);








var EmptyRBACState = function EmptyRBACState(param) {
    var resource = param.resource, _param_verb = param.verb, verb = _param_verb === void 0 ? 'list' : _param_verb, _param_group = param.group, group = _param_group === void 0 ? '' : _param_group, _param_kind = param.kind, kind = _param_kind === void 0 ? '' : _param_kind;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_4__.useTranslation)('plugin__custom-rhcl-console').t;
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_1__.EmptyState, {
        variant: "lg",
        icon: _patternfly_react_icons_dist_dynamic_icons_lock_icon__WEBPACK_IMPORTED_MODULE_3__.LockIcon,
        titleText: t('No {{resource}} found', {
            resource: resource
        }),
        headingLevel: "h2"
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_1__.EmptyStateBody, null, t("You do not have access to view {{resource}}. Contact your cluster administrator to request the '{{verb}}' permission on '{{group}}/{{kind}}'.", {
        resource: resource,
        verb: verb,
        group: group,
        kind: kind
    })), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_1__.EmptyStateFooter, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_1__.EmptyStateActions, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Button__WEBPACK_IMPORTED_MODULE_2__.Button, {
        variant: "link",
        component: "a",
        href: "https://docs.openshift.com/container-platform/latest/authentication/using-rbac.html",
        target: "_blank"
    }, t('Learn about RBAC')))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EmptyRBACState);


/***/ },

/***/ "./components/common/HostnameSearch.tsx"
/*!**********************************************!*\
  !*** ./components/common/HostnameSearch.tsx ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-router */ "webpack/sharing/consume/default/react-router");
/* harmony import */ var react_router__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_router__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_SearchInput__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/SearchInput */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/SearchInput/@patternfly/react-core/dist/dynamic/components/SearchInput");
/* harmony import */ var _patternfly_react_core_dist_dynamic_helpers_Popper_Popper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/helpers/Popper/Popper */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/helpers/Popper/Popper/@patternfly/react-core/dist/dynamic/helpers/Popper/Popper");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Menu__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Menu */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Menu/@patternfly/react-core/dist/dynamic/components/Menu");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @openshift-console/dynamic-plugin-sdk */ "webpack/sharing/consume/default/@openshift-console/dynamic-plugin-sdk");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../models */ "./models/index.ts");
/* harmony import */ var _utils_hostname__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/hostname */ "./utils/hostname.ts");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
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
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}












var HostnameSearch = function HostnameSearch() {
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_6__.useTranslation)('plugin__custom-rhcl-console').t;
    var navigate = (0,react_router__WEBPACK_IMPORTED_MODULE_1__.useNavigate)();
    var _React_useState = _sliced_to_array(react__WEBPACK_IMPORTED_MODULE_0__.useState(''), 2), searchValue = _React_useState[0], setSearchValue = _React_useState[1];
    var _React_useState1 = _sliced_to_array(react__WEBPACK_IMPORTED_MODULE_0__.useState(false), 2), isOpen = _React_useState1[0], setIsOpen = _React_useState1[1];
    var searchInputRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
    var menuRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
    var _useK8sWatchResource = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_5__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_7__.GatewayGVK,
        isList: true
    }), 1), gateways = _useK8sWatchResource[0];
    var _useK8sWatchResource1 = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_5__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_7__.HTTPRouteGVK,
        isList: true
    }), 1), httpRoutes = _useK8sWatchResource1[0];
    var results = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(function() {
        if (!searchValue || searchValue.length < 2) return [];
        var matches = [];
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            for(var _iterator = (gateways || [])[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                var gw = _step.value;
                var hostnames = (0,_utils_hostname__WEBPACK_IMPORTED_MODULE_8__.getGatewayExternalHostnames)(gw);
                if ((0,_utils_hostname__WEBPACK_IMPORTED_MODULE_8__.matchesHostnameSearch)(hostnames, searchValue)) {
                    var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
                    try {
                        for(var _iterator1 = hostnames.filter(function(hn) {
                            return hn.toLowerCase().includes(searchValue.toLowerCase());
                        })[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                            var h = _step1.value;
                            var _gw_metadata, _gw_metadata1;
                            matches.push({
                                kind: 'Gateway',
                                name: ((_gw_metadata = gw.metadata) === null || _gw_metadata === void 0 ? void 0 : _gw_metadata.name) || '',
                                namespace: ((_gw_metadata1 = gw.metadata) === null || _gw_metadata1 === void 0 ? void 0 : _gw_metadata1.namespace) || '',
                                hostname: h
                            });
                        }
                    } catch (err) {
                        _didIteratorError1 = true;
                        _iteratorError1 = err;
                    } finally{
                        try {
                            if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                                _iterator1.return();
                            }
                        } finally{
                            if (_didIteratorError1) {
                                throw _iteratorError1;
                            }
                        }
                    }
                }
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
        var _iteratorNormalCompletion2 = true, _didIteratorError2 = false, _iteratorError2 = undefined;
        try {
            for(var _iterator2 = (httpRoutes || [])[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true){
                var route = _step2.value;
                var hostnames1 = route.spec.hostnames || [];
                if ((0,_utils_hostname__WEBPACK_IMPORTED_MODULE_8__.matchesHostnameSearch)(hostnames1, searchValue)) {
                    var _iteratorNormalCompletion3 = true, _didIteratorError3 = false, _iteratorError3 = undefined;
                    try {
                        for(var _iterator3 = hostnames1.filter(function(hn) {
                            return hn.toLowerCase().includes(searchValue.toLowerCase());
                        })[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true){
                            var h1 = _step3.value;
                            var _route_metadata, _route_metadata1;
                            matches.push({
                                kind: 'HTTPRoute',
                                name: ((_route_metadata = route.metadata) === null || _route_metadata === void 0 ? void 0 : _route_metadata.name) || '',
                                namespace: ((_route_metadata1 = route.metadata) === null || _route_metadata1 === void 0 ? void 0 : _route_metadata1.namespace) || '',
                                hostname: h1
                            });
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally{
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                                _iterator3.return();
                            }
                        } finally{
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                }
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                    _iterator2.return();
                }
            } finally{
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
        return matches.slice(0, 20);
    }, [
        searchValue,
        gateways,
        httpRoutes
    ]);
    var onSelect = function onSelect(result) {
        var basePath = result.kind === 'Gateway' ? 'gateways' : 'httproutes';
        navigate("/connectivity-link/".concat(basePath, "/").concat(result.namespace, "/").concat(result.name));
        setSearchValue('');
        setIsOpen(false);
    };
    var menu = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        ref: menuRef
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Menu__WEBPACK_IMPORTED_MODULE_4__.Menu, {
        onSelect: function onSelect1(_e, itemId) {
            var result = results[itemId];
            if (result) onSelect(result);
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Menu__WEBPACK_IMPORTED_MODULE_4__.MenuContent, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Menu__WEBPACK_IMPORTED_MODULE_4__.MenuList, null, results.map(function(r, i) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Menu__WEBPACK_IMPORTED_MODULE_4__.MenuItem, {
            key: "".concat(r.kind, "-").concat(r.namespace, "-").concat(r.name, "-").concat(r.hostname),
            itemId: i
        }, r.kind, ": ", r.namespace, "/", r.name, " (", r.hostname, ")");
    })))));
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        ref: searchInputRef
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_SearchInput__WEBPACK_IMPORTED_MODULE_2__.SearchInput, {
        placeholder: t('Search by hostname'),
        value: searchValue,
        onChange: function onChange(_e, val) {
            setSearchValue(val);
            setIsOpen(val.length >= 2 && results.length > 0);
        },
        onClear: function onClear() {
            setSearchValue('');
            setIsOpen(false);
        },
        onFocus: function onFocus() {
            if (results.length > 0) setIsOpen(true);
        }
    }), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_helpers_Popper_Popper__WEBPACK_IMPORTED_MODULE_3__.Popper, {
        triggerRef: searchInputRef,
        popper: menu,
        popperRef: menuRef,
        isVisible: isOpen && results.length > 0,
        appendTo: function appendTo() {
            return document.body;
        }
    }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HostnameSearch);


/***/ },

/***/ "./components/overview/OverviewPage.tsx"
/*!**********************************************!*\
  !*** ./components/overview/OverviewPage.tsx ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Page */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Page/@patternfly/react-core/dist/dynamic/components/Page");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Title */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Title/@patternfly/react-core/dist/dynamic/components/Title");
/* harmony import */ var _patternfly_react_core_dist_dynamic_layouts_Grid__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/layouts/Grid */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/layouts/Grid/@patternfly/react-core/dist/dynamic/layouts/Grid");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Card */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Card/@patternfly/react-core/dist/dynamic/components/Card");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Spinner */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Spinner/@patternfly/react-core/dist/dynamic/components/Spinner");
/* harmony import */ var _patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/layouts/Flex */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/layouts/Flex/@patternfly/react-core/dist/dynamic/layouts/Flex");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Label */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Label/@patternfly/react-core/dist/dynamic/components/Label");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_check_circle_icon__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/check-circle-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/check-circle-icon/@patternfly/react-icons/dist/dynamic/icons/check-circle-icon");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_exclamation_triangle_icon__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/exclamation-triangle-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/exclamation-triangle-icon/@patternfly/react-icons/dist/dynamic/icons/exclamation-triangle-icon");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_exclamation_circle_icon__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon/@patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var _hooks_useResourceWithRBAC__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../hooks/useResourceWithRBAC */ "./hooks/useResourceWithRBAC.ts");
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../models */ "./models/index.ts");
/* harmony import */ var _utils_status__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../utils/status */ "./utils/status.ts");
/* harmony import */ var _common_EmptyRBACState__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../common/EmptyRBACState */ "./components/common/EmptyRBACState.tsx");
/* harmony import */ var _common_HostnameSearch__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../common/HostnameSearch */ "./components/common/HostnameSearch.tsx");





















var OverviewPage = function OverviewPage() {
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_11__.useTranslation)('plugin__custom-rhcl-console').t;
    var _useResourceWithRBAC = (0,_hooks_useResourceWithRBAC__WEBPACK_IMPORTED_MODULE_12__.useResourceWithRBAC)(_models__WEBPACK_IMPORTED_MODULE_13__.GatewayGVK), gateways = _useResourceWithRBAC.data, gwLoaded = _useResourceWithRBAC.loaded, gwAccess = _useResourceWithRBAC.hasAccess;
    var _useResourceWithRBAC1 = (0,_hooks_useResourceWithRBAC__WEBPACK_IMPORTED_MODULE_12__.useResourceWithRBAC)(_models__WEBPACK_IMPORTED_MODULE_13__.HTTPRouteGVK), httpRoutes = _useResourceWithRBAC1.data, routeLoaded = _useResourceWithRBAC1.loaded;
    if (!gwLoaded || !routeLoaded) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_1__.PageSection, {
            variant: "default"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_2__.Title, {
            headingLevel: "h1"
        }, t('Connectivity Link Overview'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_1__.PageSection, {
            isFilled: true
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_5__.Spinner, {
            size: "xl"
        })));
    }
    if (!gwAccess) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_1__.PageSection, {
            variant: "default"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_2__.Title, {
            headingLevel: "h1"
        }, t('Connectivity Link Overview'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_1__.PageSection, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_common_EmptyRBACState__WEBPACK_IMPORTED_MODULE_15__["default"], {
            resource: t('Gateways'),
            verb: "list",
            group: "gateway.networking.k8s.io",
            kind: "Gateway"
        })));
    }
    var healthyGateways = gateways.filter(function(gw) {
        var _gw_status;
        return (0,_utils_status__WEBPACK_IMPORTED_MODULE_14__.getWorstConditionSeverity)((_gw_status = gw.status) === null || _gw_status === void 0 ? void 0 : _gw_status.conditions) === 'healthy';
    });
    var degradedGateways = gateways.filter(function(gw) {
        var _gw_status;
        var s = (0,_utils_status__WEBPACK_IMPORTED_MODULE_14__.getWorstConditionSeverity)((_gw_status = gw.status) === null || _gw_status === void 0 ? void 0 : _gw_status.conditions);
        return s === 'warning' || s === 'critical';
    });
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_1__.PageSection, {
        variant: "default"
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_6__.Flex, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_6__.FlexItem, {
        grow: {
            default: 'grow'
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_2__.Title, {
        headingLevel: "h1"
    }, t('Connectivity Link Overview'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_6__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_common_HostnameSearch__WEBPACK_IMPORTED_MODULE_16__["default"], null)))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_1__.PageSection, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Grid__WEBPACK_IMPORTED_MODULE_3__.Grid, {
        hasGutter: true
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Grid__WEBPACK_IMPORTED_MODULE_3__.GridItem, {
        span: 4
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_4__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_4__.CardTitle, null, t('Gateways')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_4__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_6__.Flex, {
        spaceItems: {
            default: 'spaceItemsMd'
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_6__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_7__.Label, {
        color: "grey"
    }, t('{{count}} total', {
        count: gateways.length
    }))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_6__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_7__.Label, {
        color: "green",
        icon: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_check_circle_icon__WEBPACK_IMPORTED_MODULE_8__.CheckCircleIcon, null)
    }, t('{{count}} healthy', {
        count: healthyGateways.length
    }))), degradedGateways.length > 0 && /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_6__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_7__.Label, {
        color: "orange",
        icon: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_exclamation_triangle_icon__WEBPACK_IMPORTED_MODULE_9__.ExclamationTriangleIcon, null)
    }, t('{{count}} degraded', {
        count: degradedGateways.length
    }))))))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Grid__WEBPACK_IMPORTED_MODULE_3__.GridItem, {
        span: 4
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_4__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_4__.CardTitle, null, t('HTTPRoutes')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_4__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_7__.Label, {
        color: "grey"
    }, t('{{count}} total', {
        count: httpRoutes.length
    }))))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Grid__WEBPACK_IMPORTED_MODULE_3__.GridItem, {
        span: 4
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_4__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_4__.CardTitle, null, t('Gateway health')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_4__.CardBody, null, degradedGateways.length === 0 ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_7__.Label, {
        color: "green",
        icon: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_check_circle_icon__WEBPACK_IMPORTED_MODULE_8__.CheckCircleIcon, null)
    }, t('All systems operational')) : /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_6__.Flex, {
        direction: {
            default: 'column'
        },
        spaceItems: {
            default: 'spaceItemsSm'
        }
    }, degradedGateways.map(function(gw) {
        var _gw_metadata, _gw_metadata1, _gw_metadata2;
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_6__.FlexItem, {
            key: (_gw_metadata = gw.metadata) === null || _gw_metadata === void 0 ? void 0 : _gw_metadata.uid
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_7__.Label, {
            color: "red",
            icon: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_exclamation_circle_icon__WEBPACK_IMPORTED_MODULE_10__.ExclamationCircleIcon, null)
        }, (_gw_metadata1 = gw.metadata) === null || _gw_metadata1 === void 0 ? void 0 : _gw_metadata1.namespace, "/", (_gw_metadata2 = gw.metadata) === null || _gw_metadata2 === void 0 ? void 0 : _gw_metadata2.name));
    }))))))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (OverviewPage);


/***/ },

/***/ "./hooks/useResourceWithRBAC.ts"
/*!**************************************!*\
  !*** ./hooks/useResourceWithRBAC.ts ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useResourceWithRBAC: () => (/* binding */ useResourceWithRBAC)
/* harmony export */ });
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openshift-console/dynamic-plugin-sdk */ "webpack/sharing/consume/default/@openshift-console/dynamic-plugin-sdk");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__);
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
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
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}

function useResourceWithRBAC(gvk, namespace) {
    var _watchError_message, _watchError_message1;
    var watchResource = _object_spread({
        groupVersionKind: gvk,
        isList: true
    }, namespace ? {
        namespace: namespace
    } : {});
    var _useK8sWatchResource = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__.useK8sWatchResource)(watchResource), 3), data = _useK8sWatchResource[0], loaded = _useK8sWatchResource[1], watchError = _useK8sWatchResource[2];
    var _useAccessReview = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__.useAccessReview)(_object_spread({
        group: gvk.group,
        resource: kindToPlural(gvk.kind),
        verb: 'list'
    }, namespace ? {
        namespace: namespace
    } : {})), 2), hasAccess = _useAccessReview[0], accessLoading = _useAccessReview[1];
    var is403 = (watchError === null || watchError === void 0 ? void 0 : (_watchError_message = watchError.message) === null || _watchError_message === void 0 ? void 0 : _watchError_message.includes('403')) || (watchError === null || watchError === void 0 ? void 0 : (_watchError_message1 = watchError.message) === null || _watchError_message1 === void 0 ? void 0 : _watchError_message1.includes('Forbidden'));
    return {
        data: data || [],
        loaded: loaded && !accessLoading,
        error: is403 ? undefined : watchError,
        hasAccess: is403 ? false : hasAccess,
        accessLoading: accessLoading
    };
}
function kindToPlural(kind) {
    var lower = kind.toLowerCase();
    if (lower.endsWith('s')) return lower;
    if (lower.endsWith('y')) return lower.slice(0, -1) + 'ies';
    return lower + 's';
}


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

/***/ "./utils/hostname.ts"
/*!***************************!*\
  !*** ./utils/hostname.ts ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getGatewayExternalHostnames: () => (/* binding */ getGatewayExternalHostnames),
/* harmony export */   hostnameToURL: () => (/* binding */ hostnameToURL),
/* harmony export */   matchesHostnameSearch: () => (/* binding */ matchesHostnameSearch),
/* harmony export */   truncateHostnames: () => (/* binding */ truncateHostnames)
/* harmony export */ });
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
function getGatewayExternalHostnames(gateway) {
    var _gateway_status;
    var hostnames = [];
    var addresses = ((_gateway_status = gateway.status) === null || _gateway_status === void 0 ? void 0 : _gateway_status.addresses) || gateway.spec.addresses || [];
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = addresses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var addr = _step.value;
            if (addr.type === 'Hostname' || !addr.type && !isIPAddress(addr.value)) {
                hostnames.push(addr.value);
            }
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
    if (hostnames.length === 0) {
        var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
        try {
            for(var _iterator1 = gateway.spec.listeners[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                var listener = _step1.value;
                if (listener.hostname) {
                    hostnames.push(listener.hostname);
                }
            }
        } catch (err) {
            _didIteratorError1 = true;
            _iteratorError1 = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                    _iterator1.return();
                }
            } finally{
                if (_didIteratorError1) {
                    throw _iteratorError1;
                }
            }
        }
    }
    if (hostnames.length === 0) {
        var _gateway_status1;
        var ipAddresses = ((_gateway_status1 = gateway.status) === null || _gateway_status1 === void 0 ? void 0 : _gateway_status1.addresses) || [];
        var _iteratorNormalCompletion2 = true, _didIteratorError2 = false, _iteratorError2 = undefined;
        try {
            for(var _iterator2 = ipAddresses[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true){
                var addr1 = _step2.value;
                if (addr1.type === 'IPAddress') {
                    hostnames.push(addr1.value);
                }
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                    _iterator2.return();
                }
            } finally{
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    }
    return _to_consumable_array(new Set(hostnames));
}
function truncateHostnames(hostnames) {
    var maxLength = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 60;
    if (hostnames.length === 0) return '-';
    var joined = hostnames.join(', ');
    if (joined.length <= maxLength) return joined;
    return "".concat(joined.substring(0, maxLength), "...");
}
function hostnameToURL(hostname) {
    if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
        return hostname;
    }
    return "https://".concat(hostname);
}
function matchesHostnameSearch(hostnames, search) {
    var lowerSearch = search.toLowerCase();
    return hostnames.some(function(h) {
        var lowerH = h.toLowerCase();
        return lowerH.includes(lowerSearch) || lowerH.endsWith(lowerSearch);
    });
}
function isIPAddress(value) {
    return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value) || value.includes(':');
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
//# sourceMappingURL=exposed-OverviewPage-chunk.js.map