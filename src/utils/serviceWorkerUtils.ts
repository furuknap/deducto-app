// Service Worker utility functions

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