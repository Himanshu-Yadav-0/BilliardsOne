import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // The toast will disappear after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white shadow-lg z-50 ${bgColor}`}>
      {message}
    </div>
  );
};

export default Toast;
