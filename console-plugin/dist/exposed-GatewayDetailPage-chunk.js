"use strict";
(self["webpackChunkcustom_rhcl_console"] = self["webpackChunkcustom_rhcl_console"] || []).push([["exposed-GatewayDetailPage"],{

/***/ "./components/common/HostnameCell.tsx"
/*!********************************************!*\
  !*** ./components/common/HostnameCell.tsx ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Tooltip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Tooltip */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Tooltip/@patternfly/react-core/dist/dynamic/components/Tooltip");
/* harmony import */ var _utils_hostname__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/hostname */ "./utils/hostname.ts");



var HostnameCell = function HostnameCell(param) {
    var hostnames = param.hostnames, _param_maxLength = param.maxLength, maxLength = _param_maxLength === void 0 ? 60 : _param_maxLength, _param_asLinks = param.asLinks, asLinks = _param_asLinks === void 0 ? false : _param_asLinks;
    if (hostnames.length === 0) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, "-");
    }
    var truncated = (0,_utils_hostname__WEBPACK_IMPORTED_MODULE_2__.truncateHostnames)(hostnames, maxLength);
    var needsTooltip = truncated.endsWith('...');
    var content = asLinks ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, hostnames.map(function(h, i) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
            key: h
        }, i > 0 && ', ', /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", {
            href: (0,_utils_hostname__WEBPACK_IMPORTED_MODULE_2__.hostnameToURL)(h),
            target: "_blank",
            rel: "noopener noreferrer"
        }, h));
    })) : /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, truncated);
    if (needsTooltip && !asLinks) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tooltip__WEBPACK_IMPORTED_MODULE_1__.Tooltip, {
            content: hostnames.join(', ')
        }, content);
    }
    return content;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HostnameCell);


/***/ },

/***/ "./components/gateways/GatewayDetailPage.tsx"
/*!***************************************************!*\
  !*** ./components/gateways/GatewayDetailPage.tsx ***!
  \***************************************************/
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
/* harmony import */ var _common_HostnameCell__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../common/HostnameCell */ "./components/common/HostnameCell.tsx");
/* harmony import */ var _common_TrafficPanel__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../common/TrafficPanel */ "./components/common/TrafficPanel.tsx");
/* harmony import */ var _policies_PolicyAttachmentView__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../policies/PolicyAttachmentView */ "./components/policies/PolicyAttachmentView.tsx");
/* harmony import */ var _health_TLSHealthCard__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../health/TLSHealthCard */ "./components/health/TLSHealthCard.tsx");
/* harmony import */ var _health_DNSHealthCard__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ../health/DNSHealthCard */ "./components/health/DNSHealthCard.tsx");
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








































