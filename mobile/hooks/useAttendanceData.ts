import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Subject {
    id: number;
    name: string;
    code: string;
    teacher: string;
    totalClasses: number;
    attendedClasses: number;
    requiredPercentage: number;
}

const DEFAULT_SUBJECTS: Subject[] = [
    {
        id: 1,
        name: "Data Structures",
        code: "CS201",
        teacher: "Dr. Sarah Johnson",
        totalClasses: 40,
        attendedClasses: 35,
        requiredPercentage: 75,
    },
    {
        id: 2,
        name: "Database Management",
        code: "CS202",
        teacher: "Prof. Michael Chen",
        totalClasses: 38,
        attendedClasses: 28,
        requiredPercentage: 75,
    },
];

export function useAttendanceData() {
    const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const saved = await AsyncStorage.getItem("attendance-data");
            if (saved) {
                setSubjects(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load attendance data", e);
        } finally {
            setLoading(false);
        }
    };

    const saveData = async (newSubjects: Subject[]) => {
        try {
            await AsyncStorage.setItem("attendance-data", JSON.stringify(newSubjects));
        } catch (e) {
            console.error("Failed to save attendance data", e);
        }
    };

    const updateSubject = (id: number, status: "present" | "absent") => {
        const newSubjects = subjects.map((sub) => {
            if (sub.id !== id) return sub;
            return {
                ...sub,
                totalClasses: sub.totalClasses + 1,
                attendedClasses:
                    status === "present" ? sub.attendedClasses + 1 : sub.attendedClasses,
            };
        });
        setSubjects(newSubjects);
        saveData(newSubjects);
    };

    const getSubject = (id: number) => subjects.find((s) => s.id === id);

    return { subjects, updateSubject, getSubject, loading };
}
