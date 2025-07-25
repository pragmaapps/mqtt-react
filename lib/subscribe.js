"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = subscribe;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _object = require("object.omit");

var _object2 = _interopRequireDefault(_object);

var _connector = require("./connector");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(message) {
    try {
        var item = JSON.parse(message);
        return item;
    } catch (e) {
        return message.toString();
    }
}

function defaultDispatch(topic, message, packet) {
    var state = this.state,
        _isMounted = this._isMounted;

    var m = parse(message);
    var item = [];
    var newData = {};
    item[topic] = m;
    if (typeof state.data[topic] !== 'undefined') {
        state.data[topic] = item[topic];
        newData = _extends({}, state.data);
    } else {
        newData = _extends({}, item, state.data);
    }
    if (_isMounted && topic !== "isx/stream/file/stats/get" && topic !== "isx/adp/adp/stats/get" && topic !== "isx/sensor/status/info/get") {
        this.setState({ data: newData });
    }
};

function subscribe() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { dispatch: defaultDispatch };
    var topic = opts.topic;

    var dispatch = opts.dispatch ? opts.dispatch : defaultDispatch;

    return function (TargetComponent) {
        var MQTTSubscriber = function MQTTSubscriber(props) {
            var contextMqtt = (0, _react.useContext)(_connector.MQTTContext).mqtt;
            var client = props.client || contextMqtt;

            var _useState = (0, _react.useState)(false),
                _useState2 = _slicedToArray(_useState, 2),
                subscribed = _useState2[0],
                setSubscribed = _useState2[1];

            var _useState3 = (0, _react.useState)({}),
                _useState4 = _slicedToArray(_useState3, 2),
                data = _useState4[0],
                setData = _useState4[1];

            var isMounted = (0, _react.useRef)(false);

            // Using a ref to hold data state for dispatch function
            var dataRef = (0, _react.useRef)(data);
            dataRef.current = data;

            // Using a ref to hold isMounted flag for dispatch function
            var isMountedRef = (0, _react.useRef)(isMounted.current);

            // Dispatch handler bound to component state and refs
            var handler = function handler(topic, message, packet) {
                var m = parse(message);
                var item = [];
                var newData = {};
                item[topic] = m;
                if (typeof dataRef.current[topic] !== 'undefined') {
                    dataRef.current[topic] = item[topic];
                    newData = _extends({}, dataRef.current);
                } else {
                    newData = _extends({}, item, dataRef.current);
                }
                if (isMountedRef.current && topic !== "isx/stream/file/stats/get" && topic !== "isx/adp/adp/stats/get" && topic !== "isx/sensor/status/info/get") {
                    setData(newData);
                }
            };

            (0, _react.useEffect)(function () {
                isMounted.current = true;
                isMountedRef.current = true;

                client.on('message', handler);

                if (Array.isArray(topic)) {
                    topic.forEach(function (t) {
                        return client.subscribe(t);
                    });
                } else {
                    client.subscribe(topic);
                }
                setSubscribed(true);

                return function () {
                    isMounted.current = false;
                    isMountedRef.current = false;

                    client.off('message', handler);
                    client.unsubscribe(topic);
                    setSubscribed(false);
                };
            }, [client, topic]);

            var deleteTopic = function deleteTopic(topicToDelete) {
                setData(function (prevData) {
                    var newData = _extends({}, prevData);
                    delete newData[topicToDelete];
                    return newData;
                });
            };

            return _react2.default.createElement(TargetComponent, _extends({}, (0, _object2.default)(props, 'client'), {
                data: data,
                mqtt: client,
                deleteTopic: deleteTopic
            }));
        };

        MQTTSubscriber.propTypes = {
            client: _propTypes2.default.object
        };

        return MQTTSubscriber;
    };
}