// src/pages/TimersPage.jsx
import { useState, useEffect } from 'react';
import PomodoroTimer from '../components/Timers/PomodoroTimer';
import EyeCareTimer from '../components/Timers/EyeCareTimer';
import { useTimer } from '../context/TimerContext';

function TimersPage() {
  // Initialize with 'pomodoro' as the default selected timer
  const [activeTimer, setActiveTimer] = useState('pomodoro');
  
  // Get timer context functions
  const { setIsTimerPageActive } = useTimer();
  
  // Tell the context when timer page is active/inactive
  useEffect(() => {
    setIsTimerPageActive(true);
    return () => setIsTimerPageActive(false);
  }, [setIsTimerPageActive]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Productivity Timers</h1>
      
      {/* Timer selection buttons */}
      <div className="flex gap-4 mb-8 w-full">
        <button 
          onClick={() => setActiveTimer('pomodoro')}
          className={`w-1/2 py-3 px-4 rounded-lg text-lg font-medium transition-colors ${
            activeTimer === 'pomodoro'
              ? 'bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 text-gray-900'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pomodoro Timer
        </button>
        <button 
          onClick={() => setActiveTimer('eyecare')}
          className={`w-1/2 py-3 px-4 rounded-lg text-lg font-medium transition-colors ${
            activeTimer === 'eyecare'
              ? 'bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 text-gray-900'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          20/20/20 Timer
        </button>
      </div>
      
      {/* Display the selected timer component */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTimer === 'pomodoro' ? (
          <PomodoroTimer />
        ) : (
          <EyeCareTimer />
        )}
      </div>
    </div>
  );
}

export default TimersPage;