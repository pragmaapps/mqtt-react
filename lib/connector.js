"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.MQTTContext = void 0;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _mqtt = _interopRequireDefault(require("mqtt"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var MQTTContext = exports.MQTTContext = /*#__PURE__*/(0, _react.createContext)({
  mqtt: null,
  mqttStatus: ''
});
var Connector = function Connector(_ref) {
  var mqttProp = _ref.mqtt,
    mqttProps = _ref.mqttProps,
    children = _ref.children;
  var _useState = (0, _react.useState)(''),
    _useState2 = _slicedToArray(_useState, 2),
    mqttStatus = _useState2[0],
    setMqttStatus = _useState2[1];
  var _useState3 = (0, _react.useState)(null),
    _useState4 = _slicedToArray(_useState3, 2),
    mqtt = _useState4[0],
    setMqtt = _useState4[1];
  (0, _react.useEffect)(function () {
    var client = mqttProp ? mqttProp : _mqtt["default"].connect(mqttProps);
    console.log("[Connector][MQTT CLIENT] [UPGRADE] : ", mqttProps);
    var makeStatusHandler = function makeStatusHandler(status) {
      return function () {
        setMqttStatus(status);
      };
    };
    client.on('connect', makeStatusHandler('connected'));
    client.on('reconnect', makeStatusHandler('reconnect'));
    client.on('close', makeStatusHandler('closed'));
    client.on('offline', makeStatusHandler('offline'));
    client.on('error', console.error);
    setMqtt(client);
    return function () {
      // client.end(); // Uncomment if you want to close connection on unmount
    };
  }, [mqttProp, mqttProps]);
  return /*#__PURE__*/_react["default"].createElement(MQTTContext.Provider, {
    value: {
      mqtt: mqtt,
      mqttStatus: mqttStatus
    }
  }, _react.Children.only(children));
};
Connector.propTypes = {
  mqtt: _propTypes["default"].object,
  mqttProps: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].object]),
  children: _propTypes["default"].element.isRequired
};
var _default = exports["default"] = Connector;