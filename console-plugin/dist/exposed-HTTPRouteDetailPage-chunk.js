"use strict";
(self["webpackChunkcustom_rhcl_console"] = self["webpackChunkcustom_rhcl_console"] || []).push([["exposed-HTTPRouteDetailPage"],{

/***/ "./components/httproutes/HTTPRouteDetailPage.tsx"
/*!*******************************************************!*\
  !*** ./components/httproutes/HTTPRouteDetailPage.tsx ***!
  \*******************************************************/
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
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Tabs */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Tabs/@patternfly/react-core/dist/dynamic/components/Tabs");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/DescriptionList */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/DescriptionList/@patternfly/react-core/dist/dynamic/components/DescriptionList");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Card */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Card/@patternfly/react-core/dist/dynamic/components/Card");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Spinner */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Spinner/@patternfly/react-core/dist/dynamic/components/Spinner");
/* harmony import */ var _patternfly_react_core_dist_dynamic_layouts_Bullseye__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/layouts/Bullseye */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/layouts/Bullseye/@patternfly/react-core/dist/dynamic/layouts/Bullseye");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Breadcrumb__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Breadcrumb */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Breadcrumb/@patternfly/react-core/dist/dynamic/components/Breadcrumb");
/* harmony import */ var _patternfly_react_core_dist_dynamic_layouts_Grid__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/layouts/Grid */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/layouts/Grid/@patternfly/react-core/dist/dynamic/layouts/Grid");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Label */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Label/@patternfly/react-core/dist/dynamic/components/Label");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_CodeBlock__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/CodeBlock */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/CodeBlock/@patternfly/react-core/dist/dynamic/components/CodeBlock");
/* harmony import */ var _patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @patternfly/react-table/dist/dynamic/components/Table */ "webpack/sharing/consume/default/@patternfly/react-table/dist/dynamic/components/Table/@patternfly/react-table/dist/dynamic/components/Table");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @openshift-console/dynamic-plugin-sdk */ "webpack/sharing/consume/default/@openshift-console/dynamic-plugin-sdk");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var js_yaml__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! js-yaml */ "../node_modules/js-yaml/dist/js-yaml.mjs");
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../models */ "./models/index.ts");
/* harmony import */ var _utils_hostname__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../utils/hostname */ "./utils/hostname.ts");
/* harmony import */ var _common_StatusLabel__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../common/StatusLabel */ "./components/common/StatusLabel.tsx");
/* harmony import */ var _common_TrafficPanel__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../common/TrafficPanel */ "./components/common/TrafficPanel.tsx");
/* harmony import */ var _policies_PolicyAttachmentView__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../policies/PolicyAttachmentView */ "./components/policies/PolicyAttachmentView.tsx");
/* harmony import */ var _policies_EffectivePolicyStack__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../policies/EffectivePolicyStack */ "./components/policies/EffectivePolicyStack.tsx");
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






































