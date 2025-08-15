"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = subscribe;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _lodash = require("lodash");
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
function subscribe(opts = {}) {
  const {
    topic
  } = opts;
  return TargetComponent => {
    const MQTTSubscriber = props => {
      const {
        mqtt: contextClient
      } = (0, _react.useContext)(_connector.MqttContext);
      const client = props.client || contextClient;
      const [data, setData] = (0, _react.useState)({});

      // `messageHandler` फ़ंक्शन को memoize करने के लिए `useCallback` का उपयोग।
      // इससे यह हर रेंडर पर दोबारा नहीं बनेगा।
      const messageHandler = (0, _react.useCallback)((msgTopic, message) => {
        const parsedMessage = parse(message);

        // कुछ खास topics के messages को ignore करें।
        if (["isx/stream/file/stats/get", "isx/adp/adp/stats/get", "isx/sensor/status/info/get"].includes(msgTopic)) {
          return;
        }
        setData(prevData => ({
          ...prevData,
          [msgTopic]: parsedMessage
        }));
      }, []);

      // Subscription और cleanup logic को एक ही `useEffect` hook में।
      (0, _react.useEffect)(() => {
        // अगर client उपलब्ध नहीं है, तो कुछ न करें।
        if (!client) return;

        // Topic(s) को subscribe करें।
        const topicsToSubscribe = Array.isArray(topic) ? topic : [topic];
        topicsToSubscribe.forEach(t => client.subscribe(t));

        // `message` event listener जोड़ें।
        client.on('message', messageHandler);

        // Cleanup फ़ंक्शन जो component unmount होने पर चलता है।
        return () => {
          // Topics से unsubscribe करें।
          topicsToSubscribe.forEach(t => client.unsubscribe(t));
          // `message` event listener हटाएँ।
          client.off('message', messageHandler);
        };
      }, [client, topic, messageHandler]);
      const deleteTopic = (0, _react.useCallback)(topicToDelete => {
        setData(prevData => (0, _lodash.omit)(prevData, [topicToDelete]));
      }, []);

      // Props को memoize करने के लिए `useMemo` का उपयोग।
      // यह `TargetComponent` के अनावश्यक re-renders को रोकता है।
      const componentProps = (0, _react.useMemo)(() => ({
        ...(0, _lodash.omit)(props, 'client'),
        data: data,
        mqtt: client,
        deleteTopic: deleteTopic
      }), [props, data, client, deleteTopic]);
      return /*#__PURE__*/_react.default.createElement(TargetComponent, componentProps);
    };
    MQTTSubscriber.propTypes = {
      client: _propTypes.default.object
    };
    return MQTTSubscriber;
  };
}