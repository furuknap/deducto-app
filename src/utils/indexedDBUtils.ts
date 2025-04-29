import { Tables } from "@/integrations/supabase/types";

// Define types for our local database
export type LocalExpense = Tables<"expenses"> & {
  categories?: Tables<"categories"> | null;
  syncStatus: 'synced' | 'pending' | 'error';
};

export type LocalCategory = Tables<"categories"> & {
  syncStatus: 'synced' | 'pending' | 'error';
};

// Database name and version
const DB_NAME = 'deducto-offline-db';
const DB_VERSION = 1;

// Store names
const EXPENSES_STORE = 'expenses';
const CATEGORIES_STORE = 'categories';
const SYNC_QUEUE_STORE = 'syncQueue';

// SyncQueue item type
export type SyncQueueItem = {
  id: string;
  operation: 'create' | 'update' | 'delete';
  storeName: string;
  data: {
    id: string;
    [key: string]: unknown;
  };
  timestamp: number;
  retryCount: number;
};

// Open the database
export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(new Error('Error opening IndexedDB'));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create expenses store
      if (!db.objectStoreNames.contains(EXPENSES_STORE)) {
        const expensesStore = db.createObjectStore(EXPENSES_STORE, { keyPath: 'id' });
        expensesStore.createIndex('user_id', 'user_id', { unique: false });
        expensesStore.createIndex('category_id', 'category_id', { unique: false });
        expensesStore.createIndex('date', 'date', { unique: false });
        expensesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      // Create categories store
      if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
        const categoriesStore = db.createObjectStore(CATEGORIES_STORE, { keyPath: 'id' });
        categoriesStore.createIndex('user_id', 'user_id', { unique: false });
        categoriesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const syncQueueStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
        syncQueueStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncQueueStore.createIndex('storeName', 'storeName', { unique: false });
      }
    };
  });
};

// Generic function to add an item to a store
export const addItem = <T>(storeName: string, item: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    openDatabase().then(db => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = () => {
        reject(new Error(`Failed to add item to ${storeName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    }).catch(reject);
  });
};

// Generic function to update an item in a store
export const updateItem = <T>(storeName: string, item: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    openDatabase().then(db => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = () => {
        reject(new Error(`Failed to update item in ${storeName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    }).catch(reject);
  });
};

// Generic function to delete an item from a store
export const deleteItem = (storeName: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    openDatabase().then(db => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete item from ${storeName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    }).catch(reject);
  });
};

// Generic function to get an item from a store
export const getItem = <T>(storeName: string, id: string): Promise<T | null> => {
  return new Promise((resolve, reject) => {
    openDatabase().then(db => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get item from ${storeName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    }).catch(reject);
  });
};

// Generic function to get all items from a store
export const getAllItems = <T>(storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    openDatabase().then(db => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get all items from ${storeName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    }).catch(reject);
  });
};

// Get items by index
export const getItemsByIndex = <T>(
  storeName: string, 
  indexName: string, 
  value: IDBValidKey
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    openDatabase().then(db => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get items by index from ${storeName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    }).catch(reject);
  });
};

// Add item to sync queue
export const addToSyncQueue = (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<SyncQueueItem> => {
  const queueItem: SyncQueueItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retryCount: 0
  };
  
  return addItem<SyncQueueItem>(SYNC_QUEUE_STORE, queueItem);
};

// Get all items in sync queue
export const getSyncQueue = (): Promise<SyncQueueItem[]> => {
  return getAllItems<SyncQueueItem>(SYNC_QUEUE_STORE);
};

// Remove item from sync queue
export const removeFromSyncQueue = (id: string): Promise<void> => {
  return deleteItem(SYNC_QUEUE_STORE, id);
};

// Update item in sync queue (e.g., increment retry count)
export const updateSyncQueueItem = (item: SyncQueueItem): Promise<SyncQueueItem> => {
  return updateItem<SyncQueueItem>(SYNC_QUEUE_STORE, item);
};

// Expense-specific functions
export const addExpense = (expense: LocalExpense): Promise<LocalExpense> => {
  return addItem<LocalExpense>(EXPENSES_STORE, expense);
};

export const updateExpense = (expense: LocalExpense): Promise<LocalExpense> => {
  return updateItem<LocalExpense>(EXPENSES_STORE, expense);
};

export const deleteExpense = (id: string): Promise<void> => {
  return deleteItem(EXPENSES_STORE, id);
};

export const getExpense = (id: string): Promise<LocalExpense | null> => {
  return getItem<LocalExpense>(EXPENSES_STORE, id);
};

export const getAllExpenses = (): Promise<LocalExpense[]> => {
  return getAllItems<LocalExpense>(EXPENSES_STORE);
};

export const getExpensesByUserId = (userId: string): Promise<LocalExpense[]> => {
  return getItemsByIndex<LocalExpense>(EXPENSES_STORE, 'user_id', userId);
};

export const getPendingSyncExpenses = (): Promise<LocalExpense[]> => {
  return getItemsByIndex<LocalExpense>(EXPENSES_STORE, 'syncStatus', 'pending');
};

// Category-specific functions
export const addCategory = (category: LocalCategory): Promise<LocalCategory> => {
  return addItem<LocalCategory>(CATEGORIES_STORE, category);
};

export const updateCategory = (category: LocalCategory): Promise<LocalCategory> => {
  return updateItem<LocalCategory>(CATEGORIES_STORE, category);
};

export const deleteCategory = (id: string): Promise<void> => {
  return deleteItem(CATEGORIES_STORE, id);
};

export const getCategory = (id: string): Promise<LocalCategory | null> => {
  return getItem<LocalCategory>(CATEGORIES_STORE, id);
};

export const getAllCategories = (): Promise<LocalCategory[]> => {
  return getAllItems<LocalCategory>(CATEGORIES_STORE);
};

export const getCategoriesByUserId = (userId: string): Promise<LocalCategory[]> => {
  return getItemsByIndex<LocalCategory>(CATEGORIES_STORE, 'user_id', userId);
};

export const getPendingSyncCategories = (): Promise<LocalCategory[]> => {
  return getItemsByIndex<LocalCategory>(CATEGORIES_STORE, 'syncStatus', 'pending');
};

// Check if the browser is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Add event listeners for online/offline status
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