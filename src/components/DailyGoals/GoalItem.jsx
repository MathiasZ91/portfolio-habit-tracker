//GoalItem:

// Represents a single habit button
// Changes appearance based on status (completed/not completed)
// Responds to clicks to change status

function GoalItem({ habit, completed, onToggle }) {
  // Different styles for completed and uncompleted habits
  const buttonClasses = `
    w-full p-4 rounded-lg shadow-sm transition-all duration-200 
    ${completed 
      ? 'bg-gray-200 text-gray-600 border-green-500 border-2' 
      : 'bg-white text-gray-900 border border-gray-200 hover:border-blue-500'}
  `;
 
  return (
    <button
      className={buttonClasses}
      onClick={onToggle}
      aria-pressed={completed}
    >
      <div className="flex items-center">
        <div className={`w-4 h-4 rounded-full mr-3 ${completed ? 'bg-green-500' : 'bg-gray-200'}`}></div>
        <span className={completed ? 'line-through' : ''}>{habit}</span>
      </div>
    </button>
  );
 }
 
 import PropTypes from 'prop-types';
 
 GoalItem.propTypes = {
  habit: PropTypes.string.isRequired,
  completed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
 };
 
 export default GoalItem;