var GatewayDetailPage = function GatewayDetailPage() {
    var _gateway_status, _gateway_status1;
    var _useParams = (0,react_router__WEBPACK_IMPORTED_MODULE_1__.useParams)(), ns = _useParams.ns, name = _useParams.name;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_15__.useTranslation)('plugin__custom-rhcl-console').t;
    var _React_useState = _sliced_to_array(react__WEBPACK_IMPORTED_MODULE_0__.useState(0), 2), activeTab = _React_useState[0], setActiveTab = _React_useState[1];
    var _useK8sWatchResource = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_14__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_17__.GatewayGVK,
        name: name,
        namespace: ns
    }), 2), gateway = _useK8sWatchResource[0], loaded = _useK8sWatchResource[1];
    if (!loaded || !gateway) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_2__.PageSection, {
            isFilled: true
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Bullseye__WEBPACK_IMPORTED_MODULE_8__.Bullseye, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_7__.Spinner, {
            size: "xl"
        }))));
    }
    var hostnames = (0,_utils_hostname__WEBPACK_IMPORTED_MODULE_18__.getGatewayExternalHostnames)(gateway);
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_2__.PageSection, {
        variant: "default"
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Breadcrumb__WEBPACK_IMPORTED_MODULE_9__.Breadcrumb, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Breadcrumb__WEBPACK_IMPORTED_MODULE_9__.BreadcrumbItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router__WEBPACK_IMPORTED_MODULE_1__.Link, {
        to: "/connectivity-link/gateways"
    }, t('Gateways'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Breadcrumb__WEBPACK_IMPORTED_MODULE_9__.BreadcrumbItem, {
        isActive: true
    }, ns, "/", name)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_3__.Title, {
        headingLevel: "h1",
        style: {
            marginTop: 8
        }
    }, name, " ", /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_common_StatusLabel__WEBPACK_IMPORTED_MODULE_19__["default"], {
        conditions: (_gateway_status = gateway.status) === null || _gateway_status === void 0 ? void 0 : _gateway_status.conditions
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
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListTerm, null, t('Name')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListDescription, null, name)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListTerm, null, t('Namespace')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListDescription, null, ns)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListTerm, null, t('Gateway class')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListDescription, null, gateway.spec.gatewayClassName)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListTerm, null, t('Listeners')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListDescription, null, gateway.spec.listeners.length)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListTerm, null, t('Hostnames')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListDescription, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_common_HostnameCell__WEBPACK_IMPORTED_MODULE_20__["default"], {
        hostnames: hostnames,
        asLinks: true
    }))))))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Grid__WEBPACK_IMPORTED_MODULE_10__.GridItem, {
        span: 6
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_6__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_6__.CardTitle, null, t('Listeners')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_6__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Table, {
        "aria-label": t('Listeners'),
        variant: "compact"
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Thead, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Tr, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, t('Name')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, "Port"), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, "Protocol"), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, t('Hostnames')))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Tbody, null, gateway.spec.listeners.map(function(l) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Tr, {
            key: l.name
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, l.name), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, l.port), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, l.protocol), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, l.hostname || '*'));
    })))))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Grid__WEBPACK_IMPORTED_MODULE_10__.GridItem, {
        span: 12
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(ConditionsCard, {
        conditions: (_gateway_status1 = gateway.status) === null || _gateway_status1 === void 0 ? void 0 : _gateway_status1.conditions
    })))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.Tab, {
        eventKey: 1,
        title: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.TabTitleText, null, t('Policies'))
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            marginTop: 16
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_policies_PolicyAttachmentView__WEBPACK_IMPORTED_MODULE_22__.PolicyAttachmentView, {
        targetKind: "Gateway",
        targetName: name || '',
        targetNamespace: ns || ''
    }))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.Tab, {
        eventKey: 2,
        title: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.TabTitleText, null, t('Routes'))
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            marginTop: 16
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(GatewayRoutesTab, {
        gatewayName: name || '',
        namespace: ns || ''
    }))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.Tab, {
        eventKey: 3,
        title: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.TabTitleText, null, t('Metrics'))
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            marginTop: 16
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_common_TrafficPanel__WEBPACK_IMPORTED_MODULE_21__["default"], {
        kind: "Gateway",
        name: name || '',
        namespace: ns || ''
    }))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.Tab, {
        eventKey: 4,
        title: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.TabTitleText, null, t('TLS health'))
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            marginTop: 16
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_health_TLSHealthCard__WEBPACK_IMPORTED_MODULE_23__["default"], {
        gateway: gateway,
        namespace: ns || ''
    }))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.Tab, {
        eventKey: 5,
        title: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.TabTitleText, null, t('DNS health'))
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            marginTop: 16
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_health_DNSHealthCard__WEBPACK_IMPORTED_MODULE_24__["default"], {
        gatewayName: name || '',
        namespace: ns || ''
    }))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.Tab, {
        eventKey: 6,
        title: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tabs__WEBPACK_IMPORTED_MODULE_4__.TabTitleText, null, t('YAML'))
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            marginTop: 16
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_CodeBlock__WEBPACK_IMPORTED_MODULE_12__.CodeBlock, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_CodeBlock__WEBPACK_IMPORTED_MODULE_12__.CodeBlockCode, null, js_yaml__WEBPACK_IMPORTED_MODULE_16__["default"].dump(gateway, {
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
var GatewayRoutesTab = function GatewayRoutesTab(param) {
    var gatewayName = param.gatewayName, namespace = param.namespace;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_15__.useTranslation)('plugin__custom-rhcl-console').t;
    var _useK8sWatchResource = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_14__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_17__.HTTPRouteGVK,
        isList: true
    }), 2), routes = _useK8sWatchResource[0], loaded = _useK8sWatchResource[1];
    var filteredRoutes = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(function() {
        return (routes || []).filter(function(r) {
            var _r_spec_parentRefs;
            return (_r_spec_parentRefs = r.spec.parentRefs) === null || _r_spec_parentRefs === void 0 ? void 0 : _r_spec_parentRefs.some(function(ref) {
                return ref.name === gatewayName && (!ref.namespace || ref.namespace === namespace);
            });
        });
    }, [
        routes,
        gatewayName,
        namespace
    ]);
    if (!loaded) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_7__.Spinner, {
            size: "lg"
        });
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Table, {
        "aria-label": t('Routes'),
        variant: "compact"
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Thead, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Tr, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, t('Name')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, t('Namespace')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, t('Hostnames')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Th, null, t('Status')))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Tbody, null, filteredRoutes.map(function(route) {
        var _route_metadata, _route_metadata1, _route_metadata2, _route_metadata3, _route_metadata4, _route_status_parents_, _route_status_parents, _route_status;
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Tr, {
            key: (_route_metadata = route.metadata) === null || _route_metadata === void 0 ? void 0 : _route_metadata.uid
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router__WEBPACK_IMPORTED_MODULE_1__.Link, {
            to: "/connectivity-link/httproutes/".concat((_route_metadata1 = route.metadata) === null || _route_metadata1 === void 0 ? void 0 : _route_metadata1.namespace, "/").concat((_route_metadata2 = route.metadata) === null || _route_metadata2 === void 0 ? void 0 : _route_metadata2.name)
        }, (_route_metadata3 = route.metadata) === null || _route_metadata3 === void 0 ? void 0 : _route_metadata3.name)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, (_route_metadata4 = route.metadata) === null || _route_metadata4 === void 0 ? void 0 : _route_metadata4.namespace), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, (route.spec.hostnames || []).join(', ') || '-'), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_13__.Td, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_common_StatusLabel__WEBPACK_IMPORTED_MODULE_19__["default"], {
            conditions: (_route_status = route.status) === null || _route_status === void 0 ? void 0 : (_route_status_parents = _route_status.parents) === null || _route_status_parents === void 0 ? void 0 : (_route_status_parents_ = _route_status_parents[0]) === null || _route_status_parents_ === void 0 ? void 0 : _route_status_parents_.conditions
        })));
    })));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GatewayDetailPage);


