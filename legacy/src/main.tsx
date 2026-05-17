import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Published from './Published';


const __isPublish = () => {
  try {
    const p = new URLSearchParams(window.location.search);
    return p.get('pub') === '1' || p.get('mode') === 'pub';
  } catch {
    return false;
  }
};
createRoot(document.getElementById("root")!).render(
  __isPublish() ? <Published site="wsl" /> : <App />
)