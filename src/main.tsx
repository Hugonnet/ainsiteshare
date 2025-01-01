import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App.tsx';
import './index.css';

// Fonction pour initialiser l'application de manière contrôlée
const initializeApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error('Root element not found');

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

// Démarrage de l'application
initializeApp();