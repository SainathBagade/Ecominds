import React from 'react';

/**
 * Loader Component
 * Simple loading spinner for the application
 */
const Loader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-primary-600 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
};

export default Loader;
