import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { ArrowLeft, BookOpen, User, AlertCircle, TrendingUp, Calendar, Target } from "lucide-react";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { calculateStatus, calculateBunks, calculateMustAttend } from "@/lib/calculations";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function SubjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getSubject } = useAttendanceData();
  
  const subject = getSubject(Number(id));

  if (!subject) return <div>Subject not found</div>;

  const attendancePct = Math.round((subject.attendedClasses / subject.totalClasses) * 100);
  const status = calculateStatus(subject);
  const bunks = calculateBunks(subject);
  const mustAttend = calculateMustAttend(subject);

  // Mock chart data based on current stats
  const chartData = [
    { week: "Week 1", val: 100 },
    { week: "Week 2", val: 90 },
    { week: "Week 3", val: 85 },
    { week: "Current", val: attendancePct },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">{subject.name}</h1>
              </div>
              <p className="text-sm text-muted-foreground">{subject.code}</p>
            </div>
            <Badge variant={status === 'safe' ? 'safe' : 'critical'}>{status.toUpperCase()}</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Current %" value={`${attendancePct}%`} icon={TrendingUp} gradient />
          <StatCard title="Required %" value={`${subject.requiredPercentage}%`} icon={Target} />
          <StatCard title="Can Bunk" value={bunks} subtitle="Next classes" icon={Calendar} />
          <StatCard title="Must Attend" value={mustAttend} subtitle="Next classes" icon={AlertCircle} />
        </div>

        {/* Chart */}
        <Card className="p-6 h-80">
          <h3 className="font-semibold mb-4">Attendance Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="week" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
              />
              <Line type="monotone" dataKey="val" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </main>
    </div>
  );
}