var HTTPRouteDetailPage = function HTTPRouteDetailPage() {
    var _route_spec_parentRefs, _route_status_parents_, _route_status_parents, _route_status;
    var _useParams = (0,react_router__WEBPACK_IMPORTED_MODULE_1__.useParams)(), ns = _useParams.ns, name = _useParams.name;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_15__.useTranslation)('plugin__custom-rhcl-console').t;
    var _React_useState = _sliced_to_array(react__WEBPACK_IMPORTED_MODULE_0__.useState(0), 2), activeTab = _React_useState[0], setActiveTab = _React_useState[1];
    var _useK8sWatchResource = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_14__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_17__.HTTPRouteGVK,
        name: name,
        namespace: ns
    }), 2), route = _useK8sWatchResource[0], loaded = _useK8sWatchResource[1];
    if (!loaded || !route) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_2__.PageSection, {
            isFilled: true
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Bullseye__WEBPACK_IMPORTED_MODULE_8__.Bullseye, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_7__.Spinner, {
            size: "xl"
        }))));
    }
    var hostnames = route.spec.hostnames || [];
    var parentRef = (_route_spec_parentRefs = route.spec.parentRefs) === null || _route_spec_parentRefs === void 0 ? void 0 : _route_spec_parentRefs[0];
    var parentConditions = (_route_status = route.status) === null || _route_status === void 0 ? void 0 : (_route_status_parents = _route_status.parents) === null || _route_status_parents === void 0 ? void 0 : (_route_status_parents_ = _route_status_parents[0]) === null || _route_status_parents_ === void 0 ? void 0 : _route_status_parents_.conditions;
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_2__.PageSection, {
        variant: "default"
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Breadcrumb__WEBPACK_IMPORTED_MODULE_9__.Breadcrumb, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Breadcrumb__WEBPACK_IMPORTED_MODULE_9__.BreadcrumbItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router__WEBPACK_IMPORTED_MODULE_1__.Link, {
        to: "/connectivity-link/httproutes"
    }, t('HTTPRoutes'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Breadcrumb__WEBPACK_IMPORTED_MODULE_9__.BreadcrumbItem, {
        isActive: true
    }, ns, "/", name)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_3__.Title, {
        headingLevel: "h1",
        style: {
            marginTop: 8
        }
    }, name, " ", /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_common_StatusLabel__WEBPACK_IMPORTED_MODULE_19__["default"], {
        conditions: parentConditions
    }))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_2__.PageSection, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.Tabs, {
        activeKey: activeTab,
        onSelect: function onSelect(_e, idx) {
            return setActiveTab(idx);
        },
        "aria-label": t('Details')
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.Tab, {
        eventKey: 0,
        title: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.TabTitleText, null, t('Details'))
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Grid__WEBPACK_IMPORTED_MODULE_10__.Grid, {
        hasGutter: true,
        style: {
            marginTop: 16
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Grid__WEBPACK_IMPORTED_MODULE_10__.GridItem, {
        span: 6
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_6__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_6__.CardTitle, null, t('Details')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_6__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionList, {
        isHorizontal: true
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListTerm, null, t('Name')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListDescription, null, name)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListTerm, null, t('Namespace')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListDescription, null, ns)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListTerm, null, t('Parent gateway')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListDescription, null, parentRef ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router__WEBPACK_IMPORTED_MODULE_1__.Link, {
        to: "/connectivity-link/gateways/".concat(parentRef.namespace || ns, "/").concat(parentRef.name)
    }, parentRef.name) : '-')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListTerm, null, t('Hostnames')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListDescription, null, hostnames.length > 0 ? hostnames.map(function(h) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
            key: h
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", {
            href: (0,_utils_hostname__WEBPACK_IMPORTED_MODULE_18__.hostnameToURL)(h),
            target: "_blank",
            rel: "noopener noreferrer"
        }, h));
    }) : '-')))))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Grid__WEBPACK_IMPORTED_MODULE_10__.GridItem, {
        span: 6
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_6__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_6__.CardTitle, null, t('Backend refs')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_6__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Table, {
        "aria-label": t('Backend refs'),
        variant: "compact"
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Thead, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Tr, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, "Rule"), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, t('Method')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, t('Path pattern')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, "Backend"), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, "Port"))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Tbody, null, (route.spec.rules || []).flatMap(function(rule, ri) {
        return (rule.backendRefs || []).map(function(backend, bi) {
            var _rule_matches_, _rule_matches, _rule_matches__path, _rule_matches_1, _rule_matches1;
            return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Tr, {
                key: "".concat(ri, "-").concat(bi)
            }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, ri), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, ((_rule_matches = rule.matches) === null || _rule_matches === void 0 ? void 0 : (_rule_matches_ = _rule_matches[0]) === null || _rule_matches_ === void 0 ? void 0 : _rule_matches_.method) || '*'), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, ((_rule_matches1 = rule.matches) === null || _rule_matches1 === void 0 ? void 0 : (_rule_matches_1 = _rule_matches1[0]) === null || _rule_matches_1 === void 0 ? void 0 : (_rule_matches__path = _rule_matches_1.path) === null || _rule_matches__path === void 0 ? void 0 : _rule_matches__path.value) || '/'), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, backend.name), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, backend.port || '-'));
        });
    })))))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Grid__WEBPACK_IMPORTED_MODULE_10__.GridItem, {
        span: 12
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(ConditionsCard, {
        conditions: parentConditions
    })))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.Tab, {
        eventKey: 1,
        title: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.TabTitleText, null, t('Policies'))
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            marginTop: 16
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_policies_PolicyAttachmentView__WEBPACK_IMPORTED_MODULE_21__.PolicyAttachmentView, {
        targetKind: "HTTPRoute",
        targetName: name || '',
        targetNamespace: ns || ''
    }))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.Tab, {
        eventKey: 2,
        title: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.TabTitleText, null, t('Effective policy stack'))
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            marginTop: 16
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_policies_EffectivePolicyStack__WEBPACK_IMPORTED_MODULE_22__.EffectivePolicyStack, {
        routeName: name || '',
        routeNamespace: ns || '',
        parentGatewayName: (parentRef === null || parentRef === void 0 ? void 0 : parentRef.name) || '',
        parentGatewayNamespace: (parentRef === null || parentRef === void 0 ? void 0 : parentRef.namespace) || ns || ''
    }))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.Tab, {
        eventKey: 3,
        title: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.TabTitleText, null, t('Metrics'))
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            marginTop: 16
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_common_TrafficPanel__WEBPACK_IMPORTED_MODULE_20__["default"], {
        kind: "HTTPRoute",
        name: name || '',
        namespace: ns || ''
    }))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.Tab, {
        eventKey: 4,
        title: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.TabTitleText, null, t('YAML'))
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            marginTop: 16
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_CodeBlock__WEBPACK_IMPORTED_MODULE_12__.CodeBlock, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_CodeBlock__WEBPACK_IMPORTED_MODULE_12__.CodeBlockCode, null, js_yaml__WEBPACK_IMPORTED_MODULE_16__["default"].dump(route, {
        noRefs: true,
        lineWidth: -1
    }))))))));
};
var ConditionsCard = function ConditionsCard(param) {
    var conditions = param.conditions;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_15__.useTranslation)('plugin__custom-rhcl-console').t;
    if (!conditions || conditions.length === 0) return null;
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_6__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_6__.CardTitle, null, t('Status')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_6__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Table, {
        "aria-label": t('Status'),
        variant: "compact"
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Thead, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Tr, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, "Type"), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, t('Status')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, "Reason"), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, t('Message')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, "Last transition"))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Tbody, null, conditions.map(function(c) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Tr, {
            key: c.type
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, c.type), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_11__.Label, {
            color: c.status === 'True' ? 'green' : c.status === 'False' ? 'red' : 'grey'
        }, c.status)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, c.reason || '-'), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, c.message || '-'), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, c.lastTransitionTime || '-'));
    })))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HTTPRouteDetailPage);


