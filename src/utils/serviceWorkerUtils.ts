// Service Worker utility functions
import { toast } from "@/components/ui/use-toast";

/**
 * Check if service workers are supported by the browser
 */
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

/**
 * Register the service worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isServiceWorkerSupported()) {
    console.log('Service workers are not supported by this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered with scope:', registration.scope);
    
    // Register for sync if supported
    if ('sync' in registration && registration.sync) {
      try {
        await (registration.sync as SyncManager).register('deducto-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Error registering background sync:', error);
      }
    }
    
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Check for service worker updates
 */
export const checkForUpdates = (registration: ServiceWorkerRegistration): void => {
  // Check for updates every hour
  setInterval(() => {
    registration.update();
  }, 60 * 60 * 1000);
};

/**
 * Event emitter for service worker updates
 */
class ServiceWorkerUpdateEmitter {
  private listeners: Array<() => void> = [];

  public addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: () => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  public emit(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const updateEmitter = new ServiceWorkerUpdateEmitter();

/**
 * Show a notification when a new service worker is waiting
 * This is now handled by the ServiceWorkerUpdateNotification component
 */
export const showUpdateNotification = (callback: () => void): void => {
  updateEmitter.emit();
  console.log('A new version of the app is available. Refresh to update?');
};

/**
 * Send a message to the service worker to skip waiting
 */
export const sendSkipWaitingMessage = (registration: ServiceWorkerRegistration): void => {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
};

/**
 * Set up service worker update handling
 */
export const setupServiceWorkerUpdates = (registration: ServiceWorkerRegistration): void => {
  // When a new service worker is waiting
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    if (!newWorker) return;

    // When the new service worker is installed and waiting
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // Show notification to user
        showUpdateNotification(() => {
          sendSkipWaitingMessage(registration);
          window.location.reload();
        });
      }
    });
  });

  // When the service worker takes control after skipWaiting
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Reload the page to ensure new version is used
    window.location.reload();
  });

  // Set up periodic update checks
  checkForUpdates(registration);
};

/**
 * Trigger a manual sync from the service worker
 */
export const triggerServiceWorkerSync = async (): Promise<boolean> => {
  if (!isServiceWorkerSupported() || !navigator.serviceWorker.controller) {
    console.warn('Service worker not available for sync');
    return false;
  }

  return new Promise((resolve) => {
    // Set up a one-time message handler for the sync status response
    const messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_STATUS') {
        // Clean up the event listener
        navigator.serviceWorker.removeEventListener('message', messageHandler);
        
        if (event.data.status === 'completed') {
          toast({
            title: "Sync Complete",
            description: "Your data has been synchronized with the server.",
          });
          resolve(true);
        } else if (event.data.status === 'failed') {
          console.error('Sync failed:', event.data.error);
          toast({
            title: "Sync Failed",
            description: "There was a problem synchronizing your data.",
            variant: "destructive",
          });
          resolve(false);
        } else if (event.data.supported === false) {
          console.warn('Background sync not supported');
          toast({
            title: "Sync Not Supported",
            description: "Background sync is not supported by your browser.",
            variant: "destructive",
          });
          resolve(false);
        }
      }
    };
    
    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', messageHandler);
    
    // Send the sync request
    navigator.serviceWorker.controller.postMessage({ type: 'SYNC_NOW' });
    
    // Set a timeout in case we don't get a response
    setTimeout(() => {
      navigator.serviceWorker.removeEventListener('message', messageHandler);
      console.warn('Sync request timed out');
      toast({
        title: "Sync Timeout",
        description: "The sync request timed out. Please try again.",
        variant: "destructive",
      });
      resolve(false);
    }, 10000);
  });
};

/**
 * Check if the device is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Listen for online/offline status changes
 */
export const setupOnlineStatusListeners = (
  onlineCallback: () => void,
  offlineCallback: () => void
): () => void => {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
};