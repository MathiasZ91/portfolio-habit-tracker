// Main container for Notes functionality
import { useState, useEffect } from 'react';
import NotesForm from '../components/Notes/NotesForm';
import NotesList from '../components/Notes/NotesList';

const NotesPage = () => {
  // Store notes collection
  const [notes, setNotes] = useState([]);
  
  // Load saved notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes when they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Create new note
  const addNote = (text) => {
    if (text.trim() !== '') {
      const newNote = {
        id: Date.now(),
        text,
        completed: false
      };
      setNotes([...notes, newNote]);
    }
  };

  // Update note completion status
  const toggleComplete = (id) => {
    setNotes(
      notes.map(note => 
        note.id === id 
          ? { ...note, completed: !note.completed } 
          : note
      )
    );
  };

  // Remove note
  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="notes-page">
      <h1>My Notes</h1>
      <NotesForm addNote={addNote} />
      <NotesList 
        notes={notes} 
        toggleComplete={toggleComplete} 
        deleteNote={deleteNote} 
      />
    </div>
  );
};

export default NotesPage;