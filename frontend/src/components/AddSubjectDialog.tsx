import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { format } from "date-fns";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { toast } from "sonner";

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

const DAYS = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
  { short: "Sun", full: "Sunday" },
];

export default function AddSubjectDialog({ open, onOpenChange }: AddSubjectDialogProps) {
  const { subjects, setSubjects } = useAttendanceData();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    mentor: "",
    startDate: new Date(),
    endDate: new Date(),
    classDays: [] as { day: string; time: string; weightage: number }[],
    requiredAttendance: 75,
    maxDL: 0,
    maxML: 0,
    currentAttendance: 0,
    currentDL: 0,
    currentML: 0,
  });

  const [tempDay, setTempDay] = useState("");
  const [tempTime, setTempTime] = useState("");
  const [tempWeightage, setTempWeightage] = useState(1);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    // Validation
    if (step === 1) {
      if (!formData.name || !formData.code || !formData.mentor) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    if (step === 3) {
      if (formData.classDays.length === 0) {
        toast.error("Please add at least one class schedule");
        return;
      }
    }
    if (step < 5) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSave = () => {
    // Calculate total and attended classes based on current attendance percentage
    const estimatedTotalClasses = formData.classDays.length * 4; // Rough estimate: 4 weeks
    const attendedClasses = Math.round((formData.currentAttendance / 100) * estimatedTotalClasses);

    const newSubject = {
      id: subjects.length > 0 ? Math.max(...subjects.map(s => s.id)) + 1 : 1,
      name: formData.name,
      code: formData.code,
      teacher: formData.mentor,
      totalClasses: estimatedTotalClasses,
      attendedClasses: attendedClasses,
      requiredPercentage: formData.requiredAttendance,
    };

    setSubjects([...subjects, newSubject]);
    toast.success(`${formData.name} added successfully!`);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: "",
      code: "",
      mentor: "",
      startDate: new Date(),
      endDate: new Date(),
      classDays: [],
      requiredAttendance: 75,
      maxDL: 0,
      maxML: 0,
      currentAttendance: 0,
      currentDL: 0,
      currentML: 0,
    });
    setTempDay("");
    setTempTime("");
    setTempWeightage(1);
  };

  const addClassDay = () => {
    if (tempDay && tempTime) {
      const selectedDays = tempDay.split(",").filter(d => d);
      const newClasses = selectedDays.map(day => ({
        day: day.trim(),
        time: tempTime,
        weightage: tempWeightage,
      }));
      
      updateFormData({
        classDays: [...formData.classDays, ...newClasses],
      });
      setTempDay("");
      setTempTime("");
      setTempWeightage(1);
    }
  };

  const removeClassDay = (index: number) => {
    updateFormData({
      classDays: formData.classDays.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Subject
          </DialogTitle>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= step
                    ? "bg-gradient-to-r from-blue-600 to-purple-600"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Subject Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Data Structures & Algorithms"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="code">Subject Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., CS201"
                    value={formData.code}
                    onChange={(e) => updateFormData({ code: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="mentor">Mentor/Teacher Name *</Label>
                  <Input
                    id="mentor"
                    placeholder="e.g., Dr. Sarah Johnson"
                    value={formData.mentor}
                    onChange={(e) => updateFormData({ mentor: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Duration */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Course Duration</h3>
                <p className="text-sm text-muted-foreground">
                  Select the start and end dates for this subject
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Start Date</Label>
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && updateFormData({ startDate: date })}
                    className="rounded-md border"
                  />
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    {format(formData.startDate, "MMMM yyyy")}
                  </p>
                </div>

                <div>
                  <Label className="mb-2 block">End Date</Label>
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => date && updateFormData({ endDate: date })}
                    className="rounded-md border"
                  />
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    {format(formData.endDate, "MMMM yyyy")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Class Schedule */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Class Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  Select days and add timing with weightage for your classes
                </p>
              </div>

              {/* Day Selection */}
              <div className="space-y-3">
                <Label>Select Days *</Label>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS.map((d) => {
                    const isSelected = tempDay.split(",").includes(d.short);
                    return (
                      <Button
                        key={d.short}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className={`h-16 text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            : ""
                        }`}
                        onClick={() => {
                          const days = tempDay ? tempDay.split(",") : [];
                          if (days.includes(d.short)) {
                            setTempDay(days.filter((day) => day !== d.short).join(","));
                          } else {
                            setTempDay([...days, d.short].join(","));
                          }
                        }}
                      >
                        <div className="text-center">
                          <div className="text-xs opacity-80">{d.short}</div>
                          <div className="text-[10px] opacity-60">{d.full.slice(0, 3)}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
                {tempDay && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {tempDay.split(",").join(", ")}
                  </p>
                )}
              </div>

              {/* Time and Weightage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Class Time *</Label>
                  <div className="relative">
                    <Input
                      id="time"
                      type="time"
                      value={tempTime}
                      onChange={(e) => setTempTime(e.target.value)}
                      className="text-lg font-medium h-12 pl-4 pr-4"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weightage">Weightage</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                      onClick={() => setTempWeightage(Math.max(1, tempWeightage - 1))}
                    >
                      -
                    </Button>
                    <Input
                      id="weightage"
                      type="number"
                      min="1"
                      value={tempWeightage}
                      onChange={(e) => setTempWeightage(parseInt(e.target.value) || 1)}
                      className="text-center text-lg font-bold h-12"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                      onClick={() => setTempWeightage(tempWeightage + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    How many attendance units per class
                  </p>
                </div>
              </div>

              {/* Add Button */}
              <Button
                onClick={addClassDay}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base font-semibold"
                disabled={!tempDay || !tempTime}
              >
                Add Class Schedule
              </Button>

              {/* Added Classes */}
              {formData.classDays.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Added Schedules ({formData.classDays.length})</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFormData({ classDays: [] })}
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {formData.classDays.map((classDay, index) => (
                      <div
                        key={index}
                        className="group relative p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-2 border-blue-100 dark:border-blue-900 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {classDay.day}
                            </div>
                            <div>
                              <p className="font-semibold text-base">{classDay.time}</p>
                              <p className="text-xs text-muted-foreground">
                                Weightage: {classDay.weightage}x
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeClassDay(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Criteria */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Attendance Criteria</h3>
                <p className="text-sm text-muted-foreground">
                  Set your attendance requirements and leave limits
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="requiredAttendance">Required Attendance % *</Label>
                  <Input
                    id="requiredAttendance"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.requiredAttendance}
                    onChange={(e) =>
                      updateFormData({ requiredAttendance: parseInt(e.target.value) || 75 })
                    }
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxDL">Max Duty Leave (DL)</Label>
                    <Input
                      id="maxDL"
                      type="number"
                      min="0"
                      value={formData.maxDL}
                      onChange={(e) => updateFormData({ maxDL: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxML">Max Medical Leave (ML)</Label>
                    <Input
                      id="maxML"
                      type="number"
                      min="0"
                      value={formData.maxML}
                      onChange={(e) => updateFormData({ maxML: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Current Status */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Current Status</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your current attendance and leave status till today
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentAttendance">Current Attendance % *</Label>
                  <Input
                    id="currentAttendance"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.currentAttendance}
                    onChange={(e) =>
                      updateFormData({ currentAttendance: parseInt(e.target.value) || 0 })
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your attendance percentage till yesterday
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentDL">Current DL Used</Label>
                    <Input
                      id="currentDL"
                      type="number"
                      min="0"
                      max={formData.maxDL}
                      value={formData.currentDL}
                      onChange={(e) =>
                        updateFormData({ currentDL: parseInt(e.target.value) || 0 })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentML">Current ML Used</Label>
                    <Input
                      id="currentML"
                      type="number"
                      min="0"
                      max={formData.maxML}
                      value={formData.currentML}
                      onChange={(e) =>
                        updateFormData({ currentML: parseInt(e.target.value) || 0 })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2">
                  <h4 className="font-semibold mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subject:</span>
                      <span className="font-medium">{formData.name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Code:</span>
                      <span className="font-medium">{formData.code || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Classes per week:</span>
                      <span className="font-medium">{formData.classDays.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Attendance:</span>
                      <span className="font-medium">{formData.currentAttendance}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {step === 5 ? (
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Subject
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
