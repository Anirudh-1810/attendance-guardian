import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, FileUp, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6 max-w-2xl">
        {/* Semester Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Semester Settings</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Semester Start</Label>
              <Input type="date" id="start-date" defaultValue="2024-01-15" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Semester End</Label>
              <Input type="date" id="end-date" defaultValue="2024-05-31" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="required">Required Attendance %</Label>
            <Input type="number" id="required" defaultValue="75" min="0" max="100" />
          </div>

          <Button className="w-full" onClick={() => toast.success("Semester settings updated")}>
            Save Changes
          </Button>
        </Card>

        {/* Timetable */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <FileUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Timetable</h2>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Upload a new timetable image to update your subjects and schedules
          </p>

          <Button variant="outline" className="w-full">
            <FileUp className="h-4 w-4" />
            Upload New Timetable
          </Button>
        </Card>

        {/* Holidays & Leave */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Holidays & Leave</h2>
          
          <div className="space-y-2">
            <Label>Add Holidays</Label>
            <div className="flex gap-2">
              <Input type="date" className="flex-1" />
              <Button>Add</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duty Leave Dates</Label>
            <div className="flex gap-2">
              <Input type="date" className="flex-1" />
              <Button>Add</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Medical Leave Dates</Label>
            <div className="flex gap-2">
              <Input type="date" className="flex-1" />
              <Button>Add</Button>
            </div>
          </div>
        </Card>

        {/* Export Data */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Download className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Export Data</h2>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Download your attendance records as a PDF report
          </p>

          <Button variant="outline" className="w-full" onClick={() => toast.success("Report exported successfully")}>
            <Download className="h-4 w-4" />
            Export Attendance Report
          </Button>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 space-y-4 border-destructive/50">
          <div className="flex items-center gap-3 mb-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Clear all attendance data and reset the application
          </p>

          <Button variant="destructive" className="w-full">
            <Trash2 className="h-4 w-4" />
            Reset All Data
          </Button>
        </Card>
      </main>
    </div>
  );
}
