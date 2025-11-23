import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { ArrowLeft, BookOpen, User, AlertCircle, TrendingUp, Calendar, Target } from "lucide-react";

const mockSubjectData = {
  name: "Data Structures",
  code: "CS201",
  teacher: "Dr. Sarah Johnson",
  attendance: 88,
  required: 75,
  status: "safe" as const,
  surpriseLevel: "low" as const,
  canBunk: 3,
  mustAttend: 0,
  weeksLeft: 8,
  classesPerWeek: 4,
  totalClasses: 48,
  attended: 42,
  missed: 6,
};

export default function SubjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">{mockSubjectData.name}</h1>
              </div>
              <p className="text-sm text-muted-foreground">{mockSubjectData.code}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="safe">{mockSubjectData.status}</Badge>
              <Badge variant="surprise-low">{mockSubjectData.surpriseLevel} Surprise</Badge>
            </div>
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
              <p className="font-semibold">{mockSubjectData.teacher}</p>
            </div>
          </div>
        </Card>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Current %"
            value={`${mockSubjectData.attendance}%`}
            icon={TrendingUp}
            gradient
          />
          <StatCard
            title="Required %"
            value={`${mockSubjectData.required}%`}
            icon={Target}
          />
          <StatCard
            title="Can Bunk"
            value={mockSubjectData.canBunk}
            subtitle="Next classes"
            icon={Calendar}
          />
          <StatCard
            title="Must Attend"
            value={mockSubjectData.mustAttend}
            subtitle="Next classes"
            icon={AlertCircle}
          />
        </div>

        {/* Attendance Breakdown */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Attendance Breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-3xl font-bold text-foreground">{mockSubjectData.totalClasses}</p>
              <p className="text-sm text-muted-foreground">Total Classes</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-risk-safe-light">
              <p className="text-3xl font-bold text-risk-safe">{mockSubjectData.attended}</p>
              <p className="text-sm text-muted-foreground">Attended</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-risk-critical-light">
              <p className="text-3xl font-bold text-risk-critical">{mockSubjectData.missed}</p>
              <p className="text-sm text-muted-foreground">Missed</p>
            </div>
          </div>
        </Card>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Attendance Trend</h3>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Line chart coming soon</p>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Monthly Comparison</h3>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Bar chart coming soon</p>
            </div>
          </Card>
        </div>

        {/* Suggestions */}
        <Card className={`p-6 ${mockSubjectData.status === "safe" ? "bg-risk-safe-light border-risk-safe" : "bg-risk-warning-light border-risk-warning"} border-2`}>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {mockSubjectData.status === "safe" ? (
                <div className="h-12 w-12 rounded-full bg-risk-safe/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-risk-safe" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-risk-warning/20 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-risk-warning" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">
                {mockSubjectData.status === "safe" ? "Great Job!" : "Action Required"}
              </h3>
              <p className="text-sm text-foreground">
                {mockSubjectData.status === "safe"
                  ? `You're doing well! You can afford to miss ${mockSubjectData.canBunk} more classes and still maintain your required attendance.`
                  : `You need to attend the next ${mockSubjectData.mustAttend} classes to stay above the required attendance percentage.`}
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
