import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  SyncQueueItem, 
  LocalExpense, 
  LocalCategory,
  getSyncQueue, 
  removeFromSyncQueue, 
  updateSyncQueueItem,
  updateExpense,
  updateCategory,
  getExpense,
  getCategory
} from "./indexedDBUtils";

// Maximum number of retry attempts for sync operations
const MAX_RETRY_ATTEMPTS = 3;

// Process the sync queue
export const processSyncQueue = async (): Promise<void> => {
  try {
    // Get all items in the sync queue
    const queueItems = await getSyncQueue();
    
    if (queueItems.length === 0) {
      console.log('Sync queue is empty');
      return;
    }
    
    console.log(`Processing sync queue: ${queueItems.length} items`);
    
    // Sort by timestamp (oldest first)
    const sortedItems = [...queueItems].sort((a, b) => a.timestamp - b.timestamp);
    
    // Process each item
    for (const item of sortedItems) {
      try {
        await processSyncItem(item);
      } catch (error) {
        console.error(`Error processing sync item ${item.id}:`, error);
        
        // Increment retry count
        if (item.retryCount < MAX_RETRY_ATTEMPTS) {
          await updateSyncQueueItem({
            ...item,
            retryCount: item.retryCount + 1
          });
        } else {
          console.error(`Max retry attempts reached for item ${item.id}, marking as error`);
          
          // Mark the original item as error
          if (item.storeName === 'expenses') {
            const expense = await getExpense(item.data.id as string);
            if (expense) {
              await updateExpense({
                ...expense,
                syncStatus: 'error'
              });
            }
          } else if (item.storeName === 'categories') {
            const category = await getCategory(item.data.id as string);
            if (category) {
              await updateCategory({
                ...category,
                syncStatus: 'error'
              });
            }
          }
          
          // Remove from queue after max retries
          await removeFromSyncQueue(item.id);
          
          // Show error toast
          toast({
            title: "Sync Error",
            description: `Failed to sync some data after multiple attempts. Please try again later.`,
            variant: "destructive",
          });
        }
      }
    }
    
    console.log('Sync queue processing completed');
  } catch (error) {
    console.error('Error processing sync queue:', error);
    toast({
      title: "Sync Error",
      description: "Failed to synchronize data. Please check your connection and try again.",
      variant: "destructive",
    });
  }
};

// Process a single sync queue item
const processSyncItem = async (item: SyncQueueItem): Promise<void> => {
  console.log(`Processing sync item: ${item.operation} on ${item.storeName}`, item.data);
  
  if (item.storeName === 'expenses') {
    await syncExpense(item);
  } else if (item.storeName === 'categories') {
    await syncCategory(item);
  } else {
    throw new Error(`Unknown store name: ${item.storeName}`);
  }
  
  // Remove from queue after successful sync
  await removeFromSyncQueue(item.id);
};

// Sync an expense with the backend
const syncExpense = async (item: SyncQueueItem): Promise<void> => {
  const { operation, data } = item;
  
  // Remove local-only properties before sending to Supabase
  const { syncStatus, categories, ...expenseData } = data as LocalExpense;
  let upsertError, deleteError, expense;
  
  switch (operation) {
    case 'create':
    case 'update': {
      const result = await supabase
        .from('expenses')
        .upsert(expenseData);
      
      upsertError = result.error;
      if (upsertError) throw upsertError;
      
      // Update local expense to mark as synced
      expense = await getExpense(data.id as string);
      if (expense) {
        await updateExpense({
          ...expense,
          syncStatus: 'synced'
        });
      }
      break;
    }
      
    case 'delete': {
      const result = await supabase
        .from('expenses')
        .delete()
        .eq('id', data.id as string);
      
      deleteError = result.error;
      if (deleteError) throw deleteError;
      break;
    }
      
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
};

// Sync a category with the backend
const syncCategory = async (item: SyncQueueItem): Promise<void> => {
  const { operation, data } = item;
  
  // Remove local-only properties before sending to Supabase
  const { syncStatus, ...categoryData } = data as LocalCategory;
  let upsertError, deleteError, category;
  
  switch (operation) {
    case 'create':
    case 'update': {
      const result = await supabase
        .from('categories')
        .upsert(categoryData);
      
      upsertError = result.error;
      if (upsertError) throw upsertError;
      
      // Update local category to mark as synced
      category = await getCategory(data.id as string);
      if (category) {
        await updateCategory({
          ...category,
          syncStatus: 'synced'
        });
      }
      break;
    }
      
    case 'delete': {
      const result = await supabase
        .from('categories')
        .delete()
        .eq('id', data.id as string);
      
      deleteError = result.error;
      if (deleteError) throw deleteError;
      break;
    }
      
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
};

// Start sync process when app comes online
export const setupSyncOnReconnect = (): () => void => {
  const handleOnline = () => {
    console.log('App is online, starting sync process');
    processSyncQueue().catch(error => {
      console.error('Error during sync process:', error);
    });
  };
  
  // Add event listener
  window.addEventListener('online', handleOnline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
  };
};

// Manually trigger sync process
export const triggerSync = async (): Promise<void> => {
  if (navigator.onLine) {
    await processSyncQueue();
    toast({
      title: "Sync Complete",
      description: "Your data has been synchronized with the server.",
    });
  } else {
    toast({
      title: "Offline",
      description: "You are currently offline. Data will sync when you reconnect.",
    });
  }
};