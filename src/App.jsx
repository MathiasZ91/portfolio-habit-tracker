// React Router v7 Imports
import { 
  createBrowserRouter,  // Erstellt den Router für die Browser-Navigation
  RouterProvider,       // Verbindet den Router mit der React-App
  Outlet                // Platzhalter für die Anzeige der untergeordneten Routen
} from 'react-router';  // Wichtig: "dom" Subpackage für DOM-spezifische Komponenten

// Gemeinsame Komponenten
import Navbar from './components/common/Navbar';  // Navigation, erscheint auf allen Seiten oben
import Footer from './components/common/Footer';  // Footer, erscheint auf allen Seiten unten
import ProfileModal from './components/common/ProfileModal'; // Profilauswahl-Modal

// Profile Context Provider
import { ProfileProvider } from './context/ProfileContext';  // Profilverwaltung mit Context API

// Seitenkomponenten
import DailyGoalsPage from './pages/DailyGoalsPage';  // Hauptseite für tägliche Ziele
import CalendarPage from './pages/CalendarPage';      // Kalenderseite
import TimersPage from './pages/TimersPage';
import NotesPage from './pages/NotesPage';
import LoginPage from './pages/LoginPage';


/**
 * Root-Layout Komponente
 * 
 * Diese Komponente definiert das grundlegende Layout der App:
 * - Navbar (immer oben)
 * - Dynamischer Inhalt über den Outlet
 * - Footer (immer unten)
 * 
 * Das Layout bleibt konstant, während sich nur der Inhalt im Outlet ändert.
 */
const Root = () => {
  return (
    <>
      <div className="flex flex-col min-h-screen">
      <Navbar />  {/* Navigation wird immer oben angezeigt (auf Desktop) */}
      <main className="flex-grow pt-16 md:pt-20 pb-16 md:pb-0">
        <Outlet />  {/* Hier werden die untergeordneten Routen dynamisch angezeigt */}
      </main>
      <Footer />  {/* Footer wird immer unten angezeigt (+ Mobile-Navigation) */}
      <ProfileModal /> {/* Modal für Profilverwaltung, überall verfügbar */}
    </div>
    </>
  );
};

/**
 * Router-Konfiguration
 * 
 * Hier definieren wir:
 * 1. Eine Hauptroute ("/"), die das Root-Layout rendert
 * 2. Untergeordnete Routen, die im Outlet angezeigt werden:
 *    - Index-Route (Standardseite beim Besuch von "/")
 *    - Calendar-Route (beim Besuch von "/calendar")
 */
const router = createBrowserRouter([  
  {
    path: "/",           // Die Hauptroute der App
    element: <Root />,   // Zeigt das Root-Layout mit Navbar, Outlet und Footer an
    children: [          // Untergeordnete Routen, die im Outlet erscheinen
      {
        index: true,     // Dies ist die Standardroute (wenn genau "/" besucht wird)
        element: <DailyGoalsPage />  // Zeigt die DailyGoalsPage im Outlet an
      },
      {
        path: "calendar", // Diese Route wird bei "/calendar" aktiviert
        element: <CalendarPage />    // Zeigt die CalendarPage im Outlet an
      },
      {
        path: "timers", // Diese Route wird bei "/calendar" aktiviert
        element: <TimersPage />    // Zeigt die CalendarPage im Outlet an
      },
      {
        path: "notes", // Diese Route wird bei "/calendar" aktiviert
        element: <NotesPage />    // Zeigt die CalendarPage im Outlet an
      },
      {
        path: "login", // Diese Route wird bei "/calendar" aktiviert
        element: <LoginPage />    // Zeigt die CalendarPage im Outlet an
      }
    ]
  }
]);

/**
 * Haupt-App-Komponente
 * 
 * Diese Komponente verbindet die gesamte Router-Konfiguration 
 * mit unserer React-Anwendung.
 */
const App = () => {
  // Wrap the entire app in the ProfileProvider to make profile data available everywhere
  return (
    <ProfileProvider>
      <RouterProvider router={router} />
    </ProfileProvider>
  );
};

export default App;

/**
 * Wie alles zusammenarbeitet:
 * 
 * 1. App rendert den RouterProvider mit unserer Router-Konfiguration
 * 2. Wenn ein Benutzer die App besucht, schaut der Router auf die URL:
 *    - Bei "/" wird die Root-Komponente mit DailyGoalsPage im Outlet angezeigt
 *    - Bei "/calendar" wird die Root-Komponente mit CalendarPage im Outlet angezeigt
 * 3. Navbar und Footer bleiben konstant, nur der Inhalt im Outlet ändert sich
 * 
 * Wichtige Konzepte:
 * - Der Outlet ist ein "Fenster" für die untergeordneten Routen
 * - Die children-Routen sind die verschiedenen Inhalte, die im Outlet erscheinen
 * - Nested Routing erlaubt uns, ein konsistentes Layout zu haben
 * - Die ProfileProvider umschließt die gesamte App, sodass Profildaten überall verfügbar sind
 */