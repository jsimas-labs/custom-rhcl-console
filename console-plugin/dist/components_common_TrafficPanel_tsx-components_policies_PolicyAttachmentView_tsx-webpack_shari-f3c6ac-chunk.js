"use strict";
(self["webpackChunkcustom_rhcl_console"] = self["webpackChunkcustom_rhcl_console"] || []).push([["components_common_TrafficPanel_tsx-components_policies_PolicyAttachmentView_tsx-webpack_shari-f3c6ac"],{

/***/ "./components/common/TrafficPanel.tsx"
/*!********************************************!*\
  !*** ./components/common/TrafficPanel.tsx ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Card */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Card/@patternfly/react-core/dist/dynamic/components/Card");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/DescriptionList */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/DescriptionList/@patternfly/react-core/dist/dynamic/components/DescriptionList");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Spinner */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Spinner/@patternfly/react-core/dist/dynamic/components/Spinner");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/EmptyState */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/EmptyState/@patternfly/react-core/dist/dynamic/components/EmptyState");
/* harmony import */ var _patternfly_react_core_dist_dynamic_layouts_Split__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/layouts/Split */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/layouts/Split/@patternfly/react-core/dist/dynamic/layouts/Split");
/* harmony import */ var _patternfly_react_core_dist_dynamic_layouts_Stack__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/layouts/Stack */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/layouts/Stack/@patternfly/react-core/dist/dynamic/layouts/Stack");
/* harmony import */ var _patternfly_react_icons_dist_dynamic_icons_exclamation_triangle_icon__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @patternfly/react-icons/dist/dynamic/icons/exclamation-triangle-icon */ "webpack/sharing/consume/default/@patternfly/react-icons/dist/dynamic/icons/exclamation-triangle-icon/@patternfly/react-icons/dist/dynamic/icons/exclamation-triangle-icon");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _hooks_usePrometheusTraffic__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../hooks/usePrometheusTraffic */ "./hooks/usePrometheusTraffic.ts");
/* harmony import */ var _TrafficChart__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./TrafficChart */ "./components/common/TrafficChart.tsx");



















var TrafficPanel = function TrafficPanel(param) {
    var kind = param.kind, name = param.name, namespace = param.namespace, pollInterval = param.pollInterval;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_8__.useTranslation)('plugin__custom-rhcl-console').t;
    var _usePrometheusTraffic = (0,_hooks_usePrometheusTraffic__WEBPACK_IMPORTED_MODULE_9__.usePrometheusTraffic)(kind, name, namespace, pollInterval), data = _usePrometheusTraffic.data, loaded = _usePrometheusTraffic.loaded, metricsAvailable = _usePrometheusTraffic.metricsAvailable;
    if (!loaded) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardTitle, null, t('Metrics')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_3__.Spinner, {
            size: "lg"
        })));
    }
    if (!metricsAvailable) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardTitle, null, t('Metrics')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_4__.EmptyState, {
            variant: "sm",
            icon: _patternfly_react_icons_dist_dynamic_icons_exclamation_triangle_icon__WEBPACK_IMPORTED_MODULE_7__.ExclamationTriangleIcon,
            titleText: t('Metrics unavailable'),
            headingLevel: "h3"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_4__.EmptyStateBody, null, t('Metrics are unavailable. User workload monitoring may not be enabled on this cluster.')))));
    }
    var fmt = function fmt(val) {
        var suffix = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : '';
        return val !== null ? "".concat(val.toFixed(2)).concat(suffix) : '-';
    };
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Stack__WEBPACK_IMPORTED_MODULE_6__.Stack, {
        hasGutter: true
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Stack__WEBPACK_IMPORTED_MODULE_6__.StackItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardTitle, null, t('Metrics')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Split__WEBPACK_IMPORTED_MODULE_5__.Split, {
        hasGutter: true
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Split__WEBPACK_IMPORTED_MODULE_5__.SplitItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionList, {
        isHorizontal: true,
        isCompact: true
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionListTerm, null, t('Requests/sec')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionListDescription, null, t('1m rate'), ": ", fmt(data.requestRate1m), " | ", t('5m rate'), ": ", fmt(data.requestRate5m))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionListTerm, null, t('Success rate')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionListDescription, null, fmt(data.successRate, '%'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionListTerm, null, "2xx / 4xx / 5xx"), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionListDescription, null, fmt(data.rate2xx), " / ", fmt(data.rate4xx), " / ", fmt(data.rate5xx))))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Split__WEBPACK_IMPORTED_MODULE_5__.SplitItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionList, {
        isHorizontal: true,
        isCompact: true
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionListTerm, null, t('Latency')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_2__.DescriptionListDescription, null, t('p50'), ": ", fmt(data.latencyP50, 'ms'), " | ", t('p95'), ": ", fmt(data.latencyP95, 'ms'), " | ", t('p99'), ": ", fmt(data.latencyP99, 'ms'))))))))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Stack__WEBPACK_IMPORTED_MODULE_6__.StackItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_TrafficChart__WEBPACK_IMPORTED_MODULE_10__.TrafficCharts, {
        kind: kind,
        name: name,
        namespace: namespace
    })));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TrafficPanel);


