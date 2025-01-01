import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Démarrage de l\'application...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Élément root non trouvé');
} else {
  console.log('Élément root trouvé, création du root React...');
  try {
    const root = createRoot(rootElement);
    console.log('Root React créé, rendu de l\'application...');
    root.render(<App />);
    console.log('Application rendue avec succès');
  } catch (error) {
    console.error('Erreur lors du rendu de l\'application:', error);
  }
}