/***/ },

/***/ "./components/health/DNSHealthCard.tsx"
/*!*********************************************!*\
  !*** ./components/health/DNSHealthCard.tsx ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Card */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Card/@patternfly/react-core/dist/dynamic/components/Card");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Label */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Label/@patternfly/react-core/dist/dynamic/components/Label");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/EmptyState */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/EmptyState/@patternfly/react-core/dist/dynamic/components/EmptyState");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Spinner */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Spinner/@patternfly/react-core/dist/dynamic/components/Spinner");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/DescriptionList */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/DescriptionList/@patternfly/react-core/dist/dynamic/components/DescriptionList");
/* harmony import */ var _patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/layouts/Flex */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/layouts/Flex/@patternfly/react-core/dist/dynamic/layouts/Flex");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_check_circle_icon__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/check-circle-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/check-circle-icon/@patternfly/react-icons/dist/dynamic/icons/check-circle-icon");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_exclamation_circle_icon__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon/@patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _hooks_useDNSRecordsForGateway__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../hooks/useDNSRecordsForGateway */ "./hooks/useDNSRecordsForGateway.ts");
/* harmony import */ var _common_StatusLabel__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../common/StatusLabel */ "./components/common/StatusLabel.tsx");



















var DNSHealthCard = function DNSHealthCard(param) {
    var gatewayName = param.gatewayName, namespace = param.namespace;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_9__.useTranslation)('plugin__custom-rhcl-console').t;
    var _useDNSRecordsForGateway = (0,_hooks_useDNSRecordsForGateway__WEBPACK_IMPORTED_MODULE_10__.useDNSRecordsForGateway)(gatewayName, namespace), entries = _useDNSRecordsForGateway.entries, loaded = _useDNSRecordsForGateway.loaded, error = _useDNSRecordsForGateway.error;
    if (!loaded) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardTitle, null, t('DNS health')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_4__.Spinner, {
            size: "lg"
        })));
    }
    if (error) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardTitle, null, t('DNS health')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_3__.EmptyState, {
            variant: "sm",
            titleText: t('Error loading DNS records'),
            headingLevel: "h3"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_3__.EmptyStateBody, null, error.message))));
    }
    if (entries.length === 0) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardTitle, null, t('DNS health')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_3__.EmptyState, {
            variant: "sm",
            titleText: t('No DNS policies'),
            headingLevel: "h3"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_3__.EmptyStateBody, null, t('No DNSPolicy is attached to this Gateway.')))));
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardTitle, null, t('DNS health')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_6__.Flex, {
        direction: {
            default: 'column'
        },
        spaceItems: {
            default: 'spaceItemsMd'
        }
    }, entries.map(function(entry) {
        var _entry_dnsPolicy_metadata, _entry_dnsPolicy_metadata1, _entry_dnsPolicy_status;
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_6__.FlexItem, {
            key: (_entry_dnsPolicy_metadata = entry.dnsPolicy.metadata) === null || _entry_dnsPolicy_metadata === void 0 ? void 0 : _entry_dnsPolicy_metadata.uid
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, {
            isCompact: true
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionList, {
            isHorizontal: true,
            isCompact: true
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListTerm, null, "DNSPolicy"), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListDescription, null, (_entry_dnsPolicy_metadata1 = entry.dnsPolicy.metadata) === null || _entry_dnsPolicy_metadata1 === void 0 ? void 0 : _entry_dnsPolicy_metadata1.name, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_common_StatusLabel__WEBPACK_IMPORTED_MODULE_11__["default"], {
            conditions: (_entry_dnsPolicy_status = entry.dnsPolicy.status) === null || _entry_dnsPolicy_status === void 0 ? void 0 : _entry_dnsPolicy_status.conditions
        }))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListTerm, null, t('Managed zone')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListDescription, null, entry.managedZone || '-')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListTerm, null, t('DNS record status')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListDescription, null, entry.dnsRecords.length, " records")), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListTerm, null, t('Propagation')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_5__.DescriptionListDescription, null, entry.propagationHealthy ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
            color: "green",
            icon: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_check_circle_icon__WEBPACK_IMPORTED_MODULE_7__.CheckCircleIcon, null)
        }, t('Healthy')) : /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
            color: "red",
            icon: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_exclamation_circle_icon__WEBPACK_IMPORTED_MODULE_8__.ExclamationCircleIcon, null)
        }, t('Degraded'))))))));
    }))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DNSHealthCard);


