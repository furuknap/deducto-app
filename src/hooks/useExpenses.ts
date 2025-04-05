
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
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });

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
    if (dateRange.from || dateRange.to) {
      filterExpensesByDate();
    } else {
      setFilteredExpenses(expenses);
    }
  }, [expenses, dateRange]);

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

  const filterExpensesByDate = () => {
    if (!dateRange.from && !dateRange.to) {
      setFilteredExpenses(expenses);
      return;
    }
    
    const filtered = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      expenseDate.setHours(0, 0, 0, 0);
      
      if (dateRange.from && dateRange.to) {
        return expenseDate >= dateRange.from && expenseDate <= dateRange.to;
      } else if (dateRange.from) {
        return expenseDate >= dateRange.from;
      } else if (dateRange.to) {
        return expenseDate <= dateRange.to;
      }
      
      return true;
    });
    
    setFilteredExpenses(filtered);
  };

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  return {
    expenses,
    filteredExpenses,
    categories,
    isLoadingExpenses,
    isLoadingCategories,
    totalAmount,
    fetchExpenses,
    fetchCategories,
    handleDateRangeChange
  };
};
