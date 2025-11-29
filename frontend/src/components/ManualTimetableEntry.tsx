import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface Subject {
  name: string;
  code: string;
  teacher: string;
  requiredPercentage: number;
}

interface TimetableSlot {
  day: string;
  startTime: string;
  endTime: string;
  subjectCode: string;
}

interface ManualTimetableEntryProps {
  onComplete: (subjects: Subject[], schedule: TimetableSlot[]) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ManualTimetableEntry({ onComplete }: ManualTimetableEntryProps) {
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: "", code: "", teacher: "", requiredPercentage: 75 },
  ]);
  
  const [schedule, setSchedule] = useState<TimetableSlot[]>([
    { day: "Monday", startTime: "09:00", endTime: "10:00", subjectCode: "" },
  ]);

  const addSubject = () => {
    setSubjects([...subjects, { name: "", code: "", teacher: "", requiredPercentage: 75 }]);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = (index: number, field: keyof Subject, value: string | number) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };
    setSubjects(updated);
  };

  const addScheduleSlot = () => {
    setSchedule([...schedule, { day: "Monday", startTime: "09:00", endTime: "10:00", subjectCode: "" }]);
  };

  const removeScheduleSlot = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateScheduleSlot = (index: number, field: keyof TimetableSlot, value: string) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  const handleSave = () => {
    // Validation
    const invalidSubjects = subjects.filter(s => !s.name || !s.code || !s.teacher);
    if (invalidSubjects.length > 0) {
      toast.error("Please fill in all subject details");
      return;
    }

    const invalidSlots = schedule.filter(s => !s.subjectCode);
    if (invalidSlots.length > 0) {
      toast.error("Please assign subjects to all schedule slots");
      return;
    }

    // Check if all schedule subject codes exist
    const subjectCodes = subjects.map(s => s.code);
    const invalidCodes = schedule.filter(s => !subjectCodes.includes(s.subjectCode));
    if (invalidCodes.length > 0) {
      toast.error("Some schedule slots reference non-existent subject codes");
      return;
    }

    onComplete(subjects, schedule);
    toast.success("Timetable saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Subjects Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Subjects</h3>
          <Button onClick={addSubject} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>

        <div className="space-y-4">
          {subjects.map((subject, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Subject Name *</Label>
                <Input
                  placeholder="Data Structures"
                  value={subject.name}
                  onChange={(e) => updateSubject(index, "name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Subject Code *</Label>
                <Input
                  placeholder="CS201"
                  value={subject.code}
                  onChange={(e) => updateSubject(index, "code", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Teacher *</Label>
                <Input
                  placeholder="Dr. Smith"
                  value={subject.teacher}
                  onChange={(e) => updateSubject(index, "teacher", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Required %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={subject.requiredPercentage}
                  onChange={(e) => updateSubject(index, "requiredPercentage", parseInt(e.target.value))}
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeSubject(index)}
                  disabled={subjects.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Schedule Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Weekly Schedule</h3>
          <Button onClick={addScheduleSlot} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Slot
          </Button>
        </div>

        <div className="space-y-4">
          {schedule.map((slot, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Day *</Label>
                <Select value={slot.day} onValueChange={(value) => updateScheduleSlot(index, "day", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateScheduleSlot(index, "startTime", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateScheduleSlot(index, "endTime", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={slot.subjectCode} onValueChange={(value) => updateScheduleSlot(index, "subjectCode", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.filter(s => s.code).map(subject => (
                      <SelectItem key={subject.code} value={subject.code}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeScheduleSlot(index)}
                  disabled={schedule.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button onClick={handleSave} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Timetable
        </Button>
      </div>
    </div>
  );
}
