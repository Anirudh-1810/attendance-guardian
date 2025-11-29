import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AttendanceRecord {
  subjectCode: string;
  date: Date;
  status: "PRESENT" | "ABSENT" | "DUTY_LEAVE" | "MEDICAL_LEAVE";
}

interface BulkAttendanceUploadProps {
  subjects: Array<{ code: string; name: string }>;
  onUpload: (records: AttendanceRecord[]) => void;
}

export function BulkAttendanceUpload({ subjects, onUpload }: BulkAttendanceUploadProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([
    { subjectCode: "", date: new Date(), status: "PRESENT" },
  ]);

  const addRecord = () => {
    setRecords([...records, { subjectCode: "", date: new Date(), status: "PRESENT" }]);
  };

  const removeRecord = (index: number) => {
    setRecords(records.filter((_, i) => i !== index));
  };

  const updateRecord = (index: number, field: keyof AttendanceRecord, value: any) => {
    const updated = [...records];
    updated[index] = { ...updated[index], [field]: value };
    setRecords(updated);
  };

  const handleUpload = () => {
    const invalidRecords = records.filter(r => !r.subjectCode);
    if (invalidRecords.length > 0) {
      toast.error("Please select a subject for all records");
      return;
    }

    onUpload(records);
    toast.success(`${records.length} attendance records uploaded!`);
    setRecords([{ subjectCode: "", date: new Date(), status: "PRESENT" }]);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').slice(1); // Skip header
      
      const parsed: AttendanceRecord[] = [];
      lines.forEach(line => {
        const [subjectCode, dateStr, status] = line.split(',').map(s => s.trim());
        if (subjectCode && dateStr && status) {
          parsed.push({
            subjectCode,
            date: new Date(dateStr),
            status: status as AttendanceRecord['status'],
          });
        }
      });

      if (parsed.length > 0) {
        setRecords(parsed);
        toast.success(`Loaded ${parsed.length} records from CSV`);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csv = [
      "SubjectCode,Date,Status",
      "CS201,2024-01-15,PRESENT",
      "CS202,2024-01-15,ABSENT",
      "CS201,2024-01-16,PRESENT",
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Bulk Attendance Upload</h3>
            <p className="text-sm text-muted-foreground">
              Upload past attendance records to get started mid-semester
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              Download CSV Template
            </Button>
            <label htmlFor="csv-upload">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </span>
              </Button>
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVUpload}
            />
          </div>
        </div>

        <div className="space-y-4">
          {records.map((record, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select
                  value={record.subjectCode}
                  onValueChange={(value) => updateRecord(index, "subjectCode", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.code} value={subject.code}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(record.date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={record.date}
                      onSelect={(date) => date && updateRecord(index, "date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={record.status}
                  onValueChange={(value) => updateRecord(index, "status", value as AttendanceRecord['status'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="DUTY_LEAVE">Duty Leave</SelectItem>
                    <SelectItem value="MEDICAL_LEAVE">Medical Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeRecord(index)}
                  disabled={records.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <Button onClick={addRecord} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
          <Button onClick={handleUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload {records.length} Record{records.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </Card>
    </div>
  );
}