/***/ },

/***/ "./components/policies/AuthPolicyEnforcedToggle.tsx"
/*!**********************************************************!*\
  !*** ./components/policies/AuthPolicyEnforcedToggle.tsx ***!
  \**********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthPolicyEnforcedToggle: () => (/* binding */ AuthPolicyEnforcedToggle)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Switch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Switch */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Switch/@patternfly/react-core/dist/dynamic/components/Switch");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Tooltip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Tooltip */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Tooltip/@patternfly/react-core/dist/dynamic/components/Tooltip");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @openshift-console/dynamic-plugin-sdk */ "webpack/sharing/consume/default/@openshift-console/dynamic-plugin-sdk");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../models */ "./models/index.ts");
/* harmony import */ var _utils_status__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/status */ "./utils/status.ts");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
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
function _ts_generator(thisArg, body) {
    var f, y, t, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype), d = Object.defineProperty;
    return d(g, "next", {
        value: verb(0)
    }), d(g, "throw", {
        value: verb(1)
    }), d(g, "return", {
        value: verb(2)
    }), typeof Symbol === "function" && d(g, Symbol.iterator, {
        value: function() {
            return this;
        }
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}







var AuthPolicyEnforcedToggle = function AuthPolicyEnforcedToggle(param) {
    var policy = param.policy, namespace = param.namespace;
    var _policy_metadata, _policyWithStatus_status, _policy_metadata1;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_4__.useTranslation)('plugin__custom-rhcl-console').t;
    var _React_useState = _sliced_to_array(react__WEBPACK_IMPORTED_MODULE_0__.useState(false), 2), isUpdating = _React_useState[0], setIsUpdating = _React_useState[1];
    var _useAccessReview = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_3__.useAccessReview)({
        group: _models__WEBPACK_IMPORTED_MODULE_5__.AuthPolicyGVK.group,
        resource: 'authpolicies',
        verb: 'update',
        namespace: namespace,
        name: (_policy_metadata = policy.metadata) === null || _policy_metadata === void 0 ? void 0 : _policy_metadata.name
    }), 1), canUpdate = _useAccessReview[0];
    var policyWithStatus = policy;
    var isEnforced = (0,_utils_status__WEBPACK_IMPORTED_MODULE_6__.isConditionTrue)((_policyWithStatus_status = policyWithStatus.status) === null || _policyWithStatus_status === void 0 ? void 0 : _policyWithStatus_status.conditions, 'Enforced');
    var handleToggle = function handleToggle() {
        return _async_to_generator(function() {
            var patchData, e;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        if (!canUpdate || isUpdating) return [
                            2
                        ];
                        setIsUpdating(true);
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            3,
                            4,
                            5
                        ]);
                        patchData = [
                            {
                                op: 'replace',
                                path: '/metadata/annotations/kuadrant.io~1enforced',
                                value: isEnforced ? 'false' : 'true'
                            }
                        ];
                        return [
                            4,
                            (0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_3__.k8sPatch)({
                                model: {
                                    apiVersion: "".concat(_models__WEBPACK_IMPORTED_MODULE_5__.AuthPolicyGVK.group, "/").concat(_models__WEBPACK_IMPORTED_MODULE_5__.AuthPolicyGVK.version),
                                    apiGroup: _models__WEBPACK_IMPORTED_MODULE_5__.AuthPolicyGVK.group,
                                    kind: _models__WEBPACK_IMPORTED_MODULE_5__.AuthPolicyGVK.kind,
                                    plural: 'authpolicies',
                                    abbr: 'AP',
                                    label: 'AuthPolicy',
                                    labelPlural: 'AuthPolicies',
                                    namespaced: true
                                },
                                resource: policy,
                                data: patchData
                            })
                        ];
                    case 2:
                        _state.sent();
                        return [
                            3,
                            5
                        ];
                    case 3:
                        e = _state.sent();
                        console.error('Failed to toggle AuthPolicy enforced state:', e);
                        return [
                            3,
                            5
                        ];
                    case 4:
                        setIsUpdating(false);
                        return [
                            7
                        ];
                    case 5:
                        return [
                            2
                        ];
                }
            });
        })();
    };
    var toggle = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Switch__WEBPACK_IMPORTED_MODULE_1__.Switch, {
        id: "enforced-toggle-".concat((_policy_metadata1 = policy.metadata) === null || _policy_metadata1 === void 0 ? void 0 : _policy_metadata1.uid),
        label: isEnforced ? t('Enforced') : t('Not Enforced'),
        isChecked: isEnforced,
        onChange: handleToggle,
        isDisabled: !canUpdate || isUpdating
    });
    if (!canUpdate) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Tooltip__WEBPACK_IMPORTED_MODULE_2__.Tooltip, {
            content: t('You do not have permission to update this AuthPolicy')
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, toggle));
    }
    return toggle;
};


