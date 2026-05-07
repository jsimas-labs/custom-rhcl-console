"use strict";
(self["webpackChunkcustom_rhcl_console"] = self["webpackChunkcustom_rhcl_console"] || []).push([["components_common_TrafficChart_tsx-hooks_usePrometheusTraffic_ts-models_index_ts-utils_hostna-bac171"],{

/***/ "./components/common/TrafficChart.tsx"
/*!********************************************!*\
  !*** ./components/common/TrafficChart.tsx ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TrafficCharts: () => (/* binding */ TrafficCharts),
/* harmony export */   TrafficSparkline: () => (/* binding */ TrafficSparkline)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @patternfly/react-charts/victory */ "../node_modules/@patternfly/react-charts/dist/esm/victory/components/Chart/Chart.js");
/* harmony import */ var _patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @patternfly/react-charts/victory */ "../node_modules/@patternfly/react-charts/dist/esm/victory/components/ChartArea/ChartArea.js");
/* harmony import */ var _patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @patternfly/react-charts/victory */ "../node_modules/@patternfly/react-charts/dist/esm/victory/components/ChartAxis/ChartAxis.js");
/* harmony import */ var _patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @patternfly/react-charts/victory */ "../node_modules/@patternfly/react-charts/dist/esm/victory/components/ChartGroup/ChartGroup.js");
/* harmony import */ var _patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @patternfly/react-charts/victory */ "../node_modules/@patternfly/react-charts/dist/esm/victory/components/ChartLine/ChartLine.js");
/* harmony import */ var _patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @patternfly/react-charts/victory */ "../node_modules/@patternfly/react-charts/dist/esm/victory/components/ChartTheme/ChartThemeColor.js");
/* harmony import */ var _patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @patternfly/react-charts/victory */ "../node_modules/@patternfly/react-charts/dist/esm/victory/components/ChartVoronoiContainer/ChartVoronoiContainer.js");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Card */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Card/@patternfly/react-core/dist/dynamic/components/Card");
/* harmony import */ var _patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @patternfly/react-core/dist/dynamic/components/Spinner */ "webpack/sharing/consume/default/@patternfly/react-core/dist/dynamic/components/Spinner/@patternfly/react-core/dist/dynamic/components/Spinner");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var _hooks_usePrometheusRange__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../hooks/usePrometheusRange */ "./hooks/usePrometheusRange.ts");
/* harmony import */ var _utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../utils/prometheusQueries */ "./utils/prometheusQueries.ts");









