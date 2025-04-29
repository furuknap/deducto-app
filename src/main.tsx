import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  registerServiceWorker,
  setupServiceWorkerUpdates,
} from "./utils/serviceWorkerUtils";

// Register service worker
window.addEventListener("load", async () => {
  const registration = await registerServiceWorker();
  if (registration) {
    setupServiceWorkerUpdates(registration);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
