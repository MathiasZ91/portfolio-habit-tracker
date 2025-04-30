import Button from '../common/Button';
import PropTypes from 'prop-types';

const NotesItem = ({ note, toggleComplete, deleteNote }) => {
 const handleToggle = () => {
   toggleComplete(note.id);
 };
 
 const handleDelete = () => {
   deleteNote(note.id);
 };
 
 return (
   <div className={`flex justify-between items-center p-4 border border-gray-200 rounded-md ${note.completed ? 'bg-gray-50' : 'bg-white'}`}>
     <div 
       className="flex-1 cursor-pointer"
       onClick={handleToggle}
       style={{ textDecoration: note.completed ? 'line-through' : 'none' }}
     >
       {note.text}
     </div>
     
     <div className="flex gap-2">
       <Button onClick={handleToggle}>
         {note.completed ? 'Undo' : 'Complete'}
       </Button>
       <Button onClick={handleDelete}>Delete</Button>
     </div>
   </div>
 );
};

NotesItem.propTypes = {
 note: PropTypes.shape({
   id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
   text: PropTypes.string.isRequired,
   completed: PropTypes.bool.isRequired,
 }).isRequired,
 toggleComplete: PropTypes.func.isRequired,
 deleteNote: PropTypes.func.isRequired,
};

export default NotesItem;