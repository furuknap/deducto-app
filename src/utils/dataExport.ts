
import { getUserCategories, getUserExpenses } from './dataStorage';
import { saveToStorage } from './localStorage';
import { Category, Expense } from './dataStorage';

interface ExportData {
  categories: Category[];
  expenses: Expense[];
  version: string;
  exportDate: string;
}

/**
 * Exports all user data (categories and expenses) as a JSON string
 */
export const exportUserData = (userId: string): string => {
  const categories = getUserCategories(userId);
  const expenses = getUserExpenses(userId);
  
  const exportData: ExportData = {
    categories,
    expenses,
    version: '1.0', // For future format compatibility
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(exportData, null, 2);
};

/**
 * Imports user data from JSON string
 * Returns true if successful, false otherwise
 */
export const importUserData = (userId: string, jsonData: string): boolean => {
  try {
    const importData = JSON.parse(jsonData) as ExportData;
    
    // Basic validation
    if (!importData.categories || !importData.expenses) {
      console.error('Invalid import data: missing categories or expenses');
      return false;
    }
    
    // Import categories
    saveToStorage(`user_categories_${userId}`, importData.categories);
    
    // Import expenses (without category details)
    const cleanExpenses = importData.expenses.map(expense => {
      const { categories, ...expenseWithoutCategoryDetails } = expense;
      return expenseWithoutCategoryDetails;
    });
    saveToStorage(`user_expenses_${userId}`, cleanExpenses);
    
    console.log('Data imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

/**
 * Generates a filename for exporting data
 */
export const getExportFilename = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `deducto_backup_${dateStr}.json`;
};

/**
 * Triggers a file download in the browser
 */
export const downloadJson = (jsonData: string, filename: string): void => {
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
