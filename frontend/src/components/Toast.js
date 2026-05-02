import React, { useEffect, useState } from 'react';

const Toast = ({ message, show, duration = 2200 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!show) return null;

  return (
    <div className={`app-toast ${visible ? 'show' : ''}`}>
      {message}
    </div>
  );
};

export default Toast;
