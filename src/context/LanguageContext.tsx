import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>((localStorage.getItem("language") as Language) || "en");

  const t = (key: string) => {
    return translations[language][key] || translations["en"][key] || key;
  };

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

const translations = {
  en: {
    welcome: "Welcome",
    login: "Login",
    logout: "Logout",
    register: "Register",
    dashboard: "Dashboard",
    categories: "Categories",
    notFound: "404 Not Found",
    pageNotFound: "Page not found",
    goHome: "Go Home",
    loading: "Loading...",
    addNewExpense: "Add New Expense",
    description: "Description",
    amount: "Amount",
    category: "Category",
    date: "Date",
    quantity: "Quantity",
    addExpense: "Add Expense",
    editExpense: "Edit Expense",
    updateExpense: "Update Expense",
    deleteExpense: "Delete Expense",
    cancel: "Cancel",
    recentExpenses: "Recent Expenses",
    noExpenses: "No expenses recorded",
    total: "Total",
    allCategories: "All Categories",
    filterByCategory: "Filter by Category",
    qty: "Qty",
    name: "Name",
    addCategory: "Add Category",
    editCategory: "Edit Category",
    updateCategory: "Update Category",
    deleteCategory: "Delete Category",
    noCategories: "No categories recorded",
    expensesByCategory: "Expenses by Category",
    noExpensesToDisplay: "No expenses to display",
    uncategorized: "Uncategorized",
  },
  es: {
    welcome: "Bienvenido",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    register: "Registrarse",
    dashboard: "Panel de control",
    categories: "Categorías",
    notFound: "404 No encontrado",
    pageNotFound: "Página no encontrada",
    goHome: "Ir a la página principal",
    loading: "Cargando...",
    addNewExpense: "Agregar Nuevo Gasto",
    description: "Descripción",
    amount: "Cantidad",
    category: "Categoría",
    date: "Fecha",
    quantity: "Cantidad",
    addExpense: "Agregar Gasto",
    editExpense: "Editar Gasto",
    updateExpense: "Actualizar Gasto",
    deleteExpense: "Eliminar Gasto",
    cancel: "Cancelar",
    recentExpenses: "Gastos Recientes",
    noExpenses: "No hay gastos registrados",
    total: "Total",
    allCategories: "Todas las Categorías",
    filterByCategory: "Filtrar por Categoría",
    qty: "Cant",
    name: "Nombre",
    addCategory: "Agregar Categoría",
    editCategory: "Editar Categoría",
    updateCategory: "Actualizar Categoría",
    deleteCategory: "Eliminar Categoría",
    noCategories: "No hay categorías registradas",
    expensesByCategory: "Gastos por Categoría",
    noExpensesToDisplay: "No hay gastos para mostrar",
    uncategorized: "Sin categoría",
  },
};
