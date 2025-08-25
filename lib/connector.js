"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _mqtt = _interopRequireDefault(require("mqtt"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Connector extends _react.Component {
  static propTypes = {
    mqqt: _propTypes.default.object,
    mqttProps: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.object]),
    children: _propTypes.default.element.isRequired
  };
  static childContextTypes = {
    mqtt: _propTypes.default.object,
    mqttStatus: _propTypes.default.string
  };
  constructor(props, context) {
    super(props, context);
    const initialState = {};
    this.state = initialState;
  }
  getChildContext() {
    return {
      mqtt: this.mqtt,
      mqttStatus: this.state.mqttStatus
    };
  }
  componentWillMount() {
    console.log('[Connector] componentWillMount');
    const {
      mqttProps,
      mqtt
    } = this.props;
    console.log('[Connector] mqttProps', mqttProps);
    this.mqtt = mqtt ? mqtt : _mqtt.default.connect(mqttProps);
    this.mqtt.on('connect', this._makeStatusHandler('connected'));
    this.mqtt.on('reconnect', this._makeStatusHandler('reconnect'));
    this.mqtt.on('close', this._makeStatusHandler('closed'));
    this.mqtt.on('offline', this._makeStatusHandler('offline'));
    this.mqtt.on('error', console.error);
  }
  componentWillUnmount() {
    console.log('[Connector] componentWillUnmount');
    // this.mqtt.end();
  }
  _makeStatusHandler = status => {
    return () => {
      this.setState({
        mqttStatus: status
      });
    };
  };
  render() {
    return this.renderConnected();
  }
  renderConnected() {
    return _react.Children.only(this.props.children);
  }
}
exports.default = Connector;