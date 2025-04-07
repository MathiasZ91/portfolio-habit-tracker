import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTimer } from '../../hooks/UseTimer';
import _ from 'lodash';

function EyeCareTimer() {
    const { updateTimer, getTimerState } = useTimer();
    const timerType = 'eyecare';
    
    // Constants for the 20-20-20 rule
    const WORK_TIME = 20 * 60; // 20 minutes in seconds
    const BREAK_TIME = 20; // 20 seconds

    // Get initial state from context
    const contextState = getTimerState(timerType);
    
    // States
    const [timeLeft, setTimeLeft] = useState(contextState.timeLeft || WORK_TIME);
    const [isRunning, setIsRunning] = useState(contextState.isRunning || false);
    const [isWorkPhase, setIsWorkPhase] = useState(contextState.isWorkPhase || true);

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
                    setIsWorkPhase(parsedState.isWorkPhase);
                    
                    // Update the context
                    updateTimer(timerType, {
                        isRunning: parsedState.isRunning,
                        timeLeft: Math.ceil((parsedState.endTime - now) / 1000),
                        isWorkPhase: parsedState.isWorkPhase
                    });
                } else if (parsedState.isRunning) {
                    // Timer completed while away, handle phase transition
                    const newPhase = !parsedState.isWorkPhase;
                    const newTime = newPhase ? WORK_TIME : BREAK_TIME;
                    
                    setIsWorkPhase(newPhase);
                    setTimeLeft(newTime);
                    setIsRunning(true);
                    
                    // Set new end time
                    const newEndTime = Date.now() + (newTime * 1000);
                    endTimeRef.current = newEndTime;
                    
                    // Update the context
                    updateTimer(timerType, {
                        isRunning: true,
                        timeLeft: newTime,
                        isWorkPhase: newPhase
                    });
                    
                    // Show notification if phase changed
                    if (Notification.permission === "granted") {
                        new Notification(newPhase ? "Back to Work" : "Eye Break Time!", {
                            body: newPhase 
                                ? "Time to resume working" 
                                : "Look at something 20 feet away for 20 seconds",
                            icon: "/favicon.ico"
                        });
                    }
                }
            } catch (error) {
                console.error('Error restoring timer state:', error);
            }
        }
    }, [timerType, WORK_TIME, BREAK_TIME, updateTimer]);

    // Save timer state to localStorage when it changes
    useEffect(() => {
        if (isRunning && endTimeRef.current) {
            localStorage.setItem(`${timerType}_timer_state`, JSON.stringify({
                endTime: endTimeRef.current,
                timeLeft,
                isRunning,
                isWorkPhase,
                timestamp: Date.now()
            }));
        } else {
            localStorage.removeItem(`${timerType}_timer_state`);
        }
    }, [isRunning, timeLeft, timerType, isWorkPhase]);

    // Debounced update timer function
    const debouncedUpdateTimer = useMemo(() => 
        _.debounce((type, state) => {
            updateTimer(type, state);
        }, 300), 
        [updateTimer]
    );

    // Toggle timer with debounce and careful state management
    const toggleTimer = useCallback(() => {
        console.group('Eye Care Timer Debug');
        console.log('Current State:', {
            isRunning,
            timeLeft,
            isWorkPhase,
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
                isWorkPhase: isWorkPhase,
            });
            
            return newState;
        });

        console.groupEnd();
    }, [isRunning, debouncedUpdateTimer, timerType, timeLeft, isWorkPhase]);

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
            if (isWorkPhase) {
                // Work phase completed, switch to break
                setIsWorkPhase(false);
                setTimeLeft(BREAK_TIME);
                
                // Set new end time
                endTimeRef.current = Date.now() + (BREAK_TIME * 1000);
                
                // Update context
                updateTimer(timerType, {
                    isRunning: true,
                    timeLeft: BREAK_TIME,
                    isWorkPhase: false
                });
                
                // Notification
                if (Notification.permission === "granted") {
                    new Notification("Eye Break Time!", {
                        body: "Look at something 20 feet away for 20 seconds",
                        icon: "/favicon.ico"
                    });
                }
            } else {
                // Break phase completed, switch to work
                setIsWorkPhase(true);
                setTimeLeft(WORK_TIME);
                
                // Set new end time
                endTimeRef.current = Date.now() + (WORK_TIME * 1000);
                
                // Update context
                updateTimer(timerType, {
                    isRunning: true,
                    timeLeft: WORK_TIME,
                    isWorkPhase: true
                });
                
                // Notification
                if (Notification.permission === "granted") {
                    new Notification("Back to Work", {
                        body: "Time to resume working",
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
                isWorkPhase
            });
        }
    }, [isWorkPhase, isRunning, updateTimer, timerType, WORK_TIME, BREAK_TIME]);

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

    // Reset timer
    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        setIsRunning(false);
        setIsWorkPhase(true);
        setTimeLeft(WORK_TIME);
        endTimeRef.current = null;
        
        // Update context
        updateTimer(timerType, {
            isRunning: false,
            timeLeft: WORK_TIME,
            isWorkPhase: true
        });
        
        // Clear localStorage
        localStorage.removeItem(`${timerType}_timer_state`);
    }, [updateTimer, timerType, WORK_TIME]);

    // Format time as MM:SS
    const formatTime = useCallback((seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Display phase in the UI
    const phaseDisplay = isWorkPhase ? "Work Phase" : "Eye Break";

    return (
        <div className="flex flex-col items-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
                20/20/20 Timer
            </h2>
            
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
            
            {/* Controls */}
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

export default EyeCareTimer;