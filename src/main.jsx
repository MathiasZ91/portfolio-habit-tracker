
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/* KEY CONCEPT: SERVICE WORKER REGISTRATION - Added to main entry point */
// Register service worker
if ('serviceWorker' in navigator) {  // (1) Feature detection
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// PWA install prompt handling
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  // You could show your custom install button here
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
