import React, { useState, useEffect } from "react";
import DailyGoalsForm from '../components/DailyGoals/DailyGoalsForm';
import GoalsList from '../components/DailyGoals/GoalsList'; 
import Button from '../components/common/Button';



function DailyGoalsPage() {
  // 1. State für die Habits definieren
  const [habits, setHabits] = useState([]);

  // 2. State für den Setup-Status
  const [isSetupCompleted, setIsSetupCompleted] = useState(false);

  // 3. State für die erledigten Habits
  const [completedHabits, setCompletedHabits] = useState([]);

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