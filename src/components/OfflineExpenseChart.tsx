import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { LocalExpense, LocalCategory } from "@/utils/indexedDBUtils";

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

type CategoryTotal = {
  name: string;
  value: number;
  color: string;
};

interface OfflineExpenseChartProps {
  expenses: LocalExpense[];
  isLoading: boolean;
  dateRange: { from: Date | undefined; to: Date | undefined };
}

export const OfflineExpenseChart = ({
  expenses,
  isLoading,
  dateRange,
}: OfflineExpenseChartProps) => {
  const { t } = useLanguage();

  // Calculate data for the pie chart
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
    return Object.entries(categoryTotals).map(
      ([id, { total, name }], index) => ({
        name,
        value: total,
        color: COLORS[index % COLORS.length],
      })
    );
  }, [expenses, t]);

  // Create chart config
  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};

    chartData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.color,
      };
    });

    return config;
  }, [chartData]);

  // Format date range for display
  const dateRangeText = useMemo(() => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "PP")} - ${format(dateRange.to, "PP")}`;
    }
    return t("allTime");
  }, [dateRange, t]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("expensesByCategory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-[250px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("expensesByCategory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p>{t("noExpensesInSelectedPeriod")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("expensesByCategory")}</CardTitle>
        <p className="text-sm text-gray-500">{dateRangeText}</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart width={500} height={300}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                percent,
              }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return percent > 0.05 ? (
                  <text
                    x={x}
                    y={y}
                    fill="#888"
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                    fontSize={12}
                  >
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                ) : null;
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
