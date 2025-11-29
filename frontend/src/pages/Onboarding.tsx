import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TimetableUpload } from "@/components/TimetableUpload";
import { Upload, Calendar, FileText, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { ParsedTimetable } from "@/lib/timetableParser";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [timetableData, setTimetableData] = useState<ParsedTimetable | null>(null);
  const { setSubjects } = useAttendanceData();

  const handleTimetableUpload = (data: ParsedTimetable) => {
    setTimetableData(data);
    localStorage.setItem("timetable-schedule", JSON.stringify(data.schedule));
  };

  const handleComplete = () => {
    if (timetableData) {
      const newSubjects = timetableData.subjects.map((sub, index) => ({
        ...sub,
        id: Date.now() + index,
        totalClasses: 0,
        attendedClasses: 0,
      }));
      setSubjects(newSubjects);
    }
    
    localStorage.setItem("onboarded", "true");
    toast.success("Setup complete! Welcome to Attendance Guardian");
    window.location.href = "/";
  };

  const steps = [
    { number: 1, title: "Upload Timetable", icon: Upload },
    { number: 2, title: "Semester Dates", icon: Calendar },
    { number: 3, title: "Leave Rules", icon: FileText },
    { number: 4, title: "Review", icon: Check },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => {
              const StepIcon = s.icon;
              const isActive = s.number === step;
              const isComplete = s.number < step;

              return (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
                        ${isComplete ? "bg-primary text-primary-foreground" : ""}
                        ${isActive ? "bg-primary text-primary-foreground shadow-lg scale-110" : ""}
                        ${!isActive && !isComplete ? "bg-muted text-muted-foreground" : ""}
                      `}
                    >
                      {isComplete ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                    </div>
                    <p className={`mt-2 text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-4 ${s.number < step ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <Card className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Upload Your Timetable</h2>
                <p className="text-muted-foreground">
                  Upload an image of your timetable and we'll extract all the subjects automatically
                </p>
              </div>

              <TimetableUpload onUploadComplete={handleTimetableUpload} />

              {timetableData && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4">
                  <h3 className="font-semibold">Detected Subjects ({timetableData.subjects.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {timetableData.subjects.map((subject) => (
                      <div key={subject.code} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <Check className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <span className="font-medium">{subject.name}</span>
                          <p className="text-xs text-muted-foreground">{subject.code} - {subject.teacher}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={() => setStep(2)}
                disabled={!timetableData}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Semester Dates</h2>
                <p className="text-muted-foreground">
                  Set your semester start and end dates, plus weekly and additional holidays
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Semester Start Date</Label>
                    <Input type="date" id="start-date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Semester End Date</Label>
                    <Input type="date" id="end-date" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Weekly Holidays</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox id={day} />
                        <label htmlFor={day} className="text-sm font-medium">
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="holidays">Additional Holidays</Label>
                  <Input type="date" id="holidays" placeholder="Add holiday dates" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Leave Rules</h2>
                <p className="text-muted-foreground">
                  Configure duty leave and medical leave settings
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4 p-4 rounded-lg border-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Duty Leave</h3>
                      <p className="text-sm text-muted-foreground">Official college activities</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>Add Duty Leave Dates</Label>
                    <Input type="date" placeholder="Select dates" />
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-lg border-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Medical Leave</h3>
                      <p className="text-sm text-muted-foreground">Health-related absences</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>Add Medical Leave Dates</Label>
                    <Input type="date" placeholder="Select dates" />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-foreground">
                    <strong>Note:</strong> Leave dates marked as Duty or Medical will not negatively impact your attendance calculations.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(4)}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Review Your Setup</h2>
                <p className="text-muted-foreground">
                  Everything looks good! Here's a summary of your configuration
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-semibold mb-2">Subjects</h3>
                  <p className="text-sm text-muted-foreground">
                    {timetableData?.subjects.length || 0} subjects detected and configured
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-semibold mb-2">Semester Duration</h3>
                  <p className="text-sm text-muted-foreground">16 weeks remaining</p>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-semibold mb-2">Leave Configuration</h3>
                  <p className="text-sm text-muted-foreground">Duty and Medical leave enabled</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleComplete}>
                  Finish Setup
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}