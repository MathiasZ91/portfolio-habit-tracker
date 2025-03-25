// Konzept für TimerDisplay
import PropTypes from 'prop-types';

function TimerDisplay({ minutes, seconds }) {
    return (
      <div className="flex items-start justify-center w-full gap-4">
        <span>{minutes} Minuten</span>
        <span>{seconds} Sekunden</span>
      </div>
    );
}

TimerDisplay.propTypes = {
    minutes: PropTypes.number.isRequired,
    seconds: PropTypes.number.isRequired,
};

export default TimerDisplay;