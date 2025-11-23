import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClassCard } from "@/components/ClassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { toast } from "sonner";

const todaysClasses = [
  {
    time: "09:00 - 10:00",
    subject: "Data Structures",
    teacher: "Dr. Sarah Johnson",
    code: "CS201",
  },
  {
    time: "10:00 - 11:00",
    subject: "Database Management",
    teacher: "Prof. Michael Chen",
    code: "CS202",
  },
  {
    time: "11:30 - 12:30",
    subject: "Operating Systems",
    teacher: "Dr. Emily Brown",
    code: "CS203",
  },
  {
    time: "14:00 - 15:00",
    subject: "Computer Networks",
    teacher: "Prof. David Lee",
    code: "CS204",
  },
];

export default function Attendance() {
  const navigate = useNavigate();
  const [markedClasses, setMarkedClasses] = useState<Set<string>>(new Set());

  const handleMark = (classTime: string, status: "present" | "absent", reason?: string) => {
    setMarkedClasses(prev => new Set(prev).add(classTime));
    toast.success(
      `Marked ${status === "present" ? "Present" : "Absent"} for ${classTime}`,
      {
        description: reason && reason !== "normal" ? `Reason: ${reason === "duty" ? "Duty Leave" : "Medical Leave"}` : undefined,
      }
    );
  };

  const allMarked = markedClasses.size === todaysClasses.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Mark Attendance</h1>
                <p className="text-sm text-muted-foreground">
                  Today — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
            <Calendar className="h-5 w-5 text-primary" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Progress Indicator */}
        <div className="rounded-2xl bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Progress</h2>
            <span className="text-sm text-muted-foreground">
              {markedClasses.size} of {todaysClasses.length} marked
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${(markedClasses.size / todaysClasses.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Classes List */}
        <div className="space-y-4">
          {todaysClasses.map((classData) => (
            <ClassCard
              key={classData.time}
              classData={classData}
              onMark={(status, reason, wasTaken) => handleMark(classData.time, status, reason)}
            />
          ))}
        </div>

        {/* Save Button */}
        {allMarked && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
            <Button
              size="lg"
              className="shadow-xl animate-in slide-in-from-bottom-4"
              onClick={() => {
                toast.success("Attendance saved successfully!");
                navigate("/");
              }}
            >
              Save All Attendance
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
