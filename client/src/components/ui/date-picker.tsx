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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean | ((date: Date) => boolean);
  fromDate?: Date;
  bookedDates?: Array<{ start: string; end: string }>;
}

export function DatePicker({
  date,
  setDate,
  label,
  placeholder = "Pick a date",
  className,
  disabled = false as boolean | ((date: Date) => boolean),
  fromDate,
  bookedDates,
}: DatePickerProps) {
  const disabledDates = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { before: fromDate || today };
  }, [fromDate]);

  const isDateBooked = (date: Date) => {
    if (!bookedDates) return false;

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return bookedDates.some(booking => {
      const start = new Date(booking.start);
      const end = new Date(booking.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      return checkDate >= start && checkDate <= end;
    });
  };

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
            disabled={typeof disabled === 'function' ? (date ? disabled(date) : true) : disabled}
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
            disabled={(date) => {
              const isDisabled = typeof disabled === 'function' ? disabled(date) : disabled;
              return isDisabled || isDateBooked(date);
            }}
            modifiers={{
              booked: (date) => isDateBooked(date),
            }}
            modifiersStyles={{
              booked: { backgroundColor: '#fee2e2', color: '#ef4444' },
            }}
            initialFocus
          />
          {bookedDates && bookedDates.length > 0 && (
            <div className="p-3 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-300"></div>
                <span>Booked dates</span>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}