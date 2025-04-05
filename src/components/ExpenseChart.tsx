
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

type Expense = Tables<"expenses"> & {
  categories: Tables<"categories"> | null;
};

type CategoryTotal = {
  name: string;
  value: number;
  color: string;
};

// More distinct colors with better contrast
const COLORS = [
  "#8B5CF6", // Vivid Purple
  "#F97316", // Bright Orange
  "#0EA5E9", // Ocean Blue
  "#D946EF", // Magenta Pink 
  "#ea384c", // Red
  "#34d399", // Green
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
];

interface ExpenseChartProps {
  expenses: Expense[];
  isLoading: boolean;
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export const ExpenseChart = ({ expenses, isLoading, dateRange }: ExpenseChartProps) => {
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

  // Calculate percentages for each category
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentage = chartData.map(item => ({
    ...item,
    percentage: totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0
  }));

  // Format the date range for display
  const dateRangeText = useMemo(() => {
    if (!dateRange || (!dateRange.from && !dateRange.to)) {
      return t("allTime");
    }
    
    if (dateRange.from && dateRange.to) {
      if (dateRange.from.toDateString() === dateRange.to.toDateString()) {
        return format(dateRange.from, 'MMM dd, yyyy');
      }
      return `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
    }
    
    if (dateRange.from) {
      return `${format(dateRange.from, 'MMM dd, yyyy')} - ${t("present")}`;
    }
    
    if (dateRange.to) {
      return `${t("until")} ${format(dateRange.to, 'MMM dd, yyyy')}`;
    }
    
    return t("allTime");
  }, [dateRange, t]);

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
      <CardHeader className="flex flex-col space-y-1">
        <CardTitle>{t("expensesByCategory")}</CardTitle>
        <p className="text-sm text-muted-foreground">{dateRangeText}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row h-[300px] w-full">
          {/* Pie chart on the left */}
          <div className="w-full md:w-1/2">
            <ChartContainer config={chartConfig}>
              <PieChart width={300} height={250}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
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
              </PieChart>
            </ChartContainer>
          </div>
          
          {/* Legend on the right with percentages */}
          <div className="w-full md:w-1/2 flex items-center">
            <div className="w-full">
              <ul className="space-y-2">
                {dataWithPercentage.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span 
                      className="block w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">
                      {item.name} ({item.percentage}%) - ${item.value.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
