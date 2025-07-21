'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = subscribe;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _object = require('object.omit');

var _object2 = _interopRequireDefault(_object);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function parse(message) {
  try {
    return JSON.parse(message);
  } catch (e) {
    return message.toString();
  }
}

function defaultDispatch(topic, message, packet, setData, getDataRef) {
  var parsed = parse(message);
  var newTopicData = _defineProperty({}, topic, parsed);

  var existingData = getDataRef.current;
  var newData = void 0;

  if (typeof existingData[topic] !== 'undefined') {
    existingData[topic] = parsed;
    newData = _extends({}, existingData);
  } else {
    newData = _extends({}, newTopicData, existingData);
  }

  if (topic !== 'isx/stream/file/stats/get' && topic !== 'isx/adp/adp/stats/get' && topic !== 'isx/sensor/status/info/get') {
    setData(newData);
  }
}

function subscribe() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { dispatch: defaultDispatch };
  var topic = opts.topic,
      _opts$dispatch = opts.dispatch,
      dispatch = _opts$dispatch === undefined ? defaultDispatch : _opts$dispatch;


  return function withSubscription(TargetComponent) {
    var MQTTSubscriber = function MQTTSubscriber(props) {
      var context = (0, _react.useContext)(_react2.default.createContext()); // fallback context
      var client = props.client || context.mqtt;

      var _useState = (0, _react.useState)({}),
          _useState2 = _slicedToArray(_useState, 2),
          data = _useState2[0],
          setData = _useState2[1];

      var _useState3 = (0, _react.useState)(false),
          _useState4 = _slicedToArray(_useState3, 2),
          subscribed = _useState4[0],
          setSubscribed = _useState4[1];

      var getDataRef = _react2.default.useRef(data);
      getDataRef.current = data;

      (0, _react.useEffect)(function () {
        if (!client) return;

        var handler = function handler(t, message, packet) {
          dispatch(t, message, packet, setData, getDataRef);
        };

        client.on('message', handler);

        var subscribeTopics = function subscribeTopics() {
          if (Array.isArray(topic)) {
            topic.forEach(function (t) {
              return client.subscribe(t);
            });
          } else {
            client.subscribe(topic);
          }
          setSubscribed(true);
        };

        var unsubscribeTopics = function unsubscribeTopics() {
          if (Array.isArray(topic)) {
            topic.forEach(function (t) {
              return client.unsubscribe(t);
            });
          } else {
            client.unsubscribe(topic);
          }
          setSubscribed(false);
        };

        subscribeTopics();

        return function () {
          unsubscribeTopics();
          client.off('message', handler);
        };
      }, [client]);

      var deleteTopic = function deleteTopic(t) {
        var newData = _extends({}, data);
        delete newData[t];
        setData(newData);
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