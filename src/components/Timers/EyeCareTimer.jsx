import { useState, useEffect, useRef, useCallback } from 'react';
import { useTimer } from '../../context/TimerContext';

/* KEY CONCEPT: BACKGROUND-FRIENDLY TIMER WITH CONTEXT PERSISTENCE */
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
    const [isRunning, setIsRunning] = useState(contextState.isRunning);
    const [isWorkPhase, setIsWorkPhase] = useState(contextState.isWorkPhase);

    // Refs to track time
    const timerRef = useRef(null);
    const endTimeRef = useRef(null);
    const phaseRef = useRef(contextState.isWorkPhase ? 'work' : 'break');
    
    // Update state based on context when component mounts or regains focus
    useEffect(() => {
        const state = getTimerState(timerType);
        setTimeLeft(state.timeLeft || (state.isWorkPhase ? WORK_TIME : BREAK_TIME));
        setIsRunning(state.isRunning);
        setIsWorkPhase(state.isWorkPhase);
        phaseRef.current = state.isWorkPhase ? 'work' : 'break';
    }, [getTimerState, timerType, WORK_TIME, BREAK_TIME]);
    
    // Function to play a sound when phase completes
    const playSound = useCallback(() => {
        try {
            // Simple beep with Web Audio API
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
    }, []);

    // Timer tick function - calculates remaining time based on end timestamp
    const timerTick = useCallback(() => {
        if (!endTimeRef.current) return;
        
        const now = Date.now();
        const diff = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
        
        if (diff <= 0) {
            // Time's up
            // Play sound
            playSound();
            
            // Vibrate if supported (mobile devices)
            if ('vibrate' in navigator) {
                navigator.vibrate(200);  // Vibrate for 200ms
            }
            
            // Reset timer and switch phase
            if (phaseRef.current === 'work') {
                // Work phase completed, switch to break
                phaseRef.current = 'break';
                setTimeLeft(BREAK_TIME);
                setIsWorkPhase(false);
                
                if (isRunning) {
                    // Set new end time
                    const newEndTime = Date.now() + BREAK_TIME * 1000;
                    endTimeRef.current = newEndTime;
                }
                
                // Display notification
                if (Notification.permission === "granted") {
                    try {
                        new Notification("Eye Break Time!", {
                            body: "Look at something 20 feet away for 20 seconds",
                            icon: "/favicon.ico"
                        });
                    } catch (error) {
                        console.error("Error showing notification:", error);
                    }
                }
                
                // Update context
                updateTimer(timerType, {
                    isRunning: true,
                    timeLeft: BREAK_TIME,
                    isWorkPhase: false
                });
            } else {
                // Break phase completed, switch to work
                phaseRef.current = 'work';
                setTimeLeft(WORK_TIME);
                setIsWorkPhase(true);
                
                if (isRunning) {
                    // Set new end time
                    const newEndTime = Date.now() + WORK_TIME * 1000;
                    endTimeRef.current = newEndTime;
                }
                
                // Display notification
                if (Notification.permission === "granted") {
                    try {
                        new Notification("Back to Work", {
                            body: "Time to resume working",
                            icon: "/favicon.ico"
                        });
                    } catch (error) {
                        console.error("Error showing notification:", error);
                    }
                }
                
                // Update context
                updateTimer(timerType, {
                    isRunning: true,
                    timeLeft: WORK_TIME,
                    isWorkPhase: true
                });
            }
        } else {
            // Update displayed time
            setTimeLeft(diff);
            
            // Update context periodically
            updateTimer(timerType, {
                timeLeft: diff,
                isRunning,
                isWorkPhase: phaseRef.current === 'work'
            });
        }
    }, [BREAK_TIME, WORK_TIME, isRunning, playSound, updateTimer, timerType]);

    // Handle visibility change (tab/app switching)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isRunning) {
                // Recalculate time left when returning to the app
                if (endTimeRef.current) {
                    const now = Date.now();
                    const diff = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
                    
                    if (diff <= 0) {
                        // Timer has elapsed while away - trigger tick to handle phase change
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

    // Start/stop timer logic
    useEffect(() => {
        if (isRunning) {
            // Set when this phase will end
            const duration = phaseRef.current === 'work' ? WORK_TIME : BREAK_TIME;
            const endTime = Date.now() + duration * 1000;
            endTimeRef.current = endTime;
            
            // Start timer ticks
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            
            timerRef.current = setInterval(timerTick, 500);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        // Update context whenever timer running state changes
        updateTimer(timerType, {
            isRunning,
            timeLeft,
            isWorkPhase
        });
        
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, WORK_TIME, BREAK_TIME, timerTick, updateTimer, timerType, timeLeft, isWorkPhase]);

    // Function to toggle timer
    const toggleTimer = useCallback(() => {
        // Request notification permission when starting timer
        if (!isRunning && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
        
        setIsRunning(prev => !prev);
    }, [isRunning]);

    // Function to reset timer
    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        setIsRunning(false);
        setIsWorkPhase(true);
        setTimeLeft(WORK_TIME);
        phaseRef.current = 'work';
        endTimeRef.current = null;
        
        // Update context
        updateTimer(timerType, {
            isRunning: false,
            timeLeft: WORK_TIME,
            isWorkPhase: true
        });
    }, [WORK_TIME, updateTimer, timerType]);

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
            
            {/* Timer display - enhanced for larger, more modern look */}
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