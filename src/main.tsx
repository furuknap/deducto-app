import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Add message listener for inter-window communication
window.addEventListener("message", (event) => {
  const allowedOrigins = [
    "https://app.delacasa.app",
    "https://test.delacasa.app",
    "http://localhost:8000", // Use http for localhost
    "http://localhost:5000", // Use http for localhost
    "https://localhost:7106",
  ];

  // Check if the origin of the message is in the allowed origins list
  if (allowedOrigins.includes(event.origin)) {
    console.log(
      "Message received from allowed origin:",
      event.origin,
      "Data:",
      event.data
    );
    // Further processing of the message data will be done in subsequent tasks
    if (event.data === "backup") {
      console.debug("Backup command received from", event.origin);
      (event.source as Window).postMessage("backup_received", event.origin);
    }
  } else {
    console.warn("Message received from unauthorized origin:", event.origin);
  }
});
createRoot(document.getElementById("root")!).render(<App />);
