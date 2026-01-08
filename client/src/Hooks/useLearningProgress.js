import { useContext } from 'react';
import { ProgressContext } from '@context/ProgressContext';

export const useLearningProgress = () => {
  const context = useContext(ProgressContext);
  
  if (!context) {
    throw new Error('useLearningProgress must be used within a ProgressProvider');
  }
  
  return context;
};