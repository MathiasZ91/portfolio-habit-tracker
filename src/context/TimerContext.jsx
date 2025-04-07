// src/context/TimerContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

/* KEY CONCEPT: BACKGROUND TIMER MANAGEMENT */
// This context allows timers to continue running when navigating away

const TimerContext = createContext(null);

// Custom hook to use the timer context with safety check
export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === null) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  // Active timer states with their configurations
  const [activeTimers, setActiveTimers] = useState({
    pomodoro: {
      isRunning: false,
      timeLeft: 0,
      isWorkPhase: true,
      endTime: null, // When the timer should end (based on Date.now())
      mode: 'shortPomodoro'
    },
    eyecare: {
      isRunning: false,
      timeLeft: 0,
      isWorkPhase: true,
      endTime: null
    }
  });

  // Track which page we're on to optimize updates
  const [isTimerPageActive, setIsTimerPageActive] = useState(false);

  // Register or update a timer
  const updateTimer = (type, timerState) => {
    // If starting or continuing to run, calculate end time
    let endTime = null;
    if (timerState.isRunning && timerState.timeLeft > 0) {
      endTime = Date.now() + (timerState.timeLeft * 1000);
    }

    setActiveTimers(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...timerState,
        endTime
      }
    }));
  };

  // Get the current state of a timer, calculating elapsed time if running
  const getTimerState = (type) => {
    const timer = activeTimers[type];
    
    // If timer is running and has an end time, calculate current time left
    if (timer.isRunning && timer.endTime) {
      const millisLeft = Math.max(0, timer.endTime - Date.now());
      const secondsLeft = Math.ceil(millisLeft / 1000);
      
      return {
        ...timer,
        timeLeft: secondsLeft
      };
    }
    
    return timer;
  };

  // Background sync effect - updates timers even when timer page is not active
  useEffect(() => {
    // Only run background updates if timer page is not active
    if (isTimerPageActive) return;

    // Check if any timers are running
    const hasRunningTimer = Object.values(activeTimers).some(t => t.isRunning);
    if (!hasRunningTimer) return;

    // Set up interval to update timers in background
    const intervalId = setInterval(() => {
      setActiveTimers(prev => {
        const now = Date.now();
        const updated = { ...prev };
        
        // Update each timer
        Object.keys(updated).forEach(type => {
          const timer = updated[type];
          if (timer.isRunning && timer.endTime) {
            // Timer is still running
            if (now >= timer.endTime) {
              // Timer completed - handle phase change
              // This would ideally trigger a notification
              if (Notification.permission === "granted") {
                new Notification(`${type.charAt(0).toUpperCase() + type.slice(1)} Timer Complete`, {
                  body: timer.isWorkPhase ? "Break time!" : "Back to work!",
                  icon: "/favicon.ico"
                });
              }
              
              // Vibrate if supported
              if ('vibrate' in navigator) {
                navigator.vibrate(200);
              }
              
              // Switch phases (simplified logic)
              if (type === 'pomodoro') {
                const modes = {
                  shortPomodoro: { workTime: 25 * 60, breakTime: 5 * 60 },
                  longPomodoro: { workTime: 50 * 60, breakTime: 15 * 60 }
                };
                
                const newPhase = !timer.isWorkPhase;
                const newTime = newPhase ? 
                  modes[timer.mode].workTime : 
                  modes[timer.mode].breakTime;
                  
                updated[type] = {
                  ...timer,
                  isWorkPhase: newPhase,
                  timeLeft: newTime,
                  endTime: now + (newTime * 1000)
                };
              } else if (type === 'eyecare') {
                const newPhase = !timer.isWorkPhase;
                const newTime = newPhase ? 20 * 60 : 20; // 20 min or 20 sec
                
                updated[type] = {
                  ...timer,
                  isWorkPhase: newPhase,
                  timeLeft: newTime,
                  endTime: now + (newTime * 1000)
                };
              }
            } else {
              // Update time left
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

  // Request notification permission
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

// Support both named exports and default export
export default TimerProvider;