var REQUEST_COLORS = [
    '#3E8635',
    '#F0AB00',
    '#C9190B'
];
var LATENCY_COLORS = [
    '#06C',
    '#8481DD',
    '#EC7A08'
];
function formatTime(date) {
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}
var RequestRateChart = function RequestRateChart(param) {
    var series = param.series;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_10__.useTranslation)('plugin__custom-rhcl-console').t;
    var legendData = [
        {
            name: '2xx',
            symbol: {
                fill: REQUEST_COLORS[0]
            }
        },
        {
            name: '4xx',
            symbol: {
                fill: REQUEST_COLORS[1]
            }
        },
        {
            name: '5xx',
            symbol: {
                fill: REQUEST_COLORS[2]
            }
        }
    ];
    var hasData = series.some(function(s) {
        return s.data.length > 0;
    });
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_8__.Card, {
        isCompact: true
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_8__.CardTitle, null, t('Request rate'), " (", t('last hour'), ")"), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_8__.CardBody, null, !hasData ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--pf-t--global--color--nonstatus--gray--default)'
        }
    }, t('No data available')) : /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_1__.Chart, {
        height: 200,
        padding: {
            top: 10,
            bottom: 40,
            left: 60,
            right: 20
        },
        containerComponent: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_7__.ChartVoronoiContainer, {
            labels: function labels(param) {
                var datum = param.datum;
                var _datum_y;
                return "".concat(datum.childName, ": ").concat((_datum_y = datum.y) === null || _datum_y === void 0 ? void 0 : _datum_y.toFixed(2), " req/s");
            }
        }),
        legendData: legendData,
        legendPosition: "bottom",
        themeColor: _patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_6__.ChartThemeColor.multiUnordered
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_3__.ChartAxis, {
        tickFormat: function tickFormat(t) {
            return formatTime(t);
        },
        fixLabelOverlap: true
    }), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_3__.ChartAxis, {
        dependentAxis: true,
        tickFormat: function tickFormat(t) {
            return "".concat(t.toFixed(1));
        }
    }), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_4__.ChartGroup, null, series.map(function(s, i) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_2__.ChartArea, {
            key: s.label,
            name: s.label,
            data: s.data.map(function(d) {
                return {
                    x: d.x,
                    y: d.y
                };
            }),
            style: {
                data: {
                    fill: REQUEST_COLORS[i],
                    fillOpacity: 0.3,
                    stroke: REQUEST_COLORS[i]
                }
            }
        });
    })))));
};
var LatencyChart = function LatencyChart(param) {
    var series = param.series;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_10__.useTranslation)('plugin__custom-rhcl-console').t;
    var legendData = [
        {
            name: 'p50',
            symbol: {
                fill: LATENCY_COLORS[0]
            }
        },
        {
            name: 'p95',
            symbol: {
                fill: LATENCY_COLORS[1]
            }
        },
        {
            name: 'p99',
            symbol: {
                fill: LATENCY_COLORS[2]
            }
        }
    ];
    var hasData = series.some(function(s) {
        return s.data.length > 0;
    });
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_8__.Card, {
        isCompact: true
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_8__.CardTitle, null, t('Latency'), " (", t('last hour'), ")"), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_8__.CardBody, null, !hasData ? /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--pf-t--global--color--nonstatus--gray--default)'
        }
    }, t('No data available')) : /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_1__.Chart, {
        height: 200,
        padding: {
            top: 10,
            bottom: 40,
            left: 60,
            right: 20
        },
        containerComponent: /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_7__.ChartVoronoiContainer, {
            labels: function labels(param) {
                var datum = param.datum;
                var _datum_y;
                return "".concat(datum.childName, ": ").concat((_datum_y = datum.y) === null || _datum_y === void 0 ? void 0 : _datum_y.toFixed(1), "ms");
            }
        }),
        legendData: legendData,
        legendPosition: "bottom",
        themeColor: _patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_6__.ChartThemeColor.multiUnordered
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_3__.ChartAxis, {
        tickFormat: function tickFormat(t) {
            return formatTime(t);
        },
        fixLabelOverlap: true
    }), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_3__.ChartAxis, {
        dependentAxis: true,
        tickFormat: function tickFormat(t) {
            return "".concat(t.toFixed(0), "ms");
        }
    }), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_4__.ChartGroup, null, series.map(function(s, i) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_5__.ChartLine, {
            key: s.label,
            name: s.label,
            data: s.data.map(function(d) {
                return {
                    x: d.x,
                    y: d.y
                };
            }),
            style: {
                data: {
                    stroke: LATENCY_COLORS[i],
                    strokeWidth: 2
                }
            }
        });
    })))));
};
var TrafficCharts = function TrafficCharts(param) {
    var kind = param.kind, name = param.name, namespace = param.namespace;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_10__.useTranslation)('plugin__custom-rhcl-console').t;
    var rateQueries = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(function() {
        return [
            {
                label: '2xx',
                query: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_12__.statusCodeRateRangeQuery)(namespace, name, kind, '2xx')
            },
            {
                label: '4xx',
                query: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_12__.statusCodeRateRangeQuery)(namespace, name, kind, '4xx')
            },
            {
                label: '5xx',
                query: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_12__.statusCodeRateRangeQuery)(namespace, name, kind, '5xx')
            }
        ];
    }, [
        namespace,
        name,
        kind
    ]);
    var latencyQueries = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(function() {
        return [
            {
                label: 'p50',
                query: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_12__.latencyPercentileRangeQuery)(namespace, name, kind, 0.5)
            },
            {
                label: 'p95',
                query: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_12__.latencyPercentileRangeQuery)(namespace, name, kind, 0.95)
            },
            {
                label: 'p99',
                query: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_12__.latencyPercentileRangeQuery)(namespace, name, kind, 0.99)
            }
        ];
    }, [
        namespace,
        name,
        kind
    ]);
    var _usePrometheusRange = (0,_hooks_usePrometheusRange__WEBPACK_IMPORTED_MODULE_11__.usePrometheusRange)(rateQueries, 3600, 60), rateSeries = _usePrometheusRange.series, rateLoaded = _usePrometheusRange.loaded;
    var _usePrometheusRange1 = (0,_hooks_usePrometheusRange__WEBPACK_IMPORTED_MODULE_11__.usePrometheusRange)(latencyQueries, 3600, 60), latencySeries = _usePrometheusRange1.series, latencyLoaded = _usePrometheusRange1.loaded;
    if (!rateLoaded || !latencyLoaded) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_8__.Card, {
            isCompact: true
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_8__.CardTitle, null, t('Charts')), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Card__WEBPACK_IMPORTED_MODULE_8__.CardBody, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_core_dist_dynamic_components_Spinner__WEBPACK_IMPORTED_MODULE_9__.Spinner, {
            size: "lg"
        })));
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(RequestRateChart, {
        series: rateSeries
    }), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(LatencyChart, {
        series: latencySeries
    }));
};
var TrafficSparkline = function TrafficSparkline(param) {
    var kind = param.kind, name = param.name, namespace = param.namespace;
    var _series_;
    var queries = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(function() {
        return [
            {
                label: 'req/s',
                query: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_12__.trafficOverTimeQuery)(namespace, name, kind)
            }
        ];
    }, [
        namespace,
        name,
        kind
    ]);
    var _usePrometheusRange = (0,_hooks_usePrometheusRange__WEBPACK_IMPORTED_MODULE_11__.usePrometheusRange)(queries, 3600, 120), series = _usePrometheusRange.series, loaded = _usePrometheusRange.loaded;
    if (!loaded || !((_series_ = series[0]) === null || _series_ === void 0 ? void 0 : _series_.data.length)) {
        return null;
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        style: {
            height: 40,
            marginTop: 8
        }
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_1__.Chart, {
        height: 40,
        padding: {
            top: 2,
            bottom: 2,
            left: 0,
            right: 0
        },
        themeColor: _patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_6__.ChartThemeColor.blue
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(_patternfly_react_charts_victory__WEBPACK_IMPORTED_MODULE_2__.ChartArea, {
        data: series[0].data.map(function(d) {
            return {
                x: d.x,
                y: d.y
            };
        }),
        style: {
            data: {
                fillOpacity: 0.2,
                strokeWidth: 1.5
            }
        }
    })));
};


