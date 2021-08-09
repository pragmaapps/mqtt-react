import { Component, createElement } from "react";
import PropTypes from "prop-types";
import omit from "object.omit";


function parse(message) {
    try {
        const item = JSON.parse(message);
        return item;
    } catch (e) {
        return message.toString();
    }
}

function defaultDispatch(topic, message, packet) {
    const { state, _isMounted } = this;
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
        this.setState({ data: newData });
    }
};


export default function subscribe(opts = { dispatch: defaultDispatch }) {
    const { topic } = opts;
    const dispatch = (opts.dispatch) ? opts.dispatch : defaultDispatch;

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
                this._isMounted = false;
                this.handler = dispatch.bind(this)
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

            render() {
                return createElement(TargetComponent, {
                    ...omit(this.props, 'client'),
                    data: this.state.data,
                    mqtt: this.client
                });
            }

            subscribe() {
                if (this._isMounted) {
                    if (Array.isArray(topic)) {
                        topic.map((t, key) => {
                            this.client.subscribe(t);
                            this.setState({ subscribed: true });
                        });
                    } else {
                        this.client.subscribe(topic);
                        this.setState({ subscribed: true });
                    }
                }
            }

            unsubscribe() {
                if (this._isMounted) {
                    this.client.unsubscribe(topic);
                    this.setState({ subscribed: false });
                }
            }

        }
        return MQTTSubscriber;
    }
}