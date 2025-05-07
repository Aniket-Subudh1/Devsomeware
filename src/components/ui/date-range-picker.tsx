"use client";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

export interface DateRangePickerValue {
  from?: Date;
  to?: Date;
}

export interface DateRangePickerItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: DateRangePickerValue;
  onDateChange?: (value: DateRangePickerValue) => void;
}

export function DateRangePickerItem({
  className,
  value,
  onDateChange,
}: DateRangePickerItemProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: value?.from,
    to: value?.to,
  });

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    onDateChange?.(range || {});
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={date?.from}
        selected={date}
        onSelect={handleSelect}
        numberOfMonths={2}
        className="bg-gray-900 border-gray-700 text-white rounded-md"
      />
      <div className="flex gap-2 mt-2">
        <Button
          variant="outline"
          className="flex-1 bg-gray-900 border-gray-700 text-white"
          onClick={() => {
            const today = new Date();
            handleSelect({
              from: today,
              to: today,
            });
          }}
        >
          Today
        </Button>
        <Button
          variant="outline"
          className="flex-1 bg-gray-900 border-gray-700 text-white"
          onClick={() => {
            const today = new Date();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            handleSelect({
              from: weekStart,
              to: weekEnd,
            });
          }}
        >
          This Week
        </Button>
        <Button
          variant="outline"
          className="flex-1 bg-gray-900 border-gray-700 text-white"
          onClick={() => {
            const today = new Date();
            const monthStart = new Date(
              today.getFullYear(),
              today.getMonth(),
              1
            );
            const monthEnd = new Date(
              today.getFullYear(),
              today.getMonth() + 1,
              0
            );

            handleSelect({
              from: monthStart,
              to: monthEnd,
            });
          }}
        >
          This Month
        </Button>
      </div>
    </div>
  );
}

export interface DateRangePickerProps {
  value?: DateRangePickerValue;
  onChange?: (value: DateRangePickerValue) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="w-auto">
      <DateRangePickerItem value={value} onDateChange={onChange} />
    </div>
  );
}
