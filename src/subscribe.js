import React, { useState, useEffect, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import omit from 'object.omit';
import { MqttContext } from './connector';

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
    const item = { [topic]: m };

    // Yahan pe `this.state` ko `useState` hook ke state se replace kiya gaya hai.
    // Isliye hum functional update ka use kar rahe hain.
    // Yeh code ab seedhe `defaultDispatch` ke andar nahi chal sakta.
    // Iski logic ko `useEffect` hook ke andar daal diya gaya hai.
}

export default function subscribe(opts = { dispatch: defaultDispatch }) {
    const { topic } = opts;
    // Dispatch function ko ab seedha use nahi kiya ja raha, iski logic hook mein hai.
    // const dispatch = (opts.dispatch) ? opts.dispatch : defaultDispatch;

    return (TargetComponent) => {

        const MQTTSubscriber = (props) => {
            const { mqtt } = useContext(MqttContext);
            const client = props.client || mqtt;

            const [state, setState] = useState({
                subscribed: false,
                data: {},
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
                        [msgTopic]: m,
                    };

                    return { ...prevState, data: newData };
                });
            };

            const subscribeMethod = () => {
                if (client) {
                    if (Array.isArray(topic)) {
                        topic.forEach((t) => client.subscribe(t));
                    } else {
                        client.subscribe(topic);
                    }
                    setState(prevState => ({ ...prevState, subscribed: true }));
                }
            };

            const unsubscribeMethod = () => {
                if (client) {
                    client.unsubscribe(topic);
                    setState(prevState => ({ ...prevState, subscribed: false }));
                }
            };

            useEffect(() => {
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

            const deleteTopic = (topicToDelete) => {
                setState(prevState => {
                    const newData = { ...prevState.data };
                    delete newData[topicToDelete];
                    return { ...prevState, data: newData };
                });
            };

            const render = () => {
                const componentProps = {
                    ...omit(props, 'client'),
                    data: state.data,
                    mqtt: client,
                    deleteTopic: deleteTopic,
                };
                return React.createElement(TargetComponent, componentProps);
            };

            return render();
        };

        MQTTSubscriber.propTypes = {
            client: PropTypes.object
        };

        return MQTTSubscriber;
    };
}
