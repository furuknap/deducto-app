
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
  
  // Create some expenses
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const expenses: Expense[] = [
    {
      id: 'exp_1',
      amount: 45.75,
      description: 'Weekly groceries',
      category_id: 'cat_1',
      count: 1,
      date: today.toISOString().split('T')[0],
      user_id: testUser.id,
      created_at: today.toISOString()
    },
    {
      id: 'exp_2',
      amount: 25.00,
      description: 'Bus ticket',
      category_id: 'cat_2',
      count: 2,
      date: yesterday.toISOString().split('T')[0],
      user_id: testUser.id,
      created_at: yesterday.toISOString()
    },
    {
      id: 'exp_3',
      amount: 15.50,
      description: 'Movie ticket',
      category_id: 'cat_3',
      count: 1,
      date: lastWeek.toISOString().split('T')[0],
      user_id: testUser.id,
      created_at: lastWeek.toISOString()
    }
  ];
  
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
