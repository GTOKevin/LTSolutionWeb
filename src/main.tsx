import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
 import { ErrorBoundary } from './shared/components/ui/ErrorBoundary';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
