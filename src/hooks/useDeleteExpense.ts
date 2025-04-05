
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

export const useDeleteExpense = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useLanguage();

  const deleteExpense = async (expenseId: string) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);
      
      if (error) throw error;
      
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

  return { deleteExpense, isDeleting };
};
