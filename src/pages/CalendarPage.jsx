// pages/CalendarPage.jsx
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Basis-CSS für den Kalender

function CalendarPage() {
  // State für das ausgewählte Datum
  const [date, setDate] = useState(new Date());
  
  // State für die Erfolgs- und Fehlschlagsdaten (aus localStorage)
  const [completionData, setCompletionData] = useState({
    // Format: { "2023-03-25": "completed", "2023-03-26": "failed" }
  });
  
  // State für den aktuellen Streak
  const [currentStreak, setCurrentStreak] = useState(0);
  
  // Funktion zum Formatieren eines Datums als String-Schlüssel
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // Laden der Daten aus dem localStorage beim ersten Rendern
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
  
  // Benutzerdefinierte Inhalte für Kalendertage
  const tileContent = ({ date, view }) => {
    // Nur für die Monatsansicht und wenn es Daten für dieses Datum gibt
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
  
  // Benutzerdefinierte Klassen für Kalendertage
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
  
  // Überprüfen, ob ein Datum in der Zukunft liegt
  const isDateInFuture = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };
  
  // Deaktivieren von Datumsauswahl in der Zukunft
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