import React, { useState, useEffect, createContext } from "react";
import PropTypes from 'prop-types';
import mqtt from 'mqtt';

// Context creation to provide MQTT client and status
export const MqttContext = createContext(null);

// Functional component that acts as the Connector
export default function Connector({ mqqt, mqttProps, children }) {
    const [mqttClient, setMqttClient] = useState(null);
    const [mqttStatus, setMqttStatus] = useState('disconnected');

    // useEffect hook to handle connection and disconnection logic
    useEffect(() => {
        if (!mqttProps) {
            console.error("[MQTT] [CONNECTOR] mqttProps are not provided.");
            return;
        }


        const client = mqtt.connect(mqttProps);

        console.log("[MQTT] [CONNECTOR] Client created:", client);
        setMqttClient(client);

        // Event handlers
        const handleStatusChange = (status) => () => {
            // console.log(`[MQTT] [CONNECTOR] Status changed to: ${status}`);
            setMqttStatus(status);
        };

        client.on('connect', handleStatusChange('connected'));
        client.on('reconnect', handleStatusChange('reconnect'));
        client.on('close', handleStatusChange('closed'));
        client.on('offline', handleStatusChange('offline'));
        client.on('error', (err) => {
            // console.error("[MQTT] [CONNECTOR] Error:", err);
            handleStatusChange('error')();
        });

        // Cleanup function for component unmount
        return () => {
            console.log("[MQTT] [CONNECTOR] Cleaning up client connection.");
            if (client) {
                client.end();
                client.off('connect', handleStatusChange('connected'));
                client.off('reconnect', handleStatusChange('reconnect'));
                client.off('close', handleStatusChange('closed'));
                client.off('offline', handleStatusChange('offline'));
                client.off('error', () => {});
            }
        };
    }, [mqttProps]);

    const contextValue = {
        mqtt: mqttClient,
        mqttStatus: mqttStatus
    };

    // The context provider wraps the children
    return (
        <MqttContext.Provider value={contextValue}>
            {children}
        </MqttContext.Provider>
    );
}

// Prop types for the functional component
Connector.propTypes = {
    mqqt: PropTypes.object,
    mqttProps: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    children: PropTypes.element.isRequired,
};