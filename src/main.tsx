import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initGoogleAnalytics } from './lib/gtag';
import { CONSENT_EVENT } from './lib/consent';

// Google Analytics ne se charge qu'avec le consentement du visiteur.
// Au chargement (si déjà accepté) puis à chaque changement de choix.
initGoogleAnalytics();
window.addEventListener(CONSENT_EVENT, () => initGoogleAnalytics());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
