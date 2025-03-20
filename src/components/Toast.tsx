'use client';

import { useEffect, useState } from 'react';

type ToastProps = {
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
};

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getNotificationClass = () => {
    switch (type) {
      case 'success':
        return 'is-success';
      case 'danger':
        return 'is-danger';
      case 'warning':
        return 'is-warning';
      case 'info':
        return 'is-info';
      default:
        return 'is-info';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="toast-container" style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 100 
    }}>
      <div className={`notification ${getNotificationClass()}`} style={{ minWidth: '250px' }}>
        <button className="delete" onClick={handleClose}></button>
        <div className="content">
          {message}
        </div>
      </div>
    </div>
  );
}