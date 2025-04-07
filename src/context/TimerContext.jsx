// @refresh reset
import { createContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

// Export the context
export const TimerContext = createContext(null);

export const TimerProvider = ({ children }) => {
  const [activeTimers, setActiveTimers] = useState({
    pomodoro: {
      isRunning: false,
      timeLeft: 1500, // 25 minutes default
      isWorkPhase: true,
      endTime: null,
      mode: 'shortPomodoro'
    },
    eyecare: {
      isRunning: false,
      timeLeft: 1200, // 20 minutes default
      isWorkPhase: true,
      endTime: null
    }
  });

  const [isTimerPageActive, setIsTimerPageActive] = useState(false);

  const updateTimer = useCallback((type, timerState) => {
    setActiveTimers(prev => {
      const currentTimer = prev[type] || {};
      
      const newTimerState = {
        ...currentTimer,
        ...timerState,
        endTime: timerState.isRunning && timerState.timeLeft > 0 
          ? Date.now() + (timerState.timeLeft * 1000) 
          : null
      };

      return {
        ...prev,
        [type]: newTimerState
      };
    });
  }, []);

  const getTimerState = useCallback((type) => {
    const timer = activeTimers[type];
    
    if (timer.isRunning && timer.endTime) {
      const millisLeft = Math.max(0, timer.endTime - Date.now());
      const secondsLeft = Math.ceil(millisLeft / 1000);
      
      return {
        ...timer,
        timeLeft: secondsLeft
      };
    }
    
    return timer;
  }, [activeTimers]);

  // Background sync effect
  useEffect(() => {
    if (isTimerPageActive) return;

    const hasRunningTimer = Object.values(activeTimers).some(t => t.isRunning);
    if (!hasRunningTimer) return;

    const intervalId = setInterval(() => {
      setActiveTimers(prev => {
        const now = Date.now();
        const updated = { ...prev };
        
        Object.keys(updated).forEach(type => {
          const timer = updated[type];
          if (timer.isRunning && timer.endTime) {
            if (now >= timer.endTime) {
              // Timer completed - handle phase change
              if (Notification.permission === "granted") {
                new Notification(`${type.charAt(0).toUpperCase() + type.slice(1)} Timer Complete`, {
                  body: timer.isWorkPhase ? "Break time!" : "Back to work!",
                  icon: "/favicon.ico"
                });
              }
              
              if ('vibrate' in navigator) {
                navigator.vibrate(200);
              }
              
              // Phase switching logic
              const modes = {
                shortPomodoro: { workTime: 1500, breakTime: 300 },
                longPomodoro: { workTime: 3000, breakTime: 900 }
              };
              
              const newPhase = !timer.isWorkPhase;
              const newTime = type === 'pomodoro' 
                ? (newPhase ? modes[timer.mode].workTime : modes[timer.mode].breakTime)
                : (newPhase ? 1200 : 20); // 20 min or 20 sec for eyecare
                
              updated[type] = {
                ...timer,
                isWorkPhase: newPhase,
                timeLeft: newTime,
                endTime: now + (newTime * 1000)
              };
            } else {
              const millisLeft = Math.max(0, timer.endTime - now);
              const secondsLeft = Math.ceil(millisLeft / 1000);
              
              updated[type] = {
                ...timer,
                timeLeft: secondsLeft
              };
            }
          }
        });
        
        return updated;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isTimerPageActive, activeTimers]);

  // Notification permission
  useEffect(() => {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  const value = {
    updateTimer,
    getTimerState,
    setIsTimerPageActive,
    isTimerPageActive
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

TimerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TimerProvider;