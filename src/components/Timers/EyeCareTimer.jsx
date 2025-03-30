import { useState, useEffect, useRef, useCallback } from 'react';
import { useTimer } from '../../context/TimerContext';

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

    // Reference for storing interval ID for cleanup
    const timerRef = useRef(null);

    // Update state based on context when component mounts or regains focus
    useEffect(() => {
        const state = getTimerState(timerType);
        setTimeLeft(state.timeLeft || (state.isWorkPhase ? WORK_TIME : BREAK_TIME));
        setIsRunning(state.isRunning);
        setIsWorkPhase(state.isWorkPhase);
    }, [getTimerState, timerType, WORK_TIME]);

    // Function to play a sound when phase completes
    const playSound = () => {
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
    };

    // Function to handle phase completion
    const handlePhaseComplete = useCallback(() => {
        // Play sound
        playSound();
        
        // Vibrate if supported
        if ('vibrate' in navigator) {
            navigator.vibrate(200);
        }
        
        // Reset timer and switch phase
        if (isWorkPhase) {
            // Work phase completed, switch to break
            setTimeLeft(BREAK_TIME);
            setIsWorkPhase(false);
            
            // Display notification
            if (Notification.permission === "granted") {
                new Notification("Eye Break Time!", {
                    body: "Look at something 20 feet away for 20 seconds",
                    icon: "/favicon.ico"
                });
            }
        } else {
            // Break phase completed, switch to work
            setTimeLeft(WORK_TIME);
            setIsWorkPhase(true);
            
            // Display notification
            if (Notification.permission === "granted") {
                new Notification("Back to Work", {
                    body: "Time to resume working",
                    icon: "/favicon.ico"
                });
            }
        }
        
        // Update context
        updateTimer(timerType, {
            isRunning: true,
            timeLeft: isWorkPhase ? BREAK_TIME : WORK_TIME,
            isWorkPhase: !isWorkPhase
        });
    }, [isWorkPhase, updateTimer, timerType, WORK_TIME]);

    // Effects for countdown functionality
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            // Start timer
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (isRunning && timeLeft === 0) {
            // Time's up - perform phase transition
            handlePhaseComplete();
        }

        // Cleanup function to clear interval
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, timeLeft, handlePhaseComplete]);
    
    // Update context whenever timer state changes
    useEffect(() => {
        updateTimer(timerType, {
            isRunning,
            timeLeft,
            isWorkPhase
        });
    }, [isRunning, timeLeft, isWorkPhase, updateTimer, timerType]);

    // Function to toggle timer
    const toggleTimer = () => {
        // Request notification permission when starting timer
        if (!isRunning && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
        setIsRunning(!isRunning);
    };

    // Function to reset timer
    const resetTimer = () => {
        setIsRunning(false);
        setIsWorkPhase(true);
        setTimeLeft(WORK_TIME);
        
        // Update context
        updateTimer(timerType, {
            isRunning: false,
            timeLeft: WORK_TIME,
            isWorkPhase: true
        });
    };

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
                20/20/20 Timer
            </h2>
            
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