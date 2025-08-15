"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MqttContext = void 0;
exports.default = Connector;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _mqtt = _interopRequireDefault(require("mqtt"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Context creation to provide MQTT client and status
const MqttContext = exports.MqttContext = /*#__PURE__*/(0, _react.createContext)(null);

// Functional component that acts as the Connector
function Connector({
  mqqt,
  mqttProps,
  children
}) {
  const [mqttClient, setMqttClient] = (0, _react.useState)(null);
  const [mqttStatus, setMqttStatus] = (0, _react.useState)('disconnected');

  // useEffect hook to handle connection and disconnection logic
  (0, _react.useEffect)(() => {
    if (!mqttProps) {
      console.error("[MQTT] [CONNECTOR] mqttProps are not provided.");
      return;
    }

    // MQTT v5 ke anusaar connect function ka upyog
    const client = _mqtt.default.connect(mqttProps);
    console.log("[MQTT] [CONNECTOR] Client created:", client);
    setMqttClient(client);

    // Event handlers
    const handleStatusChange = status => () => {
      console.log(`[MQTT] [CONNECTOR] Status changed to: ${status}`);
      setMqttStatus(status);
    };
    client.on('connect', handleStatusChange('connected'));
    client.on('reconnect', handleStatusChange('reconnect'));
    client.on('close', handleStatusChange('closed'));
    client.on('offline', handleStatusChange('offline'));
    client.on('error', err => {
      console.error("[MQTT] [CONNECTOR] Error:", err);
      handleStatusChange('error')();
    });

    // Cleanup function for component unmount
    return () => {
      console.log("[MQTT] [CONNECTOR] Cleaning up client connection.");
      if (client) {
        // Client ko disconnect karne ke liye end() method ka upyog karein
        client.end();
        // Event listeners ko hatana
        client.off('connect', handleStatusChange('connected'));
        client.off('reconnect', handleStatusChange('reconnect'));
        client.off('close', handleStatusChange('closed'));
        client.off('offline', handleStatusChange('offline'));
        client.off('error', () => {});
      }
    };
  }, [mqttProps]); // Dependency array mein mqttProps ko shamil karna

  // Context value ko dynamically banana
  const contextValue = {
    mqtt: mqttClient,
    mqttStatus: mqttStatus
  };

  // The context provider wraps the children
  return /*#__PURE__*/_react.default.createElement(MqttContext.Provider, {
    value: contextValue
  }, children);
}

// Prop types for the functional component
Connector.propTypes = {
  mqqt: _propTypes.default.object,
  mqttProps: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.object]),
  children: _propTypes.default.element.isRequired
};