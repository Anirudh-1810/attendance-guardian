import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SubjectCard } from "@/components/SubjectCard";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart3, GraduationCap, AlertTriangle, TrendingUp, Calendar, Settings } from "lucide-react";

type SubjectStatus = "safe" | "warning" | "high" | "critical";
type SurpriseLevel = "low" | "medium" | "high";

const mockSubjects: Array<{
  id: number;
  name: string;
  code: string;
  teacher: string;
  attendance: number;
  required: number;
  status: SubjectStatus;
  surpriseLevel: SurpriseLevel;
  canBunk: number;
  mustAttend: number;
}> = [
  {
    id: 1,
    name: "Data Structures",
    code: "CS201",
    teacher: "Dr. Sarah Johnson",
    attendance: 88,
    required: 75,
    status: "safe",
    surpriseLevel: "low",
    canBunk: 3,
    mustAttend: 0,
  },
  {
    id: 2,
    name: "Database Management",
    code: "CS202",
    teacher: "Prof. Michael Chen",
    attendance: 72,
    required: 75,
    status: "warning",
    surpriseLevel: "medium",
    canBunk: 0,
    mustAttend: 2,
  },
  {
    id: 3,
    name: "Operating Systems",
    code: "CS203",
    teacher: "Dr. Emily Brown",
    attendance: 68,
    required: 75,
    status: "high",
    surpriseLevel: "high",
    canBunk: 0,
    mustAttend: 4,
  },
  {
    id: 4,
    name: "Computer Networks",
    code: "CS204",
    teacher: "Prof. David Lee",
    attendance: 92,
    required: 75,
    status: "safe",
    surpriseLevel: "low",
    canBunk: 5,
    mustAttend: 0,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [subjects] = useState(mockSubjects);

  const avgAttendance = Math.round(
    subjects.reduce((acc, s) => acc + s.attendance, 0) / subjects.length
  );
  const atRisk = subjects.filter(s => s.status === "high" || s.status === "critical" || s.status === "warning").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Attendance Risk Detector</h1>
                <p className="text-sm text-muted-foreground">Spring 2024 Semester</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/attendance")}>
                <Calendar className="h-4 w-4" />
                Mark Attendance
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Average Attendance"
            value={`${avgAttendance}%`}
            subtitle="Across all subjects"
            icon={BarChart3}
            trend={avgAttendance >= 75 ? "up" : "down"}
            gradient
          />
          <StatCard
            title="Subjects at Risk"
            value={atRisk}
            subtitle="Below required %"
            icon={AlertTriangle}
          />
          <StatCard
            title="Overall Status"
            value={avgAttendance >= 80 ? "Safe" : avgAttendance >= 70 ? "Warning" : "Critical"}
            subtitle="Keep it up!"
            icon={TrendingUp}
          />
        </div>

        {/* Risk Meter */}
        <div className="rounded-2xl bg-card p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Attendance Risk Meter</h2>
            <span className="text-sm text-muted-foreground">{avgAttendance}% Average</span>
          </div>
          <div className="space-y-2">
            <Progress value={avgAttendance} className="h-3 gradient-risk" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Subjects</h2>
            <Button variant="outline" onClick={() => navigate("/subjects")}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onClick={() => navigate(`/subject/${subject.id}`)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
