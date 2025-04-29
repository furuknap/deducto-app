
import { saveToStorage } from './localStorage';
import { User } from './authStorage';
import { Category, Expense } from './dataStorage';

/**
 * Initialize test data for demo purposes
 */
export const initializeTestData = () => {
  // Create a test user
  const testUser: User = {
    id: 'test_user_1',
    email: 'test@example.com'
  };
  
  // Add to registered users
  const users = [testUser];
  saveToStorage('registered_users', users);
  
  // Set password for test user
  const passwords: Record<string, string> = {
    [testUser.id]: 'password123'
  };
  saveToStorage('user_passwords', passwords);
  
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
  return {
    testUser,
    testPassword: 'password123'
  };
};

/**
 * Check if application has been initialized with test data
 */
export const isTestDataInitialized = (): boolean => {
  const users = localStorage.getItem('registered_users');
  return users !== null && users.includes('test_user_1');
};
