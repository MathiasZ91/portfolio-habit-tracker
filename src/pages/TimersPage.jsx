import { useState, useEffect } from 'react';
import PomodoroTimer from '../components/Timers/PomodoroTimer';
import EyeCareTimer from '../components/Timers/EyeCareTimer';
import { useTimer } from '../hooks/UseTimer';

const TimersPage = () => {
 const { setIsTimerPageActive } = useTimer();
 const [activeTab, setActiveTab] = useState('pomodoro');
 
 // Notify context when timer page is active/inactive
 useEffect(() => {
   setIsTimerPageActive(true);
   
   return () => {
     setIsTimerPageActive(false);
   };
 }, [setIsTimerPageActive]);
 
 return (
   <div className="container mx-auto px-4 py-8 text-gray-800">
     <h1 className="text-3xl font-bold mb-8 text-center">Productivity Timers</h1>
     
     <div className="max-w-2xl mx-auto mb-10">
       <div className="flex border-b">
         <button
           className={`px-6 py-2 text-lg font-medium w-1/2 text-center transition-colors ${
             activeTab === 'pomodoro'
               ? 'border-b-2 border-red-400 text-red-500'
               : ''
           }`}
           onClick={() => setActiveTab('pomodoro')}
         >
           Pomodoro
         </button>
         
         <button
           className={`px-6 py-2 text-lg font-medium w-1/2 text-center transition-colors ${
             activeTab === 'eyecare'
               ? 'border-b-2 border-red-400 text-red-500'
               : ''
           }`}
           onClick={() => setActiveTab('eyecare')}
         >
           Eye Care
         </button>
       </div>
     </div>
     
     <div className="max-w-2xl mx-auto py-8">
       {activeTab === 'pomodoro' ? (
         <PomodoroTimer />
       ) : (
         <EyeCareTimer />
       )}
     </div>
   </div>
 );
};

export default TimersPage;