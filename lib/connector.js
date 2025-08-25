"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MqttContext = void 0;
exports["default"] = Connector;
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
// Context creation to provide MQTT client and status
var MqttContext = exports.MqttContext = /*#__PURE__*/(0, _react.createContext)(null);

// Functional component that acts as the Connector
function Connector(_ref) {
  var mqqt = _ref.mqqt,
    mqttProps = _ref.mqttProps,
    children = _ref.children;
  var _useState = (0, _react.useState)(null),
    _useState2 = _slicedToArray(_useState, 2),
    mqttClient = _useState2[0],
    setMqttClient = _useState2[1];
  var _useState3 = (0, _react.useState)('disconnected'),
    _useState4 = _slicedToArray(_useState3, 2),
    mqttStatus = _useState4[0],
    setMqttStatus = _useState4[1];

  // useEffect hook to handle connection and disconnection logic
  (0, _react.useEffect)(function () {
    if (!mqttProps) {
      console.error("[MQTT] [CONNECTOR] mqttProps are not provided.");
      return;
    }
    var client = _mqtt["default"].connect(mqttProps);
    console.log("[MQTT] [CONNECTOR] Client created:", client);
    setMqttClient(client);

    // Event handlers
    var handleStatusChange = function handleStatusChange(status) {
      return function () {
        // console.log(`[MQTT] [CONNECTOR] Status changed to: ${status}`);
        setMqttStatus(status);
      };
    };
    client.on('connect', handleStatusChange('connected'));
    client.on('reconnect', handleStatusChange('reconnect'));
    client.on('close', handleStatusChange('closed'));
    client.on('offline', handleStatusChange('offline'));
    client.on('error', function (err) {
      // console.error("[MQTT] [CONNECTOR] Error:", err);
      handleStatusChange('error')();
    });

    // Cleanup function for component unmount
    return function () {
      console.log("[MQTT] [CONNECTOR] Cleaning up client connection.");
      if (client) {
        client.end();
        client.off('connect', handleStatusChange('connected'));
        client.off('reconnect', handleStatusChange('reconnect'));
        client.off('close', handleStatusChange('closed'));
        client.off('offline', handleStatusChange('offline'));
        client.off('error', function () {});
      }
    };
  }, [mqttProps]);
  var contextValue = {
    mqtt: mqttClient,
    mqttStatus: mqttStatus
  };

  // The context provider wraps the children
  return /*#__PURE__*/_react["default"].createElement(MqttContext.Provider, {
    value: contextValue
  }, children);
}

// Prop types for the functional component
Connector.propTypes = {
  mqqt: _propTypes["default"].object,
  mqttProps: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].object]),
  children: _propTypes["default"].element.isRequired
};