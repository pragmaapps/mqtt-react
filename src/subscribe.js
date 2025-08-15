import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import { MqttContext } from './connector';

function parse(message) {
    try {
        const item = JSON.parse(message);
        return item;
    } catch (e) {
        return message.toString();
    }
}

export default function subscribe(opts = {}) {
    const { topic } = opts;

    return (TargetComponent) => {
        const MQTTSubscriber = (props) => {
            const { mqtt: contextClient } = useContext(MqttContext);
            const client = props.client || contextClient;

            const [data, setData] = useState({});

            // `messageHandler` फ़ंक्शन को memoize करने के लिए `useCallback` का उपयोग।
            // इससे यह हर रेंडर पर दोबारा नहीं बनेगा।
            const messageHandler = useCallback((msgTopic, message) => {
                const parsedMessage = parse(message);
                
                // कुछ खास topics के messages को ignore करें।
                if (["isx/stream/file/stats/get", "isx/adp/adp/stats/get", "isx/sensor/status/info/get"].includes(msgTopic)) {
                    return;
                }

                setData(prevData => ({
                    ...prevData,
                    [msgTopic]: parsedMessage,
                }));
            }, []);

            // Subscription और cleanup logic को एक ही `useEffect` hook में।
            useEffect(() => {
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

            const deleteTopic = useCallback((topicToDelete) => {
                setData(prevData => omit(prevData, [topicToDelete]));
            }, []);

            // Props को memoize करने के लिए `useMemo` का उपयोग।
            // यह `TargetComponent` के अनावश्यक re-renders को रोकता है।
            const componentProps = useMemo(() => ({
                ...omit(props, 'client'),
                data: data,
                mqtt: client,
                deleteTopic: deleteTopic,
            }), [props, data, client, deleteTopic]);

            return <TargetComponent {...componentProps} />;
        };

        MQTTSubscriber.propTypes = {
            client: PropTypes.object
        };

        return MQTTSubscriber;
    };
}