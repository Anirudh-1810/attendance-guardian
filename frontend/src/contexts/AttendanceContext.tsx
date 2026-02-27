import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";

export interface Subject {
    id: string;
    name: string;
    code: string;
    teacher: string;
    totalClasses: number;
    attendedClasses: number;
    requiredPercentage: number;
}

interface AttendanceContextType {
    subjects: Subject[];
    loading: boolean;
    error: string | null;
    currentSemesterId: string | null;
    updateSubject: (id: string, status: "present" | "absent") => Promise<void>;
    getSubject: (id: string) => Subject | undefined;
    setSubjects: (subjects: Subject[]) => void;
    resetAllData: () => void;
    addSubject: (subjectData: Omit<Subject, "id" | "totalClasses" | "attendedClasses"> & { startDate: Date; endDate: Date; classDays: any[] }) => Promise<boolean | undefined>;
    refetch: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

const DEFAULT_SUBJECTS: Subject[] = [];

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
    const { token, isAuthenticated } = useAuth();
    const [subjects, setSubjectsState] = useState<Subject[]>(DEFAULT_SUBJECTS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSemesterId, setCurrentSemesterId] = useState<string | null>(null);
    const fetchedRef = useRef(false);

    const fetchSubjects = useCallback(async () => {
        if (!isAuthenticated || !token) return;

        setLoading(true);
        try {
            const semRes = await fetch(`${API_BASE_URL}/semesters/current`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!semRes.ok) throw new Error("Failed to fetch semester");

            const semester = await semRes.json();

            if (semester && semester.id) {
                setCurrentSemesterId(semester.id);
            }

            if (semester && semester.subjects) {
                const mappedSubjects: Subject[] = semester.subjects.map((s: any) => ({
                    id: s.id,
                    name: s.courseName,
                    code: s.courseCode,
                    teacher: s.teacher || "Unknown",
                    totalClasses: s.totalClassesConducted,
                    attendedClasses: s.totalClassesAttended,
                    requiredPercentage: s.requiredPercentage ?? 75,
                }));
                setSubjectsState(mappedSubjects);
            } else {
                setSubjectsState([]);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token]);

    // Fetch only ONCE on mount (guard against StrictMode double-fire)
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchSubjects();
    }, [fetchSubjects]);

    const addSubject = async (subjectData: Omit<Subject, "id" | "totalClasses" | "attendedClasses"> & { startDate: Date; endDate: Date; classDays: any[] }) => {
        if (!token) return;

        try {
            if (!currentSemesterId) throw new Error("No active semester found");

            const res = await fetch(`${API_BASE_URL}/courses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    semesterId: currentSemesterId,
                    courseName: subjectData.name,
                    courseCode: subjectData.code,
                    teacher: subjectData.teacher,
                    classesPerWeek: subjectData.classDays.length,
                    maxAllowedAbsences: 0,
                }),
            });

            if (!res.ok) throw new Error("Failed to add subject");

            await fetchSubjects();
            return true;
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    };

    const updateSubject = async (id: string, status: "present" | "absent") => {
        // Optimistic update
        const previousSubjects = [...subjects];
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

        try {
            const date = new Date().toISOString().split('T')[0];
            const res = await fetch(`${API_BASE_URL}/class/mark-date`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    subjectId: id,
                    date,
                    status: status === "present" ? "PRESENT" : "ABSENT",
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to update attendance");
            }
        } catch (err) {
            console.error(err);
            setSubjectsState(previousSubjects);
        }
    };

    const getSubject = (id: string) => subjects.find((s) => s.id === id);

    const setSubjects = (newSubjects: Subject[]) => {
        setSubjectsState(newSubjects);
    };

    const resetAllData = () => {
        setSubjectsState(DEFAULT_SUBJECTS);
    };

    return (
        <AttendanceContext.Provider
            value={{
                subjects,
                loading,
                error,
                currentSemesterId,
                updateSubject,
                getSubject,
                setSubjects,
                resetAllData,
                addSubject,
                refetch: fetchSubjects,
            }}
        >
            {children}
        </AttendanceContext.Provider>
    );
}

export function useAttendanceData() {
    const context = useContext(AttendanceContext);
    if (!context) {
        throw new Error("useAttendanceData must be used within an AttendanceProvider");
    }
    return context;
}
