// LoadingSpinner.jsx
// This is a simple loading spinner component using Tailwind CSS
// It displays a spinning circle animation to indicate loading state
// Usage: import and use <LoadingSpinner /> in any component where you need to show loading



const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default LoadingSpinner;