/***/ },

/***/ "./components/policies/EffectivePolicyStack.tsx"
/*!******************************************************!*\
  !*** ./components/policies/EffectivePolicyStack.tsx ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EffectivePolicyStack: () => (/* binding */ EffectivePolicyStack)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Card */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Card/@patternfly/react-core/dist/dynamic/components/Card");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Label */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Label/@patternfly/react-core/dist/dynamic/components/Label");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Spinner */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Spinner/@patternfly/react-core/dist/dynamic/components/Spinner");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/EmptyState */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/EmptyState/@patternfly/react-core/dist/dynamic/components/EmptyState");
/* harmony import */ var _patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/layouts/Flex */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/layouts/Flex/@patternfly/react-core/dist/dynamic/layouts/Flex");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Divider__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Divider */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Divider/@patternfly/react-core/dist/dynamic/components/Divider");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Title */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Title/@patternfly/react-core/dist/dynamic/components/Title");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Icon__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Icon */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Icon/@patternfly/react-core/dist/dynamic/components/Icon");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_arrow_down_icon__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/arrow-down-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/arrow-down-icon/@patternfly/react-icons/dist/dynamic/icons/arrow-down-icon");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_arrow_right_icon__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/arrow-right-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/arrow-right-icon/@patternfly/react-icons/dist/dynamic/icons/arrow-right-icon");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var _hooks_useAttachedPolicies__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../hooks/useAttachedPolicies */ "./hooks/useAttachedPolicies.ts");
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../models */ "./models/index.ts");
/* harmony import */ var _utils_policyMerge__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../utils/policyMerge */ "./utils/policyMerge.ts");



















