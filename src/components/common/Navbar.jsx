import { Link, useLocation } from 'react-router';
import { useEffect } from 'react';
import ProfileButton from '../common/ProfileButton';

/**
 * Responsive navigation component
 * - Shows tabs on desktop devices
 * - Shows dropdown menu on mobile
 * - Highlights active route
 */
const Navbar = () => {
  // Get current URL path to highlight active navigation item
  const location = useLocation();
  
  // Load streak from localStorage and update regularly
  useEffect(() => {
    const updateStreak = () => {
      const storedStreak = localStorage.getItem('habitsStreak');
      if (storedStreak) {
        // Load streak value from localStorage (not used yet)
        parseInt(JSON.parse(storedStreak), 10);
      }
    };
    
    // Initial load
    updateStreak();
    
    // Regular checking instead of event listener
    const intervalId = setInterval(updateStreak, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Navigation data in array for easy maintenance
  // To add/remove navigation items, just modify this array
  const navLinks = [
    { to: "/", label: "Daily Habits" },
    { to: "/calendar", label: "Calendar" },
    { to: "/timers", label: "Timers" },
    { to: "/notes", label: "Notes" },
    { to: "/login", label: "Sign In-Up" }
  ];

  return (
    <nav className="hidden md:block fixed top-0 left-0 w-full bg-white shadow-sm z-40 transition-opacity duration-300 ease-in-out">
      {/* Mobile navigation (only visible on small screens) */}
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">Select your tab</label>
        <select 
          id="tabs" 
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          // Set current path as selected value
          value={location.pathname}
          // Navigate to selected path when user picks an option
          onChange={(e) => {
            window.location.href = e.target.value;
          }}
        >
          {/* Generate options from navigation data */}
          {navLinks.map((link) => (
            <option key={link.to} value={link.to}>
              {link.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop navigation (hidden on small screens) */}
      <div className="flex justify-between items-center mx-4">
        <ul className="hidden text-sm font-medium text-center text-gray-500 rounded-lg shadow-sm sm:flex dark:divide-gray-700 dark:text-gray-400">
          {/* Generate tabs from navigation data */}
          {navLinks.map((link, index) => {
            // Check if link matches current URL path
            const isActive = location.pathname === link.to;
            // Special styling for first and last elements (rounded corners)
            const isFirst = index === 0;
            const isLast = index === navLinks.length - 1;
            
            // Start building className string
            let className = "inline-block w-full p-4 ";
            
            // Add styles based on active state
            if (isActive) {
              // Styling for active links (darker background etc.)
              className += "text-gray-900 bg-gray-100 focus:ring-4 focus:ring-blue-300 active focus:outline-none dark:bg-gray-700 dark:text-white ";
            } else {
              // Styling for inactive links with hover effects
              className += "bg-white hover:text-gray-700 hover:bg-gray-50 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700 ";
            }
            
            // Add position-specific styles (borders and rounded corners)
            if (isFirst) {
              // First element gets rounded corners on left
              className += "border-r border-gray-200 dark:border-gray-700 rounded-s-lg ";
            } else if (isLast) {
              // Last element gets rounded corners on right
              className += "border-s-0 border-gray-200 dark:border-gray-700 rounded-e-lg ";
            } else {
              // Middle elements get borders on right side
              className += "border-r border-gray-200 dark:border-gray-700 ";
            }
            
            // Standard link without streak display
            return (
              <li key={link.to} className="w-full focus-within:z-10">
                <Link 
                  to={link.to} 
                  className={className}
                  // aria-current improves accessibility by marking current page
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Profile Button added to the navbar */}
        <div className="hidden sm:block">
          <ProfileButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;