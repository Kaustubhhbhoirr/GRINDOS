import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Browser fallback to allow stand-alone testing in standard browser environments
if (!window.api) {
  window.api = {
    getProblems: async () => {
      const data = localStorage.getItem('grindos_problems');
      return data ? JSON.parse(data) : [];
    },
    saveProblems: async (problems) => {
      localStorage.setItem('grindos_problems', JSON.stringify(problems));
      return { success: true };
    },
    openExternal: (url) => {
      window.open(url, '_blank');
    }
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
