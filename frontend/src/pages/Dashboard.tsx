import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { GraduationCap, Plus, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { calculateStatus } from "@/lib/calculations";
import { Skeleton } from "@/components/ui/skeleton";

import SubjectCard from "@/components/SubjectCard";
import OnboardingWizard from "@/components/OnboardingWizard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
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
  const { subjects, setSubjects, refetch, updateSubject, loading, currentSemesterId } = useAttendanceData();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const totalAttended = subjects.reduce((acc, s) => acc + s.attendedClasses, 0);
  const totalClasses = subjects.reduce((acc, s) => acc + s.totalClasses, 0);
  const avgAttendance = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  // Show skeleton while data is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-foreground relative z-10">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {/* Header skeleton */}
          <div className="mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          {/* Subject cards skeleton */}
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
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
          {subjects.length > 0 && (
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
          )}

          {subjects.length === 0 ? (
            <OnboardingWizard onComplete={() => refetch()} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onDelete={(id, e) => handleDeleteSubject(id as any, e)}
                  onAttendanceUpdate={(status) => updateSubject(subject.id, status)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Analytics Section */}
        {subjects.length > 0 && (
          <div className="space-y-6 mt-8">
            {/* Line Chart - Attendance Performance */}
            <Card className="p-6 shadow-lg bg-card text-card-foreground">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Attendance Performance</h2>
                <p className="text-muted-foreground">Track all subjects over time</p>
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

            {/* Bar Chart and Pie Chart Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Bar Chart - Classes Comparison */}
              {/* Bar Chart - Classes Comparison (Campaigns Style) */}
              <Card className="p-8 shadow-2xl bg-[#232D3F] border-none text-white rounded-[24px]">
                <div className="mb-6">
                  <h2 className="text-[22px] font-medium tracking-wide">Campaigns</h2>
                </div>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subjects.map(sub => ({
                        name: sub.code,
                        Finished: sub.attendedClasses,
                        'Not Finished': sub.totalClasses - sub.attendedClasses
                      }))}
                      margin={{ top: 20, right: 0, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                        domain={[0, 'auto']}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#1E252E', borderColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px' }}
                      />
                      <Bar dataKey="Finished" stackId="a" fill="#8B5CF6" barSize={16} radius={[0, 0, 4, 4]} />
                      <Bar dataKey="Not Finished" stackId="a" fill="#E2D6FF" barSize={16} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#E2D6FF]"></div>
                    <span className="text-[14px] text-gray-200">Finished</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
                    <span className="text-[14px] text-gray-200">Not Finished</span>
                  </div>
                </div>
              </Card>

              {/* Pie Chart - Top 5 Subjects */}
              <Card className="p-8 shadow-2xl bg-[#232D3F] border-none text-white rounded-[24px]">
                <div className="mb-2">
                  <h2 className="text-[22px] font-medium tracking-wide">Top 5 Subjects</h2>
                </div>
                <div className="flex h-[280px] w-full items-center mt-4">
                  <div className="flex-1 h-full max-w-[55%] relative -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subjects.slice(0, 5).map((sub) => ({
                            name: sub.code,
                            value: sub.attendedClasses,
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          dataKey="value"
                          stroke="none"
                          labelLine={{ stroke: 'white', strokeWidth: 1.5 }}
                          label={({ x, y, percent, textAnchor }) => (
                            <text x={x} y={y} fill="white" fontSize={16} fontWeight="400" textAnchor={textAnchor} dominantBaseline="central">
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          )}
                        >
                          {subjects.slice(0, 5).map((_, index) => {
                            const colors = ['#E2D6FF', '#B1A9FF', '#FFFFA3', '#A193F6', '#FDDDF9'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E252E', borderColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px' }}
                          itemStyle={{ color: 'white' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Custom Legend */}
                  <div className="flex-1 pl-4 flex flex-col justify-center gap-4 border-l border-transparent">
                    {subjects.slice(0, 5).map((sub, index) => {
                      const colors = ['#E2D6FF', '#B1A9FF', '#FFFFA3', '#A193F6', '#FDDDF9'];
                      return (
                        <div key={sub.code} className="flex items-center gap-3">
                          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                          <span className="text-[17px] font-normal text-gray-100">{sub.code}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>

            {/* Radar Chart - Subject Performance */}
            <Card className="p-6 shadow-lg bg-card text-card-foreground">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Subject Performance Radar</h2>
                <p className="text-sm text-muted-foreground">Multi-dimensional view of your attendance</p>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={subjects.map(sub => ({
                      subject: sub.code,
                      attendance: Math.round((sub.attendedClasses / sub.totalClasses) * 100),
                      required: sub.requiredPercentage,
                      fullMark: 100
                    }))}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Current" dataKey="attendance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Radar name="Required" dataKey="required" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </main>
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none [&>button]:top-8 [&>button]:right-8 [&>button]:text-muted-foreground [&>button]:bg-background/50 [&>button]:p-2 [&>button]:rounded-full [&>button:hover]:bg-background/80">
          <OnboardingWizard
            isUpdate={true}
            existingSemesterId={currentSemesterId || undefined}
            onComplete={() => {
              setShowAddDialog(false);
              refetch();
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}