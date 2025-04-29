import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/context/LanguageContext";
import { LocalCategory } from "@/utils/indexedDBUtils";

type Category = LocalCategory;

interface OfflineExpenseFormProps {
  userId: string;
  categories: Category[];
  isLoadingCategories: boolean;
  onExpenseAdded: () => void;
  addNewExpense: (
    expenseData: Omit<Tables<"expenses">, "id"> & { user_id: string }
  ) => Promise<boolean>;
  isOnline: boolean;
}

export const OfflineExpenseForm = ({
  userId,
  categories,
  isLoadingCategories,
  onExpenseAdded,
  addNewExpense,
  isOnline,
}: OfflineExpenseFormProps) => {
  const { t } = useLanguage();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [count, setCount] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) return;

    try {
      setIsSubmitting(true);

      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];
      const now = new Date().toISOString();

      const success = await addNewExpense({
        user_id: userId,
        amount: parseFloat(amount),
        description,
        category_id: categoryId || null,
        count: parseInt(count),
        date: formattedDate,
        created_at: now,
      });

      if (success) {
        toast({
          title: t("expenseAdded"),
          description: isOnline
            ? t("expenseSuccessfullyRecorded")
            : t("expenseAddedOffline"),
        });

        setAmount("");
        setDescription("");
        setCategoryId("");
        setCount("1");

        onExpenseAdded();
      }
    } catch (error) {
      toast({
        title: t("errorAddingExpense"),
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isOnline && (
        <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-md mb-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {t("offlineMode")} {t("changesSavedLocally")}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">{t("amount")}</Label>
        <Input
          id="amount"
          type="number"
          step="100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("description")}</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("whatExpenseFor")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">{t("category")}</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder={t("selectCategory")} />
          </SelectTrigger>
          <SelectContent>
            {isLoadingCategories ? (
              <SelectItem value="loading" disabled>
                {t("loadingCategories")}
              </SelectItem>
            ) : categories.length === 0 ? (
              <SelectItem value="none" disabled>
                {t("noCategories")}
              </SelectItem>
            ) : (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="count">{t("count")}</Label>
        <Input
          id="count"
          type="number"
          min="1"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t("adding") : t("addExpense")}
      </Button>
    </form>
  );
};