var EffectivePolicyStack = function EffectivePolicyStack(param) {
    var routeName = param.routeName, routeNamespace = param.routeNamespace, parentGatewayName = param.parentGatewayName, parentGatewayNamespace = param.parentGatewayNamespace;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_11__.useTranslation)('plugin__custom-rhcl-console').t;
    var _useAttachedPolicies = (0,_hooks_useAttachedPolicies__WEBPACK_IMPORTED_MODULE_12__.useAttachedPolicies)('HTTPRoute', routeName, routeNamespace), routePolicies = _useAttachedPolicies.policies, routeLoaded = _useAttachedPolicies.loaded;
    var _useAttachedPolicies1 = (0,_hooks_useAttachedPolicies__WEBPACK_IMPORTED_MODULE_12__.useAttachedPolicies)('Gateway', parentGatewayName, parentGatewayNamespace), gatewayPolicies = _useAttachedPolicies1.policies, gatewayLoaded = _useAttachedPolicies1.loaded;
    var loaded = routeLoaded && gatewayLoaded;
    var effectiveStack = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(function() {
        if (!loaded) return [];
        return (0,_utils_policyMerge__WEBPACK_IMPORTED_MODULE_14__.computeEffectivePolicies)(gatewayPolicies, routePolicies);
    }, [
        loaded,
        gatewayPolicies,
        routePolicies
    ]);
    if (!loaded) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_3__.Spinner, {
            size: "lg"
        });
    }
    if (effectiveStack.length === 0) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_4__.EmptyState, {
            variant: "sm",
            titleText: t('No policies found'),
            headingLevel: "h3"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_4__.EmptyStateBody, null, t('No policies affect this HTTPRoute.')));
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardTitle, null, t('Effective policy stack')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.Flex, {
        direction: {
            default: 'column'
        },
        spaceItems: {
            default: 'spaceItemsSm'
        }
    }, effectiveStack.map(function(pa, idx) {
        var _pa_policy_metadata;
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
            key: (_pa_policy_metadata = pa.policy.metadata) === null || _pa_policy_metadata === void 0 ? void 0 : _pa_policy_metadata.uid
        }, idx > 0 && /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Icon__WEBPACK_IMPORTED_MODULE_8__.Icon, {
            size: "md"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_arrow_down_icon__WEBPACK_IMPORTED_MODULE_9__.ArrowDownIcon, null))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(EffectivePolicyCard, {
            attachment: pa
        })));
    })), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Divider__WEBPACK_IMPORTED_MODULE_6__.Divider, {
        style: {
            marginTop: 16,
            marginBottom: 16
        }
    }), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_7__.Title, {
        headingLevel: "h4"
    }, t('Resolution order')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.Flex, {
        spaceItems: {
            default: 'spaceItemsSm'
        },
        alignItems: {
            default: 'alignItemsCenter'
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: "purple"
    }, t('Route overrides'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_arrow_right_icon__WEBPACK_IMPORTED_MODULE_10__.ArrowRightIcon, null)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: "blue"
    }, t('Gateway overrides'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_arrow_right_icon__WEBPACK_IMPORTED_MODULE_10__.ArrowRightIcon, null)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: "teal"
    }, t('Route defaults'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_arrow_right_icon__WEBPACK_IMPORTED_MODULE_10__.ArrowRightIcon, null)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: "grey"
    }, t('Gateway defaults'))))));
};
var EffectivePolicyCard = function EffectivePolicyCard(param) {
    var attachment = param.attachment;
    var _policy_metadata, _policy_metadata1;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_11__.useTranslation)('plugin__custom-rhcl-console').t;
    var policy = attachment.policy, policyKind = attachment.policyKind, isOverridden = attachment.isOverridden, isEnforced = attachment.isEnforced;
    var name = ((_policy_metadata = policy.metadata) === null || _policy_metadata === void 0 ? void 0 : _policy_metadata.name) || '';
    var ns = ((_policy_metadata1 = policy.metadata) === null || _policy_metadata1 === void 0 ? void 0 : _policy_metadata1.namespace) || '';
    var level = (0,_utils_policyMerge__WEBPACK_IMPORTED_MODULE_14__.getPolicyLevel)(policy);
    var isGateway = attachment.targetRef.kind === 'Gateway';
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, {
        isCompact: true,
        style: {
            opacity: isOverridden ? 0.5 : 1
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.Flex, {
        spaceItems: {
            default: 'spaceItemsSm'
        },
        alignItems: {
            default: 'alignItemsCenter'
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: "blue"
    }, _models__WEBPACK_IMPORTED_MODULE_13__.POLICY_KIND_LABELS[policyKind] || policyKind)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, ns, "/", name), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: isGateway ? 'purple' : 'teal'
    }, isGateway ? 'Gateway' : 'Route')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: level === 'override' ? 'orange' : 'grey'
    }, level === 'override' ? t('Override') : t('Default'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, isOverridden ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: "orange"
    }, t('Overridden')) : isEnforced ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: "green"
    }, t('Enforced')) : /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: "red"
    }, t('Not Enforced'))))));
};


/***/ },

/***/ "./utils/policyMerge.ts"
/*!******************************!*\
  !*** ./utils/policyMerge.ts ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   computeEffectivePolicies: () => (/* binding */ computeEffectivePolicies),
