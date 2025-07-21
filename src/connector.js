import React, { createContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import MQTT from 'mqtt';

export const MqttContext = createContext({
  mqtt: null,
  mqttStatus: null
});

const Connector = ({ mqttProps, mqtt, children }) => {
  const [mqttStatus, setMqttStatus] = useState(null);
  const mqttRef = useRef(null);

  useEffect(() => {
    console.log('[Connector] initializing MQTT connection');
    const client = mqtt ? mqtt : MQTT.connect(mqttProps);
    mqttRef.current = client;

    const handleStatus = (status) => () => {
      setMqttStatus(status);
    };

    client.on('connect', handleStatus('connected'));
    client.on('reconnect', handleStatus('reconnect'));
    client.on('close', handleStatus('closed'));
    client.on('offline', handleStatus('offline'));
    client.on('error', console.error);

    return () => {
      console.log('[Connector] cleaning up MQTT connection');
      // Uncomment below if you want to close connection on unmount
      // client.end();
    };
  }, [mqttProps, mqtt]);

  return (
    <MqttContext.Provider
      value={{ mqtt: mqttRef.current, mqttStatus }}
    >
      {children}
    </MqttContext.Provider>
  );
};

Connector.propTypes = {
  mqtt: PropTypes.object,
  mqttProps: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.element.isRequired
};

export default Connector;
