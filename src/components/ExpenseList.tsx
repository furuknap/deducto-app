
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { format, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteExpense } from "@/hooks/useDeleteExpense";
import { useAuth } from "@/context/AuthContext";
import { Expense } from "@/utils/dataStorage";

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  totalAmount: number;
  onExpenseDeleted?: () => void;
}

export const ExpenseList = ({ expenses, isLoading, totalAmount, onExpenseDeleted }: ExpenseListProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteExpense, isDeleting } = useDeleteExpense();

  const handleExpenseClick = (expense: Expense) => {
    if (selectedExpense?.id === expense.id) {
      setSelectedExpense(null);
    } else {
      setSelectedExpense(expense);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, expense: Expense) => {
    e.stopPropagation();
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedExpense && user) {
      await deleteExpense(selectedExpense.id, user.id);
      setIsDeleteDialogOpen(false);
      setSelectedExpense(null);
      if (onExpenseDeleted) onExpenseDeleted();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center p-3 border rounded">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <p className="text-center py-8 text-gray-500">
        {t("noExpenses")}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {expenses.map((expense) => {
          // Format the date string from the database to display correctly
          const formattedDate = format(parseISO(expense.date), 'MMM dd, yyyy');
          const isSelected = selectedExpense?.id === expense.id;
          
          return (
            <div
              key={expense.id}
              className={`flex justify-between items-center p-3 border rounded bg-white cursor-pointer transition-colors ${
                isSelected ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => handleExpenseClick(expense)}
            >
              <div>
                <p className="font-medium">{expense.description}</p>
                <div className="text-sm text-gray-500 flex space-x-2">
                  <span>{formattedDate}</span>
                  {expense.categories && <span>• {expense.categories.name}</span>}
                  {expense.count > 1 && <span>• {t("qty")}: {expense.count}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-bold">
                  ${parseFloat(expense.amount.toString()).toFixed(2)}
                </div>
                {isSelected && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => handleDeleteClick(e, expense)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{t("delete")}</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <p className="font-medium">
          {t("total")}:{" "}
          <span className="font-bold">
            ${totalAmount.toFixed(2)}
          </span>
        </p>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteExpenseMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
