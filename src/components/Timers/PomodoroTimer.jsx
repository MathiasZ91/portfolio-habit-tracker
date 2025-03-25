import { useState, useEffect, useRef, useCallback, useMemo } from 'react';


function PomodoroTimer() {
    const modes = useMemo(() => ({
        shortPomodoro: { workTime: 25 * 60, breakTime: 5 * 60 },
        longPomodoro: { workTime: 50 * 60, breakTime: 15 * 60 },
    }), []);

    //States
    const [mode, setMode] = useState('shortPomodoro');  // shortPomodoro oder longPomodoro
    const [timeLeft, setTimeLeft] = useState(modes.shortPomodoro.workTime); // Fixed: Set to a number, not object
    const [isRunning, setIsRunning] = useState(false); //  läuft der timer??
    const [isWorkPhase, setIsWorkPhase] = useState(true); // Arbeits- oder Pausenphase

    //Referenzen zum Speichern der Interval-ID für die Bereinigung
    const timerRef = useRef(null);

    // Funktion zum Abspielen eines Sounds bei Phasenabschluss
    const playSound = () => {
        // Einfacher Piepton mit Web Audio API
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
    
    // Funktion zum Wechseln der Phasen - Moved before useEffect
    const handlePhaseComplete = useCallback(() => {
        // Sound abspielen
        playSound();
        
        // Timer zurücksetzen und Phase Wechseln
        if (isWorkPhase) {
            //Arbeitsphase abgeschlossen, zur Pause wechseln
            setTimeLeft(modes[mode].breakTime);
            setIsWorkPhase(false);
        } else {
            // Pausenphase abgeschlossen, zur Arbeitsphase wechseln
            setTimeLeft(modes[mode].workTime);
            setIsWorkPhase(true);
        }
    }, [isWorkPhase, mode, modes]);

    //Effekte für die Countdown-Funktionalität
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            // Timer starten
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (isRunning && timeLeft === 0) {
            // Zeit abgelaufen - Phasenwechsel durchführen
            handlePhaseComplete();
        }

        // Aufräumfunktion zum löschen des Intervals
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
        // Dependency array for useEffect
    }, [isRunning, timeLeft, handlePhaseComplete]);

    // FUnktion zum Behalten des Modulswechsels
    const handleModeChange = (newMode) => {
        setMode(newMode);
        setTimeLeft(modes[newMode][isWorkPhase ? 'workTime' : 'breakTime']);
        setIsRunning(false);
    };

    //Funktion zum Umschalten des Timers
    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    //Funktion zum Zurücksetzen des Timers
    const resetTimer = () => {
        setIsRunning(false);
        setIsWorkPhase(true);
        setTimeLeft(modes[mode].workTime);
    };

    // Funktion zum Formatieren der Zeit als MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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
          
          {/* Timer display - made larger */}
          <div className="flex items-start justify-center w-full mb-10">
            <div className="timer w-64">
              <div className="bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 py-12 px-6 rounded-lg overflow-hidden">
                <h3 className="countdown-element font-semibold text-7xl text-gray-900 text-center">
                  {formatTime(timeLeft)}
                </h3>
              </div>
            </div>
          </div>
          
          {/* Timer controls - using your Button component with larger size */}
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