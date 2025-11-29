import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimetableUpload } from "@/components/TimetableUpload";
import { ManualTimetableEntry } from "@/components/ManualTimetableEntry";
import { BulkAttendanceUpload } from "@/components/BulkAttendanceUpload";
import { Upload, Edit, Calendar, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { semesterAPI, subjectAPI, classAPI } from "@/lib/api";
import { format, eachDayOfInterval, getDay } from "date-fns";

export default function SetupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploadMethod, setUploadMethod] = useState<"upload" | "manual">("manual");
  
  // Semester data
  const [semesterData, setSemesterData] = useState({
    name: "Spring 2024",
    startDate: "",
    endDate: "",
    requiredPercentage: 75,
  });

  // Timetable data
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  
  // Past attendance
  const [pastAttendance, setPastAttendance] = useState<any[]>([]);

  const handleTimetableUpload = (data: any) => {
    setSubjects(data.subjects);
    setSchedule(data.schedule);
    toast.success("Timetable uploaded successfully!");
  };

  const handleManualEntry = (manualSubjects: any[], manualSchedule: any[]) => {
    setSubjects(manualSubjects);
    setSchedule(manualSchedule);
  };

  const handleBulkAttendance = (records: any[]) => {
    setPastAttendance(records);
  };

  const generateClassesFromSchedule = (semesterId: string, subjectMap: Map<string, string>) => {
    if (!semesterData.startDate || !semesterData.endDate) return [];
    
    const start = new Date(semesterData.startDate);
    const end = new Date(semesterData.endDate);
    const allDays = eachDayOfInterval({ start, end });
    
    const classes: any[] = [];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    allDays.forEach(date => {
      const dayName = dayNames[getDay(date)];
      const daySchedule = schedule.filter(s => s.day === dayName);
      
      daySchedule.forEach(slot => {
        const subjectId = subjectMap.get(slot.subjectCode);
        if (subjectId) {
          // Check if there's past attendance for this date/subject
          const pastRecord = pastAttendance.find(
            r => r.subjectCode === slot.subjectCode && 
                 format(r.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          );
          
          classes.push({
            subjectId,
            date: format(date, 'yyyy-MM-dd'),
            dayOfWeek: dayName,
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: pastRecord?.status || 'SCHEDULED',
          });
        }
      });
    });
    
    return classes;
  };

  const handleComplete = async () => {
    try {
      // Step 1: Create semester
      const semester = await semesterAPI.create({
        ...semesterData,
        userId: 'default-user',
      });
      
      // Step 2: Create subjects
      const createdSubjects = await subjectAPI.bulkCreate(subjects, semester.id);
      
      // Create subject code to ID map
      const subjectMap = new Map(
        createdSubjects.map((s: any) => [s.code, s.id])
      );
      
      // Step 3: Generate and create classes
      const classes = generateClassesFromSchedule(semester.id, subjectMap);
      if (classes.length > 0) {
        await classAPI.bulkCreate(classes);
      }
      
      // Save to localStorage for quick access
      localStorage.setItem('currentSemesterId', semester.id);
      localStorage.setItem('onboarded', 'true');
      
      toast.success("Setup complete! Redirecting to dashboard...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error(error.message || "Failed to complete setup");
    }
  };

  const steps = [
    { number: 1, title: "Timetable", icon: Upload },
    { number: 2, title: "Semester Info", icon: Calendar },
    { number: 3, title: "Past Attendance", icon: Edit },
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
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <Card className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Setup Your Timetable</h2>
                <p className="text-muted-foreground">
                  Choose how you want to add your subjects and schedule
                </p>
              </div>

              <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">
                    <Edit className="h-4 w-4 mr-2" />
                    Manual Entry
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4">
                  <ManualTimetableEntry onComplete={handleManualEntry} />
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <TimetableUpload onUploadComplete={handleTimetableUpload} />
                </TabsContent>
              </Tabs>

              <Button
                className="w-full"
                size="lg"
                onClick={() => setStep(2)}
                disabled={subjects.length === 0}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Semester Information</h2>
                <p className="text-muted-foreground">
                  Set your semester dates and requirements
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Semester Name</Label>
                  <Input
                    value={semesterData.name}
                    onChange={(e) => setSemesterData({ ...semesterData, name: e.target.value })}
                    placeholder="Spring 2024"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={semesterData.startDate}
                      onChange={(e) => setSemesterData({ ...semesterData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={semesterData.endDate}
                      onChange={(e) => setSemesterData({ ...semesterData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Required Attendance %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={semesterData.requiredPercentage}
                    onChange={(e) => setSemesterData({ ...semesterData, requiredPercentage: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(3)}
                  disabled={!semesterData.startDate || !semesterData.endDate}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Past Attendance (Optional)</h2>
                <p className="text-muted-foreground">
                  Starting mid-semester? Upload your attendance till yesterday
                </p>
              </div>

              <BulkAttendanceUpload
                subjects={subjects}
                onUpload={handleBulkAttendance}
              />

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
                  Everything looks good! Ready to start tracking?
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-semibold mb-2">Semester</h3>
                  <p className="text-sm text-muted-foreground">
                    {semesterData.name} ({format(new Date(semesterData.startDate), 'MMM d')} - {format(new Date(semesterData.endDate), 'MMM d, yyyy')})
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-semibold mb-2">Subjects</h3>
                  <p className="text-sm text-muted-foreground">
                    {subjects.length} subjects configured
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-semibold mb-2">Schedule</h3>
                  <p className="text-sm text-muted-foreground">
                    {schedule.length} weekly class slots
                  </p>
                </div>

                {pastAttendance.length > 0 && (
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-semibold mb-2">Past Attendance</h3>
                    <p className="text-sm text-muted-foreground">
                      {pastAttendance.length} records uploaded
                    </p>
                  </div>
                )}
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
