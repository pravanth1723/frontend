import React, { useEffect } from "react";

/**
 * Snackbar - Toast notification component
 * @param {string} category - 'success' or 'error'
 * @param {string} message - Message to display
 * @param {function} onClose - Callback when snackbar is closed
 * @param {number} duration - Auto-close duration in ms (default: 5000, 0 for no auto-close)
 */
export default function Snackbar({ category, message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const isSuccess = category === 'success';
  
  const styles = {
    container: {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      minWidth: '300px',
      maxWidth: '600px',
      animation: 'slideDown 0.3s ease-out'
    },
    snackbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderRadius: '6px',
      backgroundColor: isSuccess ? '#4caf50' : '#f44336',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      gap: '12px'
    },
    message: {
      flex: 1,
      fontSize: '14px',
      fontWeight: 500
    },
    closeButton: {
      background: 'transparent',
      border: 'none',
      color: '#ffffff',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '0',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      transition: 'background 0.2s'
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.snackbar}>
          <div style={styles.message}>{message}</div>
          <button 
            style={styles.closeButton} 
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
    </>
  );
}
