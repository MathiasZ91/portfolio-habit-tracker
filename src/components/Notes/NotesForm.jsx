import { useState } from 'react';
import Button from '../common/Button';
import PropTypes from 'prop-types';

const NotesForm = ({ addNote }) => {
  // Wir verwenden den useState-Hook, um den Wert des Eingabefelds zu verfolgen
  // Dies macht unser Eingabefeld zu einer "kontrollierten Komponente" - React kontrolliert den Wert
  const [inputValue, setInputValue] = useState('');

  // Diese Handler-Funktion wird bei jeder Änderung des Eingabewerts aufgerufen
  // Sie aktualisiert den State und hält unsere UI synchron mit dem Datenmodell
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Diese Handler-Funktion wird beim Absenden des Formulars aufgerufen
  // Sie verhindert das Standard-Verhalten des Browsers (Neuladen der Seite)
  // und ruft dann die übergebene addNote-Funktion mit dem aktuellen Wert auf
  const handleSubmit = (e) => {
    e.preventDefault(); // Verhindert das Neuladen der Seite
    
    // Wir fügen nur Notizen hinzu, die tatsächlich Text enthalten
    // trim() entfernt Leerzeichen am Anfang und Ende
    if (inputValue.trim() !== '') {
      addNote(inputValue); // Ruft die vom Elternteil übergebene Funktion auf
      setInputValue(''); // Setzt das Eingabefeld zurück für bessere UX
    }
  };
  
  return (
    <form 
      onSubmit={handleSubmit} 
      // Wir verwenden Flexbox für das Layout des Formulars
      // gap-2 sorgt für einen gleichmäßigen Abstand zwischen den Elementen
      className="flex gap-2 mb-6"
    >
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Add a new note..."
        // Styling mit Tailwind:
        // - flex-1 lässt das Eingabefeld den verfügbaren Platz einnehmen
        // - Padding, Border und Rounded für ein ansprechendes Aussehen
        // - Focus-Styles für bessere Zugänglichkeit
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {/* 
        Wir verwenden unsere eigene Button-Komponente 
        anstelle eines standard HTML-Buttons für Konsistenz
      */}
      <Button type="submit">Add</Button>
    </form>
  );
};
NotesForm.propTypes = {
  addNote: PropTypes.func.isRequired,
};

export default NotesForm;