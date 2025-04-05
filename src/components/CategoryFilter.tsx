
import { useState, useEffect } from "react";
import { Check, Filter } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

type Category = Tables<"categories">;
type Expense = Tables<"expenses"> & {
  categories: Tables<"categories"> | null;
};

interface CategoryFilterProps {
  expenses: Expense[];
  categories: Category[];
  onCategoryChange: (categoryId: string | null) => void;
  selectedCategoryId: string | null;
}

export const CategoryFilter = ({
  expenses,
  categories,
  onCategoryChange,
  selectedCategoryId,
}: CategoryFilterProps) => {
  const { t } = useLanguage();
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  // Filter categories to only show ones that have expenses in the current filtered list
  useEffect(() => {
    if (!expenses.length) {
      setAvailableCategories(categories);
      return;
    }

    const categoryIds = new Set(
      expenses
        .filter(expense => expense.category_id !== null)
        .map(expense => expense.category_id)
    );
    
    const filteredCategories = categories.filter(
      category => categoryIds.has(category.id)
    );
    
    setAvailableCategories(filteredCategories);
  }, [expenses, categories]);

  return (
    <div className="mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {selectedCategoryId 
              ? categories.find(c => c.id === selectedCategoryId)?.name || t("category")
              : t("allCategories")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>{t("filterByCategory")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={selectedCategoryId === null}
            onCheckedChange={() => onCategoryChange(null)}
          >
            {t("allCategories")}
          </DropdownMenuCheckboxItem>
          {availableCategories.map((category) => (
            <DropdownMenuCheckboxItem
              key={category.id}
              checked={selectedCategoryId === category.id}
              onCheckedChange={() => onCategoryChange(category.id)}
            >
              {category.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
