import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/api/client';

export interface Subject {
    id: string;
    name: string;
    code: string;
    teacher: string;
    totalClasses: number;
    attendedClasses: number;
    requiredPercentage: number;
}

const DEFAULT_SUBJECTS: Subject[] = [];

export function useAttendanceData() {
    const { token, isAuthenticated } = useAuth();
    const [subjects, setSubjectsState] = useState<Subject[]>(DEFAULT_SUBJECTS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSubjects = useCallback(async () => {
        if (!isAuthenticated || !token) return;

        setLoading(true);
        try {
            // 1. Get Current Semester
            const semester = await apiClient.get<any>('/api/semesters/current');

            if (semester && semester.subjects) {
                // Map backend subjects to frontend format
                const mappedSubjects: Subject[] = semester.subjects.map((s: any) => ({
                    id: s.id,
                    name: s.courseName,
                    code: s.courseCode,
                    teacher: s.teacher || 'Unknown',
                    totalClasses: s.totalClassesConducted,
                    attendedClasses: s.totalClassesAttended,
                    requiredPercentage: s.classesPerWeek ? 75 : 75, // Default or calculated
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

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const addSubject = async (
        subjectData: Omit<Subject, 'id' | 'totalClasses' | 'attendedClasses'> & {
            startDate: Date;
            endDate: Date;
            classDays: any[];
        }
    ) => {
        if (!token) return;

        try {
            // 1. Ensure Semester Exists
            const semester = await apiClient.get<any>('/api/semesters/current');

            if (!semester || !semester.id) throw new Error('No active semester found');

            // 2. Create Course
            await apiClient.post('/api/courses', {
                semesterId: semester.id,
                courseName: subjectData.name,
                courseCode: subjectData.code,
                teacher: subjectData.teacher,
                classesPerWeek: subjectData.classDays.length,
                maxAllowedAbsences: 0, // Default
            });

            await fetchSubjects(); // Refresh list
            return true;
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    };

    const updateSubject = (id: string, status: 'present' | 'absent') => {
        // Optimistic update - ideally should call API
        setSubjectsState((prev) =>
            prev.map((sub) => {
                if (sub.id !== id) return sub;
                return {
                    ...sub,
                    totalClasses: sub.totalClasses + 1,
                    attendedClasses:
                        status === 'present' ? sub.attendedClasses + 1 : sub.attendedClasses,
                };
            })
        );
        // TODO: Implement API call for attendance marking
    };

    const getSubject = (id: string) => subjects.find((s) => s.id === id);

    // Deprecated: setSubjects direct manipulation
    const setSubjects = (newSubjects: Subject[]) => {
        setSubjectsState(newSubjects);
    };

    const resetAllData = () => {
        setSubjectsState(DEFAULT_SUBJECTS);
    };

    return {
        subjects,
        updateSubject,
        getSubject,
        setSubjects,
        resetAllData,
        addSubject,
        loading,
        error,
    };
}
