'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MqttContext = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _mqtt = require('mqtt');

var _mqtt2 = _interopRequireDefault(_mqtt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MqttContext = exports.MqttContext = (0, _react.createContext)({
  mqtt: null,
  mqttStatus: null
});

var Connector = function Connector(_ref) {
  var mqttProps = _ref.mqttProps,
      mqtt = _ref.mqtt,
      children = _ref.children;

  var _useState = (0, _react.useState)(null),
      _useState2 = _slicedToArray(_useState, 2),
      mqttStatus = _useState2[0],
      setMqttStatus = _useState2[1];

  var mqttRef = (0, _react.useRef)(null);

  (0, _react.useEffect)(function () {
    console.log('[Connector] initializing MQTT connection');
    var client = mqtt ? mqtt : _mqtt2.default.connect(mqttProps);
    mqttRef.current = client;

    var handleStatus = function handleStatus(status) {
      return function () {
        setMqttStatus(status);
      };
    };

    client.on('connect', handleStatus('connected'));
    client.on('reconnect', handleStatus('reconnect'));
    client.on('close', handleStatus('closed'));
    client.on('offline', handleStatus('offline'));
    client.on('error', console.error);

    return function () {
      console.log('[Connector] cleaning up MQTT connection');
      // Uncomment below if you want to close connection on unmount
      // client.end();
    };
  }, [mqttProps, mqtt]);

  return _react2.default.createElement(
    MqttContext.Provider,
    {
      value: { mqtt: mqttRef.current, mqttStatus: mqttStatus }
    },
    children
  );
};

Connector.propTypes = {
  mqtt: _propTypes2.default.object,
  mqttProps: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object]),
  children: _propTypes2.default.element.isRequired
};

exports.default = Connector;