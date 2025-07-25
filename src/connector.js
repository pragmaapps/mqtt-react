import React, { createContext, useState, useEffect, Children } from "react";
import PropTypes from 'prop-types';
import MQTT from "mqtt";

export const MQTTContext = createContext({
    mqtt: null,
    mqttStatus: ''
});

const Connector = ({ mqtt: mqttProp, mqttProps, children }) => {
    const [mqttStatus, setMqttStatus] = useState('');
    const [mqtt, setMqtt] = useState(null);

    useEffect(() => {
        const client = mqttProp ? mqttProp : MQTT.connect(mqttProps);

        const makeStatusHandler = (status) => () => {
            setMqttStatus(status);
        };

        client.on('connect', makeStatusHandler('connected'));
        client.on('reconnect', makeStatusHandler('reconnect'));
        client.on('close', makeStatusHandler('closed'));
        client.on('offline', makeStatusHandler('offline'));
        client.on('error', console.error);

        setMqtt(client);

        return () => {
            // client.end(); // Uncomment if you want to close connection on unmount
        };
    }, [mqttProp, mqttProps]);

    return (
        <MQTTContext.Provider value={{ mqtt, mqttStatus }}>
            {Children.only(children)}
        </MQTTContext.Provider>
    );
};

Connector.propTypes = {
    mqtt: PropTypes.object,
    mqttProps: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    children: PropTypes.element.isRequired,
};

export default Connector;
