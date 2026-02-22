
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, CheckCircle2, XCircle } from "lucide-react";
import { calculateStatus, calculateBunks, calculateMustAttend } from "@/lib/calculations";
import { Subject } from "@/hooks/useAttendanceData";
import { useNavigate } from "react-router-dom";

interface SubjectCardProps {
    subject: Subject;
    onDelete: (id: string, e: React.MouseEvent) => void;
    onAttendanceUpdate: (status: 'present' | 'absent') => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onDelete, onAttendanceUpdate }) => {
    const navigate = useNavigate();

    const attendancePct = subject.totalClasses > 0 ? Math.round(
        (subject.attendedClasses / subject.totalClasses) * 100
    ) : 0;

    const status = calculateStatus(subject);
    const canBunk = calculateBunks(subject);
    const mustAttend = calculateMustAttend(subject);

    const statusConfig = {
        safe: {
            gradient: "from-green-500 to-emerald-600",
            bg: "bg-green-50 dark:bg-green-950/30",
            border: "border-green-200 dark:border-green-800",
            text: "text-green-600",
            label: "✓ Safe",
            color: "#10B981"
        },
        warning: {
            gradient: "from-yellow-500 to-orange-500",
            bg: "bg-yellow-50 dark:bg-yellow-950/30",
            border: "border-yellow-200 dark:border-yellow-800",
            text: "text-yellow-600",
            label: "⚠ Warning",
            color: "#EAB308"
        },
        high: {
            gradient: "from-orange-500 to-red-500",
            bg: "bg-orange-50 dark:bg-orange-950/30",
            border: "border-orange-200 dark:border-orange-800",
            text: "text-orange-600",
            label: "⚠ At Risk",
            color: "#F97316"
        },
        critical: {
            gradient: "from-red-500 to-red-700",
            bg: "bg-red-50 dark:bg-red-950/30",
            border: "border-red-200 dark:border-red-800",
            text: "text-red-600",
            label: "⚠ Critical",
            color: "#EF4444"
        },
    };

    const config = statusConfig[status];

    return (
        <Card
            className={`p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group ${config.bg} ${config.border} border-2`}
            onClick={() => navigate(`/subject/${subject.id}`)}
        >
            {/* Delete Button (Visible on hover) */}
            <div className="absolute top-4 right-4 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete {subject.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this subject and all its attendance data. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => onDelete(subject.id, e)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-bold text-xl mb-1 truncate">{subject.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 uppercase tracking-wide">
                                {subject.code}
                            </span>
                            <span className="text-sm text-muted-foreground font-medium">
                                {subject.teacher}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Gauge Progress Bar with Stats */}
                <div className="flex flex-col items-center mt-2 space-y-2">
                    <div className="relative flex justify-center w-full">
                        <svg
                            viewBox="0 0 200 110"
                            className="w-48 h-28 drop-shadow-sm"
                        >
                            {/* Background Arc */}
                            <path
                                d="M 20 90 A 80 80 0 0 1 180 90"
                                fill="none"
                                stroke="#334155"
                                strokeWidth="18"
                                strokeLinecap="round"
                                className="opacity-30 dark:opacity-50"
                            />
                            {/* Foreground Arc */}
                            <path
                                d="M 20 90 A 80 80 0 0 1 180 90"
                                fill="none"
                                stroke={config.color}
                                strokeWidth="18"
                                strokeLinecap="round"
                                strokeDasharray={251.3}
                                strokeDashoffset={251.3 - (attendancePct / 100) * 251.3}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute bottom-4 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{attendancePct}%</span>
                        </div>
                    </div>

                    <div className="flex w-full items-end justify-between px-1">
                        <div className="text-left">
                            <p className="font-bold text-sm">{subject.attendedClasses}/{subject.totalClasses}</p>
                            <p className="text-xs text-muted-foreground">attended</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-medium text-muted-foreground block mb-1">Target: {subject.requiredPercentage}%</span>
                            <span className={`${config.text} text-xs font-bold block`}>
                                {config.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                    <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-900/50 shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Safe to Bunk</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {canBunk}
                        </p>
                        <p className="text-[10px] text-muted-foreground">classes</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-900/50 shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Must Attend</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {mustAttend}
                        </p>
                        <p className="text-[10px] text-muted-foreground">classes</p>
                    </div>
                </div>
                {/* Mark Attendance Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4 mt-2 border-t border-black/5 dark:border-white/5">
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAttendanceUpdate("present");
                        }}
                    >
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Present
                    </Button>
                    <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAttendanceUpdate("absent");
                        }}
                    >
                        <XCircle className="h-5 w-5 mr-2" />
                        Absent
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default SubjectCard;
