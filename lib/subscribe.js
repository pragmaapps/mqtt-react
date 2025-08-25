"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = subscribe;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _object = _interopRequireDefault(require("object.omit"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function parse(message) {
  try {
    const item = JSON.parse(message);
    return item;
  } catch (e) {
    return message.toString();
  }
}
function defaultDispatch(topic, message, packet) {
  const {
    state,
    _isMounted
  } = this;
  const m = parse(message);
  const item = [];
  let newData = {};
  item[topic] = m;
  if (typeof state.data[topic] !== 'undefined') {
    state.data[topic] = item[topic];
    newData = {
      ...state.data
    };
  } else {
    newData = {
      ...item,
      ...state.data
    };
  }
  if (_isMounted && topic !== "isx/stream/file/stats/get" && topic !== "isx/adp/adp/stats/get" && topic !== "isx/sensor/status/info/get") {
    this.setState({
      data: newData
    });
  }
}
;
function subscribe(opts = {
  dispatch: defaultDispatch
}) {
  const {
    topic
  } = opts;
  const dispatch = opts.dispatch ? opts.dispatch : defaultDispatch;
  return TargetComponent => {
    class MQTTSubscriber extends _react.Component {
      static propTypes = {
        client: _propTypes.default.object
      };
      static contextTypes = {
        mqtt: _propTypes.default.object
      };
      constructor(props, context) {
        super(props, context);
        this.client = props.client || context.mqtt;
        this.state = {
          subscribed: false,
          data: {}
        };
        this._isMounted = false;
        this.handler = dispatch.bind(this);
        this.client.on('message', this.handler);
      }

      //needs to verify the solution of use componentDidMount over componentWillMount
      // componentWillMount() {
      //     console.log('[SUBSCRIBE] MQTTSubscriber componentWillMount method');
      //     this.subscribe();
      // }

      componentDidMount() {
        this._isMounted = true;
        this.subscribe();
      }
      componentWillUnmount() {
        this._isMounted = false;
        this.unsubscribe();
      }
      deleteTopic(topic) {
        console.log(topic);
        let {
          data
        } = this.state;
        delete data[topic];
        this.setState({
          data
        });
      }
      render() {
        return /*#__PURE__*/(0, _react.createElement)(TargetComponent, {
          ...(0, _object.default)(this.props, 'client'),
          data: this.state.data,
          mqtt: this.client,
          deleteTopic: this.deleteTopic.bind(this)
        });
      }
      subscribe() {
        if (this._isMounted) {
          if (Array.isArray(topic)) {
            topic.map((t, key) => {
              this.client.subscribe(t);
              this.setState({
                subscribed: true
              });
            });
          } else {
            this.client.subscribe(topic);
            this.setState({
              subscribed: true
            });
          }
        }
      }
      unsubscribe() {
        if (this._isMounted) {
          this.client.unsubscribe(topic);
          this.setState({
            subscribed: false
          });
        }
      }
    }
    return MQTTSubscriber;
  };
}