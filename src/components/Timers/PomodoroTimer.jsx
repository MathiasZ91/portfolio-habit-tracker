import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTimer } from '../../hooks/UseTimer';
import _ from 'lodash';

function PomodoroTimer() {
    const { updateTimer, getTimerState } = useTimer();
    const timerType = 'pomodoro';
    
    const modes = useMemo(() => ({
        shortPomodoro: { workTime: 25 * 60, breakTime: 5 * 60 },
        longPomodoro: { workTime: 50 * 60, breakTime: 15 * 60 },
    }), []);

    // Get initial state from context
    const contextState = getTimerState(timerType);
    
    // States
    const [mode, setMode] = useState(contextState.mode || 'shortPomodoro');
    const [timeLeft, setTimeLeft] = useState(contextState.timeLeft || modes.shortPomodoro.workTime);
    const [isRunning, setIsRunning] = useState(contextState.isRunning || false);
    const [currentPhase, setCurrentPhase] = useState(contextState.isWorkPhase ? 'work' : 'break');

    // Refs for timestamp-based timing
    const timerRef = useRef(null);
    const endTimeRef = useRef(null);

    // Restore timer state from localStorage on component mount
    useEffect(() => {
        const savedState = localStorage.getItem(`${timerType}_timer_state`);
        
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                
                // Check if the saved state is still valid (not too old)
                const now = Date.now();
                
                if (parsedState.endTime && parsedState.endTime > now) {
                    // Valid timer state that hasn't completed yet
                    endTimeRef.current = parsedState.endTime;
                    setTimeLeft(Math.ceil((parsedState.endTime - now) / 1000));
                    setIsRunning(parsedState.isRunning);
                    setCurrentPhase(parsedState.isWorkPhase ? 'work' : 'break');
                    
                    if (parsedState.mode) {
                        setMode(parsedState.mode);
                    }
                    
                    // Update the context
                    updateTimer(timerType, {
                        isRunning: parsedState.isRunning,
                        timeLeft: Math.ceil((parsedState.endTime - now) / 1000),
                        isWorkPhase: parsedState.isWorkPhase,
                        mode: parsedState.mode || mode
                    });
                } else if (parsedState.isRunning) {
                    // Timer completed while away, handle phase transition
                    const newPhase = parsedState.isWorkPhase ? 'break' : 'work';
                    const newTime = newPhase === 'work' 
                        ? modes[parsedState.mode || mode].workTime 
                        : modes[parsedState.mode || mode].breakTime;
                    
                    setCurrentPhase(newPhase);
                    setTimeLeft(newTime);
                    setIsRunning(true);
                    
                    if (parsedState.mode) {
                        setMode(parsedState.mode);
                    }
                    
                    // Set new end time
                    const newEndTime = Date.now() + (newTime * 1000);
                    endTimeRef.current = newEndTime;
                    
                    // Update the context
                    updateTimer(timerType, {
                        isRunning: true,
                        timeLeft: newTime,
                        isWorkPhase: newPhase === 'work',
                        mode: parsedState.mode || mode
                    });
                    
                    // Show notification if phase changed
                    if (Notification.permission === "granted") {
                        new Notification(newPhase === 'work' ? "Focus Time!" : "Break Time!", {
                            body: newPhase === 'work' 
                                ? "Time to get back to work" 
                                : "Time to take a short break",
                            icon: "/favicon.ico"
                        });
                    }
                }
            } catch (error) {
                console.error('Error restoring timer state:', error);
            }
        }
    }, [timerType, modes, mode, updateTimer]);

    // Save timer state to localStorage when it changes
    useEffect(() => {
        if (isRunning && endTimeRef.current) {
            localStorage.setItem(`${timerType}_timer_state`, JSON.stringify({
                endTime: endTimeRef.current,
                timeLeft,
                isRunning,
                isWorkPhase: currentPhase === 'work',
                mode,
                timestamp: Date.now()
            }));
        } else {
            localStorage.removeItem(`${timerType}_timer_state`);
        }
    }, [isRunning, timeLeft, timerType, currentPhase, mode]);

    // Debounced update timer function
    const debouncedUpdateTimer = useCallback((type, state) => {
        const debouncedFn = _.debounce(() => {
            updateTimer(type, state);
        }, 300);
        debouncedFn();
    }, [updateTimer]);

    // Toggle timer with debounce and careful state management
    const toggleTimer = useCallback(() => {
        console.group('Toggle Timer Debug');
        console.log('Current State:', {
            isRunning,
            timeLeft,
            currentPhase,
            timerType
        });

        // Prevent multiple rapid toggles
        if (!isRunning && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
        
        setIsRunning(prev => {
            const newState = !prev;
            
            console.log('New Running State:', newState);
            
            // Update context with the new state
            debouncedUpdateTimer(timerType, {
                isRunning: newState,
                timeLeft: timeLeft,
                isWorkPhase: currentPhase === 'work',
                mode
            });
            
            return newState;
        });

        console.groupEnd();
    }, [isRunning, debouncedUpdateTimer, timerType, timeLeft, currentPhase, mode]);

    // Timer tick logic
    const timerTick = useCallback(() => {
        if (!endTimeRef.current) return;
        
        const now = Date.now();
        const diff = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
        
        if (diff <= 0) {
            // Play completion sound
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
            } catch (error) {
                console.error("Error playing sound:", error);
            }
            
            // Vibrate if supported
            if ('vibrate' in navigator) {
                navigator.vibrate(200);
            }
            
            // Switch phases
            if (currentPhase === 'work') {
                setCurrentPhase('break');
                setTimeLeft(modes[mode].breakTime);
                
                // Set new end time
                endTimeRef.current = Date.now() + (modes[mode].breakTime * 1000);
                
                // Update context
                updateTimer(timerType, {
                    isRunning: true,
                    timeLeft: modes[mode].breakTime,
                    isWorkPhase: false,
                    mode
                });
                
                // Notification
                if (Notification.permission === "granted") {
                    new Notification("Break Time!", {
                        body: "Time to take a short break",
                        icon: "/favicon.ico"
                    });
                }
            } else {
                setCurrentPhase('work');
                setTimeLeft(modes[mode].workTime);
                
                // Set new end time
                endTimeRef.current = Date.now() + (modes[mode].workTime * 1000);
                
                // Update context
                updateTimer(timerType, {
                    isRunning: true,
                    timeLeft: modes[mode].workTime,
                    isWorkPhase: true,
                    mode
                });
                
                // Notification
                if (Notification.permission === "granted") {
                    new Notification("Focus Time!", {
                        body: "Time to get back to work",
                        icon: "/favicon.ico"
                    });
                }
            }
        } else {
            // Update displayed time
            setTimeLeft(diff);
            
            // Periodic context update
            updateTimer(timerType, {
                timeLeft: diff,
                isRunning,
                isWorkPhase: currentPhase === 'work',
                mode
            });
        }
    }, [currentPhase, isRunning, mode, modes, updateTimer, timerType]);

    // Timer start/stop effect - IMPROVED VERSION
    useEffect(() => {
        if (isRunning) {
            // Only set the end time if it's not already set
            if (!endTimeRef.current) {
                const endTime = Date.now() + (timeLeft * 1000);
                endTimeRef.current = endTime;
            }
            
            if (!timerRef.current) {
                // Create the interval that will update the timer
                timerRef.current = setInterval(() => {
                    const now = Date.now();
                    const diff = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
                    
                    if (diff <= 0) {
                        // Timer completed
                        timerTick();
                    } else {
                        // Update displayed time
                        setTimeLeft(diff);
                    }
                }, 500);
            }
        } else {
            // Clear interval when timer is stopped
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            
            // Clear end time when stopped
            if (!isRunning) {
                endTimeRef.current = null;
            }
        }
        
        // Cleanup on component unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isRunning, timerTick, timeLeft]);

    // Handle visibility change (tab/app switching) - IMPROVED VERSION
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (isRunning && endTimeRef.current) {
                    // Calculate the current time left based on the end time
                    const now = Date.now();
                    const diff = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
                    
                    if (diff <= 0) {
                        // Timer has elapsed while away - trigger phase change
                        timerTick();
                    } else {
                        // Timer is still running - update the displayed time to reflect elapsed time
                        setTimeLeft(diff);
                    }
                }
            }
        };
        
        // Add the event listener
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isRunning, timerTick]);

    // Mode change handler
    const handleModeChange = useCallback((newMode) => {
        // Stop current timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        // Reset to initial state of new mode
        setIsRunning(false);
        setCurrentPhase('work');
        setMode(newMode);
        setTimeLeft(modes[newMode].workTime);
        endTimeRef.current = null;
        
        // Update context
        updateTimer(timerType, {
            isRunning: false,
            timeLeft: modes[newMode].workTime,
            isWorkPhase: true,
            mode: newMode
        });
        
        // Clear localStorage
        localStorage.removeItem(`${timerType}_timer_state`);
    }, [modes, updateTimer, timerType]);

    // Reset timer
    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        setIsRunning(false);
        setCurrentPhase('work');
        setTimeLeft(modes[mode].workTime);
        endTimeRef.current = null;
        
        // Update context
        updateTimer(timerType, {
            isRunning: false,
            timeLeft: modes[mode].workTime,
            isWorkPhase: true,
            mode
        });
        
        // Clear localStorage
        localStorage.removeItem(`${timerType}_timer_state`);
    }, [mode, modes, updateTimer, timerType]);

    // Format time as MM:SS
    const formatTime = useCallback((seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Display the current phase in the UI
    const phaseDisplay = currentPhase === 'work' ? "Work Phase" : "Break Phase";

    return (
        <div className="flex flex-col items-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            Pomodoro Timer
          </h2>
          
          {/* Mode selection */}
          <div className="flex gap-4 mb-8 w-full">
            <button
              onClick={() => handleModeChange('shortPomodoro')}
              className={`w-1/2 py-3 px-4 rounded-lg text-lg font-medium transition-colors ${
                mode === 'shortPomodoro' 
                  ? 'bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 text-gray-900' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              25/5 Mode
            </button>
            <button
              onClick={() => handleModeChange('longPomodoro')}
              className={`w-1/2 py-3 px-4 rounded-lg text-lg font-medium transition-colors ${
                mode === 'longPomodoro' 
                  ? 'bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 text-gray-900' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              50/15 Mode
            </button>
          </div>
          
          {/* Current phase indicator */}
          <div className="mb-2 text-lg font-medium">
            {phaseDisplay}
          </div>
          
          {/* Timer display */}
          <div className="flex items-center justify-center w-full mb-10">
            <div className="timer w-80">
              <div className="bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 py-16 px-8 rounded-xl shadow-lg overflow-hidden">
                <h3 className="countdown-element font-bold text-8xl text-gray-900 text-center">
                  {formatTime(timeLeft)}
                </h3>
              </div>
            </div>
          </div>
          
          {/* Timer controls */}
          <div className="flex gap-4 w-full">
            <button 
              onClick={toggleTimer}
              className="w-1/2 py-3 px-4 rounded-lg text-lg font-medium transition-colors bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 text-gray-900"
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button 
              onClick={resetTimer}
              className="w-1/2 py-3 px-4 rounded-lg text-lg font-medium transition-colors bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 text-gray-900"
            >
              Reset
            </button>
          </div>
        </div>
    );
}

export default PomodoroTimer;