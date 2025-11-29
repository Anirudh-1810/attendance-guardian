import { useNavigate } from "react-router-dom";
import { SubjectCard } from "@/components/SubjectCard";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BarChart3, GraduationCap, AlertTriangle, TrendingUp, Calendar, Settings } from "lucide-react";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { calculateStatus, calculateBunks, calculateMustAttend } from "@/lib/calculations";

export default function Dashboard() {
  const navigate = useNavigate();
  const { subjects } = useAttendanceData();

  // Calculate Aggregates
  const totalAttended = subjects.reduce((acc, s) => acc + s.attendedClasses, 0);
  const totalClasses = subjects.reduce((acc, s) => acc + s.totalClasses, 0);
  const avgAttendance = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
  
  const atRiskCount = subjects.filter(s => {
    const status = calculateStatus(s);
    return status === "high" || status === "critical";
  }).length;

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
                <h1 className="text-xl font-bold">Attendance Guardian</h1>
                <p className="text-sm text-muted-foreground">Spring Semester</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/attendance")}>
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Mark</span>
              </Button>
              <ThemeToggle />
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
            value={atRiskCount}
            subtitle="Below required %"
            icon={AlertTriangle}
          />
          <StatCard
            title="Overall Status"
            value={avgAttendance >= 80 ? "Safe" : avgAttendance >= 75 ? "Warning" : "Critical"}
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
              <span>75% (Req)</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Subjects</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((subject) => {
              const status = calculateStatus(subject);
              const attendancePct = Math.round((subject.attendedClasses / subject.totalClasses) * 100);
              
              // Map to component props
              const cardProps = {
                name: subject.name,
                code: subject.code,
                teacher: subject.teacher,
                attendance: attendancePct,
                required: subject.requiredPercentage,
                status: status as "safe" | "warning" | "high" | "critical",
                surpriseLevel: "low" as const, // Mock data for now
                canBunk: calculateBunks(subject),
                mustAttend: calculateMustAttend(subject)
              };

              return (
                <SubjectCard
                  key={subject.id}
                  subject={cardProps}
                  onClick={() => navigate(`/subject/${subject.id}`)}
                />
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}