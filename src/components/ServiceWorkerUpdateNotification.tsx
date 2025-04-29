import { useState, useEffect } from "react";
import {
  sendSkipWaitingMessage,
  updateEmitter,
} from "../utils/serviceWorkerUtils";

interface ServiceWorkerUpdateNotificationProps {
  registration: ServiceWorkerRegistration | null;
}

const ServiceWorkerUpdateNotification: React.FC<
  ServiceWorkerUpdateNotificationProps
> = ({ registration }) => {
  const [showReload, setShowReload] = useState(false);

  // Listen for service worker update events
  useEffect(() => {
    const handleUpdate = () => {
      setShowReload(true);
    };

    // Add listener for update events
    updateEmitter.addListener(handleUpdate);

    return () => {
      // Clean up listener
      updateEmitter.removeListener(handleUpdate);
    };
  }, []);

  // Check for waiting service worker on mount
  useEffect(() => {
    if (!registration) return;

    // When a new service worker is waiting
    const onUpdateFound = () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      // When the new service worker is installed and waiting
      const onStateChange = () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          setShowReload(true);
        }
      };

      newWorker.addEventListener("statechange", onStateChange);
    };

    // Check if there's already a waiting service worker
    if (registration.waiting && navigator.serviceWorker.controller) {
      setShowReload(true);
    }

    registration.addEventListener("updatefound", onUpdateFound);

    return () => {
      registration.removeEventListener("updatefound", onUpdateFound);
    };
  }, [registration]);

  const handleReload = () => {
    if (!registration) return;

    sendSkipWaitingMessage(registration);
    // The page will reload automatically due to the controllerchange event listener
    // in setupServiceWorkerUpdates
  };

  if (!showReload) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <p className="mb-2">A new version of the app is available!</p>
      <div className="flex justify-end">
        <button
          onClick={handleReload}
          className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition-colors"
        >
          Update Now
        </button>
      </div>
    </div>
  );
};

export default ServiceWorkerUpdateNotification;
