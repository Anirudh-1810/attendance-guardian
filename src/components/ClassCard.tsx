import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, User, Check, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ClassCardProps {
  classData: {
    time: string;
    subject: string;
    teacher: string;
    code: string;
  };
  onMark?: (status: "present" | "absent", reason?: string, wasTaken?: boolean) => void;
}

export function ClassCard({ classData, onMark }: ClassCardProps) {
  const [status, setStatus] = useState<"present" | "absent" | null>(null);
  const [reason, setReason] = useState<string>("normal");
  const [wasTaken, setWasTaken] = useState(true);

  const handleMark = (newStatus: "present" | "absent") => {
    setStatus(newStatus);
    onMark?.(newStatus, reason, wasTaken);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-semibold text-lg">{classData.time}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{classData.subject}</span>
              <Badge variant="outline" className="text-xs">{classData.code}</Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{classData.teacher}</span>
            </div>
          </div>
        </div>

        {status && (
          <Badge 
            variant={status === "present" ? "safe" : reason === "duty" ? "duty" : reason === "medical" ? "medical" : "critical"}
            className="ml-4"
          >
            {status === "present" ? "Marked Present" : `Absent (${reason === "normal" ? "Normal" : reason === "duty" ? "Duty Leave" : "Medical Leave"})`}
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {status === "absent" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for Absence</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="duty">Duty Leave</SelectItem>
                <SelectItem value="medical">Medical Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id={`attendance-${classData.time}`}
            checked={wasTaken}
            onCheckedChange={(checked) => setWasTaken(checked as boolean)}
          />
          <label
            htmlFor={`attendance-${classData.time}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Attendance was taken today
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
            variant="success" 
            className="flex-1"
            onClick={() => handleMark("present")}
            disabled={status !== null}
          >
            <Check className="h-4 w-4" />
            Present
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1"
            onClick={() => handleMark("absent")}
            disabled={status !== null}
          >
            <X className="h-4 w-4" />
            Absent
          </Button>
        </div>
      </div>
    </Card>
  );
}
