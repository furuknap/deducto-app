
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type DateRangeFilterProps = {
  onDateRangeChange: (dateRange: DateRange) => void;
};

export const DateRangeFilter = ({ onDateRangeChange }: DateRangeFilterProps) => {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getFirstDayOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const firstDay = new Date(date);
    firstDay.setDate(diff);
    firstDay.setHours(0, 0, 0, 0);
    return firstDay;
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
    return firstDay;
  };

  const getPreviousDaysStart = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    let range: DateRange = { from: undefined, to: undefined };

    switch (filter) {
      case "today":
        range = { from: today, to: today };
        break;
      case "this-week":
        range = { from: getFirstDayOfWeek(today), to: today };
        break;
      case "this-month":
        range = { from: getFirstDayOfMonth(today), to: today };
        break;
      case "previous-7":
        range = { from: getPreviousDaysStart(7), to: today };
        break;
      case "previous-30":
        range = { from: getPreviousDaysStart(30), to: today };
        break;
      case "custom":
        // Keep existing custom date range
        range = dateRange;
        break;
      default:
        // "all" - no date filtering
        range = { from: undefined, to: undefined };
    }

    setDateRange(range);
    onDateRangeChange(range);
  };

  const handleCustomDateChange = (range: DateRange) => {
    setDateRange(range);
    if (range.from && range.to) {
      setActiveFilter("custom");
      onDateRangeChange(range);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          size="sm"
          variant={activeFilter === "all" ? "default" : "outline"}
          onClick={() => handleFilterClick("all")}
        >
          {t("allTime")}
        </Button>
        <Button
          size="sm"
          variant={activeFilter === "today" ? "default" : "outline"}
          onClick={() => handleFilterClick("today")}
        >
          {t("today")}
        </Button>
        <Button
          size="sm"
          variant={activeFilter === "this-week" ? "default" : "outline"}
          onClick={() => handleFilterClick("this-week")}
        >
          {t("thisWeek")}
        </Button>
        <Button
          size="sm"
          variant={activeFilter === "this-month" ? "default" : "outline"}
          onClick={() => handleFilterClick("this-month")}
        >
          {t("thisMonth")}
        </Button>
        <Button
          size="sm"
          variant={activeFilter === "previous-7" ? "default" : "outline"}
          onClick={() => handleFilterClick("previous-7")}
        >
          {t("previous7Days")}
        </Button>
        <Button
          size="sm"
          variant={activeFilter === "previous-30" ? "default" : "outline"}
          onClick={() => handleFilterClick("previous-30")}
        >
          {t("previous30Days")}
        </Button>
      </div>

      <div className="flex flex-col space-y-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={activeFilter === "custom" ? "default" : "outline"}
              className="justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from && dateRange.to ? (
                <>
                  {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
                </>
              ) : (
                <span>{t("customDateRange")}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ 
                from: dateRange.from || undefined, 
                to: dateRange.to || undefined 
              }}
              onSelect={(range: any) => handleCustomDateChange(range || { from: undefined, to: undefined })}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
