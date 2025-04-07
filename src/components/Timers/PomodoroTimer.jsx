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

    // Timer start/stop effect
    useEffect(() => {
        if (isRunning) {
            const duration = currentPhase === 'work' ? modes[mode].workTime : modes[mode].breakTime;
            const endTime = Date.now() + duration * 1000;
            endTimeRef.current = endTime;
            
            if (!timerRef.current) {
                timerRef.current = setInterval(timerTick, 500);
            }
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isRunning, currentPhase, mode, modes, timerTick]);

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
        
        // Update context
        updateTimer(timerType, {
            isRunning: false,
            timeLeft: modes[newMode].workTime,
            isWorkPhase: true,
            mode: newMode
        });
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
        
        // Update context
        updateTimer(timerType, {
            isRunning: false,
            timeLeft: modes[mode].workTime,
            isWorkPhase: true,
            mode
        });
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