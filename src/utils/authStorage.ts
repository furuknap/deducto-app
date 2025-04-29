
import { saveToStorage, getFromStorage, removeFromStorage } from './localStorage';

// Type definitions
export interface User {
  id: string;
  email: string;
}

const AUTH_KEY = 'user_auth';

/**
 * Save user authentication data
 */
export const saveAuthUser = (user: User): void => {
  saveToStorage(AUTH_KEY, user);
};

/**
 * Get authenticated user
 */
export const getAuthUser = (): User | null => {
  return getFromStorage<User>(AUTH_KEY);
};

/**
 * Clear authentication data
 */
export const clearAuthUser = (): void => {
  removeFromStorage(AUTH_KEY);
};

/**
 * Check if email and password match stored values
 * Very simplified auth for demo purposes
 */
export const validateCredentials = (email: string, password: string): User | null => {
  // Get registered users
  const users = getFromStorage<User[]>('registered_users') || [];
  const user = users.find(u => u.email === email);
  
  // In real app we would never store passwords in localStorage
  // This is just for demo purposes
  const passwordsByUser = getFromStorage<Record<string, string>>('user_passwords') || {};
  
  if (user && passwordsByUser[user.id] === password) {
    return user;
  }
  
  return null;
};

/**
 * Register a new user
 */
export const registerUser = (email: string, password: string): User => {
  // Get existing users or initialize empty array
  const users = getFromStorage<User[]>('registered_users') || [];
  
  // Check if user already exists
  if (users.some(user => user.email === email)) {
    throw new Error('User with this email already exists');
  }
  
  // Create new user
  const newUser: User = {
    id: `user_${Date.now()}`, // Simple ID generation
    email
  };
  
  // Add user to users list
  users.push(newUser);
  saveToStorage('registered_users', users);
  
  // Store password separately (again, not secure, just for demo)
  const passwords = getFromStorage<Record<string, string>>('user_passwords') || {};
  passwords[newUser.id] = password;
  saveToStorage('user_passwords', passwords);
  
  return newUser;
};

/**
 * Reset password for email
 */
export const requestPasswordReset = (email: string): boolean => {
  const users = getFromStorage<User[]>('registered_users') || [];
  return users.some(user => user.email === email);
};

/**
 * Update password for a user
 */
export const updateUserPassword = (userId: string, newPassword: string): boolean => {
  // Get passwords
  const passwords = getFromStorage<Record<string, string>>('user_passwords') || {};
  
  // Update password
  if (userId) {
    passwords[userId] = newPassword;
    saveToStorage('user_passwords', passwords);
    return true;
  }
  
  return false;
};
