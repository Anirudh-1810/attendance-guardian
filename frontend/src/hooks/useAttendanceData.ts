import { useState, useEffect } from "react";

export interface Subject {
  id: number;
  name: string;
  code: string;
  teacher: string;
  totalClasses: number;
  attendedClasses: number;
  requiredPercentage: number;
}

const DEFAULT_SUBJECTS: Subject[] = [];

export function useAttendanceData() {
  // Initialize with function to read from local storage or use default
  const [subjects, setSubjectsState] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem("attendance-data");
      return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
    } catch (e) {
      return DEFAULT_SUBJECTS;
    }
  });

  useEffect(() => {
    localStorage.setItem("attendance-data", JSON.stringify(subjects));
  }, [subjects]);

  const updateSubject = (id: number, status: "present" | "absent") => {
    setSubjectsState((prev) =>
      prev.map((sub) => {
        if (sub.id !== id) return sub;
        return {
          ...sub,
          totalClasses: sub.totalClasses + 1,
          attendedClasses:
            status === "present" ? sub.attendedClasses + 1 : sub.attendedClasses,
        };
      })
    );
  };

  const getSubject = (id: number) => subjects.find((s) => s.id === id);

  const setSubjects = (newSubjects: Subject[]) => {
    setSubjectsState(newSubjects);
  };

  const resetAllData = () => {
    localStorage.removeItem("attendance-data");
    localStorage.removeItem("timetable-schedule");
    localStorage.removeItem("onboarded");
    setSubjectsState(DEFAULT_SUBJECTS);
  };

  return { subjects, updateSubject, getSubject, setSubjects, resetAllData };
}