// DailyGoalsPage:
// Ist dein "Container" oder deine "Seite"
// Verwaltet den gesamten State (Habits, Abschluss-Status, erledigte Habits)
// Entscheidet, ob das Formular oder die Liste angezeigt wird

import { useState, useEffect } from "react";
import DailyGoalsForm from '../components/DailyGoals/DailyGoalsForm';
import GoalsList from '../components/DailyGoals/GoalsList';

function DailyGoalsPage() {
  // 1. State für die Habits definieren
  const [habits, setHabits] = useState([]);
  
  // 2. State für den Setup-Status
  const [isSetupCompleted, setIsSetupCompleted] = useState(false);
  
  // 3. State für die erledigten Habits
  const [completedHabits, setCompletedHabits] = useState([]);
  
  // Funktion zum Formatieren eines Datums als String-Schlüssel (im lokalen Format)
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // Funktion zum Aktualisieren des Habit-Status
  const updateCompletionStatus = (allCompleted) => {
    // Aktuelles Datum als Key verwenden
    const today = formatDate(new Date());
    
    // Aktuelle Daten aus dem localStorage laden
    const storedData = localStorage.getItem('habitsCompletionData');
    let completionData = storedData ? JSON.parse(storedData) : {};
    
    // Status aktualisieren (nur wenn er sich geändert hat)
    const currentStatus = completionData[today];
    const newStatus = allCompleted ? 'completed' : 'failed';
    
    if (currentStatus !== newStatus) {
      // Daten aktualisieren
      completionData[today] = newStatus;
      localStorage.setItem('habitsCompletionData', JSON.stringify(completionData));
      
      // Streak aktualisieren
      updateStreak(completionData);
    }
  };
  
  // Funktion zum Berechnen und Aktualisieren der Streak
  const updateStreak = (completionData) => {
    let streak = 0;
    const today = new Date();
    
    // Rückwärts durch die Tage gehen und die Streak berechnen
    for (let i = 0; i < 366; i++) { // Maximal 1 Jahr zurück
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = formatDate(date);
      
      // Wenn der Tag als abgeschlossen markiert ist, Streak erhöhen
      if (completionData[dateKey] === 'completed') {
        streak++;
      } else {
        // Bei einem fehlenden oder fehlgeschlagenen Tag die Schleife beenden
        break;
      }
    }
    
    // Streak im localStorage speichern
    localStorage.setItem('habitsStreak', JSON.stringify(streak));
  };
  
  // 4. Habits aus dem localStorage laden (beim ersten Rendern)
  useEffect(() => {
    const savedHabits = localStorage.getItem("habits");
    const savedSetupStatus = localStorage.getItem("isSetupCompleted");
    const savedCompletedHabits = localStorage.getItem("completedHabits");
    
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedSetupStatus) setIsSetupCompleted(JSON.parse(savedSetupStatus));
    if (savedCompletedHabits) setCompletedHabits(JSON.parse(savedCompletedHabits));
  }, []);
  
  // 5. Änderungen im State in localStorage speichern
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("isSetupCompleted", JSON.stringify(isSetupCompleted));
    localStorage.setItem("completedHabits", JSON.stringify(completedHabits));
  }, [habits, isSetupCompleted, completedHabits]);
  
  // Aktualisierung des Habit-Status, wenn alle Habits erledigt sind
  useEffect(() => {
    if (habits.length > 0 && completedHabits.length === habits.length) {
      updateCompletionStatus(true);
    }
  }, [completedHabits, habits, habits.length]);
  
  // Mitternachts-Überprüfung für den Tageswechsel
  useEffect(() => {
    // Funktion zum Planen der Mitternachts-Überprüfung
    const scheduleMidnightCheck = () => {
      const now = new Date();
      const night = new Date(now);
      night.setDate(night.getDate() + 1);
      night.setHours(0, 0, 0, 0);
      
      const timeToMidnight = night.getTime() - now.getTime();
      
      return setTimeout(() => {
        // Überprüfen, ob alle Habits für den Vortag erledigt wurden
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = formatDate(yesterday);
        
        // Daten laden
        const storedData = localStorage.getItem('habitsCompletionData');
        let completionData = storedData ? JSON.parse(storedData) : {};
        
        // Wenn kein Eintrag für gestern existiert, aber wir Habits hatten, als "failed" markieren
        if (!completionData[yesterdayKey] && habits.length > 0) {
          completionData[yesterdayKey] = 'failed';
          localStorage.setItem('habitsCompletionData', JSON.stringify(completionData));
          updateStreak(completionData);
        }
        
        // CompletedHabits für den neuen Tag zurücksetzen
        setCompletedHabits([]);
        
        // Nächste Überprüfung planen
        scheduleMidnightCheck();
      }, timeToMidnight);
    };
    
    const timerId = scheduleMidnightCheck();
    return () => clearTimeout(timerId);
  }, [habits.length]);
  
  // 6. Funktionen zur Verwaltung der Habits
  const handleAddHabit = (habit) => {
    if (habits.length < 5) {
      setHabits([...habits, habit]);
    }
  };

  const handleCompleteSetup = () => {
    if (habits.length > 0) {
      setIsSetupCompleted(true);
    }
  };

  const handleToggleHabit = (habitId) => {
    if (completedHabits.includes(habitId)) {
      // Habit aus completedHabits entfernen
      setCompletedHabits(completedHabits.filter((id) => id !== habitId));
    } else {
      // Habit zu completedHabits hinzufügen
      setCompletedHabits([...completedHabits, habitId]);
    }
  };

  // Funktion zum zurücksetzen
  const handleResetSetup = () => {
    setIsSetupCompleted(false);
    setCompletedHabits([]);
  };

  // 7. Überprüfung, ob alle Habits erledigt sind
  const allHabitsCompleted = habits.length > 0 && completedHabits.length === habits.length;

  // 8. Komponente rendern
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Daily Goals Tracker</h1>
      
      {isSetupCompleted ? (
        //Tracking-Ansicht anzeigen
        <GoalsList
          habits={habits}
          completedHabits={completedHabits}
          onToggleHabit={handleToggleHabit}
          allCompleted={allHabitsCompleted}
          onReset={handleResetSetup}
        />
      ) : (
        // Setup-Formular anzeigen
        <DailyGoalsForm
          habits={habits}
          onAddHabit={handleAddHabit}
          onCompleteSetup={handleCompleteSetup}
          maxHabits={5}
        />
      )}
    </div>
  );
}

export default DailyGoalsPage;