/***/ },

/***/ "./hooks/usePrometheusRange.ts"
/*!*************************************!*\
  !*** ./hooks/usePrometheusRange.ts ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   usePrometheusRange: () => (/* binding */ usePrometheusRange)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @openshift-console/dynamic-plugin-sdk */ "webpack/sharing/consume/default/@openshift-console/dynamic-plugin-sdk");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_1__);
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
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
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


function usePrometheusRange(queries) {
    var durationSeconds = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 3600, stepSeconds = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 60, pollInterval = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 30000;
    var _useState = _sliced_to_array((0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]), 2), series = _useState[0], setSeries = _useState[1];
    var _useState1 = _sliced_to_array((0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false), 2), loaded = _useState1[0], setLoaded = _useState1[1];
    var _useState2 = _sliced_to_array((0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true), 2), metricsAvailable = _useState2[0], setMetricsAvailable = _useState2[1];
    var intervalRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    var queriesKey = queries.map(function(q) {
        return q.query;
    }).join('|');
    var fetchRange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function() {
        return _async_to_generator(function() {
            var now, start, results, e, err;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        if (queries.length === 0) return [
                            2
                        ];
                        now = Math.floor(Date.now() / 1000);
                        start = now - durationSeconds;
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            3,
                            ,
                            4
                        ]);
                        return [
                            4,
                            Promise.all(queries.map(function(spec) {
                                return _async_to_generator(function() {
                                    var _json_data_result_, _json_data_result, _json_data, params, url, response, json, values, unused;
                                    return _ts_generator(this, function(_state) {
                                        switch(_state.label){
                                            case 0:
                                                _state.trys.push([
                                                    0,
                                                    3,
                                                    ,
                                                    4
                                                ]);
                                                params = new URLSearchParams({
                                                    query: spec.query,
                                                    start: String(start),
                                                    end: String(now),
                                                    step: String(stepSeconds)
                                                });
                                                url = "/api/prometheus/api/v1/query_range?".concat(params);
                                                return [
                                                    4,
                                                    (0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_1__.consoleFetch)(url)
                                                ];
                                            case 1:
                                                response = _state.sent();
                                                return [
                                                    4,
                                                    response.json()
                                                ];
                                            case 2:
                                                json = _state.sent();
                                                values = (json === null || json === void 0 ? void 0 : (_json_data = json.data) === null || _json_data === void 0 ? void 0 : (_json_data_result = _json_data.result) === null || _json_data_result === void 0 ? void 0 : (_json_data_result_ = _json_data_result[0]) === null || _json_data_result_ === void 0 ? void 0 : _json_data_result_.values) || [];
                                                return [
                                                    2,
                                                    {
                                                        label: spec.label,
                                                        data: values.map(function(param) {
                                                            var _param = _sliced_to_array(param, 2), ts = _param[0], val = _param[1];
                                                            return {
                                                                x: new Date(ts * 1000),
                                                                y: parseFloat(val) || 0
                                                            };
                                                        })
                                                    }
                                                ];
                                            case 3:
                                                unused = _state.sent();
                                                return [
                                                    2,
                                                    {
                                                        label: spec.label,
                                                        data: []
                                                    }
                                                ];
                                            case 4:
                                                return [
                                                    2
                                                ];
                                        }
                                    });
                                })();
                            }))
                        ];
                    case 2:
                        results = _state.sent();
                        setSeries(results);
                        setLoaded(true);
                        setMetricsAvailable(true);
                        return [
                            3,
                            4
                        ];
                    case 3:
                        e = _state.sent();
                        err = _instanceof(e, Error) ? e : new Error(String(e));
                        if (err.message.includes('404') || err.message.includes('503')) {
                            setMetricsAvailable(false);
                        }
                        setLoaded(true);
                        return [
                            3,
                            4
                        ];
                    case 4:
                        return [
                            2
                        ];
                }
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
        })();
    }, [
        queriesKey,
        durationSeconds,
        stepSeconds
    ]);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function() {
        fetchRange();
        intervalRef.current = setInterval(fetchRange, pollInterval);
        return function() {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [
        fetchRange,
        pollInterval
    ]);
    return {
        series: series,
        loaded: loaded,
        metricsAvailable: metricsAvailable
    };
}


