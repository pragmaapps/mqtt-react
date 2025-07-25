import React, { useContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import omit from "object.omit";
import { MQTTContext } from "./connector";

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
    const dispatch = opts.dispatch ? opts.dispatch : defaultDispatch;

    return (TargetComponent) => {
        const MQTTSubscriber = (props) => {
            const contextMqtt = useContext(MQTTContext).mqtt;
            const client = props.client || contextMqtt;

            const [subscribed, setSubscribed] = useState(false);
            const [data, setData] = useState({});
            const isMounted = useRef(false);

            // Using a ref to hold data state for dispatch function
            const dataRef = useRef(data);
            dataRef.current = data;

            // Using a ref to hold isMounted flag for dispatch function
            const isMountedRef = useRef(isMounted.current);

            // Dispatch handler bound to component state and refs
            const handler = (topic, message, packet) => {
                const m = parse(message);
                const item = [];
                let newData = {};
                item[topic] = m;
                if (typeof dataRef.current[topic] !== 'undefined') {
                    dataRef.current[topic] = item[topic];
                    newData = {
                        ...dataRef.current
                    };
                } else {
                    newData = {
                        ...item,
                        ...dataRef.current
                    };
                }
                if (isMountedRef.current && topic !== "isx/stream/file/stats/get" && topic !== "isx/adp/adp/stats/get" && topic !== "isx/sensor/status/info/get") {
                    setData(newData);
                }
            };

            useEffect(() => {
                isMounted.current = true;
                isMountedRef.current = true;

                client.on('message', handler);

                if (Array.isArray(topic)) {
                    topic.forEach(t => client.subscribe(t));
                } else {
                    client.subscribe(topic);
                }
                setSubscribed(true);

                return () => {
                    isMounted.current = false;
                    isMountedRef.current = false;

                    client.off('message', handler);
                    client.unsubscribe(topic);
                    setSubscribed(false);
                };
            }, [client, topic]);

            const deleteTopic = (topicToDelete) => {
                setData(prevData => {
                    const newData = { ...prevData };
                    delete newData[topicToDelete];
                    return newData;
                });
            };

            return (
                <TargetComponent
                    {...omit(props, 'client')}
                    data={data}
                    mqtt={client}
                    deleteTopic={deleteTopic}
                />
            );
        };

        MQTTSubscriber.propTypes = {
            client: PropTypes.object
        };

        return MQTTSubscriber;
    };
}
