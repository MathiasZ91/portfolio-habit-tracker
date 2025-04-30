// src/components/common/InstallPWA.jsx
import { useEffect, useState } from 'react';

function InstallPWA() {
 const [installPrompt, setInstallPrompt] = useState(null);
 const [isInstalled, setIsInstalled] = useState(false);

 useEffect(() => {
   // Save install prompt for later use
   window.addEventListener('beforeinstallprompt', (e) => {
     // Prevent automatic prompt on mobile
     e.preventDefault();
     // Store event for manual triggering
     setInstallPrompt(e);
   });

   // Track when app is installed
   window.addEventListener('appinstalled', () => {
     setIsInstalled(true);
     setInstallPrompt(null);
   });
   
   // Check if already running as standalone app
   if (window.matchMedia('(display-mode: standalone)').matches) {
     setIsInstalled(true);
   }
 }, []);

 const handleInstallClick = () => {
   if (!installPrompt) return;
   
   // Display install prompt to user
   installPrompt.prompt();
   
   // Track user's response
   installPrompt.userChoice.then((choiceResult) => {
     if (choiceResult.outcome === 'accepted') {
       console.log('User accepted the install prompt');
     } else {
       console.log('User dismissed the install prompt');
     }
     setInstallPrompt(null);
   });
 };

 if (isInstalled || !installPrompt) return null;

 return (
   <div className="fixed bottom-4 left-0 right-0 mx-auto max-w-sm bg-white p-4 rounded-lg shadow-lg flex flex-col items-center z-50">
     <p className="mb-3 text-center">Use Habit Tracker even when offline!</p>
     <button 
       onClick={handleInstallClick}
       className="text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
     >
       Install App
     </button>
   </div>
 );
}

export default InstallPWA;