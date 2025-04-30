// pages/CalendarPage.jsx
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Base CSS for calendar

function CalendarPage() {
 // Selected date state
 const [date, setDate] = useState(new Date());
 
 // Habit completion data from localStorage
 const [completionData, setCompletionData] = useState({
   // Format: { "2023-03-25": "completed", "2023-03-26": "failed" }
 });
 
 // Current streak counter
 const [currentStreak, setCurrentStreak] = useState(0);
 
 // Format date as string key
 const formatDate = (date) => {
   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
 };
 
 // Load data from localStorage on initial render
 useEffect(() => {
   const storedCompletionData = localStorage.getItem('habitsCompletionData');
   const storedStreak = localStorage.getItem('habitsStreak');
   
   if (storedCompletionData) {
     setCompletionData(JSON.parse(storedCompletionData));
   }
   
   if (storedStreak) {
     setCurrentStreak(parseInt(JSON.parse(storedStreak), 10));
   }
 }, []);
 
 // Custom content for calendar tiles
 const tileContent = ({ date, view }) => {
   // Only for month view with data for this date
   if (view === 'month') {
     const dateKey = formatDate(date);
     const status = completionData[dateKey];
     
     if (status === 'completed') {
       return <span className="text-green-600">✓</span>;
     } else if (status === 'failed') {
       return <span className="text-red-600">✗</span>;
     }
   }
   return null;
 };
 
 // Custom classes for calendar tiles
 const tileClassName = ({ date, view }) => {
   if (view === 'month') {
     const dateKey = formatDate(date);
     const status = completionData[dateKey];
     
     if (status === 'completed') {
       return 'bg-green-100';
     } else if (status === 'failed') {
       return 'bg-red-100';
     }
   }
   return null;
 };
 
 // Check if date is in the future
 const isDateInFuture = (date) => {
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   return date > today;
 };
 
 // Disable date selection in the future
 const tileDisabled = ({ date, view }) => {
   if (view === 'month') {
     return isDateInFuture(date);
   }
   return false;
 };

 return (
   <div className="container mx-auto p-4">
     <h1 className="text-2xl font-bold mb-6">Habit Calendar</h1>
     
     <div className="bg-white p-6 rounded-lg shadow-md">
       <Calendar
         onChange={setDate}
         value={date}
         tileContent={tileContent}
         tileClassName={tileClassName}
         tileDisabled={tileDisabled}
         className="mx-auto"
       />
       
       <div className="mt-6 text-center">
         <p className="text-xl">
           Streak: <span className="font-bold">{currentStreak}</span>
           {currentStreak > 0 && <span className="ml-2">🔥</span>}
         </p>
         {currentStreak === 0 && (
           <p className="text-sm text-gray-600 mt-2">
             Complete all habits for multiple days to grow your streak!
           </p>
         )}
       </div>
     </div>
   </div>
 );
}

export default CalendarPage;