import { Subject } from "@/hooks/useAttendanceData";

export interface TimetableSlot {
  day: string;
  time: string;
  subject: string;
  teacher: string;
  code: string;
}

export interface ParsedTimetable {
  subjects: Omit<Subject, "id" | "totalClasses" | "attendedClasses">[];
  schedule: TimetableSlot[];
}

// Simulated OCR/parsing function
export async function parseTimetableImage(file: File): Promise<ParsedTimetable> {
  // In a real implementation, this would:
  // 1. Send the image to an OCR service (like Tesseract.js or a cloud API)
  // 2. Parse the text to extract subjects, times, teachers
  // 3. Structure the data
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock parsed data - in production, this would come from actual OCR
      const mockData: ParsedTimetable = {
        subjects: [
          {
            name: "Data Structures",
            code: "CS201",
            teacher: "Dr. Sarah Johnson",
            requiredPercentage: 75,
          },
          {
            name: "Database Management",
            code: "CS202",
            teacher: "Prof. Michael Chen",
            requiredPercentage: 75,
          },
          {
            name: "Operating Systems",
            code: "CS203",
            teacher: "Dr. Emily Brown",
            requiredPercentage: 75,
          },
          {
            name: "Computer Networks",
            code: "CS204",
            teacher: "Prof. David Lee",
            requiredPercentage: 75,
          },
          {
            name: "Software Engineering",
            code: "CS205",
            teacher: "Dr. Anna Wilson",
            requiredPercentage: 75,
          },
        ],
        schedule: [
          { day: "Monday", time: "09:00-10:00", subject: "Data Structures", teacher: "Dr. Sarah Johnson", code: "CS201" },
          { day: "Monday", time: "10:00-11:00", subject: "Database Management", teacher: "Prof. Michael Chen", code: "CS202" },
          { day: "Tuesday", time: "09:00-10:00", subject: "Operating Systems", teacher: "Dr. Emily Brown", code: "CS203" },
          { day: "Tuesday", time: "11:00-12:00", subject: "Computer Networks", teacher: "Prof. David Lee", code: "CS204" },
          { day: "Wednesday", time: "10:00-11:00", subject: "Data Structures", teacher: "Dr. Sarah Johnson", code: "CS201" },
          { day: "Wednesday", time: "14:00-15:00", subject: "Software Engineering", teacher: "Dr. Anna Wilson", code: "CS205" },
          { day: "Thursday", time: "09:00-10:00", subject: "Database Management", teacher: "Prof. Michael Chen", code: "CS202" },
          { day: "Thursday", time: "11:00-12:00", subject: "Operating Systems", teacher: "Dr. Emily Brown", code: "CS203" },
          { day: "Friday", time: "10:00-11:00", subject: "Computer Networks", teacher: "Prof. David Lee", code: "CS204" },
          { day: "Friday", time: "14:00-15:00", subject: "Software Engineering", teacher: "Dr. Anna Wilson", code: "CS205" },
        ],
      };
      
      resolve(mockData);
    }, 1500);
  });
}

export function validateTimetableFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Please upload a PNG, JPG, or PDF file" };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10MB" };
  }

  return { valid: true };
}
