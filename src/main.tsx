import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initGoogleAnalytics } from './lib/gtag';

// Charge Google Analytics uniquement si VITE_GA_MEASUREMENT_ID est configuré
initGoogleAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
