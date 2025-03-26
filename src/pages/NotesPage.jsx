// Main container component for Notes functionality
import React, { useState, useEffect } from 'react';
import NotesForm from '../components/Notes/NotesForm';
import NotesList from '../components/Notes/NotesList';

const NotesPage = () => {
  // State to hold all notes
  const [notes, setNotes] = useState([]);
  
  // Load notes from localStorage when component mounts
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Function to add a new note
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

  // Function to toggle completion status
  const toggleComplete = (id) => {
    setNotes(
      notes.map(note => 
        note.id === id 
          ? { ...note, completed: !note.completed } 
          : note
      )
    );
  };

  // Function to delete a note
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