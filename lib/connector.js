"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MQTTContext = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _mqtt = require("mqtt");

var _mqtt2 = _interopRequireDefault(_mqtt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MQTTContext = exports.MQTTContext = (0, _react.createContext)({
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
        var client = mqttProp ? mqttProp : _mqtt2.default.connect(mqttProps);

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

    return _react2.default.createElement(
        MQTTContext.Provider,
        { value: { mqtt: mqtt, mqttStatus: mqttStatus } },
        _react.Children.only(children)
    );
};

Connector.propTypes = {
    mqtt: _propTypes2.default.object,
    mqttProps: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object]),
    children: _propTypes2.default.element.isRequired
};

exports.default = Connector;