import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { useLanguage } from "@/context/LanguageContext";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { OfflineCategoryFilter } from "@/components/OfflineCategoryFilter";
import { OfflineExpenseForm } from "@/components/OfflineExpenseForm";
import { OfflineExpenseList } from "@/components/OfflineExpenseList";
import { OfflineExpenseChart } from "@/components/OfflineExpenseChart";
import { useOfflineExpenses } from "@/hooks/useOfflineExpenses";
import { useOffline } from "@/context/OfflineContext";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isOnline, isSyncing, triggerSync } = useOffline();

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
    handleCategoryChange,
    addNewExpense,
    deleteExpenseById,
  } = useOfflineExpenses(user?.id);

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
        {/* Online/Offline Status Indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-600">{t("online")}</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-amber-600">{t("offline")}</span>
              </>
            )}
          </div>

          {isOnline && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerSync()}
              disabled={isSyncing}
              className="flex items-center gap-1"
            >
              <RefreshCw
                className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? t("syncing") : t("syncNow")}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>{t("addNewExpense")}</CardTitle>
            </CardHeader>
            <CardContent>
              {user && (
                <OfflineExpenseForm
                  userId={user.id}
                  categories={categories}
                  isLoadingCategories={isLoadingCategories}
                  onExpenseAdded={fetchExpenses}
                  addNewExpense={addNewExpense}
                  isOnline={isOnline}
                />
              )}
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
                  <OfflineCategoryFilter
                    expenses={dateFilteredExpenses}
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onCategoryChange={handleCategoryChange}
                  />
                </div>

                <OfflineExpenseList
                  expenses={filteredExpenses}
                  isLoading={isLoadingExpenses}
                  onDeleteExpense={deleteExpenseById}
                  onSyncRequest={triggerSync}
                  isOnline={isOnline}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Move the chart to the bottom of the page */}
        <div className="mt-6">
          <OfflineExpenseChart
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
