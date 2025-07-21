import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import omit from 'object.omit';

function parse(message) {
  try {
    return JSON.parse(message);
  } catch (e) {
    return message.toString();
  }
}

function defaultDispatch(topic, message, packet, setData, getDataRef) {
  const parsed = parse(message);
  const newTopicData = { [topic]: parsed };

  const existingData = getDataRef.current;
  let newData;

  if (typeof existingData[topic] !== 'undefined') {
    existingData[topic] = parsed;
    newData = { ...existingData };
  } else {
    newData = {
      ...newTopicData,
      ...existingData,
    };
  }

  if (
    topic !== 'isx/stream/file/stats/get' &&
    topic !== 'isx/adp/adp/stats/get' &&
    topic !== 'isx/sensor/status/info/get'
  ) {
    setData(newData);
  }
}

export default function subscribe(opts = { dispatch: defaultDispatch }) {
  const { topic, dispatch = defaultDispatch } = opts;

  return function withSubscription(TargetComponent) {
    const MQTTSubscriber = (props) => {
      const context = useContext(React.createContext()); // fallback context
      const client = props.client || context.mqtt;
      const [data, setData] = useState({});
      const [subscribed, setSubscribed] = useState(false);
      const getDataRef = React.useRef(data);
      getDataRef.current = data;

      useEffect(() => {
        if (!client) return;

        const handler = (t, message, packet) => {
          dispatch(t, message, packet, setData, getDataRef);
        };

        client.on('message', handler);

        const subscribeTopics = () => {
          if (Array.isArray(topic)) {
            topic.forEach((t) => client.subscribe(t));
          } else {
            client.subscribe(topic);
          }
          setSubscribed(true);
        };

        const unsubscribeTopics = () => {
          if (Array.isArray(topic)) {
            topic.forEach((t) => client.unsubscribe(t));
          } else {
            client.unsubscribe(topic);
          }
          setSubscribed(false);
        };

        subscribeTopics();

        return () => {
          unsubscribeTopics();
          client.off('message', handler);
        };
      }, [client]);

      const deleteTopic = (t) => {
        const newData = { ...data };
        delete newData[t];
        setData(newData);
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
      client: PropTypes.object,
    };

    return MQTTSubscriber;
  };
}