/***/ },

/***/ "./hooks/usePrometheusTraffic.ts"
/*!***************************************!*\
  !*** ./hooks/usePrometheusTraffic.ts ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   usePrometheusTraffic: () => (/* binding */ usePrometheusTraffic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @openshift-console/dynamic-plugin-sdk */ "webpack/sharing/consume/default/@openshift-console/dynamic-plugin-sdk");
/* harmony import */ var _openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/prometheusQueries */ "./utils/prometheusQueries.ts");
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
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
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



var EMPTY_TRAFFIC = {
    requestRate1m: null,
    requestRate5m: null,
    successRate: null,
    rate2xx: null,
    rate4xx: null,
    rate5xx: null,
    latencyP50: null,
    latencyP95: null,
    latencyP99: null
};
function usePrometheusTraffic(kind, name, namespace) {
    var pollInterval = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 30000;
    var _useState = _sliced_to_array((0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(EMPTY_TRAFFIC), 2), data = _useState[0], setData = _useState[1];
    var _useState1 = _sliced_to_array((0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false), 2), loaded = _useState1[0], setLoaded = _useState1[1];
    var _useState2 = _sliced_to_array((0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null), 2), error = _useState2[0], setError = _useState2[1];
    var _useState3 = _sliced_to_array((0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true), 2), metricsAvailable = _useState3[0], setMetricsAvailable = _useState3[1];
    var intervalRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    var fetchMetrics = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function() {
        return _async_to_generator(function() {
            var queries, results, newData, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _step_value, key, value, e, _$err;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        if (!name || !namespace) return [
                            2
                        ];
                        queries = {
                            requestRate1m: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_2__.requestRateQuery)(namespace, name, kind, '1m'),
                            requestRate5m: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_2__.requestRateQuery)(namespace, name, kind, '5m'),
                            successRate: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_2__.successRateQuery)(namespace, name, kind),
                            rate2xx: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_2__.statusCodeRateQuery)(namespace, name, kind, '2xx'),
                            rate4xx: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_2__.statusCodeRateQuery)(namespace, name, kind, '4xx'),
                            rate5xx: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_2__.statusCodeRateQuery)(namespace, name, kind, '5xx'),
                            latencyP50: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_2__.latencyPercentileQuery)(namespace, name, kind, 0.5),
                            latencyP95: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_2__.latencyPercentileQuery)(namespace, name, kind, 0.95),
                            latencyP99: (0,_utils_prometheusQueries__WEBPACK_IMPORTED_MODULE_2__.latencyPercentileQuery)(namespace, name, kind, 0.99)
                        };
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            3,
                            ,
                            4
                        ]);
                        return [
                            4,
                            Promise.all(Object.entries(queries).map(function(param) {
                                var _param = _sliced_to_array(param, 2), key = _param[0], query = _param[1];
                                return _async_to_generator(function() {
                                    var _json_data_result__value, _json_data_result_, _json_data_result, _json_data, url, response, json, value, unused;
                                    return _ts_generator(this, function(_state) {
                                        switch(_state.label){
                                            case 0:
                                                _state.trys.push([
                                                    0,
                                                    3,
                                                    ,
                                                    4
                                                ]);
                                                url = "/api/prometheus/api/v1/query?query=".concat(encodeURIComponent(query));
                                                return [
                                                    4,
                                                    (0,_openshift_console_dynamic_plugin_sdk__WEBPACK_IMPORTED_MODULE_1__.consoleFetch)(url)
                                                ];
                                            case 1:
                                                response = _state.sent();
                                                return [
                                                    4,
                                                    response.json()
                                                ];
                                            case 2:
                                                json = _state.sent();
                                                value = json === null || json === void 0 ? void 0 : (_json_data = json.data) === null || _json_data === void 0 ? void 0 : (_json_data_result = _json_data.result) === null || _json_data_result === void 0 ? void 0 : (_json_data_result_ = _json_data_result[0]) === null || _json_data_result_ === void 0 ? void 0 : (_json_data_result__value = _json_data_result_.value) === null || _json_data_result__value === void 0 ? void 0 : _json_data_result__value[1];
                                                return [
                                                    2,
                                                    [
                                                        key,
                                                        value ? parseFloat(value) : null
                                                    ]
                                                ];
                                            case 3:
                                                unused = _state.sent();
                                                return [
                                                    2,
                                                    [
                                                        key,
                                                        null
                                                    ]
                                                ];
                                            case 4:
                                                return [
                                                    2
                                                ];
                                        }
                                    });
                                })();
                            }))
                        ];
                    case 2:
                        results = _state.sent();
                        newData = _object_spread({}, EMPTY_TRAFFIC);
                        _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                        try {
                            for(_iterator = results[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                                _step_value = _sliced_to_array(_step.value, 2), key = _step_value[0], value = _step_value[1];
                                newData[key] = value;
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
                        setData(newData);
                        setLoaded(true);
                        setError(null);
                        setMetricsAvailable(true);
                        return [
                            3,
                            4
                        ];
                    case 3:
                        e = _state.sent();
                        _$err = _instanceof(e, Error) ? e : new Error(String(e));
                        if (_$err.message.includes('404') || _$err.message.includes('503')) {
                            setMetricsAvailable(false);
                            setLoaded(true);
                        } else {
                            setError(_$err);
                        }
                        return [
                            3,
                            4
                        ];
                    case 4:
                        return [
                            2
                        ];
                }
            });
        })();
    }, [
        kind,
        name,
        namespace
    ]);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function() {
        fetchMetrics();
        intervalRef.current = setInterval(fetchMetrics, pollInterval);
        return function() {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [
        fetchMetrics,
        pollInterval
    ]);
    return {
        data: data,
        loaded: loaded,
        error: error,
        metricsAvailable: metricsAvailable
    };
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

/***/ "./utils/prometheusQueries.ts"
/*!************************************!*\
  !*** ./utils/prometheusQueries.ts ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   latencyPercentileQuery: () => (/* binding */ latencyPercentileQuery),