/***/ },

/***/ "./components/health/TLSHealthCard.tsx"
/*!*********************************************!*\
  !*** ./components/health/TLSHealthCard.tsx ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Card */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Card/@patternfly/react-core/dist/dynamic/components/Card");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Label */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Label/@patternfly/react-core/dist/dynamic/components/Label");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/EmptyState */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/EmptyState/@patternfly/react-core/dist/dynamic/components/EmptyState");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Spinner */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Spinner/@patternfly/react-core/dist/dynamic/components/Spinner");
/* harmony import */ var _patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @patternfly/react-table/dist/dynamic/components/Table */ "webpack/sharing/consume/default/@patternfly/react-table/dist/dynamic/components/Table/@patternfly/react-table/dist/dynamic/components/Table");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_check_circle_icon__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/check-circle-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/check-circle-icon/@patternfly/react-icons/dist/dynamic/icons/check-circle-icon");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_exclamation_triangle_icon__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/exclamation-triangle-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/exclamation-triangle-icon/@patternfly/react-icons/dist/dynamic/icons/exclamation-triangle-icon");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_exclamation_circle_icon__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon/@patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _hooks_useCertificatesForGateway__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../hooks/useCertificatesForGateway */ "./hooks/useCertificatesForGateway.ts");



















var HEALTH_COLORS = {
    ok: 'green',
    warning: 'orange',
    critical: 'red'
};
var HEALTH_ICONS = {
    ok: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_check_circle_icon__WEBPACK_IMPORTED_MODULE_6__.CheckCircleIcon, null),
    warning: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_exclamation_triangle_icon__WEBPACK_IMPORTED_MODULE_7__.ExclamationTriangleIcon, null),
    critical: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_icons_dist_dynamic_icons_exclamation_circle_icon__WEBPACK_IMPORTED_MODULE_8__.ExclamationCircleIcon, null)
};
var TLSHealthCard = function TLSHealthCard(param) {
    var gateway = param.gateway, namespace = param.namespace;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_9__.useTranslation)('plugin__custom-rhcl-console').t;
    var _useCertificatesForGateway = (0,_hooks_useCertificatesForGateway__WEBPACK_IMPORTED_MODULE_10__.useCertificatesForGateway)(gateway, namespace), certificates = _useCertificatesForGateway.certificates, loaded = _useCertificatesForGateway.loaded, error = _useCertificatesForGateway.error;
    if (!loaded) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardTitle, null, t('TLS health')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_4__.Spinner, {
            size: "lg"
        })));
    }
    if (error) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardTitle, null, t('TLS health')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_3__.EmptyState, {
            variant: "sm",
            titleText: t('Error loading certificates'),
            headingLevel: "h3"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_3__.EmptyStateBody, null, error.message))));
    }
    if (certificates.length === 0) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardTitle, null, t('TLS health')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_3__.EmptyState, {
            variant: "sm",
            titleText: t('No TLS certificates'),
            headingLevel: "h3"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_3__.EmptyStateBody, null, t('No TLS listeners or certificates found for this Gateway.')))));
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardTitle, null, t('TLS health')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Table, {
        "aria-label": t('TLS health'),
        variant: "compact"
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Thead, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Tr, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Th, null, "Listener"), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Th, null, t('Certificate')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Th, null, t('Issuer')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Th, null, t('Expires')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Th, null, t('Renewal status')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Th, null, t('Status')))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Tbody, null, certificates.map(function(entry) {
        var _entry_certificate_metadata;
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(CertificateRow, {
            key: (_entry_certificate_metadata = entry.certificate.metadata) === null || _entry_certificate_metadata === void 0 ? void 0 : _entry_certificate_metadata.uid,
            entry: entry
        });
    })))));
};
var CertificateRow = function CertificateRow(param) {
    var entry = param.entry;
    var _cert_metadata, _cert_status, _cert_status1;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_9__.useTranslation)('plugin__custom-rhcl-console').t;
    var cert = entry.certificate;
    var healthText = t('Healthy');
    if (entry.healthLevel === 'warning') {
        healthText = t('Warning: certificate expires in less than 14 days');
    } else if (entry.healthLevel === 'critical') {
        healthText = t('Critical: certificate expires in less than 3 days');
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Tr, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Td, null, entry.listenerName || '-'), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Td, null, ((_cert_metadata = cert.metadata) === null || _cert_metadata === void 0 ? void 0 : _cert_metadata.name) || '-'), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Td, null, cert.spec.issuerRef.name, cert.spec.issuerRef.kind ? " (".concat(cert.spec.issuerRef.kind, ")") : ''), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Td, null, ((_cert_status = cert.status) === null || _cert_status === void 0 ? void 0 : _cert_status.notAfter) || '-'), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Td, null, ((_cert_status1 = cert.status) === null || _cert_status1 === void 0 ? void 0 : _cert_status1.renewalTime) || '-'), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_table_dist_dynamic_components_Table__WEBPACK_IMPORTED_MODULE_5__.Td, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: HEALTH_COLORS[entry.healthLevel],
        icon: HEALTH_ICONS[entry.healthLevel]
    }, healthText)));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TLSHealthCard);


