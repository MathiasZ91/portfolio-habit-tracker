import { useContext } from 'react';
import { TimerContext } from '../context/TimerContext';

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === null) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};