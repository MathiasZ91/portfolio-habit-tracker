// Shows habit checklist with reset button and celebration on completion
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import GoalItem from './GoalItem';
import CelebrationModal from './CelebrationModal';

function GoalsList({ habits, completedHabits, onToggleHabit, allCompleted, onReset }) {
  const [showCelebration, setShowCelebration] = useState(false);

  // Show celebration when all habits are completed
  useEffect(() => {
    if (allCompleted && habits.length > 0) {
      setShowCelebration(true);
    }
  }, [allCompleted, habits.length]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Today&apos;s Habits</h2>
        <Button onClick={onReset}>Reset</Button>
      </div>

      {habits.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t set up any habits yet. Click Reset to add some.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {habits.map((habit, index) => (
            <GoalItem
              key={index}
              id={index}
              habit={habit}
              completed={completedHabits.includes(index)}
              onToggle={() => onToggleHabit(index)}
            />
          ))}
        </div>
      )}

      {showCelebration && (
        <CelebrationModal onClose={() => setShowCelebration(false)} />
      )}
    </div>
  );
}

// PropTypes definition
GoalsList.propTypes = {
  habits: PropTypes.arrayOf(PropTypes.string).isRequired,
  completedHabits: PropTypes.arrayOf(PropTypes.number).isRequired,
  onToggleHabit: PropTypes.func.isRequired,
  allCompleted: PropTypes.bool.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default GoalsList;