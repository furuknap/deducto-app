
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { useLanguage } from "@/context/LanguageContext";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseChart } from "@/components/ExpenseChart";
import { useExpenses } from "@/hooks/useExpenses";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const {
    filteredExpenses,
    dateFilteredExpenses,
    categories,
    isLoadingExpenses,
    isLoadingCategories,
    totalAmount,
    selectedCategoryId,
    dateRange,
    fetchExpenses,
    handleDateRangeChange,
    handleCategoryChange
  } = useExpenses(user.id);
  
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
              <ExpenseForm 
                userId={user.id}
                categories={categories}
                isLoadingCategories={isLoadingCategories}
                onExpenseAdded={fetchExpenses}
              />
            </CardContent>
          </Card>
          
          <div className="md:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("recentExpenses")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 mb-4">
                  <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
                  <CategoryFilter 
                    expenses={dateFilteredExpenses}
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onCategoryChange={handleCategoryChange}
                  />
                </div>
                
                <ExpenseList 
                  expenses={filteredExpenses}
                  isLoading={isLoadingExpenses}
                  totalAmount={totalAmount}
                  onExpenseDeleted={fetchExpenses}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Chart at the bottom of the page */}
        <div className="mt-6">
          <ExpenseChart 
            expenses={filteredExpenses}
            isLoading={isLoadingExpenses}
            dateRange={dateRange}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