/***/ },

/***/ "./hooks/useCertificatesForGateway.ts"
/*!********************************************!*\
  !*** ./hooks/useCertificatesForGateway.ts ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useCertificatesForGateway: () => (/* binding */ useCertificatesForGateway)
/* harmony export */ });
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openshift-console/dynamic-plugin-sdk */ "webpack/sharing/consume/default/@openshift-console/dynamic-plugin-sdk");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../models */ "./models/index.ts");
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


var FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
var THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
function useCertificatesForGateway(gateway, namespace) {
    var _useK8sWatchResource = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_1__.CertificateGVK,
        isList: true,
        namespace: namespace
    }), 3), allCerts = _useK8sWatchResource[0], loaded = _useK8sWatchResource[1], error = _useK8sWatchResource[2];
    if (!gateway || !loaded) {
        return {
            certificates: [],
            loaded: loaded,
            error: error
        };
    }
    var tlsListeners = gateway.spec.listeners.filter(function(l) {
        var _l_tls_certificateRefs, _l_tls;
        return (_l_tls = l.tls) === null || _l_tls === void 0 ? void 0 : (_l_tls_certificateRefs = _l_tls.certificateRefs) === null || _l_tls_certificateRefs === void 0 ? void 0 : _l_tls_certificateRefs.length;
    });
    var certNames = new Set();
    var listenerByCertName = new Map();
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = tlsListeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var listener = _step.value;
            var _listener_tls;
            var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
            try {
                for(var _iterator1 = (((_listener_tls = listener.tls) === null || _listener_tls === void 0 ? void 0 : _listener_tls.certificateRefs) || [])[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                    var ref = _step1.value;
                    certNames.add(ref.name);
                    listenerByCertName.set(ref.name, listener.name);
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
    var certificates = (allCerts || []).filter(function(cert) {
        var _cert_metadata;
        return certNames.has(((_cert_metadata = cert.metadata) === null || _cert_metadata === void 0 ? void 0 : _cert_metadata.name) || '');
    }).map(function(cert) {
        var _cert_status, _cert_metadata;
        var notAfter = (_cert_status = cert.status) === null || _cert_status === void 0 ? void 0 : _cert_status.notAfter;
        var daysUntilExpiry = null;
        var healthLevel = 'ok';
        if (notAfter) {
            var expiryMs = new Date(notAfter).getTime() - Date.now();
            daysUntilExpiry = Math.floor(expiryMs / (24 * 60 * 60 * 1000));
            if (expiryMs < THREE_DAYS_MS) {
                healthLevel = 'critical';
            } else if (expiryMs < FOURTEEN_DAYS_MS) {
                healthLevel = 'warning';
            }
        }
        return {
            certificate: cert,
            healthLevel: healthLevel,
            daysUntilExpiry: daysUntilExpiry,
            listenerName: listenerByCertName.get(((_cert_metadata = cert.metadata) === null || _cert_metadata === void 0 ? void 0 : _cert_metadata.name) || '')
        };
    });
    return {
        certificates: certificates,
        loaded: loaded,
        error: error
    };
}


/***/ },

/***/ "./hooks/useDNSRecordsForGateway.ts"
/*!******************************************!*\
  !*** ./hooks/useDNSRecordsForGateway.ts ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useDNSRecordsForGateway: () => (/* binding */ useDNSRecordsForGateway)