/* harmony export */   getPolicyLevel: () => (/* binding */ getPolicyLevel)
/* harmony export */ });
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
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
/**
 * Determines the effective policy stack for an HTTPRoute after merge/override resolution.
 * Kuadrant evaluates policies in this order:
 *   1. Route-level overrides (highest priority)
 *   2. Gateway-level overrides
 *   3. Route-level defaults
 *   4. Gateway-level defaults
 *
 * When a policy uses `overrides`, it takes precedence over `defaults` at the same or
 * lower level. Overridden policies are marked with the `Overridden` condition.
 */ function computeEffectivePolicies(gatewayPolicies, routePolicies) {
    var result = [];
    var overriddenSet = new Set();
    var routeOverrides = routePolicies.filter(function(p) {
        return hasOverrides(p.policy);
    });
    var gatewayOverrides = gatewayPolicies.filter(function(p) {
        return hasOverrides(p.policy);
    });
    var routeDefaults = routePolicies.filter(function(p) {
        return !hasOverrides(p.policy);
    });
    var gatewayDefaults = gatewayPolicies.filter(function(p) {
        return !hasOverrides(p.policy);
    });
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = routeOverrides[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var p = _step.value;
            result.push(_object_spread_props(_object_spread({}, p), {
                isOverridden: false,
                isEnforced: isEnforced(p.conditions)
            }));
            markOverriddenByKind(overriddenSet, p.policyKind, gatewayDefaults);
            markOverriddenByKind(overriddenSet, p.policyKind, routeDefaults);
            markOverriddenByKind(overriddenSet, p.policyKind, gatewayOverrides);
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
    var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
    try {
        for(var _iterator1 = gatewayOverrides[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
            var p1 = _step1.value;
            var key = policyKey(p1);
            var overridden = overriddenSet.has(key);
            result.push(_object_spread_props(_object_spread({}, p1), {
                isOverridden: overridden,
                isEnforced: !overridden && isEnforced(p1.conditions)
            }));
            if (!overridden) {
                markOverriddenByKind(overriddenSet, p1.policyKind, routeDefaults);
                markOverriddenByKind(overriddenSet, p1.policyKind, gatewayDefaults);
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
    var _iteratorNormalCompletion2 = true, _didIteratorError2 = false, _iteratorError2 = undefined;
    try {
        for(var _iterator2 = routeDefaults[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true){
            var p2 = _step2.value;
            var key1 = policyKey(p2);
            var overridden1 = overriddenSet.has(key1);
            result.push(_object_spread_props(_object_spread({}, p2), {
                isOverridden: overridden1,
                isEnforced: !overridden1 && isEnforced(p2.conditions)
            }));
            if (!overridden1) {
                markOverriddenByKind(overriddenSet, p2.policyKind, gatewayDefaults);
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
    var _iteratorNormalCompletion3 = true, _didIteratorError3 = false, _iteratorError3 = undefined;
    try {
        for(var _iterator3 = gatewayDefaults[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true){
            var p3 = _step3.value;
            var key2 = policyKey(p3);
            var overridden2 = overriddenSet.has(key2);
            result.push(_object_spread_props(_object_spread({}, p3), {
                isOverridden: overridden2,
                isEnforced: !overridden2 && isEnforced(p3.conditions)
            }));
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
    return result;
}
function hasOverrides(policy) {
    return !!policy.spec.overrides;
}
function isEnforced(conditions) {
    var enforced = conditions.find(function(c) {
        return c.type === 'Enforced';
    });
    if (enforced) return enforced.status === 'True';
    var accepted = conditions.find(function(c) {
        return c.type === 'Accepted';
    });
    return (accepted === null || accepted === void 0 ? void 0 : accepted.status) === 'True' || false;
}
function policyKey(p) {
    var _p_policy_metadata, _p_policy_metadata1;
    return "".concat((_p_policy_metadata = p.policy.metadata) === null || _p_policy_metadata === void 0 ? void 0 : _p_policy_metadata.namespace, "/").concat((_p_policy_metadata1 = p.policy.metadata) === null || _p_policy_metadata1 === void 0 ? void 0 : _p_policy_metadata1.name);
}
function markOverriddenByKind(set, kind, candidates) {
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = candidates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var c = _step.value;
            if (c.policyKind === kind) {
                set.add(policyKey(c));
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
}
function getPolicyLevel(policy) {
    return hasOverrides(policy) ? 'override' : 'default';
}


/***/ }

}]);
//# sourceMappingURL=exposed-HTTPRouteDetailPage-chunk.js.map