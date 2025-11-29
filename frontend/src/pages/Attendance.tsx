import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClassCard } from "@/components/ClassCard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { toast } from "sonner";

export default function Attendance() {
  const navigate = useNavigate();
  const { subjects, updateSubject } = useAttendanceData();
  
  // Fix: Allow date to be Date or undefined explicitly
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [markedClasses, setMarkedClasses] = useState<Set<string>>(new Set());

  // Fix: Add safe optional chaining (?.) in case subjects is loading
  const todaysClasses = subjects?.map((sub) => ({
    id: sub.id,
    time: "09:00 - 10:00", // Placeholder time
    subject: sub.name,
    teacher: sub.teacher,
    code: sub.code,
  })) || [];

  const handleMark = (subjectId: number, status: "present" | "absent") => {
    updateSubject(subjectId, status);
    setMarkedClasses((prev) => new Set(prev).add(subjectId.toString()));
    toast.success(`Marked ${status} successfully`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Mark Attendance</h1>
              <p className="text-sm text-muted-foreground">
                {date ? format(date, "PPP") : "Select date"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <ThemeToggle />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <CalendarIcon className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-4">
          {todaysClasses.map((classData) => (
            <ClassCard
              key={classData.id}
              classData={classData}
              onMark={(status) => handleMark(classData.id, status)}
            />
          ))}
          {todaysClasses.length === 0 && (
            <p className="text-center text-muted-foreground">No classes found.</p>
          )}
        </div>
      </main>
    </div>
  );
}