import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, XCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { toast } from "sonner";

export default function Attendance() {
  const navigate = useNavigate();
  const { subjects, updateSubject } = useAttendanceData();
  const [date, setDate] = useState<Date>(new Date());
  const [markedClasses, setMarkedClasses] = useState<Record<number, "present" | "absent">>({});

  const handleMark = (subjectId: number, status: "present" | "absent") => {
    updateSubject(subjectId, status);
    setMarkedClasses((prev) => ({ ...prev, [subjectId]: status }));
    toast.success(`Marked ${status} successfully`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Mark Attendance</h1>
                <p className="text-sm text-muted-foreground">{format(date, "PPP")}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="p-6 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select Date
            </h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
            />
          </Card>

          {/* Subjects List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold">Today's Classes</h3>
            
            {subjects.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No subjects added yet</p>
                <Button onClick={() => navigate("/")} className="mt-4">
                  Go to Dashboard
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <Card key={subject.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{subject.name}</h4>
                        <p className="text-sm text-muted-foreground">{subject.code}</p>
                        <p className="text-xs text-muted-foreground mt-1">{subject.teacher}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={markedClasses[subject.id] === "present" ? "default" : "outline"}
                          onClick={() => handleMark(subject.id, "present")}
                          className="gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Present
                        </Button>
                        <Button
                          variant={markedClasses[subject.id] === "absent" ? "destructive" : "outline"}
                          onClick={() => handleMark(subject.id, "absent")}
                          className="gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Absent
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
