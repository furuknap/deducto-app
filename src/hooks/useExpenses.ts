
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/components/ui/use-toast";
import { startOfDay, endOfDay, parseISO } from "date-fns";

type Expense = Tables<"expenses"> & {
  categories: Tables<"categories"> | null;
};

type Category = Tables<"categories">;

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export const useExpenses = (userId: string | undefined) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dateFilteredExpenses, setDateFilteredExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount.toString()) * expense.count, 
    0
  );

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
      
      console.log("Fetching expenses, authenticated as user ID:", userId);
      
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
        console.error("Error fetching expenses:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} expenses for user ${userId}`);
      console.log("First few expenses:", data?.slice(0, 2));
      
      // Reset states with fresh data
      setExpenses(data || []);
      setFilteredExpenses(data || []);
      setDateFilteredExpenses(data || []);
    } catch (error: any) {
      console.error("Error in fetchExpenses:", error);
      toast({
        title: "Error fetching expenses",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      
      console.log("Fetching categories for user ID:", userId);
      
      // Explicitly filter categories by user_id
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId || '')
        .order("name", { ascending: true });
      
      if (error) throw error;
      
      console.log(`Fetched ${data?.length || 0} categories for user ${userId}`);
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error fetching categories",
        description: error.message,
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
        
        console.log("Expense date (raw):", expense.date, "Parsed as local:", expenseDate.toISOString());
        
        // To ensure proper comparison, get start of day
        const expenseDateStart = startOfDay(expenseDate);
        
        if (dateRange.from && dateRange.to) {
          // Get start of "from" day and end of "to" day
          const fromDate = startOfDay(dateRange.from);
          const toDate = endOfDay(dateRange.to);
          
          const isInRange = expenseDateStart >= fromDate && expenseDateStart <= toDate;
          
          console.log("Date comparison:", 
            "Is in range:", isInRange,
            "From:", fromDate.toISOString(), 
            "Expense:", expenseDateStart.toISOString(), 
            "To:", toDate.toISOString()
          );
          
          return isInRange;
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
    fetchExpenses,
    fetchCategories,
    handleDateRangeChange,
    handleCategoryChange
  };
};
