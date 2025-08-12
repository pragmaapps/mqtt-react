"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = subscribe;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _object = _interopRequireDefault(require("object.omit"));
var _connector = require("./connector");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
    newData = _objectSpread({}, state.data);
  } else {
    newData = _objectSpread(_objectSpread({}, item), state.data);
  }
  if (_isMounted && topic !== "isx/stream/file/stats/get" && topic !== "isx/adp/adp/stats/get" && topic !== "isx/sensor/status/info/get") {
    this.setState({
      data: newData
    });
  }
}
;
function subscribe() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    dispatch: defaultDispatch
  };
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
          newData = _objectSpread({}, dataRef.current);
        } else {
          newData = _objectSpread(_objectSpread({}, item), dataRef.current);
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
          var newData = _objectSpread({}, prevData);
          delete newData[topicToDelete];
          return newData;
        });
      };
      return /*#__PURE__*/_react["default"].createElement(TargetComponent, _extends({}, (0, _object["default"])(props, 'client'), {
        data: data,
        mqtt: client,
        deleteTopic: deleteTopic
      }));
    };
    MQTTSubscriber.propTypes = {
      client: _propTypes["default"].object
    };
    return MQTTSubscriber;
  };
}