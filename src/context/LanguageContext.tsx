
import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "es";

type Translations = {
  [key: string]: { [key: string]: string };
};

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const translations: Translations = {
  en: {
    appName: "Expense Tracker",
    dashboard: "Dashboard",
    categories: "Categories",
    welcome: "Welcome",
    signOut: "Sign Out",
    loading: "Loading...",
    addNewExpense: "Add New Expense",
    amount: "Amount",
    description: "Description",
    category: "Category",
    count: "Count",
    qty: "Qty",
    adding: "Adding...",
    addExpense: "Add Expense",
    recentExpenses: "Recent Expenses",
    loadingCategories: "Loading categories...",
    noCategories: "No categories found",
    selectCategory: "Select a category",
    whatExpenseFor: "What was this expense for?",
    noExpenses: "No expenses found. Add your first expense!",
    total: "Total",
    addNewCategory: "Add New Category",
    categoryName: "Category Name",
    addCategory: "Add Category",
    yourCategories: "Your Categories",
    noCategoriesToShow: "No categories to show. Add your first category!",
    delete: "Delete",
    allTime: "All Time",
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    previous7Days: "Previous 7 Days",
    previous30Days: "Previous 30 Days",
    customDateRange: "Custom Date Range",
  },
  es: {
    appName: "Rastreador de Gastos",
    dashboard: "Tablero",
    categories: "Categorías",
    welcome: "Bienvenido",
    signOut: "Cerrar Sesión",
    loading: "Cargando...",
    addNewExpense: "Añadir Nuevo Gasto",
    amount: "Monto",
    description: "Descripción",
    category: "Categoría",
    count: "Cantidad",
    qty: "Cant",
    adding: "Añadiendo...",
    addExpense: "Añadir Gasto",
    recentExpenses: "Gastos Recientes",
    loadingCategories: "Cargando categorías...",
    noCategories: "No se encontraron categorías",
    selectCategory: "Seleccione una categoría",
    whatExpenseFor: "¿Para qué fue este gasto?",
    noExpenses: "No se encontraron gastos. ¡Añade tu primer gasto!",
    total: "Total",
    addNewCategory: "Añadir Nueva Categoría",
    categoryName: "Nombre de Categoría",
    addCategory: "Añadir Categoría",
    yourCategories: "Tus Categorías",
    noCategoriesToShow: "No hay categorías para mostrar. ¡Añade tu primera categoría!",
    delete: "Eliminar",
    allTime: "Todo el Tiempo",
    today: "Hoy",
    thisWeek: "Esta Semana",
    thisMonth: "Este Mes",
    previous7Days: "Últimos 7 Días",
    previous30Days: "Últimos 30 Días",
    customDateRange: "Rango de Fecha Personalizado",
  },
};

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: () => "",
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
