import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
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
import { LocalExpense, LocalCategory } from "@/utils/indexedDBUtils";

interface OfflineCategoryFilterProps {
  expenses: LocalExpense[];
  categories: LocalCategory[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export const OfflineCategoryFilter = ({
  expenses,
  categories,
  selectedCategoryId,
  onCategoryChange,
}: OfflineCategoryFilterProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [categoryMap, setCategoryMap] = useState<Record<string, LocalCategory>>(
    {}
  );

  useEffect(() => {
    // Create a map of category IDs to category objects for quick lookup
    const map: Record<string, LocalCategory> = {};
    categories.forEach((category) => {
      map[category.id] = category;
    });
    setCategoryMap(map);
  }, [categories]);

  // Get unique category IDs from expenses
  const uniqueCategoryIds = Array.from(
    new Set(
      expenses
        .filter((expense) => expense.category_id)
        .map((expense) => expense.category_id as string)
    )
  );

  // Filter out categories that don't exist in the categories array
  const availableCategories = uniqueCategoryIds
    .filter((id) => categoryMap[id])
    .map((id) => categoryMap[id]);

  const handleCategorySelect = (categoryId: string | null) => {
    onCategoryChange(categoryId);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          {selectedCategoryId
            ? t("filterByCategory") +
              ": " +
              (categoryMap[selectedCategoryId]?.name || t("unknown"))
            : t("filterByCategory")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("categories")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={selectedCategoryId === null}
          onCheckedChange={() => handleCategorySelect(null)}
        >
          {t("all")}
        </DropdownMenuCheckboxItem>
        {availableCategories.map((category) => (
          <DropdownMenuCheckboxItem
            key={category.id}
            checked={selectedCategoryId === category.id}
            onCheckedChange={() => handleCategorySelect(category.id)}
          >
            {category.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
