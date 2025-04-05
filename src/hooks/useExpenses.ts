import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/components/ui/use-toast";

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
      const { data, error } = await supabase
        .from("expenses")
        .select("*, categories(*)")
        .order("date", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setExpenses(data || []);
      setFilteredExpenses(data || []);
      setDateFilteredExpenses(data || []);
    } catch (error: any) {
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
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
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
    
    // Apply date filter
    if (dateRange.from || dateRange.to) {
      console.log("Filtering by date range:", 
        dateRange.from ? dateRange.from.toISOString() : "none", 
        dateRange.to ? dateRange.to.toISOString() : "none"
      );
      
      filtered = filtered.filter(expense => {
        // Parse the expense date string into a Date object
        const expenseDate = new Date(expense.date);
        
        // For debug logging
        console.log("Expense date:", expense.date, "Parsed as:", expenseDate.toISOString());
        
        // Set the expenseDate to the start of day for consistent comparison
        const expenseDateStartOfDay = new Date(
          expenseDate.getFullYear(),
          expenseDate.getMonth(),
          expenseDate.getDate(),
          0, 0, 0, 0
        );
        
        // If we have both from and to dates
        if (dateRange.from && dateRange.to) {
          // We need to make the 'to' date inclusive by setting it to end of day
          const toDateEndOfDay = new Date(dateRange.to);
          toDateEndOfDay.setHours(23, 59, 59, 999);
          
          const isInRange = expenseDateStartOfDay >= dateRange.from && expenseDateStartOfDay <= toDateEndOfDay;
          console.log("Is in range:", isInRange, 
            "From:", dateRange.from.toISOString(), 
            "Expense:", expenseDateStartOfDay.toISOString(), 
            "To:", toDateEndOfDay.toISOString()
          );
          
          return isInRange;
        } else if (dateRange.from) {
          return expenseDateStartOfDay >= dateRange.from;
        } else if (dateRange.to) {
          // Make the 'to' date inclusive by setting it to end of day
          const toDateEndOfDay = new Date(dateRange.to);
          toDateEndOfDay.setHours(23, 59, 59, 999);
          
          return expenseDateStartOfDay <= toDateEndOfDay;
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
    fetchExpenses,
    fetchCategories,
    handleDateRangeChange,
    handleCategoryChange
  };
};
