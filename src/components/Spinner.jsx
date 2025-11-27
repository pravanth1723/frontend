import React from "react";

/**
 * Spinner - Reusable loading spinner component
 * @param {string} size - 'small', 'medium', 'large' (default: 'medium')
 * @param {string} color - Color of the spinner (default: primary color)
 */
export default function Spinner({ size = 'medium', color = 'var(--primary)' }) {
  const sizeMap = {
    small: 20,
    medium: 40,
    large: 60
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  const styles = {
    spinner: {
      width: `${spinnerSize}px`,
      height: `${spinnerSize}px`,
      border: `${spinnerSize / 10}px solid rgba(0, 0, 0, 0.1)`,
      borderTop: `${spinnerSize / 10}px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.spinner}></div>
    </>
  );
}
