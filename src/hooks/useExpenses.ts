import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import { getUserCategories, getUserExpenses, Category, Expense } from "@/utils/dataStorage";

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
      
      if (!userId) {
        console.log("No user ID provided, skipping expense fetch");
        return;
      }
      
      console.log("Fetching expenses, authenticated as user ID:", userId);
      
      const userExpenses = getUserExpenses(userId);
      console.log(`Fetched ${userExpenses.length} expenses for user ${userId}`);
      
      setExpenses(userExpenses);
      setFilteredExpenses(userExpenses);
      setDateFilteredExpenses(userExpenses);
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
      
      if (!userId) {
        console.log("No user ID provided, skipping categories fetch");
        return;
      }
      
      console.log("Fetching categories for user ID:", userId);
      
      const userCategories = getUserCategories(userId);
      console.log(`Fetched ${userCategories.length} categories for user ${userId}`);
      
      setCategories(userCategories);
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
