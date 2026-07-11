import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
 import { ErrorBoundary } from './shared/components/ui/ErrorBoundary';
import { registerSW } from 'virtual:pwa-register';

// In development, remove stale service workers/caches to avoid loading mixed bundles.
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    });

    if ('caches' in window) {
      void caches.keys().then((keys) => {
        keys.forEach((key) => {
          void caches.delete(key);
        });
      });
    }
  } else {
    registerSW({ immediate: true });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
