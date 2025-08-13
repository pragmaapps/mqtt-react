"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = subscribe;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _object = _interopRequireDefault(require("object.omit"));
var _connector = require("./connector");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function parse(message) {
  try {
    const item = JSON.parse(message);
    return item;
  } catch (e) {
    return message.toString();
  }
}
function defaultDispatch(topic, message, packet) {
  const m = parse(message);
  let newData = {};
  const item = {
    [topic]: m
  };

  // Yahan pe `this.state` ko `useState` hook ke state se replace kiya gaya hai.
  // Isliye hum functional update ka use kar rahe hain.
  // Yeh code ab seedhe `defaultDispatch` ke andar nahi chal sakta.
  // Iski logic ko `useEffect` hook ke andar daal diya gaya hai.
}
function subscribe(opts = {
  dispatch: defaultDispatch
}) {
  const {
    topic
  } = opts;
  // Dispatch function ko ab seedha use nahi kiya ja raha, iski logic hook mein hai.
  // const dispatch = (opts.dispatch) ? opts.dispatch : defaultDispatch;

  return TargetComponent => {
    const MQTTSubscriber = props => {
      const {
        mqtt
      } = (0, _react.useContext)(_connector.MqttContext);
      const client = props.client || mqtt;
      const [state, setState] = (0, _react.useState)({
        subscribed: false,
        data: {}
      });

      // Class component ke `_isMounted` ko `useRef` se ya ek boolean flag se simulate kiya ja sakta hai,
      // lekin `useEffect` ka cleanup function iski zaroorat ko khatam kar deta hai.
      // Hum directly iski zaroorat nahi rakhte.

      const handler = (msgTopic, message, packet) => {
        const m = parse(message);
        setState(prevState => {
          if (msgTopic === "isx/stream/file/stats/get" || msgTopic === "isx/adp/adp/stats/get" || msgTopic === "isx/sensor/status/info/get") {
            return prevState;
          }
          const newData = {
            ...prevState.data,
            [msgTopic]: m
          };
          return {
            ...prevState,
            data: newData
          };
        });
      };
      const subscribeMethod = () => {
        if (client) {
          if (Array.isArray(topic)) {
            topic.forEach(t => client.subscribe(t));
          } else {
            client.subscribe(topic);
          }
          setState(prevState => ({
            ...prevState,
            subscribed: true
          }));
        }
      };
      const unsubscribeMethod = () => {
        if (client) {
          client.unsubscribe(topic);
          setState(prevState => ({
            ...prevState,
            subscribed: false
          }));
        }
      };
      (0, _react.useEffect)(() => {
        if (client) {
          client.on('message', handler);
          subscribeMethod();
        }
        return () => {
          if (client) {
            client.off('message', handler);
            unsubscribeMethod();
          }
        };
      }, [client, topic]);
      const deleteTopic = topicToDelete => {
        setState(prevState => {
          const newData = {
            ...prevState.data
          };
          delete newData[topicToDelete];
          return {
            ...prevState,
            data: newData
          };
        });
      };
      const render = () => {
        const componentProps = {
          ...(0, _object.default)(props, 'client'),
          data: state.data,
          mqtt: client,
          deleteTopic: deleteTopic
        };
        return /*#__PURE__*/_react.default.createElement(TargetComponent, componentProps);
      };
      return render();
    };
    MQTTSubscriber.propTypes = {
      client: _propTypes.default.object
    };
    return MQTTSubscriber;
  };
}