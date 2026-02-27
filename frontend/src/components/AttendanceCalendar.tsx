import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Ban, Plus, Minus } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceCalendarProps {
  subject: {
    id: string;
    name: string;
    attendedClasses: number;
    totalClasses: number;
  };
}

export default function AttendanceCalendar({ subject }: AttendanceCalendarProps) {
  const { token, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showDialog, setShowDialog] = useState(false);
  const [attendanceData, setAttendanceData] = useState<{ date: Date, status: string }[]>([]);

  useEffect(() => {
    async function fetchAttendance() {
      if (!isAuthenticated || !token || !subject.id) return;

      try {
        const res = await fetch(`/api/class?subjectId=${subject.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch attendance history");

        const data = await res.json();
        const mappedData = data.map((record: any) => ({
          date: new Date(record.date),
          status: record.status.toLowerCase(),
        }));

        setAttendanceData(mappedData);
      } catch (err) {
        console.error(err);
      }
    }

    fetchAttendance();
  }, [subject.id, token, isAuthenticated]);

  const getAttendanceForDate = (date: Date) => {
    return attendanceData.find((a) => isSameDay(a.date, date));
  };

  const handleDateClick = (date: Date | undefined) => {
    if (date) {
      const attendance = getAttendanceForDate(date);
      if (attendance) {
        setSelectedDate(date);
        setShowDialog(true);
      }
    }
  };

  const selectedAttendance = selectedDate ? getAttendanceForDate(selectedDate) : null;

  const statusConfig = {
    present: {
      label: "Present",
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-950",
    },
    absent: {
      label: "Absent",
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-950",
    },
    dl: {
      label: "Duty Leave",
      icon: Ban,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-950",
    },
    ml: {
      label: "Medical Leave",
      icon: Ban,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-950",
    },
    cancelled: {
      label: "Class Cancelled",
      icon: Ban,
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-950",
    },
    extra: {
      label: "Extra Class",
      icon: Plus,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-950",
    },
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Attendance History</h3>
            <p className="text-sm text-muted-foreground">
              Click on a date to view details. Colored dates indicate class attendance.
            </p>
          </div>

          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateClick}
              className="rounded-md border"
              modifiers={{
                present: attendanceData
                  .filter((a) => a.status === "present")
                  .map((a) => a.date),
                absent: attendanceData
                  .filter((a) => a.status === "absent")
                  .map((a) => a.date),
                dl: attendanceData.filter((a) => a.status === "dl").map((a) => a.date),
                ml: attendanceData.filter((a) => a.status === "ml").map((a) => a.date),
                cancelled: attendanceData
                  .filter((a) => a.status === "cancelled" || a.status === "canceled")
                  .map((a) => a.date),
                extra: attendanceData
                  .filter((a) => a.status === "extra")
                  .map((a) => a.date),
              }}
              modifiersClassNames={{
                present: "bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100",
                absent: "bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100",
                dl: "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100",
                ml: "bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-100",
                cancelled: "bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100",
                extra: "bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-orange-100",
              }}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(statusConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded ${config.bg}`} />
                  <span className="text-sm">{config.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, "MMMM dd, yyyy")}
            </DialogTitle>
          </DialogHeader>
          {selectedAttendance && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg ${statusConfig[selectedAttendance.status as keyof typeof statusConfig].bg
                  }`}
              >
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon =
                      statusConfig[selectedAttendance.status as keyof typeof statusConfig].icon;
                    return (
                      <Icon
                        className={`h-8 w-8 ${statusConfig[selectedAttendance.status as keyof typeof statusConfig]
                            .color
                          }`}
                      />
                    );
                  })()}
                  <div>
                    <p className="font-semibold">
                      {statusConfig[selectedAttendance.status as keyof typeof statusConfig].label}
                    </p>
                    <p className="text-sm text-muted-foreground">{subject.name}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge>
                    {statusConfig[selectedAttendance.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
              </div>

              <Button className="w-full" onClick={() => setShowDialog(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
