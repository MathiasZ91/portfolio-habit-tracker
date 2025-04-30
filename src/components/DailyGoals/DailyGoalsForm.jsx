// DailyGoalsForm:

// Shows a form for setting up habits
// Allows user to add up to 5 habits
// Has a "Done" button to complete setup

import  { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import Button from '../common/Button';
import Input from '../common/Input';

function DailyGoalsForm({ habits, onAddHabit, onCompleteSetup, maxHabits }) {
 // State for new habit being entered
 const [newHabit, setNewHabit] = useState('');
 
 // State for error messages
 const [error, setError] = useState('');
 
 // Form submission handler
 const handleSubmit = (e) => {
   e.preventDefault(); // Prevents page reload
   
   // Validation: Check if input is empty
   if (!newHabit.trim()) {
     setError('Please enter a habit');
     return;
   }
   
   // Validation: Check if habit already exists
   if (habits.includes(newHabit.trim())) {
     setError('This habit already exists');
     return;
   }
   
   // If all is good: Add habit, clear input field and reset error
   onAddHabit(newHabit.trim());
   setNewHabit('');
   setError('');
 };
 
 return (
   <div className="bg-white p-6 rounded-lg shadow-md">
     <h2 className="text-xl font-bold mb-4">Which habits do you want to track?</h2>
     <p className="mb-4 text-gray-600">Add up to {maxHabits} daily habits that you want to track.</p>
     
     {/* Form for adding habits */}
     <form onSubmit={handleSubmit} className="mb-6">
       <div className="flex flex-col md:flex-row gap-2">
         {/* Input field for new habits */}
         <Input
           type="text"
           value={newHabit}
           onChange={(e) => setNewHabit(e.target.value)}
           placeholder="Enter new habits..."
           maxLength={30}
           className="flex-grow"
           disabled={habits.length >= maxHabits} // Disabled when max is reached
         />
         {/* Add button */}
         <Button
           type="submit"
           disabled={habits.length >= maxHabits || !newHabit.trim()}
         >
           Add
         </Button>
       </div>
       
       {/* Display error message if present */}
       {error && <p className="text-red-500 mt-2">{error}</p>}
       {/* Show notification when maximum number is reached */}
       {habits.length >= maxHabits && (
         <p className="text-red-500 mt-2">You have already reached the maximum number of habits added.</p>
       )}
     </form>
     
     {/* List of already added habits */}
     {habits.length > 0 && (
       <div className="mb-6">
         <h3 className="font-bold mb-2">Your Habits:</h3>
         <ul className="bg-gray-50 rounded-lg p-3">
           {habits.map((habit, index) => (
             <li key={index} className="mb-2 p-2 bg-white border border-gray-200 rounded">
               {habit}
             </li>
           ))}
         </ul>
       </div>
     )}
     
     {/* Button to complete setup */}
     <div className="mt-6">
       <Button
         onClick={onCompleteSetup}
         disabled={habits.length === 0} // Disabled when no habits added
         className="w-full"
       >
         Ready - start tracking
       </Button>
     </div>
   </div>
 );
}

// PropTypes definition
DailyGoalsForm.propTypes = {
 habits: PropTypes.array.isRequired,
 onAddHabit: PropTypes.func.isRequired,
 onCompleteSetup: PropTypes.func.isRequired,
 maxHabits: PropTypes.number.isRequired
};

export default DailyGoalsForm;