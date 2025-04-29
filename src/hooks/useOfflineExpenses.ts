import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/components/ui/use-toast";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import { 
  LocalExpense, 
  LocalCategory,
  getExpensesByUserId,
  getCategoriesByUserId,
  addExpense,
  updateExpense,
  deleteExpense,
  addCategory,
  isOnline,
  setupOnlineStatusListeners
} from "@/utils/indexedDBUtils";
import { triggerSync } from "@/utils/syncUtils";
import { addToSyncQueue } from "@/utils/indexedDBUtils";

type Expense = Tables<"expenses"> & {
  categories: Tables<"categories"> | null;
};

type Category = Tables<"categories">;

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export const useOfflineExpenses = (userId: string | undefined) => {
  const [expenses, setExpenses] = useState<LocalExpense[]>([]);
  const [dateFilteredExpenses, setDateFilteredExpenses] = useState<LocalExpense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<LocalExpense[]>([]);
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isOnlineStatus, setIsOnlineStatus] = useState<boolean>(isOnline());

  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount.toString()) * expense.count, 
    0
  );

  // Set up online/offline listeners
  useEffect(() => {
    const cleanup = setupOnlineStatusListeners(
      // Online callback
      () => {
        setIsOnlineStatus(true);
        toast({
          title: "You're back online",
          description: "Syncing your data with the server...",
        });
        triggerSync().catch(console.error);
      },
      // Offline callback
      () => {
        setIsOnlineStatus(false);
        toast({
          title: "You're offline",
          description: "Changes will be saved locally and synced when you reconnect.",
        });
      }
    );
    
    return cleanup;
  }, []);

  useEffect(() => {
    if (userId) {
      console.log("Fetching expenses for user ID:", userId);
      // Force a refresh by clearing state first
      setExpenses([]);
      setDateFilteredExpenses([]);
      setFilteredExpenses([]);
      fetchExpenses();
      fetchCategories();
    }
  }, [userId]);

  useEffect(() => {
    applyDateFilter();
  }, [expenses, dateRange]);

  useEffect(() => {
    applyCategoryFilter();
  }, [dateFilteredExpenses, selectedCategoryId]);

  const fetchExpenses = async () => {
    try {
      setIsLoadingExpenses(true);
      
      if (!userId) {
        console.log("No user ID provided, skipping expense fetch");
        return;
      }
      
      console.log("Fetching expenses, authenticated as user ID:", userId);
      
      // Try to get expenses from IndexedDB first
      const localExpenses = await getExpensesByUserId(userId);
      console.log(`Fetched ${localExpenses.length} expenses from local storage`);
      
      // If we're online, also fetch from Supabase and merge
      if (isOnlineStatus) {
        try {
          // Get the current session to verify authentication
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error("Session error:", sessionError);
            throw sessionError;
          }
          
          console.log("Current auth session user:", sessionData.session?.user?.email);
          
          // Make sure the RLS policy uses auth.uid() by explicitly setting the user_id filter
          const { data, error } = await supabase
            .from("expenses")
            .select(`
              *,
              categories(*)
            `)
            .eq("user_id", userId) // Explicitly filter by user_id
            .order("date", { ascending: false })
            .limit(50);
          
          if (error) {
            console.error("Error fetching expenses from Supabase:", error);
            throw error;
          }
          
          console.log(`Fetched ${data?.length || 0} expenses from Supabase`);
          
          // Verify each expense belongs to the current user
          const validatedExpenses = data?.filter(expense => 
            expense.user_id === userId
          ) || [];
          
          // Convert to LocalExpense format and store in IndexedDB
          for (const expense of validatedExpenses) {
            const existingExpense = localExpenses.find(e => e.id === expense.id);
            
            // Only update if the local expense doesn't exist or is synced
            // (don't overwrite pending changes)
            if (!existingExpense || existingExpense.syncStatus === 'synced') {
              const localExpense: LocalExpense = {
                ...expense,
                categories: expense.categories,
                syncStatus: 'synced'
              };
              
              // Add or update in IndexedDB
              await updateExpense(localExpense);
            }
          }
          
          // Refresh local expenses after sync
          const refreshedExpenses = await getExpensesByUserId(userId);
          setExpenses(refreshedExpenses);
          setFilteredExpenses(refreshedExpenses);
          setDateFilteredExpenses(refreshedExpenses);
        } catch (error) {
          console.error("Error syncing with Supabase, using local data only:", error);
          // Fall back to local data only
          setExpenses(localExpenses);
          setFilteredExpenses(localExpenses);
          setDateFilteredExpenses(localExpenses);
        }
      } else {
        // Offline mode - use local data only
        console.log("Using local data only (offline mode)");
        setExpenses(localExpenses);
        setFilteredExpenses(localExpenses);
        setDateFilteredExpenses(localExpenses);
      }
    } catch (error: unknown) {
      console.error("Error in fetchExpenses:", error);
      toast({
        title: "Error fetching expenses",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      
      if (!userId) {
        console.log("No user ID provided, skipping categories fetch");
        return;
      }
      
      console.log("Fetching categories for user ID:", userId);
      
      // Try to get categories from IndexedDB first
      const localCategories = await getCategoriesByUserId(userId);
      console.log(`Fetched ${localCategories.length} categories from local storage`);
      
      // If we're online, also fetch from Supabase and merge
      if (isOnlineStatus) {
        try {
          // Explicitly filter categories by user_id
          const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("user_id", userId || '')
            .order("name", { ascending: true });
          
          if (error) throw error;
          
          console.log(`Fetched ${data?.length || 0} categories from Supabase`);
          
          // Validate all categories belong to current user
          const validatedCategories = data?.filter(category => 
            category.user_id === userId
          ) || [];
          
          // Convert to LocalCategory format and store in IndexedDB
          for (const category of validatedCategories) {
            const existingCategory = localCategories.find(c => c.id === category.id);
            
            // Only update if the local category doesn't exist or is synced
            if (!existingCategory || existingCategory.syncStatus === 'synced') {
              const localCategory: LocalCategory = {
                ...category,
                syncStatus: 'synced'
              };
              
              // Add or update in IndexedDB
              await addCategory(localCategory);
            }
          }
          
          // Refresh local categories after sync
          const refreshedCategories = await getCategoriesByUserId(userId);
          setCategories(refreshedCategories);
        } catch (error) {
          console.error("Error syncing with Supabase, using local data only:", error);
          // Fall back to local data only
          setCategories(localCategories);
        }
      } else {
        // Offline mode - use local data only
        console.log("Using local data only (offline mode)");
        setCategories(localCategories);
      }
    } catch (error: unknown) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error fetching categories",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const applyDateFilter = () => {
    let filtered = [...expenses];
    
    if (dateRange.from || dateRange.to) {
      console.log("Filtering by date range:", 
        dateRange.from ? dateRange.from.toISOString() : "none", 
        dateRange.to ? dateRange.to.toISOString() : "none"
      );
      
      filtered = filtered.filter(expense => {
        // We need to handle the date string from the database correctly
        // First, ensure we have a clean date string (no timezone info)
        const dateString = expense.date.toString().split('T')[0];
        
        // Create a date object in local timezone
        const expenseDate = parseISO(dateString);
        
        // To ensure proper comparison, get start of day
        const expenseDateStart = startOfDay(expenseDate);
        
        if (dateRange.from && dateRange.to) {
          // Get start of "from" day and end of "to" day
          const fromDate = startOfDay(dateRange.from);
          const toDate = endOfDay(dateRange.to);
          
          return expenseDateStart >= fromDate && expenseDateStart <= toDate;
        } else if (dateRange.from) {
          return expenseDateStart >= startOfDay(dateRange.from);
        } else if (dateRange.to) {
          return expenseDateStart <= endOfDay(dateRange.to);
        }
        
        return true;
      });
    }
    
    setDateFilteredExpenses(filtered);
    
    // Also apply category filter to maintain both filters
    if (selectedCategoryId) {
      setFilteredExpenses(filtered.filter(expense => 
        expense.category_id === selectedCategoryId
      ));
    } else {
      setFilteredExpenses(filtered);
    }
  };

  const applyCategoryFilter = () => {
    if (selectedCategoryId) {
      setFilteredExpenses(dateFilteredExpenses.filter(expense => 
        expense.category_id === selectedCategoryId
      ));
    } else {
      setFilteredExpenses(dateFilteredExpenses);
    }
  };

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  // Add a new expense with offline support
  const addNewExpense = async (expenseData: Omit<Tables<"expenses">, 'id'> & { user_id: string }) => {
    try {
      // Generate a UUID for the new expense
      const id = crypto.randomUUID();
      
      // Create the local expense object
      const newExpense: LocalExpense = {
        ...expenseData,
        id,
        syncStatus: 'pending',
        categories: null
      };
      
      // Save to IndexedDB
      await addExpense(newExpense);
      
      // Add to sync queue if online
      if (isOnlineStatus) {
        await addToSyncQueue({
          operation: 'create',
          storeName: 'expenses',
          data: newExpense
        });
        
        // Trigger sync
        triggerSync().catch(console.error);
      } else {
        toast({
          title: "Expense saved offline",
          description: "It will be synced when you reconnect.",
        });
      }
      
      // Refresh expenses
      fetchExpenses();
      
      return true;
    } catch (error: unknown) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error adding expense",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete an expense with offline support
  const deleteExpenseById = async (expenseId: string) => {
    try {
      // Get the expense first
      const expense = await deleteExpense(expenseId);
      
      // Add to sync queue if online
      if (isOnlineStatus) {
        await addToSyncQueue({
          operation: 'delete',
          storeName: 'expenses',
          data: { id: expenseId }
        });
        
        // Trigger sync
        triggerSync().catch(console.error);
      } else {
        toast({
          title: "Expense deleted offline",
          description: "This change will be synced when you reconnect.",
        });
      }
      
      // Refresh expenses
      fetchExpenses();
      
      return true;
    } catch (error: unknown) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error deleting expense",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    expenses,
    filteredExpenses,
    dateFilteredExpenses,
    categories,
    isLoadingExpenses,
    isLoadingCategories,
    totalAmount,
    selectedCategoryId,
    dateRange,
    isOnline: isOnlineStatus,
    fetchExpenses,
    fetchCategories,
    handleDateRangeChange,
    handleCategoryChange,
    addNewExpense,
    deleteExpenseById,
    triggerSync
  };
};