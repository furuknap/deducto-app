import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Add message listener for communication with the dashboard
window.addEventListener("message", (event) => {
  // Verify the origin of the message for security
  // Replace 'YOUR_EXPECTED_ORIGIN' with the actual origin of your dashboard application
  if (event.origin !== "YOUR_EXPECTED_ORIGIN") {
    console.warn("Message received from untrusted origin:", event.origin);
    return;
  }

  console.log("Message received from dashboard:", event.data);

  // TODO: Implement command handling based on event.data
});
