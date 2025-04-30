import { useContext } from 'react';
import { TimerContext } from '../context/TimerContext';

// Custom hook for timer access throughout the app
export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === null) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};