/***/ },

/***/ "./components/policies/PolicyAttachmentView.tsx"
/*!******************************************************!*\
  !*** ./components/policies/PolicyAttachmentView.tsx ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PolicyAttachmentView: () => (/* binding */ PolicyAttachmentView)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Card */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Card/@patternfly/react-core/dist/dynamic/components/Card");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Label */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Label/@patternfly/react-core/dist/dynamic/components/Label");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Spinner */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Spinner/@patternfly/react-core/dist/dynamic/components/Spinner");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/EmptyState */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/EmptyState/@patternfly/react-core/dist/dynamic/components/EmptyState");
/* harmony import */ var _patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/layouts/Flex */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/layouts/Flex/@patternfly/react-core/dist/dynamic/layouts/Flex");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/DescriptionList */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/DescriptionList/@patternfly/react-core/dist/dynamic/components/DescriptionList");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _hooks_useAttachedPolicies__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../hooks/useAttachedPolicies */ "./hooks/useAttachedPolicies.ts");
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../models */ "./models/index.ts");
/* harmony import */ var _utils_status__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../utils/status */ "./utils/status.ts");
/* harmony import */ var _AuthPolicyEnforcedToggle__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./AuthPolicyEnforcedToggle */ "./components/policies/AuthPolicyEnforcedToggle.tsx");



















