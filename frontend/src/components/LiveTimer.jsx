import React, { useState, useEffect } from 'react';

const LiveTimer = ({ startTime }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    const start = new Date(startTime);

    const intervalId = setInterval(() => {
      const now = new Date();
      const difference = now - start;

      const hours = Math.floor(difference / 3600000);
      const minutes = Math.floor((difference % 3600000) / 60000);
      const seconds = Math.floor((difference % 60000) / 1000);

      setElapsedTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [startTime]);

  return <p className="text-base font-mono tracking-tighter">{elapsedTime}</p>;
};

export default LiveTimer;
