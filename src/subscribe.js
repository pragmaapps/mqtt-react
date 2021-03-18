import { Component, createElement } from "react";
import PropTypes from "prop-types";
import omit from "object.omit";


function parse(message) {
    // console.log('[SUBSCRIBE] function parse');
    // console.log('[SUBSCRIBE] function parse message', message);
    try {
        const item = JSON.parse(message);
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
    const { state } = this;
    // console.log('[SUBSCRIBE] defaultDispatch function this', this);
    // console.log('[SUBSCRIBE] defaultDispatch function state', state);
    const m = parse(message);
    // console.log('[SUBSCRIBE] defaultDispatch function m', m);
    const item = [];
    let newData = {};
    item[topic] = m;
    // console.log('[SUBSCRIBE] defaultDispatch function item', item);
    if (typeof state.data[topic] !== 'undefined') {
        // console.log('[SUBSCRIBE] defaultDispatch function if topic of data is not undefined');
        state.data[topic] = item[topic];
        // console.log('[SUBSCRIBE] defaultDispatch function if topic of data is not undefined state.data[topic]', state.data[topic]);
        newData = {
            ...state.data
        };
        // console.log('[SUBSCRIBE] defaultDispatch function if topic of data is not undefined newData', newData);
    } else {
        // console.log('[SUBSCRIBE] defaultDispatch function if undefined');
        newData = {
            ...item,
            ...state.data
        };
        // console.log('[SUBSCRIBE] defaultDispatch function newData', newData);
    }
    this.setState({ data: newData });
};


export default function subscribe(opts = { dispatch: defaultDispatch }) {
    // console.log('[SUBSCRIBE] subscribe function');
    // console.log('[SUBSCRIBE] subscribe function opts', opts);
    const { topic } = opts;
    // console.log('[SUBSCRIBE] subscribe function topic', topic);
    const dispatch = (opts.dispatch) ? opts.dispatch : defaultDispatch;
    // console.log('[SUBSCRIBE] subscribe function dispatch', dispatch);

    return (TargetComponent) => {

        class MQTTSubscriber extends Component {
            static propTypes = {
                client: PropTypes.object
            }
            static contextTypes = {
                mqtt: PropTypes.object
            };

            constructor(props, context) {
                super(props, context);

                this.client = props.client || context.mqtt;
                this.state = {
                    subscribed: false,
                    data: {},
                };
                this.handler = dispatch.bind(this)
                this.client.on('message', this.handler);
            }

            componentDidMount() {
                console.log('[SUBSCRIBE] MQTTSubscriber class componentWillMount method');
                this.subscribe();
            }

            componentWillUnmount() {
                console.log('[SUBSCRIBE] MQTTSubscriber class componentWillUnmount method');
                this.unsubscribe();
            }

            render() {
                // console.log('[SUBSCRIBE] MQTTSubscriber class TargetComponent', TargetComponent);
                return createElement(TargetComponent, {
                    ...omit(this.props, 'client'),
                    data: this.state.data,
                    mqtt: this.client
                });
            }

            subscribe() {
                console.log('[SUBSCRIBE] MQTTSubscriber class subscribe method');
                console.log('[SUBSCRIBE] MQTTSubscriber class subscribe method client', this.client);
                console.log('[SUBSCRIBE] MQTTSubscriber class subscribe method topic', topic);
                if (Array.isArray(topic)) {
                    // console.log('[SUBSCRIBE] MQTTSubscriber class subscribe method if topic is Array', topic);
                    topic.map((t, key) => {
                        this.client.subscribe(t);
                        this.setState({ subscribed: true });
                    });
                } else {
                    // console.log('[SUBSCRIBE] MQTTSubscriber class subscribe method else this.client', this.client);
                    this.client.subscribe(topic);
                    this.setState({ subscribed: true });
                }
            }

            unsubscribe() {
                console.log('[SUBSCRIBE] MQTTSubscriber class unsubscribe method');
                console.log('[SUBSCRIBE] MQTTSubscriber class unsubscribe method topic', topic);
                this.client.unsubscribe(topic);
                console.log('[SUBSCRIBE] MQTTSubscriber class unsubscribe method client', this.client);
                this.setState({ subscribed: false });
            }

        }
        return MQTTSubscriber;
    }
}