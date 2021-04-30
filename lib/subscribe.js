"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = subscribe;

var _react = require("react");

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _object = require("object.omit");

var _object2 = _interopRequireDefault(_object);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function parse(message) {
    // console.log('[SUBSCRIBE] function parse');
    // console.log('[SUBSCRIBE] function parse message', message);
    try {
        var item = JSON.parse(message);
        // console.log('[SUBSCRIBE] function parse item', item);
        return item;
    } catch (e) {
        // console.log('[SUBSCRIBE] function parse catch block');
        return message.toString();
    }
}

function defaultDispatch(topic, message, packet) {
    // console.log('[SUBSCRIBE] defaultDispatch function');
    // console.log('[SUBSCRIBE] defaultDispatch function topic', topic);
    // console.log('[SUBSCRIBE] defaultDispatch function message', message);
    // console.log('[SUBSCRIBE] defaultDispatch function packet', packet);
    var state = this.state,
        _isMounted = this._isMounted;
    // console.log('[SUBSCRIBE] defaultDispatch function this', this);
    // console.log('[SUBSCRIBE] defaultDispatch function state', state);

    var m = parse(message);
    // console.log('[SUBSCRIBE] defaultDispatch function m', m);
    var item = [];
    var newData = {};
    item[topic] = m;
    // console.log('[SUBSCRIBE] defaultDispatch function item', item);
    if (typeof state.data[topic] !== 'undefined') {
        // console.log('[SUBSCRIBE] defaultDispatch function if topic of data is not undefined');
        state.data[topic] = item[topic];
        // console.log('[SUBSCRIBE] defaultDispatch function if topic of data is not undefined state.data[topic]', state.data[topic]);
        newData = _extends({}, state.data);
        // console.log('[SUBSCRIBE] defaultDispatch function if topic of data is not undefined newData', newData);
    } else {
        // console.log('[SUBSCRIBE] defaultDispatch function if undefined');
        newData = _extends({}, item, state.data);
        // console.log('[SUBSCRIBE] defaultDispatch function newData', newData);
    }
    if (_isMounted) {
        this.setState({ data: newData });
    }
};

function subscribe() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { dispatch: defaultDispatch };

    // console.log('[SUBSCRIBE] subscribe function');
    // console.log('[SUBSCRIBE] subscribe function opts', opts);
    var topic = opts.topic;
    // console.log('[SUBSCRIBE] subscribe function topic', topic);

    var dispatch = opts.dispatch ? opts.dispatch : defaultDispatch;
    // console.log('[SUBSCRIBE] subscribe function dispatch', dispatch);

    return function (TargetComponent) {
        var MQTTSubscriber = function (_Component) {
            _inherits(MQTTSubscriber, _Component);

            function MQTTSubscriber(props, context) {
                _classCallCheck(this, MQTTSubscriber);

                var _this = _possibleConstructorReturn(this, (MQTTSubscriber.__proto__ || Object.getPrototypeOf(MQTTSubscriber)).call(this, props, context));

                _this.client = props.client || context.mqtt;
                _this.state = {
                    subscribed: false,
                    data: {}
                };
                _this._isMounted = false;
                _this.handler = dispatch.bind(_this);
                _this.client.on('message', _this.handler);
                return _this;
            }

            //needs to verify the solution of use componentDidMount over componentWillMount
            // componentWillMount() {
            //     console.log('[SUBSCRIBE] MQTTSubscriber componentWillMount method');
            //     this.subscribe();
            // }

            _createClass(MQTTSubscriber, [{
                key: "componentDidMount",
                value: function componentDidMount() {
                    this._isMounted = true;
                    // console.log('[MQTTSubscriber] MQTTSubscriber componentDidMount method');
                    this.subscribe();
                }
            }, {
                key: "componentWillUnmount",
                value: function componentWillUnmount() {
                    this._isMounted = false;
                    // console.log('[MQTTSubscriber] MQTTSubscriber componentWillUnmount method');
                    this.unsubscribe();
                }
            }, {
                key: "render",
                value: function render() {
                    // console.log('[SUBSCRIBE] MQTTSubscriber class TargetComponent', TargetComponent);
                    return (0, _react.createElement)(TargetComponent, _extends({}, (0, _object2.default)(this.props, 'client'), {
                        data: this.state.data,
                        mqtt: this.client
                    }));
                }
            }, {
                key: "subscribe",
                value: function subscribe() {
                    var _this2 = this;

                    // console.log('[SUBSCRIBE] MQTTSubscriber client', this.client);
                    // console.log('[MQTTSubscriber] MQTTSubscriber topic', topic);
                    if (this._isMounted) {
                        if (Array.isArray(topic)) {
                            // console.log('[SUBSCRIBE] MQTTSubscriber class subscribe method if topic is Array', topic);
                            topic.map(function (t, key) {
                                _this2.client.subscribe(t);
                                _this2.setState({ subscribed: true });
                            });
                        } else {
                            // console.log('[SUBSCRIBE] MQTTSubscriber class subscribe method else this.client', this.client);
                            this.client.subscribe(topic);
                            this.setState({ subscribed: true });
                        }
                    }
                }
            }, {
                key: "unsubscribe",
                value: function unsubscribe() {
                    if (this._isMounted) {
                        // console.log('[MQTTSubscriber] MQTTSubscriber topic', topic);
                        this.client.unsubscribe(topic);
                        // console.log('[SUBSCRIBE] MQTTSubscriber client', this.client);
                        this.setState({ subscribed: false });
                    }
                }
            }]);

            return MQTTSubscriber;
        }(_react.Component);

        MQTTSubscriber.propTypes = {
            client: _propTypes2.default.object
        };
        MQTTSubscriber.contextTypes = {
            mqtt: _propTypes2.default.object
        };

        return MQTTSubscriber;
    };
}