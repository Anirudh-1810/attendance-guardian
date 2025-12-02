import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { GraduationCap, Plus, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { calculateStatus, calculateBunks, calculateMustAttend } from "@/lib/calculations";
import AddSubjectDialog from "@/components/AddSubjectDialog";
import { ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { subjects, setSubjects } = useAttendanceData();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const totalAttended = subjects.reduce((acc, s) => acc + s.attendedClasses, 0);
  const totalClasses = subjects.reduce((acc, s) => acc + s.totalClasses, 0);
  const avgAttendance = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  const handleDeleteSubject = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const newSubjects = subjects.filter(s => s.id !== id);
    setSubjects(newSubjects);
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground relative z-10">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Student Details Header */}
        <div className="mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {JSON.parse(localStorage.getItem("user") || "{}").name?.charAt(0) || "S"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {JSON.parse(localStorage.getItem("user") || "{}").name || "Student"}
                </h1>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-300">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4 text-blue-400" />
                    {JSON.parse(localStorage.getItem("user") || "{}").course || "Course Not Set"}
                  </span>
                  <span className="hidden md:inline text-gray-600">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-purple-400">ID:</span>
                    {JSON.parse(localStorage.getItem("user") || "{}").universityNumber || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-center flex-1 md:flex-none">
                <p className="text-xs text-gray-400 uppercase">Sem</p>
                <p className="font-bold text-white">5</p>
              </div>
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-center flex-1 md:flex-none">
                <p className="text-xs text-gray-400 uppercase">Section</p>
                <p className="font-bold text-white">A</p>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Overview */}
        {subjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Overall Attendance</p>
                  <p className="text-4xl font-bold mt-2">{avgAttendance}%</p>
                </div>
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Subjects</p>
                  <p className="text-4xl font-bold mt-2">{subjects.length}</p>
                </div>
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">At Risk</p>
                  <p className="text-4xl font-bold mt-2">
                    {subjects.filter((s) => {
                      const status = calculateStatus(s);
                      return status === "high" || status === "critical";
                    }).length}
                  </p>
                </div>
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Subjects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Your Subjects</h2>
            <Button
              onClick={() => setShowAddDialog(true)}
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-white"
            >
              <Plus className="h-5 w-5" />
              Add Subject
            </Button>
          </div>

          {subjects.length === 0 ? (
            <Card className="p-16 text-center bg-card/50 backdrop-blur-sm border-2 border-dashed">
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <GraduationCap className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold">No Subjects Yet</h3>
                <p className="text-muted-foreground">
                  Start tracking your attendance by adding your first subject
                </p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Subject
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => {
                const attendancePct = subject.totalClasses > 0 ? Math.round(
                  (subject.attendedClasses / subject.totalClasses) * 100
                ) : 0;
                const status = calculateStatus(subject);
                const canBunk = calculateBunks(subject);
                const mustAttend = calculateMustAttend(subject);

                const statusConfig = {
                  safe: {
                    gradient: "from-green-500 to-emerald-600",
                    bg: "bg-green-50 dark:bg-green-950/30",
                    border: "border-green-200 dark:border-green-800",
                  },
                  warning: {
                    gradient: "from-yellow-500 to-orange-500",
                    bg: "bg-yellow-50 dark:bg-yellow-950/30",
                    border: "border-yellow-200 dark:border-yellow-800",
                  },
                  high: {
                    gradient: "from-orange-500 to-red-500",
                    bg: "bg-orange-50 dark:bg-orange-950/30",
                    border: "border-orange-200 dark:border-orange-800",
                  },
                  critical: {
                    gradient: "from-red-500 to-red-700",
                    bg: "bg-red-50 dark:bg-red-950/30",
                    border: "border-red-200 dark:border-red-800",
                  },
                };

                const config = statusConfig[status];

                return (
                  <Card
                    key={subject.id}
                    className={`p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group ${config.bg} ${config.border} border-2`}
                    onClick={() => navigate(`/subject/${subject.id}`)}
                  >
                    {/* Delete Button (Visible on hover) */}
                    <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete {subject.name} and all its attendance data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => handleDeleteSubject(subject.id, e)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-8">
                          <h3 className="font-bold text-xl mb-1 truncate">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground font-medium">
                            {subject.code}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {subject.teacher}
                          </p>
                        </div>
                        <div
                          className={`h-12 w-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0`}
                        >
                          {attendancePct}%
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <Progress value={attendancePct} className="h-3 bg-black/10 dark:bg-white/10" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {subject.attendedClasses}/{subject.totalClasses} classes
                          </span>
                          <span>Required: {subject.requiredPercentage}%</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                        <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-900/50">
                          <p className="text-xs text-muted-foreground mb-1">Can Bunk</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {canBunk}
                          </p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-900/50">
                          <p className="text-xs text-muted-foreground mb-1">Must Attend</p>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {mustAttend}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Stock-Style Attendance Comparison */}
        {subjects.length > 0 && (
          <Card className="p-6 shadow-lg mt-8 bg-card text-card-foreground">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Attendance Performance</h2>
              <p className="text-muted-foreground">Track all subjects like stocks</p>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={Array.from({ length: 10 }, (_, i) => ({
                    week: `W${i + 1}`,
                    ...subjects.reduce((acc, sub) => ({
                      ...acc,
                      [sub.code]: Math.min(100, Math.max(0, Math.round((sub.attendedClasses / sub.totalClasses) * 100) + (Math.random() * 10 - 5)))
                    }), {})
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  {subjects.map((subject, index) => (
                    <Line
                      key={subject.id}
                      type="monotone"
                      dataKey={subject.code}
                      stroke={`hsl(${index * 60}, 70%, 50%)`}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </main>

      <AddSubjectDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}