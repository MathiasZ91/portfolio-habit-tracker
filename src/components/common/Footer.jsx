import { Link, useLocation } from 'react-router';
import { MdHome, MdCalendarMonth, MdTimer, MdChecklist, MdPerson } from 'react-icons/md';

const Footer = () => {
  // Get current URL path to detect active links
  const location = useLocation();
  // Get current year for copyright text
  const currentYear = new Date().getFullYear();
  
  // Navigation links with icons for mobile navigation
  const navLinks = [
    { to: "/", label: "Habits", icon: MdHome },
    { to: "/calendar", label: "Calendar", icon: MdCalendarMonth },
    { to: "/timers", label: "Timers", icon: MdTimer },
    { to: "/notes", label: "Notes", icon: MdChecklist },
    { to: "/login", label: "Profile", icon: MdPerson }
  ];

  return (
    <>
      {/* Standard footer - only visible on desktop */}
      <footer className="hidden md:block mt-auto py-4 bg-white shadow-sm text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400 transition-opacity duration-300 ease-in-out">
        <div className="container mx-auto px-4">
          <p>© {currentYear} Habit Tracker | Alle Rechte vorbehalten</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">Datenschutz</a>
            <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">Impressum</a>
            <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">Kontakt</a>
          </div>s
        </div>
      </footer>
      
      {/* Mobile navigation - only visible on mobile devices */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-40 transition-transform duration-300 ease-in-out">
        {/* Grid layout for even distribution of navigation links */}
        <div className="grid h-16 grid-cols-5 mx-auto">
          {/* Generate navigation element for each link */}
          {navLinks.map((link) => {
            // Check if this link matches current path
            const isActive = location.pathname === link.to;
            // Assign icon component to variable
            const Icon = link.icon;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`inline-flex flex-col items-center justify-center ${
                  // Different styling for active vs inactive links
                  isActive ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500'
                }`}
              >
                {/* Render the icon */}
                <Icon className="w-6 h-6 mb-1" />
                {/* Display link name in small text */}
                <span className="text-xs">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Footer;