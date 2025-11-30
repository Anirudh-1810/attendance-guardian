import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { GraduationCap, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { calculateStatus, calculateBunks, calculateMustAttend } from "@/lib/calculations";
import AddSubjectDialog from "@/components/AddSubjectDialog";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { subjects } = useAttendanceData();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const totalAttended = subjects.reduce((acc, s) => acc + s.attendedClasses, 0);
  const totalClasses = subjects.reduce((acc, s) => acc + s.totalClasses, 0);
  const avgAttendance = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Replaced hardcoded header with Navbar */}
      <Navbar />

      <main className="container mx-auto px-4 py-8">
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
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Add Subject
            </Button>
          </div>

          {subjects.length === 0 ? (
            <Card className="p-16 text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-dashed">
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center mx-auto">
                  <GraduationCap className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold">No Subjects Yet</h3>
                <p className="text-muted-foreground">
                  Start tracking your attendance by adding your first subject
                </p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Subject
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => {
                const attendancePct = Math.round(
                  (subject.attendedClasses / subject.totalClasses) * 100
                );
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
                    className={`p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${config.bg} ${config.border} border-2`}
                    onClick={() => navigate(`/subject/${subject.id}`)}
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl mb-1">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground font-medium">
                            {subject.code}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {subject.teacher}
                          </p>
                        </div>
                        <div
                          className={`h-12 w-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                        >
                          {attendancePct}%
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <Progress value={attendancePct} className="h-3" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {subject.attendedClasses}/{subject.totalClasses} classes
                          </span>
                          <span>Required: {subject.requiredPercentage}%</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                        <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                          <p className="text-xs text-muted-foreground mb-1">Can Bunk</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {canBunk}
                          </p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
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
          <Card className="p-6 shadow-xl mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Attendance Performance</h2>
              <p className="text-muted-foreground">
                Track all subjects like stocks - hover over lines to see details
              </p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={(() => {
                  // Generate weekly data for all subjects
                  const weeks = 10;
                  const data = [];
                  
                  for (let i = 0; i < weeks; i++) {
                    const weekData: any = { week: `W${i + 1}` };
                    
                    subjects.forEach((subject) => {
                      const currentPct = Math.round(
                        (subject.attendedClasses / subject.totalClasses) * 100
                      );
                      // Simulate weekly fluctuation
                      const variance = Math.random() * 8 - 4;
                      const weekPct = Math.max(
                        0,
                        Math.min(100, currentPct + variance - (weeks - i - 1) * 1.5)
                      );
                      weekData[subject.code] = Math.round(weekPct);
                    });
                    
                    data.push(weekData);
                  }
                  
                  return data;
                })()}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="week" 
                  stroke="#6b7280" 
                  fontSize={12}
                  label={{ value: 'Weeks', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  domain={[0, 100]}
                  label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: any, name: string) => {
                    const subject = subjects.find(s => s.code === name);
                    if (subject) {
                      const status = calculateStatus(subject);
                      const statusEmoji = {
                        safe: "✅",
                        warning: "⚠️",
                        high: "🔶",
                        critical: "🔴",
                      };
                      return [
                        `${value}% ${statusEmoji[status]}`,
                        `${subject.name} (${name})`
                      ];
                    }
                    return [`${value}%`, name];
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value: string) => {
                    const subject = subjects.find(s => s.code === value);
                    return subject ? `${subject.name} (${value})` : value;
                  }}
                />
                
                {/* Reference line for required percentage */}
                <Line
                  type="monotone"
                  dataKey="required"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="8 8"
                  dot={false}
                  name="Required (75%)"
                  data={Array(10).fill({ required: 75 })}
                />
                
                {/* Dynamic lines for each subject */}
                {subjects.map((subject) => {
                  const status = calculateStatus(subject);
                  
                  // Color based on status
                  const colors = {
                    safe: "#10b981",      // green
                    warning: "#f59e0b",   // amber
                    high: "#f97316",      // orange
                    critical: "#ef4444",  // red
                  };
                  
                  const color = colors[status];
                  
                  return (
                    <Line
                      key={subject.id}
                      type="monotone"
                      dataKey={subject.code}
                      stroke={color}
                      strokeWidth={3}
                      dot={{ fill: color, r: 5, strokeWidth: 2, stroke: "white" }}
                      activeDot={{ r: 8, strokeWidth: 2 }}
                      name={subject.code}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
            
            {/* Legend for status colors */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="h-3 w-8 bg-green-500 rounded"></div>
                <span className="text-sm text-muted-foreground">Safe (≥75%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-8 bg-amber-500 rounded"></div>
                <span className="text-sm text-muted-foreground">Warning (70-74%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-8 bg-orange-500 rounded"></div>
                <span className="text-sm text-muted-foreground">High Risk (65-69%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-8 bg-red-500 rounded"></div>
                <span className="text-sm text-muted-foreground">Critical (&lt;65%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-8 bg-gray-400 rounded border-2 border-dashed"></div>
                <span className="text-sm text-muted-foreground">Required Line</span>
              </div>
            </div>
          </Card>
        )}
      </main>

      {/* Add Subject Dialog */}
      <AddSubjectDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}