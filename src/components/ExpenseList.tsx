
import { Skeleton } from "@/components/ui/skeleton";
import { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/context/LanguageContext";
import { format, parseISO } from "date-fns";

type Expense = Tables<"expenses"> & {
  categories: Tables<"categories"> | null;
};

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  totalAmount: number;
}

export const ExpenseList = ({ expenses, isLoading, totalAmount }: ExpenseListProps) => {
  const { t } = useLanguage();

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
          // This ensures we display the date as stored in the database without timezone conversion
          const formattedDate = format(parseISO(expense.date), 'MMM dd, yyyy');
          
          return (
            <div
              key={expense.id}
              className="flex justify-between items-center p-3 border rounded bg-white"
            >
              <div>
                <p className="font-medium">{expense.description}</p>
                <div className="text-sm text-gray-500 flex space-x-2">
                  <span>{formattedDate}</span>
                  {expense.categories && <span>• {expense.categories.name}</span>}
                  {expense.count > 1 && <span>• {t("qty")}: {expense.count}</span>}
                </div>
              </div>
              <div className="font-bold">
                ${parseFloat(expense.amount.toString()).toFixed(2)}
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
    </>
  );
};
