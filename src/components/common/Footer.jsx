import { Link, useLocation } from 'react-router';
import { MdHome, MdCalendarMonth, MdTimer, MdChecklist, MdPerson } from 'react-icons/md';

const Footer = () => {
  // useLocation gibt uns den aktuellen URL-Pfad, um aktive Links zu erkennen
  const location = useLocation();
  // Ermittelt das aktuelle Jahr für das Copyright
  const currentYear = new Date().getFullYear();
  
  // Navigation-Links mit Icons für die mobile Navigation
  // Wir definieren hier sowohl die Ziel-URL als auch das anzuzeigende Icon
  const navLinks = [
    { to: "/", label: "Habits", icon: MdHome },
    { to: "/calendar", label: "Calendar", icon: MdCalendarMonth },
    { to: "/timers", label: "Timers", icon: MdTimer },
    { to: "/notes", label: "Notes", icon: MdChecklist },
    { to: "/login", label: "Profile", icon: MdPerson }
  ];

  return (
    <>
      {/* Standard-Footer - nur auf Desktop-Geräten sichtbar */}
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
      
      {/* Mobile Navigation - nur auf mobilen Geräten sichtbar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-40 transition-transform duration-300 ease-in-out">
        {/* Grid-Layout für gleichmäßige Verteilung der Navigation-Links */}
        <div className="grid h-16 grid-cols-5 mx-auto">
          {/* Für jeden Link in unserem Array generieren wir ein Navigationselement */}
          {navLinks.map((link) => {
            // Prüft, ob dieser Link dem aktuellen Pfad entspricht
            const isActive = location.pathname === link.to;
            // Weist dem Icon-Komponenten-Namen eine Variable zu
            const Icon = link.icon;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`inline-flex flex-col items-center justify-center ${
                  // Unterschiedliches Styling für aktive und inaktive Links
                  isActive ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500'
                }`}
              >
                {/* Rendert das Icon */}
                <Icon className="w-6 h-6 mb-1" />
                {/* Zeigt den Namen des Links in kleiner Schrift an */}
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