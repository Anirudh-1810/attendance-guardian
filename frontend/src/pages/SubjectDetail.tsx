import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, User, Calendar as CalendarIcon, Calculator, TrendingUp } from "lucide-react";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { calculateStatus, calculateBunks, calculateMustAttend } from "@/lib/calculations";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import WhatIfCalculator from "@/components/WhatIfCalculator";
import { Navbar } from "@/components/Navbar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line } from "recharts";

export default function SubjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getSubject } = useAttendanceData();

  const subject = getSubject(Number(id));

  if (!subject) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Subject Not Found</h2>
          <Button onClick={() => navigate("/dashboard")}>Go Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const attendancePct = subject.totalClasses > 0 ? Math.round((subject.attendedClasses / subject.totalClasses) * 100) : 0;
  const status = calculateStatus(subject);
  const bunks = calculateBunks(subject);
  const mustAttend = calculateMustAttend(subject);

  const statusColors = {
    safe: "bg-green-500",
    warning: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground relative z-10">
      <Navbar />

      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-16 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {/* UPDATED: Navigate back to Dashboard */}
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">{subject.name}</h1>
              </div>
              <p className="text-sm text-muted-foreground">{subject.code}</p>
            </div>
            <div className={`h-3 w-3 rounded-full ${statusColors[status]}`} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Teacher Info */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Instructor</p>
              <p className="font-semibold">{subject.teacher}</p>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Current</p>
            <p className="text-3xl font-bold">{attendancePct}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Required</p>
            <p className="text-3xl font-bold">{subject.requiredPercentage}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Can Bunk</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{bunks}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Must Attend</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{mustAttend}</p>
          </Card>
        </div>

        {/* Attendance Progress Graph */}
        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">Attendance Progress</h3>
              <p className="text-sm text-muted-foreground">Track your attendance over time</p>
            </div>
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={Array.from({ length: 8 }, (_, i) => ({
                  week: `Week ${i + 1}`,
                  attendance: Math.min(100, Math.max(0, attendancePct + (Math.random() * 10 - 5))),
                  required: subject.requiredPercentage
                }))}
              >
                <defs>
                  <linearGradient id="colorAttendanceArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorAttendanceArea)"
                  name="Attendance %"
                />
                <Line
                  type="monotone"
                  dataKey="required"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Required %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="calendar">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="whatif">
              <Calculator className="h-4 w-4 mr-2" />
              What If
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <AttendanceCalendar subject={{ ...subject, id: String(subject.id) }} />
          </TabsContent>

          <TabsContent value="whatif">
            <WhatIfCalculator subject={{ ...subject, id: String(subject.id) }} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}