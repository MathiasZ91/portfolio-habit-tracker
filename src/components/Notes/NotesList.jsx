
import NotesItem from "./NotesItem";
import PropTypes from "prop-types";

const NotesList = ({ notes, toggleComplete, deleteNote }) => {
  if (notes.length === 0) {
    return <p className="text-center text-gray-500 italic mt-4">No notes yet. Add one above!</p>;
  }
  
  return (
    <div className="flex flex-col gap-3 mt-4">
      {notes.map(note => (
        <NotesItem
          key={note.id}
          note={note}
          toggleComplete={toggleComplete}
          deleteNote={deleteNote}
        />
      ))}
    </div>
  );
};

NotesList.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
    })
  ).isRequired,
  toggleComplete: PropTypes.func.isRequired,
  deleteNote: PropTypes.func.isRequired,
};

export default NotesList;