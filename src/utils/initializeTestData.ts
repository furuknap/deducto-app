
import { saveToStorage } from './localStorage';
import { User } from '../context/AuthContext';
import { Category, Expense } from './dataStorage';

/**
 * Initialize test data for demo purposes
 */
export const initializeTestData = () => {
  // Create a test user
  const testUser: User = {
    id: 'default_user',
    email: 'user@example.com'
  };
  
  // Create some categories
  const categories: Category[] = [
    {
      id: 'cat_1',
      name: 'Groceries',
      user_id: testUser.id,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat_2',
      name: 'Transportation',
      user_id: testUser.id,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat_3',
      name: 'Entertainment',
      user_id: testUser.id,
      created_at: new Date().toISOString()
    }
  ];
  
  saveToStorage(`user_categories_${testUser.id}`, categories);
  
  // Create empty expenses array instead of sample data
  const expenses: Expense[] = [];
  
  saveToStorage(`user_expenses_${testUser.id}`, expenses);
  
  console.log('Test data initialized!');
};

/**
 * Check if application has been initialized with test data
 */
export const isTestDataInitialized = (): boolean => {
  const categories = localStorage.getItem('user_categories_default_user');
  return categories !== null;
};