/* harmony export */   latencyPercentileRangeQuery: () => (/* binding */ latencyPercentileRangeQuery),
/* harmony export */   requestRateQuery: () => (/* binding */ requestRateQuery),
/* harmony export */   statusCodeRateQuery: () => (/* binding */ statusCodeRateQuery),
/* harmony export */   statusCodeRateRangeQuery: () => (/* binding */ statusCodeRateRangeQuery),
/* harmony export */   successRateQuery: () => (/* binding */ successRateQuery),
/* harmony export */   trafficOverTimeQuery: () => (/* binding */ trafficOverTimeQuery)
/* harmony export */ });
/**
 * PromQL query builders for Envoy sidecar metrics.
 * These target the metrics already scraped by RHCL user-workload monitoring.
 */ function requestRateQuery(namespace, name, kind) {
    var window = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : '5m';
    if (kind === 'Gateway') {
        return 'sum(rate(envoy_http_downstream_rq_total{namespace="'.concat(namespace, '", gateway_name="').concat(name, '"}[').concat(window, "]))");
    }
    return 'sum(rate(envoy_http_downstream_rq_total{namespace="'.concat(namespace, '", route_name="').concat(name, '"}[').concat(window, "]))");
}
function statusCodeRateQuery(namespace, name, kind, codeClass) {
    var window = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : '5m';
    var codePattern = codeClass === '2xx' ? '2..' : codeClass === '4xx' ? '4..' : '5..';
    var labelKey = kind === 'Gateway' ? 'gateway_name' : 'route_name';
    return 'sum(rate(envoy_http_downstream_rq_total{namespace="'.concat(namespace, '", ').concat(labelKey, '="').concat(name, '", envoy_response_code=~"').concat(codePattern, '"}[').concat(window, "]))");
}
function latencyPercentileQuery(namespace, name, kind, percentile) {
    var window = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : '5m';
    var labelKey = kind === 'Gateway' ? 'gateway_name' : 'route_name';
    return "histogram_quantile(".concat(percentile, ', sum(rate(envoy_http_downstream_rq_time_bucket{namespace="').concat(namespace, '", ').concat(labelKey, '="').concat(name, '"}[').concat(window, "])) by (le))");
}
function successRateQuery(namespace, name, kind) {
    var window = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : '5m';
    var labelKey = kind === 'Gateway' ? 'gateway_name' : 'route_name';
    var base = 'envoy_http_downstream_rq_total{namespace="'.concat(namespace, '", ').concat(labelKey, '="').concat(name, '"}');
    return "sum(rate(".concat(base.replace('}', ', envoy_response_code=~"[23].."}'), "[").concat(window, "])) / sum(rate(").concat(base, "[").concat(window, "])) * 100");
}
function trafficOverTimeQuery(namespace, name, kind) {
    var window = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : '5m';
    var labelKey = kind === 'Gateway' ? 'gateway_name' : 'route_name';
    return 'sum(rate(envoy_http_downstream_rq_total{namespace="'.concat(namespace, '", ').concat(labelKey, '="').concat(name, '"}[').concat(window, "]))");
}
function statusCodeRateRangeQuery(namespace, name, kind, codeClass) {
    var window = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : '5m';
    var codePattern = codeClass === '2xx' ? '2..' : codeClass === '4xx' ? '4..' : '5..';
    var labelKey = kind === 'Gateway' ? 'gateway_name' : 'route_name';
    return 'sum(rate(envoy_http_downstream_rq_total{namespace="'.concat(namespace, '", ').concat(labelKey, '="').concat(name, '", envoy_response_code=~"').concat(codePattern, '"}[').concat(window, "]))");
}
function latencyPercentileRangeQuery(namespace, name, kind, percentile) {
    var window = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : '5m';
    var labelKey = kind === 'Gateway' ? 'gateway_name' : 'route_name';
    return "histogram_quantile(".concat(percentile, ', sum(rate(envoy_http_downstream_rq_time_bucket{namespace="').concat(namespace, '", ').concat(labelKey, '="').concat(name, '"}[').concat(window, "])) by (le))");
}


/***/ }

}]);
//# sourceMappingURL=components_common_TrafficChart_tsx-hooks_usePrometheusTraffic_ts-models_index_ts-utils_hostna-bac171-chunk.js.map