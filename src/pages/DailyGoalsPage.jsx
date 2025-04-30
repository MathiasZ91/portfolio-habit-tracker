// DailyGoalsPage:
// Container component managing habits state and UI display logic

import { useState, useEffect, useCallback } from "react";
import DailyGoalsForm from '../components/DailyGoals/DailyGoalsForm';
import GoalsList from '../components/DailyGoals/GoalsList';

function DailyGoalsPage() {
  // Core state management
  const [habits, setHabits] = useState([]);
  const [isSetupCompleted, setIsSetupCompleted] = useState(false);
  const [completedHabits, setCompletedHabits] = useState([]);
  
  // Format date as string key (YYYY-MM-DD)
  const formatDate = useCallback((date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, []);
  
  // Calculate and update streak counter
  const updateStreak = useCallback((completionData) => {
    let streak = 0;
    const today = new Date();
    
    // Count consecutive completed days
    for (let i = 0; i < 366; i++) { // Max 1 year back
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = formatDate(date);
      
      if (completionData[dateKey] === 'completed') {
        streak++;
      } else {
        break;
      }
    }
    
    localStorage.setItem('habitsStreak', JSON.stringify(streak));
  }, [formatDate]);
  
  // Update habit completion status in localStorage
  const updateCompletionStatus = useCallback((allCompleted) => {
    const today = formatDate(new Date());
    const storedData = localStorage.getItem('habitsCompletionData');
    let completionData = storedData ? JSON.parse(storedData) : {};
    
    const currentStatus = completionData[today];
    const newStatus = allCompleted ? 'completed' : 'failed';
    
    if (currentStatus !== newStatus) {
      completionData[today] = newStatus;
      localStorage.setItem('habitsCompletionData', JSON.stringify(completionData));
      
      updateStreak(completionData);
    }
  }, [formatDate, updateStreak]);
  
  // Load data from localStorage on initial render
  useEffect(() => {
    const savedHabits = localStorage.getItem("habits");
    const savedSetupStatus = localStorage.getItem("isSetupCompleted");
    const savedCompletedHabits = localStorage.getItem("completedHabits");
    
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedSetupStatus) setIsSetupCompleted(JSON.parse(savedSetupStatus));
    if (savedCompletedHabits) setCompletedHabits(JSON.parse(savedCompletedHabits));
  }, []);
  
  // Save state changes to localStorage
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("isSetupCompleted", JSON.stringify(isSetupCompleted));
    localStorage.setItem("completedHabits", JSON.stringify(completedHabits));
  }, [habits, isSetupCompleted, completedHabits]);
  
  // Update completion status when all habits are completed
  useEffect(() => {
    if (habits.length > 0 && completedHabits.length === habits.length) {
      updateCompletionStatus(true);
    }
  }, [completedHabits, habits, habits.length, updateCompletionStatus]);
  
  // Handle day change at midnight
  useEffect(() => {
    const scheduleMidnightCheck = () => {
      const now = new Date();
      const night = new Date(now);
      night.setDate(night.getDate() + 1);
      night.setHours(0, 0, 0, 0);
      
      const timeToMidnight = night.getTime() - now.getTime();
      
      return setTimeout(() => {
        // Check if yesterday's habits were completed
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = formatDate(yesterday);
        
        const storedData = localStorage.getItem('habitsCompletionData');
        let completionData = storedData ? JSON.parse(storedData) : {};
        
        // Mark as failed if no entry exists for yesterday
        if (!completionData[yesterdayKey] && habits.length > 0) {
          completionData[yesterdayKey] = 'failed';
          localStorage.setItem('habitsCompletionData', JSON.stringify(completionData));
          updateStreak(completionData);
        }
        
        // Reset completed habits for new day
        setCompletedHabits([]);
        
        // Schedule next check
        scheduleMidnightCheck();
      }, timeToMidnight);
    };
    
    const timerId = scheduleMidnightCheck();
    return () => clearTimeout(timerId);
  }, [habits.length, formatDate, updateStreak]);
  
  // Habit management functions
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
      // Remove habit from completed list
      setCompletedHabits(completedHabits.filter((id) => id !== habitId));
    } else {
      // Add habit to completed list
      setCompletedHabits([...completedHabits, habitId]);
    }
  };

  const handleResetSetup = () => {
    setIsSetupCompleted(false);
    setCompletedHabits([]);
  };

  // Check if all habits are completed
  const allHabitsCompleted = habits.length > 0 && completedHabits.length === habits.length;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Daily Goals Tracker</h1>
      
      {isSetupCompleted ? (
        // Show tracking view
        <GoalsList
          habits={habits}
          completedHabits={completedHabits}
          onToggleHabit={handleToggleHabit}
          allCompleted={allHabitsCompleted}
          onReset={handleResetSetup}
        />
      ) : (
        // Show setup form
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