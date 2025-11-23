import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, User, AlertCircle, CheckCircle } from "lucide-react";

interface SubjectCardProps {
  subject: {
    name: string;
    code: string;
    teacher: string;
    attendance: number;
    required: number;
    status: "safe" | "warning" | "high" | "critical";
    surpriseLevel: "low" | "medium" | "high";
    canBunk: number;
    mustAttend: number;
  };
  onClick?: () => void;
}

const statusConfig = {
  safe: { variant: "safe" as const, label: "Safe", icon: CheckCircle },
  warning: { variant: "warning" as const, label: "Warning", icon: AlertCircle },
  high: { variant: "high" as const, label: "High Risk", icon: AlertCircle },
  critical: { variant: "critical" as const, label: "Critical", icon: AlertCircle },
};

const surpriseConfig = {
  low: { variant: "surprise-low" as const, label: "Low Surprise" },
  medium: { variant: "surprise-medium" as const, label: "Medium Surprise" },
  high: { variant: "surprise-high" as const, label: "High Surprise" },
};

export function SubjectCard({ subject, onClick }: SubjectCardProps) {
  const statusInfo = statusConfig[subject.status];
  const surpriseInfo = surpriseConfig[subject.surpriseLevel];
  const StatusIcon = statusInfo.icon;

  return (
    <Card
      className="p-6 hover:shadow-card transition-all duration-200 cursor-pointer border-2 hover:border-primary/20"
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">{subject.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{subject.code}</p>
          </div>
          <Badge variant={statusInfo.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>

        {/* Teacher */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{subject.teacher}</span>
        </div>

        {/* Attendance Percentage */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">{subject.attendance}%</p>
              <p className="text-sm text-muted-foreground">Current Attendance</p>
            </div>
            <Badge variant="outline" className="text-xs">
              Required: {subject.required}%
            </Badge>
          </div>
          <Progress value={subject.attendance} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1 rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Can bunk next</p>
            <p className="text-lg font-semibold text-foreground">{subject.canBunk}</p>
          </div>
          <div className="space-y-1 rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Must attend next</p>
            <p className="text-lg font-semibold text-foreground">{subject.mustAttend}</p>
          </div>
        </div>

        {/* Surprise Attendance Badge */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">Surprise Attendance</span>
          <Badge variant={surpriseInfo.variant}>{surpriseInfo.label}</Badge>
        </div>
      </div>
    </Card>
  );
}
