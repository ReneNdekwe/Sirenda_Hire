import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  fromDate?: Date;
}

export function DatePicker({
  date,
  setDate,
  label,
  placeholder = "Pick a date",
  className,
  disabled = false,
  fromDate,
}: DatePickerProps) {
  const disabledDates = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { before: fromDate || today };
  }, [fromDate]);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal pl-3 pr-2",
              !date && "text-muted-foreground"
            )}
            disabled={typeof disabled === 'function' ? disabled(date) : disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{date ? format(date, "PPP") : placeholder}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={disabledDates}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}