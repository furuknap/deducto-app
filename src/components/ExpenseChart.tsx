
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

type Expense = Tables<"expenses"> & {
  categories: Tables<"categories"> | null;
};

type CategoryTotal = {
  name: string;
  value: number;
  color: string;
};

const COLORS = [
  "#9b87f5", // Primary Purple
  "#8B5CF6", // Vivid Purple
  "#0EA5E9", // Ocean Blue
  "#F97316", // Bright Orange
  "#D946EF", // Magenta Pink
  "#ea384c", // Red
  "#7E69AB", // Secondary Purple
  "#D6BCFA", // Light Purple
  "#33C3F0", // Sky Blue
];

interface ExpenseChartProps {
  expenses: Expense[];
  isLoading: boolean;
}

export const ExpenseChart = ({ expenses, isLoading }: ExpenseChartProps) => {
  const { t } = useLanguage();

  const chartData = useMemo(() => {
    // Group expenses by category
    const categoryTotals: Record<string, { total: number; name: string }> = {};
    
    expenses.forEach((expense) => {
      const categoryName = expense.categories?.name || t("uncategorized");
      const categoryId = expense.category_id || "uncategorized";
      const amount = parseFloat(expense.amount.toString()) * expense.count;
      
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = { total: 0, name: categoryName };
      }
      
      categoryTotals[categoryId].total += amount;
    });
    
    // Convert to array for recharts
    return Object.entries(categoryTotals).map(([id, { total, name }], index) => ({
      name,
      value: total,
      color: COLORS[index % COLORS.length]
    }));
  }, [expenses, t]);

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    
    chartData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.color
      };
    });
    
    return config;
  }, [chartData]);

  const formatTooltipValue = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("expensesByCategory")}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-[250px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("expensesByCategory")}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-center text-gray-500">{t("noExpensesToDisplay")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("expensesByCategory")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig}>
            <PieChart margin={{ top: 0, right: 0, bottom: 30, left: 0 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="40%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent formatter={formatTooltipValue} />} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
