import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed silently
    });
  });
}

// Global unhandled rejection handler
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  console.warn('Unhandled promise rejection:', event.reason);
});

createRoot(document.getElementById("root")!).render(<App />);
