
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { deleteExpense } from "@/utils/dataStorage";

export const useDeleteExpense = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useLanguage();

  const handleDeleteExpense = async (expenseId: string, userId: string) => {
    try {
      setIsDeleting(true);
      
      const success = deleteExpense(userId, expenseId);
      
      if (!success) throw new Error("Failed to delete expense");
      
      toast({
        title: t("expenseDeleted"),
        description: t("expenseDeletedMessage"),
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: t("errorDeletingExpense"),
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteExpense: handleDeleteExpense, isDeleting };
};
