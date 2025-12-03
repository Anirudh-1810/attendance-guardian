import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface CircularTimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

export default function CircularTimePicker({ value, onChange }: CircularTimePickerProps) {
  // Parse the time value (format: "HH:MM")
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: 9, minute: 0, period: "AM" };
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour = hours % 12 || 12;
    return { hour, minute: minutes, period };
  };

  const { hour: initialHour, minute: initialMinute, period: initialPeriod } = parseTime(value);
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  const [period, setPeriod] = useState(initialPeriod);

  const updateTime = (newHour: number, newMinute: number, newPeriod: string) => {
    let hours24 = newHour;
    if (newPeriod === "PM" && newHour !== 12) hours24 += 12;
    if (newPeriod === "AM" && newHour === 12) hours24 = 0;
    
    const timeString = `${String(hours24).padStart(2, "0")}:${String(newMinute).padStart(2, "0")}`;
    onChange(timeString);
  };

  const incrementHour = () => {
    const newHour = hour === 12 ? 1 : hour + 1;
    setHour(newHour);
    updateTime(newHour, minute, period);
  };

  const decrementHour = () => {
    const newHour = hour === 1 ? 12 : hour - 1;
    setHour(newHour);
    updateTime(newHour, minute, period);
  };

  const incrementMinute = () => {
    const newMinute = minute === 59 ? 0 : minute + 1;
    setMinute(newMinute);
    updateTime(hour, newMinute, period);
  };

  const decrementMinute = () => {
    const newMinute = minute === 0 ? 59 : minute - 1;
    setMinute(newMinute);
    updateTime(hour, newMinute, period);
  };

  const togglePeriod = () => {
    const newPeriod = period === "AM" ? "PM" : "AM";
    setPeriod(newPeriod);
    updateTime(hour, minute, newPeriod);
  };

  return (
    <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border-2 border-blue-100 dark:border-blue-900">
      {/* Hour Picker */}
      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
          onClick={incrementHour}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-xl">
          <span className="text-4xl font-bold text-white">{String(hour).padStart(2, "0")}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
          onClick={decrementHour}
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
        <span className="text-xs text-muted-foreground font-medium">Hour</span>
      </div>

      {/* Separator */}
      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 pb-8">:</div>

      {/* Minute Picker */}
      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900"
          onClick={incrementMinute}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-xl">
          <span className="text-4xl font-bold text-white">{String(minute).padStart(2, "0")}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900"
          onClick={decrementMinute}
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
        <span className="text-xs text-muted-foreground font-medium">Minute</span>
      </div>

      {/* AM/PM Toggle */}
      <div className="flex flex-col items-center gap-2 ml-2">
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant={period === "AM" ? "default" : "outline"}
            size="sm"
            className={`h-12 w-16 text-lg font-bold ${
              period === "AM"
                ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                : "hover:bg-blue-50 dark:hover:bg-blue-950"
            }`}
            onClick={() => {
              if (period !== "AM") togglePeriod();
            }}
          >
            AM
          </Button>
          <Button
            type="button"
            variant={period === "PM" ? "default" : "outline"}
            size="sm"
            className={`h-12 w-16 text-lg font-bold ${
              period === "PM"
                ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                : "hover:bg-purple-50 dark:hover:bg-purple-950"
            }`}
            onClick={() => {
              if (period !== "PM") togglePeriod();
            }}
          >
            PM
          </Button>
        </div>
        <span className="text-xs text-muted-foreground font-medium">Period</span>
      </div>
    </div>
  );
}
