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

            const messageHandler = useCallback((msgTopic, message) => {
                const parsedMessage = parse(message);
  
                if (["isx/stream/file/stats/get", "isx/adp/adp/stats/get", "isx/sensor/status/info/get"].includes(msgTopic)) {
                    return;
                }

                setData(prevData => ({
                    ...prevData,
                    [msgTopic]: parsedMessage,
                }));
            }, []);

            useEffect(() => {
                
                if (!client) return;

                const topicsToSubscribe = Array.isArray(topic) ? topic : [topic];
                topicsToSubscribe.forEach(t => client.subscribe(t));

                client.on('message', messageHandler);

                return () => {

                    topicsToSubscribe.forEach(t => client.unsubscribe(t));

                    client.off('message', messageHandler);
                };
            }, [client, topic, messageHandler]);

            const deleteTopic = useCallback((topicToDelete) => {
                setData(prevData => omit(prevData, [topicToDelete]));
            }, []);

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