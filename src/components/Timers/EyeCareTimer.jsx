import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTimer } from '../../hooks/UseTimer';
import _ from 'lodash';

function EyeCareTimer() {
    const { updateTimer, getTimerState } = useTimer();
    const timerType = 'eyecare';
    
    // 20-20-20 rule constants
    const WORK_TIME = 20 * 60; // 20 minutes in seconds
    const BREAK_TIME = 20; // 20 seconds

    // Get initial state from context
    const contextState = getTimerState(timerType);
    
    // Core state management
    const [timeLeft, setTimeLeft] = useState(contextState.timeLeft || WORK_TIME);
    const [isRunning, setIsRunning] = useState(contextState.isRunning || false);
    const [isWorkPhase, setIsWorkPhase] = useState(contextState.isWorkPhase || true);

    // Refs for accurate timing
    const timerRef = useRef(null);
    const endTimeRef = useRef(null);

    // Load timer state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem(`${timerType}_timer_state`);
        
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                const now = Date.now();
                
                if (parsedState.endTime && parsedState.endTime > now) {
                    // Resume valid timer state
                    endTimeRef.current = parsedState.endTime;
                    setTimeLeft(Math.ceil((parsedState.endTime - now) / 1000));
                    setIsRunning(parsedState.isRunning);
                    setIsWorkPhase(parsedState.isWorkPhase);
                    
                    updateTimer(timerType, {
                        isRunning: parsedState.isRunning,
                        timeLeft: Math.ceil((parsedState.endTime - now) / 1000),
                        isWorkPhase: parsedState.isWorkPhase
                    });
                } else if (parsedState.isRunning) {
                    // Handle phase transition if timer completed while away
                    const newPhase = !parsedState.isWorkPhase;
                    const newTime = newPhase ? WORK_TIME : BREAK_TIME;
                    
                    setIsWorkPhase(newPhase);
                    setTimeLeft(newTime);
                    setIsRunning(true);
                    
                    const newEndTime = Date.now() + (newTime * 1000);
                    endTimeRef.current = newEndTime;
                    
                    updateTimer(timerType, {
                        isRunning: true,
                        timeLeft: newTime,
                        isWorkPhase: newPhase
                    });
                    
                    // Show notification if permissions granted
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

    // Save timer state to localStorage
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

    // Reduce context updates with debounce
    const debouncedUpdateTimer = useMemo(() => 
        _.debounce((type, state) => {
            updateTimer(type, state);
        }, 300), 
        [updateTimer]
    );

    // Start/pause timer
    const toggleTimer = useCallback(() => {
        console.group('Eye Care Timer Debug');
        console.log('Current State:', {
            isRunning,
            timeLeft,
            isWorkPhase,
            timerType
        });

        // Request notification permission if needed
        if (!isRunning && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
        
        setIsRunning(prev => {
            const newState = !prev;
            
            console.log('New Running State:', newState);
            
            debouncedUpdateTimer(timerType, {
                isRunning: newState,
                timeLeft: timeLeft,
                isWorkPhase: isWorkPhase,
            });
            
            return newState;
        });

        console.groupEnd();
    }, [isRunning, debouncedUpdateTimer, timerType, timeLeft, isWorkPhase]);

    // Handle timer completion and phase switching
    const timerTick = useCallback(() => {
        if (!endTimeRef.current) return;
        
        const now = Date.now();
        const diff = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
        
        if (diff <= 0) {
            // Play alert sound
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
            
            // Vibrate device if supported
            if ('vibrate' in navigator) {
                navigator.vibrate(200);
            }
            
            // Switch between work and break phases
            if (isWorkPhase) {
                // Switch to break phase
                setIsWorkPhase(false);
                setTimeLeft(BREAK_TIME);
                endTimeRef.current = Date.now() + (BREAK_TIME * 1000);
                
                updateTimer(timerType, {
                    isRunning: true,
                    timeLeft: BREAK_TIME,
                    isWorkPhase: false
                });
                
                if (Notification.permission === "granted") {
                    new Notification("Eye Break Time!", {
                        body: "Look at something 20 feet away for 20 seconds",
                        icon: "/favicon.ico"
                    });
                }
            } else {
                // Switch to work phase
                setIsWorkPhase(true);
                setTimeLeft(WORK_TIME);
                endTimeRef.current = Date.now() + (WORK_TIME * 1000);
                
                updateTimer(timerType, {
                    isRunning: true,
                    timeLeft: WORK_TIME,
                    isWorkPhase: true
                });
                
                if (Notification.permission === "granted") {
                    new Notification("Back to Work", {
                        body: "Time to resume working",
                        icon: "/favicon.ico"
                    });
                }
            }
        } else {
            // Update timer display
            setTimeLeft(diff);
            
            updateTimer(timerType, {
                timeLeft: diff,
                isRunning,
                isWorkPhase
            });
        }
    }, [isWorkPhase, isRunning, updateTimer, timerType, WORK_TIME, BREAK_TIME]);

    // Core timer functionality
    useEffect(() => {
        if (isRunning) {
            // Set end time if not already set
            if (!endTimeRef.current) {
                const endTime = Date.now() + (timeLeft * 1000);
                endTimeRef.current = endTime;
            }
            
            if (!timerRef.current) {
                // Create timer update interval
                timerRef.current = setInterval(() => {
                    const now = Date.now();
                    const diff = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
                    
                    if (diff <= 0) {
                        timerTick();
                    } else {
                        setTimeLeft(diff);
                    }
                }, 500);
            }
        } else {
            // Clear timer when stopped
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            
            if (!isRunning) {
                endTimeRef.current = null;
            }
        }
        
        // Cleanup on unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isRunning, timerTick, timeLeft]);

    // Handle app/tab visibility changes 
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (isRunning && endTimeRef.current) {
                    // Recalculate time when tab becomes visible
                    const now = Date.now();
                    const diff = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
                    
                    if (diff <= 0) {
                        timerTick();
                    } else {
                        setTimeLeft(diff);
                    }
                }
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isRunning, timerTick]);

    // Reset timer to initial state
    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        setIsRunning(false);
        setIsWorkPhase(true);
        setTimeLeft(WORK_TIME);
        endTimeRef.current = null;
        
        updateTimer(timerType, {
            isRunning: false,
            timeLeft: WORK_TIME,
            isWorkPhase: true
        });
        
        localStorage.removeItem(`${timerType}_timer_state`);
    }, [updateTimer, timerType, WORK_TIME]);

    // Format seconds to MM:SS display
    const formatTime = useCallback((seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Current phase label
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