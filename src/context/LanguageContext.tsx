import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem("language") as Language) || "en"
  );

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

// Define the base translations
const baseTranslations = {
  en: {
    appName: "Deducto",
    welcome: "Welcome",
    login: "Login",
    logout: "Logout",
    register: "Register",
    dashboard: "Dashboard",
    categories: "Categories",
    notFound: "Not Found",
    pageNotFound: "Page Not Found",
    goHome: "Go Home",
    loading: "Loading...",
    expenses: "Expenses",
    noExpensesYet: "No expenses yet",
    addNewExpense: "Add New Expense",
    amount: "Amount",
    description: "Description",
    category: "Category",
    date: "Date",
    actions: "Actions",
    addExpense: "Add Expense",
    recentExpenses: "Recent Expenses",
    totalExpenses: "Total Expenses",
    filterByCategory: "Filter by Category",
    all: "All",
    uncategorized: "Uncategorized",
    noCategories: "No categories",
    loadingCategories: "Loading categories...",
    addCategory: "Add Category",
    categoryName: "Category Name",
    add: "Add",
    edit: "Edit",
    update: "Update",
    cancel: "Cancel",
    confirmDeleteCategory: "Are you sure you want to delete this category?",
    categoryDeleted: "Category Deleted",
    categoryUpdated: "Category Updated",
    categoryAdded: "Category Added",
    errorAddingCategory: "Error Adding Category",
    errorUpdatingCategory: "Error Updating Category",
    errorDeletingCategory: "Error Deleting Category",
    expensesByCategory: "Expenses by Category",
    noExpensesToDisplay: "No expenses to display",
    allTime: "All Time",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    thisMonth: "This Month",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    customDateRange: "Custom Date Range",
    expenseAdded: "Expense Added",
    expenseSuccessfullyRecorded: "Expense successfully recorded",
    errorAddingExpense: "Error Adding Expense",
    whatExpenseFor: "What is this expense for?",
    selectCategory: "Select a category",
    loadingCategoriesEllipsis: "Loading categories...",
    adding: "Adding...",
    count: "Count",
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    signingIn: "Signing In...",
    signingUp: "Signing Up...",
    trackExpenses: "Track and manage your expenses",
    resetPassword: "Reset Password",
    resetPasswordDescription:
      "Enter your email to receive a password reset link",
    sendResetLink: "Send Reset Link",
    sendingResetLink: "Sending...",
    resetEmailSent: "Email Sent",
    checkYourEmail: "Please check your email for the reset link",
    resetLinkSent: "A password reset link has been sent to your email",
    sendAnotherLink: "Send Another Link",
    resetError: "Reset Error",
    updatePassword: "Update Password",
    createNewPassword: "Create a new password for your account",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    passwordsDoNotMatch: "Passwords do not match",
    updatingPassword: "Updating...",
    passwordUpdated: "Password Updated",
    passwordUpdateSuccess: "Your password has been successfully updated",
    updatePasswordError: "Update Password Error",
    forgotPassword: "Forgot password?",
    confirmDelete: "Confirm Delete",
    deleteExpenseMessage:
      "Are you sure you want to delete this expense? This action cannot be undone.",
    delete: "Delete",
    deleting: "Deleting...",
    expenseDeleted: "Expense Deleted",
    expenseDeletedMessage: "The expense has been successfully deleted.",
    errorDeletingExpense: "Error Deleting Expense",

    // Offline mode translations
    online: "Online",
    offline: "Offline",
    offlineMode: "Offline Mode",
    changesStoredLocally:
      "Changes will be stored locally and synced when you're back online.",
    expenseAddedOffline: "Expense saved locally. Will sync when online.",
    syncNow: "Sync Now",
    syncing: "Syncing...",
    syncComplete: "Sync Complete",
    syncError: "Sync Error",
    pendingSync: "Pending sync",
    youAreOnline: "You are online",
    youAreOffline: "You are offline",
    syncingPendingChanges: "Syncing pending changes",
    allDataSynced: "All data is synced",
    cannotSyncOffline: "Cannot sync while offline",
    syncInProgress: "Sync in progress",
    pleaseWait: "Please wait",
    unknownError: "Unknown error",
    noExpensesInSelectedPeriod: "No expenses in the selected period",
    present: "Present",
    until: "Until",
  },
  es: {
    appName: "Deducto",
    welcome: "Bienvenido",
    login: "Iniciar Sesión",
    logout: "Cerrar Sesión",
    register: "Registrarse",
    dashboard: "Panel",
    categories: "Categorías",
    notFound: "No Encontrado",
    pageNotFound: "Página No Encontrada",
    goHome: "Ir al Inicio",
    loading: "Cargando...",
    expenses: "Gastos",
    noExpensesYet: "Aún no hay gastos",
    addNewExpense: "Agregar Nuevo Gasto",
    amount: "Monto",
    description: "Descripción",
    category: "Categoría",
    date: "Fecha",
    actions: "Acciones",
    addExpense: "Agregar Gasto",
    recentExpenses: "Gastos Recientes",
    totalExpenses: "Gastos Totales",
    filterByCategory: "Filtrar por Categoría",
    all: "Todos",
    uncategorized: "Sin Categoría",
    noCategories: "No hay categorías",
    loadingCategories: "Cargando categorías...",
    addCategory: "Agregar Categoría",
    categoryName: "Nombre de Categoría",
    add: "Agregar",
    edit: "Editar",
    update: "Actualizar",
    cancel: "Cancelar",
    confirmDeleteCategory:
      "¿Estás seguro de que quieres eliminar esta categoría?",
    categoryDeleted: "Categoría Eliminada",
    categoryUpdated: "Categoría Actualizada",
    categoryAdded: "Categoría Agregada",
    errorAddingCategory: "Error al Agregar Categoría",
    errorUpdatingCategory: "Error al Actualizar Categoría",
    errorDeletingCategory: "Error al Eliminar Categoría",
    expensesByCategory: "Gastos por Categoría",
    noExpensesToDisplay: "No hay gastos para mostrar",
    allTime: "Todo el Tiempo",
    today: "Hoy",
    yesterday: "Ayer",
    thisWeek: "Esta Semana",
    thisMonth: "Este Mes",
    last7Days: "Últimos 7 Días",
    last30Days: "Últimos 30 Días",
    customDateRange: "Rango de Fechas Personalizado",
    expenseAdded: "Gasto Agregado",
    expenseSuccessfullyRecorded: "Gasto registrado exitosamente",
    errorAddingExpense: "Error al Agregar Gasto",
    whatExpenseFor: "¿Para qué es este gasto?",
    selectCategory: "Seleccione una categoría",
    loadingCategoriesEllipsis: "Cargando categorías...",
    adding: "Agregando...",
    count: "Cantidad",
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    email: "Correo Electrónico",
    password: "Contraseña",
    signingIn: "Iniciando Sesión...",
    signingUp: "Registrando...",
    trackExpenses: "Rastrea y administra tus gastos",
    resetPassword: "Restablecer Contraseña",
    resetPasswordDescription:
      "Ingrese su correo electrónico para recibir un enlace de restablecimiento de contraseña",
    sendResetLink: "Enviar Enlace",
    sendingResetLink: "Enviando...",
    resetEmailSent: "Correo Enviado",
    checkYourEmail:
      "Por favor, revise su correo electrónico para ver el enlace de restablecimiento",
    resetLinkSent:
      "Se ha enviado un enlace de restablecimiento de contraseña a su correo electrónico",
    sendAnotherLink: "Enviar Otro Enlace",
    resetError: "Error de Restablecimiento",
    updatePassword: "Actualizar Contraseña",
    createNewPassword: "Cree una nueva contraseña para su cuenta",
    newPassword: "Nueva Contraseña",
    confirmPassword: "Confirmar Contraseña",
    passwordsDoNotMatch: "Las contraseñas no coinciden",
    updatingPassword: "Actualizando...",
    passwordUpdated: "Contraseña Actualizada",
    passwordUpdateSuccess: "Su contraseña ha sido actualizada con éxito",
    updatePasswordError: "Error al Actualizar la Contraseña",
    forgotPassword: "¿Olvidó su contraseña?",
    confirmDelete: "Confirmar Eliminación",
    deleteExpenseMessage:
      "¿Estás seguro de que quieres eliminar este gasto? Esta acción no se puede deshacer.",
    delete: "Eliminar",
    deleting: "Eliminando...",
    expenseDeleted: "Gasto Eliminado",
    expenseDeletedMessage: "El gasto ha sido eliminado con éxito.",
    errorDeletingExpense: "Error al Eliminar el Gasto",

    // Offline mode translations
    online: "En línea",
    offline: "Fuera de línea",
    offlineMode: "Modo sin conexión",
    changesStoredLocally:
      "Los cambios se guardarán localmente y se sincronizarán cuando vuelvas a estar en línea.",
    expenseAddedOffline:
      "Gasto guardado localmente. Se sincronizará cuando estés en línea.",
    syncNow: "Sincronizar ahora",
    syncing: "Sincronizando...",
    syncComplete: "Sincronización completada",
    syncError: "Error de sincronización",
    pendingSync: "Pendiente de sincronización",
    youAreOnline: "Estás en línea",
    youAreOffline: "Estás fuera de línea",
    syncingPendingChanges: "Sincronizando cambios pendientes",
    allDataSynced: "Todos los datos están sincronizados",
    cannotSyncOffline: "No se puede sincronizar mientras estás fuera de línea",
    syncInProgress: "Sincronización en progreso",
    pleaseWait: "Por favor espera",
    unknownError: "Error desconocido",
    noExpensesInSelectedPeriod: "No hay gastos en el período seleccionado",
    present: "Presente",
    until: "Hasta",
  },
};

// Use the base translations
const translations = baseTranslations;
