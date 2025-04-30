import { 
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router';

// App components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProfileModal from './components/common/ProfileModal';
import InstallPWA from './components/common/InstallPWA';

// Context providers
import { ProfileProvider } from './context/ProfileContext';
import { TimerProvider } from './context/TimerContext';

// Pages
import DailyGoalsPage from './pages/DailyGoalsPage';
import CalendarPage from './pages/CalendarPage';
import TimersPage from './pages/TimersPage';
import NotesPage from './pages/NotesPage';
import LoginPage from './pages/LoginPage';

// App layout with persistent elements and outlet for page content
const Root = () => {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16 md:pt-20 pb-16 md:pb-0">
          <Outlet />
        </main>
        <Footer />
        <ProfileModal />
      </div>
      <InstallPWA />
    </>
  );
};

// Router configuration with main and child routes
const router = createBrowserRouter([  
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <DailyGoalsPage />
      },
      {
        path: "calendar",
        element: <CalendarPage />
      },
      {
        path: "timers",
        element: <TimersPage />
      },
      {
        path: "notes",
        element: <NotesPage />
      },
      {
        path: "login",
        element: <LoginPage />
      }
    ]
  }
]);

// Main app with context providers
const App = () => {
  return (
    <ProfileProvider>
      <TimerProvider>
        <RouterProvider router={router} />
      </TimerProvider>
    </ProfileProvider>
  );
};

export default App;