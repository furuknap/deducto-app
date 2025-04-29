import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocalExpense } from "@/utils/indexedDBUtils";
import { useLanguage } from "@/context/LanguageContext";
import { format } from "date-fns";
import { AlertCircle, Trash2, RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OfflineExpenseListProps {
  expenses: LocalExpense[];
  isLoading: boolean;
  onDeleteExpense: (id: string) => Promise<boolean>;
  onSyncRequest: () => Promise<void>;
  isOnline: boolean;
}

export const OfflineExpenseList = ({
  expenses,
  isLoading,
  onDeleteExpense,
  onSyncRequest,
  isOnline,
}: OfflineExpenseListProps) => {
  const { t } = useLanguage();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteExpense(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSync = async () => {
    if (!isOnline) return;

    setIsSyncing(true);
    try {
      await onSyncRequest();
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("expenses")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("loading")}</p>
        </CardContent>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("expenses")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("noExpensesYet")}</p>
        </CardContent>
      </Card>
    );
  }

  // Count pending sync items
  const pendingSyncCount = expenses.filter(
    (expense) => expense.syncStatus === "pending"
  ).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("expenses")}</CardTitle>
        {pendingSyncCount > 0 && isOnline && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1"
          >
            <RefreshCw
              className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? t("syncing") : t("sync")} ({pendingSyncCount})
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between border-b pb-2"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{expense.description}</span>
                  {expense.syncStatus === "pending" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full p-1">
                            <AlertCircle className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("pendingSync")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {expense.syncStatus === "error" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="bg-red-100 dark:bg-red-900 rounded-full p-1">
                            <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("syncError")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(expense.date)}
                </div>
                <div className="text-sm">
                  {expense.categories?.name && (
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs mr-2">
                      {expense.categories.name}
                    </span>
                  )}
                  {expense.count > 1 && (
                    <span className="text-xs">
                      {expense.count} ×{" "}
                      {parseFloat(expense.amount.toString()).toLocaleString()} ={" "}
                    </span>
                  )}
                  <span className="font-semibold">
                    {(
                      parseFloat(expense.amount.toString()) * expense.count
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(expense.id)}
                disabled={deletingId === expense.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
