import  { useState } from 'react';
import PropTypes from 'prop-types'; // PropTypes importieren
import Button from '../common/Button';
import Input from '../common/Input';

function DailyGoalsForm({ habits, onAddHabit, onCompleteSetup, maxHabits }) {
  // State für die neue Gewohnheit, die eingegeben wird
  const [newHabit, setNewHabit] = useState('');
  
  // State für Fehlermeldungen
  const [error, setError] = useState('');
  
  // Handler für das Absenden des Formulars
  const handleSubmit = (e) => {
    e.preventDefault(); // Verhindert das Neuladen der Seite
    
    // Validierung: Prüfung, ob die Eingabe leer ist
    if (!newHabit.trim()) {
      setError('Please enter a habit');
      return;
    }
    
    // Validierung: Prüfen, ob die Gewohnheit bereits existiert
    if (habits.includes(newHabit.trim())) {
      setError('This habit already exists');
      return;
    }
    
    // Wenn alles ok ist: Gewohnheit hinzufügen, Eingabefeld leeren und Fehler zurücksetzen
    onAddHabit(newHabit.trim());
    setNewHabit('');
    setError('');
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Which habits do you want to track?</h2>
      <p className="mb-4 text-gray-600">Add up to {maxHabits} daily habits that you want to track.</p>
      
      {/* Formular zum Hinzufügen von Habits */}
      <form onSubmit={handleSubmit} className="mb-6"> {/* War: onSUbmit (U groß) */}
        <div className="flex flex-col md:flex-row gap-2">
          {/* Input-Feld für neue Gewohnheiten */}
          <Input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Enter new habits..."
            maxLength={30}
            className="flex-grow"
            disabled={habits.length >= maxHabits} // Deaktiviert, wenn maximale Anzahl erreicht
          />
          {/* Button zum Hinzufügen */}
          <Button
            type="submit"
            disabled={habits.length >= maxHabits || !newHabit.trim()}
          >
            Add
          </Button>
        </div>
        
        {/* Fehlermeldung anzeigen, falls vorhanden */}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {/* Hinweis anzeigen, wenn maximale Anzahl erreicht ist */}
        {habits.length >= maxHabits && (
          <p className="text-red-500 mt-2">You have already reached the maximum number of habits added.</p>
        )}
      </form>
      
      {/* Liste der bereits hinzugefügten Habits */}
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
      
      {/* Button zum Abschließen des Setups */}
      <div className="mt-6">
        <Button
          onClick={onCompleteSetup}
          disabled={habits.length === 0} // Deaktiviert, wenn keine Habits hinzugefügt wurden
          className="w-full"
        >
          Ready - start tracking
        </Button>
      </div>
    </div>
  );
}

// PropTypes Definition
DailyGoalsForm.propTypes = {
  habits: PropTypes.array.isRequired,
  onAddHabit: PropTypes.func.isRequired,
  onCompleteSetup: PropTypes.func.isRequired,
  maxHabits: PropTypes.number.isRequired
};

export default DailyGoalsForm;