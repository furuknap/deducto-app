
import { saveToStorage, getFromStorage } from './localStorage';
import { User } from './authStorage';

// Type definitions based on Supabase types
export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category_id: string | null;
  count: number;
  date: string;
  user_id: string;
  created_at: string;
  categories?: Category | null;
}

// Storage keys
const CATEGORIES_KEY = 'user_categories';
const EXPENSES_KEY = 'user_expenses';

// Helper to get user-specific data key
const getUserKey = (key: string, userId: string) => `${key}_${userId}`;

/**
 * Get categories for a user
 */
export const getUserCategories = (userId: string): Category[] => {
  return getFromStorage<Category[]>(getUserKey(CATEGORIES_KEY, userId)) || [];
};

/**
 * Add a new category
 */
export const addCategory = (userId: string, name: string): Category => {
  const categories = getUserCategories(userId);
  const newCategory: Category = {
    id: `cat_${Date.now()}`,
    name,
    user_id: userId,
    created_at: new Date().toISOString()
  };
  
  categories.push(newCategory);
  saveToStorage(getUserKey(CATEGORIES_KEY, userId), categories);
  return newCategory;
};

/**
 * Delete a category
 */
export const deleteCategory = (userId: string, categoryId: string): boolean => {
  const categories = getUserCategories(userId);
  const filteredCategories = categories.filter(cat => cat.id !== categoryId);
  
  if (filteredCategories.length !== categories.length) {
    saveToStorage(getUserKey(CATEGORIES_KEY, userId), filteredCategories);
    return true;
  }
  
  return false;
};

/**
 * Get expenses for a user
 */
export const getUserExpenses = (userId: string): Expense[] => {
  const expenses = getFromStorage<Expense[]>(getUserKey(EXPENSES_KEY, userId)) || [];
  const categories = getUserCategories(userId);
  
  // Add category details to expenses
  return expenses.map(expense => {
    if (expense.category_id) {
      const category = categories.find(cat => cat.id === expense.category_id) || null;
      return { ...expense, categories: category };
    }
    return { ...expense, categories: null };
  });
};

/**
 * Add a new expense
 */
export const addExpense = (
  userId: string, 
  amount: number, 
  description: string, 
  categoryId: string | null, 
  count: number,
  date?: string
): Expense => {
  const expenses = getFromStorage<Expense[]>(getUserKey(EXPENSES_KEY, userId)) || [];
  
  const today = date || new Date().toISOString().split('T')[0];
  
  const newExpense: Expense = {
    id: `exp_${Date.now()}`,
    amount,
    description,
    category_id: categoryId,
    count,
    date: today,
    user_id: userId,
    created_at: new Date().toISOString()
  };
  
  expenses.push(newExpense);
  saveToStorage(getUserKey(EXPENSES_KEY, userId), expenses);
  
  // Return expense with category details
  if (categoryId) {
    const categories = getUserCategories(userId);
    const category = categories.find(cat => cat.id === categoryId) || null;
    return { ...newExpense, categories: category };
  }
  
  return { ...newExpense, categories: null };
};

/**
 * Delete an expense
 */
export const deleteExpense = (userId: string, expenseId: string): boolean => {
  const expenses = getFromStorage<Expense[]>(getUserKey(EXPENSES_KEY, userId)) || [];
  const filteredExpenses = expenses.filter(exp => exp.id !== expenseId);
  
  if (filteredExpenses.length !== expenses.length) {
    saveToStorage(getUserKey(EXPENSES_KEY, userId), filteredExpenses);
    return true;
  }
  
  return false;
};
