import { useState } from 'react';
import Button from '../common/Button';
import PropTypes from 'prop-types';

const NotesForm = ({ addNote }) => {
 // Track input field value
 const [inputValue, setInputValue] = useState('');

 // Update state on input change
 const handleInputChange = (e) => {
   setInputValue(e.target.value);
 };

 // Handle form submission
 const handleSubmit = (e) => {
   e.preventDefault(); // Prevent page reload
   
   // Only add notes with actual content
   if (inputValue.trim() !== '') {
     addNote(inputValue);
     setInputValue(''); // Reset input field
   }
 };
 
 return (
   <form 
     onSubmit={handleSubmit} 
     className="flex gap-2 mb-6"
   >
     <input
       type="text"
       value={inputValue}
       onChange={handleInputChange}
       placeholder="Add a new note..."
       className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
     />
     <Button type="submit">Add</Button>
   </form>
 );
};

NotesForm.propTypes = {
 addNote: PropTypes.func.isRequired,
};

export default NotesForm;