/* harmony export */ });
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openshift-console/dynamic-plugin-sdk */ "webpack/sharing/consume/default/@openshift-console/dynamic-plugin-sdk");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../models */ "./models/index.ts");
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


function useDNSRecordsForGateway(gatewayName, namespace) {
    var _useK8sWatchResource = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_1__.DNSPolicyGVK,
        isList: true,
        namespace: namespace
    }), 3), dnsPolicies = _useK8sWatchResource[0], policiesLoaded = _useK8sWatchResource[1], policiesErr = _useK8sWatchResource[2];
    var _useK8sWatchResource1 = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_1__.DNSRecordGVK,
        isList: true,
        namespace: namespace
    }), 3), dnsRecords = _useK8sWatchResource1[0], recordsLoaded = _useK8sWatchResource1[1], recordsErr = _useK8sWatchResource1[2];
    var loaded = policiesLoaded && recordsLoaded;
    var error = policiesErr || recordsErr;
    var matchingPolicies = (dnsPolicies || []).filter(function(p) {
        return p.spec.targetRef.name === gatewayName && p.spec.targetRef.kind === 'Gateway';
    });
    var entries = matchingPolicies.map(function(policy) {
        var _policy_metadata, _relatedRecords__status, _relatedRecords_;
        var ownerName = ((_policy_metadata = policy.metadata) === null || _policy_metadata === void 0 ? void 0 : _policy_metadata.name) || '';
        var relatedRecords = (dnsRecords || []).filter(function(r) {
            var _r_metadata;
            var owners = ((_r_metadata = r.metadata) === null || _r_metadata === void 0 ? void 0 : _r_metadata.ownerReferences) || [];
            return owners.some(function(o) {
                return o.name === ownerName && o.kind === 'DNSPolicy';
            });
        });
        var managedZone = ((_relatedRecords_ = relatedRecords[0]) === null || _relatedRecords_ === void 0 ? void 0 : (_relatedRecords__status = _relatedRecords_.status) === null || _relatedRecords__status === void 0 ? void 0 : _relatedRecords__status.zoneDomainName) || undefined;
        var propagationHealthy = relatedRecords.every(function(r) {
            var _r_status_conditions, _r_status;
            var readyCondition = (_r_status = r.status) === null || _r_status === void 0 ? void 0 : (_r_status_conditions = _r_status.conditions) === null || _r_status_conditions === void 0 ? void 0 : _r_status_conditions.find(function(c) {
                return c.type === 'Ready';
            });
            return (readyCondition === null || readyCondition === void 0 ? void 0 : readyCondition.status) === 'True';
        });
        return {
            dnsPolicy: policy,
            dnsRecords: relatedRecords,
            managedZone: managedZone,
            propagationHealthy: propagationHealthy
        };
    });
    return {
        entries: entries,
        loaded: loaded,
        error: error
    };
}


/***/ }

}]);
//# sourceMappingURL=exposed-GatewayDetailPage-chunk.js.map