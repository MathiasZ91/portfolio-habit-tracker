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

    // Timer start/stop effect
    useEffect(() => {
        if (isRunning) {
            const duration = isWorkPhase ? WORK_TIME : BREAK_TIME;
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
    }, [isRunning, isWorkPhase, timerTick, WORK_TIME, BREAK_TIME]);

    // Handle visibility change (tab/app switching)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isRunning) {
                // Recalculate time left when returning to the app
                if (endTimeRef.current) {
                    const now = Date.now();
                    const diff = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
                    
                    if (diff <= 0) {
                        // Timer has elapsed while away
                        timerTick();
                    } else {
                        // Update displayed time
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

    // Reset timer
    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        setIsRunning(false);
        setIsWorkPhase(true);
        setTimeLeft(WORK_TIME);
        
        // Update context
        updateTimer(timerType, {
            isRunning: false,
            timeLeft: WORK_TIME,
            isWorkPhase: true
        });
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