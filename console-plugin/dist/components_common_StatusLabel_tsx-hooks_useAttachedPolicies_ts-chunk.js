"use strict";
(self["webpackChunkcustom_rhcl_console"] = self["webpackChunkcustom_rhcl_console"] || []).push([["components_common_StatusLabel_tsx-hooks_useAttachedPolicies_ts"],{

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

/***/ "./hooks/useAttachedPolicies.ts"
/*!**************************************!*\
  !*** ./hooks/useAttachedPolicies.ts ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useAttachedPolicies: () => (/* binding */ useAttachedPolicies)
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


function useAttachedPolicies(targetKind, targetName, targetNamespace) {
    var _useK8sWatchResource = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_1__.AuthPolicyGVK,
        isList: true,
        namespace: targetNamespace
    }), 3), authPolicies = _useK8sWatchResource[0], authLoaded = _useK8sWatchResource[1], authErr = _useK8sWatchResource[2];
    var _useK8sWatchResource1 = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_1__.RateLimitPolicyGVK,
        isList: true,
        namespace: targetNamespace
    }), 3), rlPolicies = _useK8sWatchResource1[0], rlLoaded = _useK8sWatchResource1[1], rlErr = _useK8sWatchResource1[2];
    var _useK8sWatchResource2 = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_1__.TokenRateLimitPolicyGVK,
        isList: true,
        namespace: targetNamespace
    }), 3), trlPolicies = _useK8sWatchResource2[0], trlLoaded = _useK8sWatchResource2[1], trlErr = _useK8sWatchResource2[2];
    var _useK8sWatchResource3 = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_1__.DNSPolicyGVK,
        isList: true,
        namespace: targetNamespace
    }), 3), dnsPolicies = _useK8sWatchResource3[0], dnsLoaded = _useK8sWatchResource3[1], dnsErr = _useK8sWatchResource3[2];
    var _useK8sWatchResource4 = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_0__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_1__.TLSPolicyGVK,
        isList: true,
        namespace: targetNamespace
    }), 3), tlsPolicies = _useK8sWatchResource4[0], tlsLoaded = _useK8sWatchResource4[1], tlsErr = _useK8sWatchResource4[2];
    var loaded = authLoaded && rlLoaded && trlLoaded && dnsLoaded && tlsLoaded;
    var errors = [
        authErr,
        rlErr,
        trlErr,
        dnsErr,
        tlsErr
    ].filter(Boolean);
    var error = errors.length === 5 ? errors[0] : undefined;
    var policies = [];
    var addMatching = function addMatching(items, kind) {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            for(var _iterator = (items || [])[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                var p = _step.value;
                var _p_status;
                var ref = p.spec.targetRef;
                if (!matchesTarget(ref, targetKind, targetName, targetNamespace)) continue;
                var conditions = ((_p_status = p.status) === null || _p_status === void 0 ? void 0 : _p_status.conditions) || [];
                var isOverridden = conditions.some(function(c) {
                    return c.type === 'Overridden' && c.status === 'True';
                });
                var isEnforced = conditions.some(function(c) {
                    return c.type === 'Enforced' && c.status === 'True';
                });
                policies.push({
                    policy: p,
                    policyKind: kind,
                    targetRef: ref,
                    conditions: conditions,
                    isOverridden: isOverridden,
                    isEnforced: isEnforced
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
    addMatching(authPolicies, 'AuthPolicy');
    addMatching(rlPolicies, 'RateLimitPolicy');
    addMatching(trlPolicies, 'TokenRateLimitPolicy');
    addMatching(dnsPolicies, 'DNSPolicy');
    addMatching(tlsPolicies, 'TLSPolicy');
    return {
        policies: policies,
        loaded: loaded,
        error: error
    };
}
function matchesTarget(ref, kind, name, namespace) {
    if (ref.name !== name) return false;
    if (ref.kind && ref.kind !== kind) return false;
    if (ref.namespace && ref.namespace !== namespace) return false;
    return true;
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
//# sourceMappingURL=components_common_StatusLabel_tsx-hooks_useAttachedPolicies_ts-chunk.js.map