import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/* KEY CONCEPT: BACKGROUND-FRIENDLY TIMER USING TIMESTAMPS */
function PomodoroTimer() {
    const modes = useMemo(() => ({
        shortPomodoro: { workTime: 25 * 60, breakTime: 5 * 60 },
        longPomodoro: { workTime: 50 * 60, breakTime: 15 * 60 },
    }), []);

    // States
    const [mode, setMode] = useState('shortPomodoro');
    const [timeLeft, setTimeLeft] = useState(modes.shortPomodoro.workTime);
    const [isRunning, setIsRunning] = useState(false);
    const [currentPhase, setCurrentPhase] = useState('work'); // Use state instead of just ref to display in UI

    // Refs for timestamp-based timing
    const timerRef = useRef(null);
    const endTimeRef = useRef(null);

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
            if (currentPhase === 'work') {
                // Work phase completed, switch to break
                setCurrentPhase('break');
                setTimeLeft(modes[mode].breakTime);
                
                if (isRunning) {
                    // Set new end time
                    const newEndTime = Date.now() + modes[mode].breakTime * 1000;
                    endTimeRef.current = newEndTime;
                }
                
                // Display notification
                if (Notification.permission === "granted") {
                    try {
                        new Notification("Break Time!", {
                            body: "Time to take a short break",
                            icon: "/favicon.ico"
                        });
                    } catch (error) {
                        console.error("Error showing notification:", error);
                    }
                }
            } else {
                // Break phase completed, switch to work
                setCurrentPhase('work');
                setTimeLeft(modes[mode].workTime);
                
                if (isRunning) {
                    // Set new end time
                    const newEndTime = Date.now() + modes[mode].workTime * 1000;
                    endTimeRef.current = newEndTime;
                }
                
                // Display notification
                if (Notification.permission === "granted") {
                    try {
                        new Notification("Focus Time!", {
                            body: "Time to get back to work",
                            icon: "/favicon.ico"
                        });
                    } catch (error) {
                        console.error("Error showing notification:", error);
                    }
                }
            }
        } else {
            // Update displayed time
            setTimeLeft(diff);
        }
    }, [currentPhase, isRunning, mode, modes, playSound]);

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

    // Start/stop timer logic
    useEffect(() => {
        if (isRunning) {
            // Set when this phase will end
            const duration = currentPhase === 'work' ? modes[mode].workTime : modes[mode].breakTime;
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
        
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, currentPhase, mode, modes, timerTick]);

    // Function to handle mode change
    const handleModeChange = useCallback((newMode) => {
        setMode(newMode);
        
        // Reset timer with new mode
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        setIsRunning(false);
        setCurrentPhase('work');
        setTimeLeft(modes[newMode].workTime);
        endTimeRef.current = null;
    }, [modes]);

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
        setCurrentPhase('work');
        setTimeLeft(modes[mode].workTime);
        endTimeRef.current = null;
    }, [mode, modes]);

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
          
          {/* Mode selection with different styling */}
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
          
          {/* Timer controls */}
          <div className="flex gap-4 w-full">
            <button 
              onClick={toggleTimer}
              className={`w-1/2 py-3 px-4 rounded-lg text-lg font-medium transition-colors bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 text-gray-900`}
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button 
              onClick={resetTimer}
              className={`w-1/2 py-3 px-4 rounded-lg text-lg font-medium transition-colors bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 text-gray-900`}
            >
              Reset
            </button>
          </div>
        </div>
    );
}

export default PomodoroTimer;