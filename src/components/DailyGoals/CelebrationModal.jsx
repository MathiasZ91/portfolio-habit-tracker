// components/DailyGoals/CelebrationModal.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Confetti from 'react-confetti';
import Button from '../common/Button';

function CelebrationModal({ onClose }) {
  // State für die Konfetti-Animation
  const [confettiActive, setConfettiActive] = useState(true);
  
  // Automatisches Stoppen der Konfetti-Animation nach 5 Sekunden
  useEffect(() => {
    const timer = setTimeout(() => {
      setConfettiActive(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Konfetti-Animation */}
      {confettiActive && (
        <Confetti 
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center relative z-10">
        <h2 className="text-2xl font-bold mb-4">Congratulations! 🎉</h2>
        <p className="mb-6">You&#39;ve completed all your habits for today!</p>
        <p className="text-gray-600 mb-6">Keep up the great work. Consistency is key to building lasting habits.</p>
        
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
CelebrationModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default CelebrationModal;