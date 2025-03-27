import { Link, useLocation } from 'react-router';
import { useEffect } from 'react';
import ProfileButton from '../common/ProfileButton';

/**
 * Navigationskomponente mit responsivem Design
 * - Zeigt Tabs auf Desktop-Geräten
 * - Zeigt ein Dropdown-Menü auf Mobilgeräten
 * - Hebt die aktive Route hervor
 */
const Navbar = () => {
  // Der useLocation-Hook gibt uns Zugriff auf den aktuellen URL-Pfad
  // Dadurch wissen wir, welcher Navigationspunkt als aktiv hervorgehoben werden soll
  const location = useLocation();
  
  // Streak aus dem localStorage laden und regelmäßig aktualisieren
  useEffect(() => {
    const updateStreak = () => {
      const storedStreak = localStorage.getItem('habitsStreak');
      if (storedStreak) {
        // Streak-Wert wird aus dem localStorage geladen, aber nicht verwendet
        parseInt(JSON.parse(storedStreak), 10);
      }
    };
    
    // Initial laden
    updateStreak();
    
    // Regelmäßiges Überprüfen statt Event-Listener
    const intervalId = setInterval(updateStreak, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Navigationsdaten in einem Array für einfache Wartung
  // Wenn du Navigationspunkte hinzufügen/entfernen möchtest, ändere einfach dieses Array
  const navLinks = [
    { to: "/", label: "Daily Habits" },
    { to: "/calendar", label: "Calendar" },
    { to: "/timers", label: "Timers" },
    { to: "/notes", label: "Notes" },
    { to: "/login", label: "Sign In-Up" }
  ];

  return (
    <nav className="hidden md:block fixed top-0 left-0 w-full bg-white shadow-sm z-40 transition-opacity duration-300 ease-in-out">
      {/* Mobile Navigation (nur auf kleinen Bildschirmen sichtbar) */}
      {/* Die Klasse sm:hidden versteckt dieses Element auf Bildschirmen, die breiter als 'small' sind */}
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">Select your tab</label>
        <select 
          id="tabs" 
          // Umfangreiche Tailwind-Klassen für das Styling des Dropdowns
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          // Setze den aktuellen Pfad als ausgewählten Wert
          value={location.pathname}
          // Wenn der Benutzer eine Option auswählt, navigiere zu diesem Pfad
          onChange={(e) => {
            window.location.href = e.target.value;
          }}
        >
          {/* Generiere Optionen aus unseren Navigationsdaten */}
          {navLinks.map((link) => (
            <option key={link.to} value={link.to}>
              {link.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Navigation (auf kleinen Bildschirmen ausgeblendet) */}
      {/* Die Klasse 'hidden' blendet es standardmäßig aus, aber 'sm:flex' zeigt es auf 'small' Bildschirmen und größer an */}
      <div className="flex justify-between items-center mx-4">
        <ul className="hidden text-sm font-medium text-center text-gray-500 rounded-lg shadow-sm sm:flex dark:divide-gray-700 dark:text-gray-400">
          {/* Generiere Tabs aus unseren Navigationsdaten */}
          {navLinks.map((link, index) => {
            // Prüfe, ob dieser Link mit dem aktuellen URL-Pfad übereinstimmt
            const isActive = location.pathname === link.to;
            // Spezielles Styling für erste und letzte Elemente (abgerundete Ecken)
            const isFirst = index === 0;
            const isLast = index === navLinks.length - 1;
            
            // Beginne mit dem Aufbau des className-Strings
            let className = "inline-block w-full p-4 ";
            
            // Füge Stile basierend auf dem aktiven Zustand hinzu
            if (isActive) {
              // Styling für aktive Links (dunklerer Hintergrund usw.)
              className += "text-gray-900 bg-gray-100 focus:ring-4 focus:ring-blue-300 active focus:outline-none dark:bg-gray-700 dark:text-white ";
            } else {
              // Styling für inaktive Links mit Hover-Effekten
              className += "bg-white hover:text-gray-700 hover:bg-gray-50 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700 ";
            }
            
            // Füge positionsspezifische Stile hinzu (Ränder und abgerundete Ecken)
            if (isFirst) {
              // Erstes Element bekommt abgerundete Ecken links
              className += "border-r border-gray-200 dark:border-gray-700 rounded-s-lg ";
            } else if (isLast) {
              // Letztes Element bekommt abgerundete Ecken rechts
              className += "border-s-0 border-gray-200 dark:border-gray-700 rounded-e-lg ";
            } else {
              // Mittlere Elemente bekommen Ränder auf der rechten Seite
              className += "border-r border-gray-200 dark:border-gray-700 ";
            }
            
           
            
            // Standard-Link ohne Streak-Anzeige
            return (
              <li key={link.to} className="w-full focus-within:z-10">
                <Link 
                  to={link.to} 
                  className={className}
                  // aria-current verbessert die Barrierefreiheit, indem es die aktuelle Seite kennzeichnet
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