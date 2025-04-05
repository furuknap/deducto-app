
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { useLanguage } from "@/context/LanguageContext";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { useExpenses } from "@/hooks/useExpenses";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const {
    filteredExpenses,
    categories,
    isLoadingExpenses,
    isLoadingCategories,
    totalAmount,
    selectedCategoryId,
    fetchExpenses,
    handleDateRangeChange,
    handleCategoryChange
  } = useExpenses(user?.id);
  
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <div className="container mx-auto py-8 flex-1">
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <div className="container mx-auto py-8 px-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>{t("addNewExpense")}</CardTitle>
            </CardHeader>
            <CardContent>
              {user && (
                <ExpenseForm 
                  userId={user.id}
                  categories={categories}
                  isLoadingCategories={isLoadingCategories}
                  onExpenseAdded={fetchExpenses}
                />
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("recentExpenses")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mb-4">
                <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
                <CategoryFilter 
                  expenses={filteredExpenses}
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onCategoryChange={handleCategoryChange}
                />
              </div>
              
              <ExpenseList 
                expenses={filteredExpenses}
                isLoading={isLoadingExpenses}
                totalAmount={totalAmount}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
