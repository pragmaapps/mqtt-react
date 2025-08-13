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
console.log("[MQTT] [CONNECTOR] LINK Upgrade outside function : ", _mqtt.default);
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
  const _makeStatusHandler = status => {
    console.log(`[MQTT] [CONNECTOR] Status changed to: ${status}`);
    return () => {
      setMqttStatus(status);
    };
  };
  const componentWillMount = () => {
    console.log("[MQTT] [CONNECTOR] mqttProps : ", mqttProps);
    const client = mqqt || _mqtt.default.connect(mqttProps);
    setMqttClient(client);
    client.on('connect', _makeStatusHandler('connected'));
    client.on('reconnect', _makeStatusHandler('reconnect'));
    client.on('close', _makeStatusHandler('closed'));
    client.on('offline', _makeStatusHandler('offline'));
    client.on('error', console.error);
    return client;
  };
  const componentWillUnmount = client => {
    if (client) {
      client.end();
      client.off('connect', _makeStatusHandler('connected'));
      client.off('reconnect', _makeStatusHandler('reconnect'));
      client.off('close', _makeStatusHandler('closed'));
      client.off('offline', _makeStatusHandler('offline'));
    }
  };

  // useEffect hook replaces componentWillMount and componentWillUnmount
  (0, _react.useEffect)(() => {
    const client = componentWillMount();
    return () => {
      componentWillUnmount(client);
    };
  }, [mqqt, mqttProps]);
  const getChildContext = () => {
    return {
      mqtt: mqttClient,
      mqttStatus: mqttStatus
    };
  };
  const renderConnected = () => {
    return _react.default.Children.only(children);
  };
  const render = () => {
    return renderConnected();
  };

  // The context provider wraps the children, making the context available
  return /*#__PURE__*/_react.default.createElement(MqttContext.Provider, {
    value: getChildContext()
  }, render());
}

// Prop types for the functional component
Connector.propTypes = {
  mqqt: _propTypes.default.object,
  mqttProps: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.object]),
  children: _propTypes.default.element.isRequired
};