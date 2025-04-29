import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  registerServiceWorker,
  setupServiceWorkerUpdates,
} from "./utils/serviceWorkerUtils";
import { initializePerformanceMonitoring } from "./utils/performanceUtils";

// Initialize performance monitoring
initializePerformanceMonitoring();

// Register service worker
window.addEventListener("load", async () => {
  const registration = await registerServiceWorker();
  if (registration) {
    setupServiceWorkerUpdates(registration);
  }
});

// Create a variable to hold the root element
const rootElement = document.getElementById("root");

// Use createRoot to render the app
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found");
}