var PolicyAttachmentView = function PolicyAttachmentView(param) {
    var targetKind = param.targetKind, targetName = param.targetName, targetNamespace = param.targetNamespace;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_7__.useTranslation)('plugin__custom-rhcl-console').t;
    var _useAttachedPolicies = (0,_hooks_useAttachedPolicies__WEBPACK_IMPORTED_MODULE_8__.useAttachedPolicies)(targetKind, targetName, targetNamespace), policies = _useAttachedPolicies.policies, loaded = _useAttachedPolicies.loaded, error = _useAttachedPolicies.error;
    if (!loaded) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_3__.Spinner, {
            size: "lg"
        });
    }
    if (error) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_4__.EmptyState, {
            variant: "sm",
            titleText: t('Error loading policies'),
            headingLevel: "h3"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_4__.EmptyStateBody, null, error.message));
    }
    if (policies.length === 0) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_4__.EmptyState, {
            variant: "sm",
            titleText: t('No policies found'),
            headingLevel: "h3"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_4__.EmptyStateBody, null, t('No policies are attached to this {{kind}}.', {
            kind: targetKind
        })));
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.Flex, {
        direction: {
            default: 'column'
        },
        spaceItems: {
            default: 'spaceItemsMd'
        }
    }, policies.map(function(pa) {
        var _pa_policy_metadata;
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, {
            key: (_pa_policy_metadata = pa.policy.metadata) === null || _pa_policy_metadata === void 0 ? void 0 : _pa_policy_metadata.uid
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(PolicyCard, {
            attachment: pa,
            targetNamespace: targetNamespace
        }));
    }));
};
var PolicyCard = function PolicyCard(param) {
    var attachment = param.attachment, targetNamespace = param.targetNamespace;
    var _policy_metadata, _policy_metadata1;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_7__.useTranslation)('plugin__custom-rhcl-console').t;
    var policy = attachment.policy, policyKind = attachment.policyKind, conditions = attachment.conditions, isOverridden = attachment.isOverridden, isEnforced = attachment.isEnforced;
    var name = ((_policy_metadata = policy.metadata) === null || _policy_metadata === void 0 ? void 0 : _policy_metadata.name) || '';
    var ns = ((_policy_metadata1 = policy.metadata) === null || _policy_metadata1 === void 0 ? void 0 : _policy_metadata1.namespace) || '';
    var accepted = (0,_utils_status__WEBPACK_IMPORTED_MODULE_10__.isConditionTrue)(conditions, 'Accepted');
    var enforcedMsg = (0,_utils_status__WEBPACK_IMPORTED_MODULE_10__.getConditionMessage)(conditions, 'Enforced');
    var overriddenMsg = (0,_utils_status__WEBPACK_IMPORTED_MODULE_10__.getConditionMessage)(conditions, 'Overridden');
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.Card, {
        isCompact: true
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardTitle, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.Flex, {
        spaceItems: {
            default: 'spaceItemsSm'
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: "blue"
    }, _models__WEBPACK_IMPORTED_MODULE_9__.POLICY_KIND_LABELS[policyKind] || policyKind)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", {
        href: (0,_models__WEBPACK_IMPORTED_MODULE_9__.policyResourceURL)(policyKind, ns, name)
    }, ns, "/", name)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Flex__WEBPACK_IMPORTED_MODULE_5__.FlexItem, null, isOverridden ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: "orange"
    }, t('Overridden')) : isEnforced ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: "green"
    }, t('Enforced')) : accepted ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: "blue"
    }, t('Accepted')) : /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Label__WEBPACK_IMPORTED_MODULE_2__.Label, {
        color: "red"
    }, t('Not Enforced'))))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_6__.DescriptionList, {
        isHorizontal: true,
        isCompact: true
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_6__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_6__.DescriptionListTerm, null, t('Target')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_6__.DescriptionListDescription, null, attachment.targetRef.kind, "/", attachment.targetRef.name)), enforcedMsg && /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_6__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_6__.DescriptionListTerm, null, t('Enforced')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_6__.DescriptionListDescription, null, enforcedMsg)), overriddenMsg && /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_6__.DescriptionListGroup, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_6__.DescriptionListTerm, null, t('Overridden')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_DescriptionList__WEBPACK_IMPORTED_MODULE_6__.DescriptionListDescription, null, overriddenMsg))), policyKind === 'AuthPolicy' && /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            marginTop: 12
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_AuthPolicyEnforcedToggle__WEBPACK_IMPORTED_MODULE_11__.AuthPolicyEnforcedToggle, {
        policy: policy,
        namespace: targetNamespace
    }))));
};


/***/ }

}]);
//# sourceMappingURL=components_common_TrafficPanel_tsx-components_policies_PolicyAttachmentView_tsx-webpack_shari-f3c6ac-chunk.js.map