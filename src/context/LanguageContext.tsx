
import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "es";

type Translations = {
  [key: string]: {
    en: string;
    es: string;
  };
};

// Our translations dictionary
const translations: Translations = {
  // Navigation
  appName: {
    en: "Cookies & Expenses",
    es: "Galletas y Gastos"
  },
  dashboard: {
    en: "Dashboard",
    es: "Panel"
  },
  categories: {
    en: "Categories",
    es: "Categorías"
  },
  signOut: {
    en: "Sign Out",
    es: "Cerrar Sesión"
  },
  welcome: {
    en: "Welcome to expense tracking",
    es: "Bienvenido al seguimiento de gastos"
  },
  
  // Auth
  signIn: {
    en: "Sign In",
    es: "Iniciar Sesión"
  },
  signUp: {
    en: "Sign Up",
    es: "Registrarse"
  },
  email: {
    en: "Email",
    es: "Correo"
  },
  password: {
    en: "Password",
    es: "Contraseña"
  },
  signingIn: {
    en: "Signing in...",
    es: "Iniciando sesión..."
  },
  signingUp: {
    en: "Signing up...",
    es: "Registrando..."
  },
  trackExpenses: {
    en: "Track your business expenses easily",
    es: "Controle sus gastos de negocio fácilmente"
  },
  
  // Dashboard
  addNewExpense: {
    en: "Add New Expense",
    es: "Añadir Nuevo Gasto"
  },
  amount: {
    en: "Amount",
    es: "Monto"
  },
  description: {
    en: "Description",
    es: "Descripción"
  },
  category: {
    en: "Category",
    es: "Categoría"
  },
  count: {
    en: "Count",
    es: "Cantidad"
  },
  adding: {
    en: "Adding...",
    es: "Añadiendo..."
  },
  addExpense: {
    en: "Add Expense",
    es: "Añadir Gasto"
  },
  recentExpenses: {
    en: "Recent Expenses",
    es: "Gastos Recientes"
  },
  loadingExpenses: {
    en: "Loading expenses...",
    es: "Cargando gastos..."
  },
  noExpenses: {
    en: "No expenses recorded yet. Add your first expense!",
    es: "Aún no hay gastos registrados. ¡Añada su primer gasto!"
  },
  total: {
    en: "Total",
    es: "Total"
  },
  selectCategory: {
    en: "Select a category",
    es: "Seleccione una categoría"
  },
  loadingCategories: {
    en: "Loading categories...",
    es: "Cargando categorías..."
  },
  noCategories: {
    en: "No categories yet",
    es: "Aún no hay categorías"
  },
  whatExpenseFor: {
    en: "What was this expense for?",
    es: "¿Para qué fue este gasto?"
  },
  qty: {
    en: "Qty",
    es: "Cant"
  },
  
  // Categories
  addNewCategory: {
    en: "Add New Category",
    es: "Añadir Nueva Categoría"
  },
  categoryName: {
    en: "Category Name",
    es: "Nombre de Categoría"
  },
  enterCategoryName: {
    en: "Enter a category name",
    es: "Ingrese un nombre de categoría"
  },
  addingCategory: {
    en: "Adding...",
    es: "Añadiendo..."
  },
  addCategory: {
    en: "Add Category",
    es: "Añadir Categoría"
  },
  manageCategories: {
    en: "Manage Categories",
    es: "Administrar Categorías"
  },
  loadingCategoriesEllipsis: {
    en: "Loading categories...",
    es: "Cargando categorías..."
  },
  noCategoriesYet: {
    en: "No categories yet. Add your first category!",
    es: "Aún no hay categorías. ¡Añada su primera categoría!"
  },
  loading: {
    en: "Loading...",
    es: "Cargando..."
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key "${key}" not found.`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
