import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTimer } from '../../context/TimerContext';

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
    const [mode, setMode] = useState(contextState.mode);
    const [timeLeft, setTimeLeft] = useState(contextState.timeLeft || modes.shortPomodoro.workTime);
    const [isRunning, setIsRunning] = useState(contextState.isRunning);
    const [isWorkPhase, setIsWorkPhase] = useState(contextState.isWorkPhase);

    // Reference for storing interval ID for cleanup
    const timerRef = useRef(null);

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
    
    // Update state based on context when component mounts or regains focus
    useEffect(() => {
        const state = getTimerState(timerType);
        setMode(state.mode);
        setTimeLeft(state.timeLeft || modes.shortPomodoro.workTime);
        setIsRunning(state.isRunning);
        setIsWorkPhase(state.isWorkPhase);
    }, [getTimerState, timerType, modes.shortPomodoro.workTime]);
    
    // Function to handle phase completion
    const handlePhaseComplete = useCallback(() => {
        // Play sound
        playSound();
        
        // Vibrate if supported
        if ('vibrate' in navigator) {
            navigator.vibrate(200);
        }
        
        // Switch phases
        if (isWorkPhase) {
            setTimeLeft(modes[mode].breakTime);
            setIsWorkPhase(false);
        } else {
            setTimeLeft(modes[mode].workTime);
            setIsWorkPhase(true);
        }
        
        // Update context
        updateTimer(timerType, {
            isRunning: true,
            timeLeft: isWorkPhase ? modes[mode].breakTime : modes[mode].workTime,
            isWorkPhase: !isWorkPhase,
            mode
        });
    }, [isWorkPhase, mode, modes, updateTimer, timerType]);

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
            isWorkPhase,
            mode
        });
    }, [isRunning, timeLeft, isWorkPhase, mode, updateTimer, timerType]);

    // Function for switching Pomodoro mode
    const handleModeChange = (newMode) => {
        setMode(newMode);
        setTimeLeft(modes[newMode][isWorkPhase ? 'workTime' : 'breakTime']);
        setIsRunning(false);
        
        // Update context
        updateTimer(timerType, {
            isRunning: false,
            timeLeft: modes[newMode][isWorkPhase ? 'workTime' : 'breakTime'],
            isWorkPhase,
            mode: newMode
        });
    };

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
        setTimeLeft(modes[mode].workTime);
        
        // Update context
        updateTimer(timerType, {
            isRunning: false,
            timeLeft: modes[mode].workTime,
            isWorkPhase: true,
            mode
        });
    };

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Rest of your component remains the same
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