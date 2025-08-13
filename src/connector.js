import React, { useState, useEffect, createContext } from "react";
import PropTypes from 'prop-types';
import MQTT from 'mqtt';
console.log("[MQTT] [CONNECTOR] LINK Upgrade outside function : ", MQTT);
// Context creation to provide MQTT client and status
export const MqttContext = createContext(null);

// Functional component that acts as the Connector
export default function Connector({ mqqt, mqttProps, children }) {
    const [mqttClient, setMqttClient] = useState(null);
    const [mqttStatus, setMqttStatus] = useState('disconnected');

    const _makeStatusHandler = (status) => {
        console.log(`[MQTT] [CONNECTOR] Status changed to: ${status}`);
        return () => {
            setMqttStatus(status);
        };
    };

    const componentWillMount = () => {
        console.log("[MQTT] [CONNECTOR] mqttProps : ", mqttProps);
        const client = mqqt || MQTT.connect(mqttProps);
        setMqttClient(client);

        client.on('connect', _makeStatusHandler('connected'));
        client.on('reconnect', _makeStatusHandler('reconnect'));
        client.on('close', _makeStatusHandler('closed'));
        client.on('offline', _makeStatusHandler('offline'));
        client.on('error', console.error);

        return client;
    };

    const componentWillUnmount = (client) => {
        if (client) {
            client.end();
            client.off('connect', _makeStatusHandler('connected'));
            client.off('reconnect', _makeStatusHandler('reconnect'));
            client.off('close', _makeStatusHandler('closed'));
            client.off('offline', _makeStatusHandler('offline'));
        }
    };

    // useEffect hook replaces componentWillMount and componentWillUnmount
    useEffect(() => {
        const client = componentWillMount();

        return () => {
            componentWillUnmount(client);
        };
    }, [mqqt, mqttProps]);

    const getChildContext = () => {
        return {
            mqtt: mqttClient,
            mqttStatus: mqttStatus
        };
    };

    const renderConnected = () => {
        return React.Children.only(children);
    };

    const render = () => {
        return renderConnected();
    };

    // The context provider wraps the children, making the context available
    return (
        <MqttContext.Provider value={getChildContext()}>
            {render()}
        </MqttContext.Provider>
    );
}

// Prop types for the functional component
Connector.propTypes = {
    mqqt: PropTypes.object,
    mqttProps: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    children: PropTypes.element.isRequired,
};