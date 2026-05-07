"use strict";
self["webpackHotUpdatecustom_rhcl_console"]("exposed-TopologyPage",{

/***/ "./components/topology/TopologyPage.tsx"
/*!**********************************************!*\
  !*** ./components/topology/TopologyPage.tsx ***!
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
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Spinner */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Spinner/@patternfly/react-core/dist/dynamic/components/Spinner");
/* harmony import */ var _patternfly_react_core_dist_dynamic_layouts_Bullseye__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/layouts/Bullseye */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/layouts/Bullseye/@patternfly/react-core/dist/dynamic/layouts/Bullseye");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/EmptyState */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/EmptyState/@patternfly/react-core/dist/dynamic/components/EmptyState");
/* harmony import */ var _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @patternfly/react-topology */ "webpack/sharing/consume/default/@patternfly/react-topology");
/* harmony import */ var _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @openshift-console/dynamic-plugin-sdk */ "webpack/sharing/consume/default/@openshift-console/dynamic-plugin-sdk");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../models */ "./models/index.ts");
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











var GATEWAY_TYPE = 'gateway-node';
var ROUTE_TYPE = 'route-node';
var SERVICE_TYPE = 'service-node';
var layoutFactory = function layoutFactory(type, graph) {
    return new _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.DagreLayout(graph, {
        rankdir: 'LR',
        nodesep: 60,
        ranksep: 100
    });
};
var componentFactory = function componentFactory(kind) {
    if (kind === _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.ModelKind.graph) return _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.GraphComponent;
    if (kind === _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.ModelKind.node) return _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.DefaultNode;
    if (kind === _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.ModelKind.edge) return _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.DefaultEdge;
    return _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.DefaultGroup;
};
var TopologyPage = function TopologyPage() {
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_8__.useTranslation)('plugin__custom-rhcl-console').t;
    var _useK8sWatchResource = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_7__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_9__.GatewayGVK,
        isList: true
    }), 2), gateways = _useK8sWatchResource[0], gwLoaded = _useK8sWatchResource[1];
    var _useK8sWatchResource1 = _sliced_to_array((0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_7__.useK8sWatchResource)({
        groupVersionKind: _models__WEBPACK_IMPORTED_MODULE_9__.HTTPRouteGVK,
        isList: true
    }), 2), httpRoutes = _useK8sWatchResource1[0], routeLoaded = _useK8sWatchResource1[1];
    var loaded = gwLoaded && routeLoaded;
    var model = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(function() {
        if (!loaded) return null;
        var nodes = [];
        var edges = [];
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            for(var _iterator = (gateways || [])[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                var gw = _step.value;
                var _gw_metadata, _gw_metadata1, _gw_metadata2;
                var gwId = "gw-".concat((_gw_metadata = gw.metadata) === null || _gw_metadata === void 0 ? void 0 : _gw_metadata.namespace, "-").concat((_gw_metadata1 = gw.metadata) === null || _gw_metadata1 === void 0 ? void 0 : _gw_metadata1.name);
                nodes.push({
                    id: gwId,
                    type: GATEWAY_TYPE,
                    label: "Gateway: ".concat((_gw_metadata2 = gw.metadata) === null || _gw_metadata2 === void 0 ? void 0 : _gw_metadata2.name),
                    width: 120,
                    height: 60,
                    shape: _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.NodeShape.rect,
                    data: {
                        kind: 'Gateway',
                        resource: gw
                    }
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
        var serviceSet = new Set();
        var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
        try {
            for(var _iterator1 = (httpRoutes || [])[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                var route = _step1.value;
                var _route_metadata, _route_metadata1, _route_metadata2;
                var routeId = "route-".concat((_route_metadata = route.metadata) === null || _route_metadata === void 0 ? void 0 : _route_metadata.namespace, "-").concat((_route_metadata1 = route.metadata) === null || _route_metadata1 === void 0 ? void 0 : _route_metadata1.name);
                nodes.push({
                    id: routeId,
                    type: ROUTE_TYPE,
                    label: "HTTPRoute: ".concat((_route_metadata2 = route.metadata) === null || _route_metadata2 === void 0 ? void 0 : _route_metadata2.name),
                    width: 140,
                    height: 60,
                    shape: _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.NodeShape.rect,
                    data: {
                        kind: 'HTTPRoute',
                        resource: route
                    }
                });
                var _iteratorNormalCompletion2 = true, _didIteratorError2 = false, _iteratorError2 = undefined;
                try {
                    for(var _iterator2 = (route.spec.parentRefs || [])[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true){
                        var parentRef = _step2.value;
                        var _route_metadata3;
                        var parentNs = parentRef.namespace || ((_route_metadata3 = route.metadata) === null || _route_metadata3 === void 0 ? void 0 : _route_metadata3.namespace) || '';
                        var gwId1 = "gw-".concat(parentNs, "-").concat(parentRef.name);
                        edges.push({
                            id: "edge-".concat(gwId1, "-").concat(routeId),
                            type: 'edge',
                            source: gwId1,
                            target: routeId
                        });
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
                    for(var _iterator3 = (route.spec.rules || [])[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true){
                        var rule = _step3.value;
                        var _iteratorNormalCompletion4 = true, _didIteratorError4 = false, _iteratorError4 = undefined;
                        try {
                            for(var _iterator4 = (rule.backendRefs || [])[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true){
                                var backend = _step4.value;
                                var _route_metadata4;
                                var backendNs = backend.namespace || ((_route_metadata4 = route.metadata) === null || _route_metadata4 === void 0 ? void 0 : _route_metadata4.namespace) || '';
                                var svcId = "svc-".concat(backendNs, "-").concat(backend.name);
                                if (!serviceSet.has(svcId)) {
                                    serviceSet.add(svcId);
                                    nodes.push({
                                        id: svcId,
                                        type: SERVICE_TYPE,
                                        label: "Service: ".concat(backend.name),
                                        width: 120,
                                        height: 60,
                                        shape: _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.NodeShape.ellipse,
                                        data: {
                                            kind: 'Service',
                                            name: backend.name,
                                            namespace: backendNs
                                        }
                                    });
                                }
                                edges.push({
                                    id: "edge-".concat(routeId, "-").concat(svcId),
                                    type: 'edge',
                                    source: routeId,
                                    target: svcId
                                });
                            }
                        } catch (err) {
                            _didIteratorError4 = true;
                            _iteratorError4 = err;
                        } finally{
                            try {
                                if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                                    _iterator4.return();
                                }
                            } finally{
                                if (_didIteratorError4) {
                                    throw _iteratorError4;
                                }
                            }
                        }
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
        return {
            nodes: nodes,
            edges: edges,
            graph: {
                id: 'rhcl-topology',
                type: 'graph',
                layout: 'Dagre'
            }
        };
    }, [
        loaded,
        gateways,
        httpRoutes
    ]);
    if (!loaded) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_1__.PageSection, {
            variant: "default"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_2__.Title, {
            headingLevel: "h1"
        }, t('Topology'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_1__.PageSection, {
            isFilled: true
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_layouts_Bullseye__WEBPACK_IMPORTED_MODULE_4__.Bullseye, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_3__.Spinner, {
            size: "xl"
        }))));
    }
    if (!model || !model.nodes || model.nodes.length === 0) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_1__.PageSection, {
            variant: "default"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_2__.Title, {
            headingLevel: "h1"
        }, t('Topology'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_1__.PageSection, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_5__.EmptyState, {
            variant: "lg",
            titleText: t('No resources found'),
            headingLevel: "h2"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_EmptyState__WEBPACK_IMPORTED_MODULE_5__.EmptyStateBody, null, t('No Gateways or HTTPRoutes found to display in the topology graph.')))));
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_1__.PageSection, {
        variant: "default"
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Title__WEBPACK_IMPORTED_MODULE_2__.Title, {
        headingLevel: "h1"
    }, t('Topology'))), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Page__WEBPACK_IMPORTED_MODULE_1__.PageSection, {
        isFilled: true,
        padding: {
            default: 'noPadding'
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(TopologyGraph, {
        model: model
    })));
};
var TopologyGraph = function TopologyGraph(param) {
    var model = param.model;
    var _React_useState = _sliced_to_array(react__WEBPACK_IMPORTED_MODULE_0__.useState(null), 2), controller = _React_useState[0], setController = _React_useState[1];
    react__WEBPACK_IMPORTED_MODULE_0__.useEffect(function() {
        var viz = new _patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.Visualization();
        viz.registerLayoutFactory(layoutFactory);
        viz.registerComponentFactory(componentFactory);
        viz.addEventListener(_patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.GRAPH_LAYOUT_END_EVENT, function() {
            viz.getGraph().fit(40);
        });
        viz.fromModel(model, false);
        setController(viz);
    }, [
        model
    ]);
    if (!controller) return null;
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            height: 'calc(100vh - 200px)',
            minHeight: 400
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.VisualizationProvider, {
        controller: controller
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_topology__WEBPACK_IMPORTED_MODULE_6__.VisualizationSurface, null)));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TopologyPage);


/***/ }

});
//# sourceMappingURL=exposed-TopologyPage.bed57fe05b864d7e1f2b.hot-update.js.map