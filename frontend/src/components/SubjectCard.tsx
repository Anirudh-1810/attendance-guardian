
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
import { Trash2 } from "lucide-react";
import { calculateStatus, calculateBunks, calculateMustAttend } from "@/lib/calculations";
import { Subject } from "@/hooks/useAttendanceData";
import { useNavigate } from "react-router-dom";

interface SubjectCardProps {
    subject: Subject;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onDelete }) => {
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
            label: "✓ Safe"
        },
        warning: {
            gradient: "from-yellow-500 to-orange-500",
            bg: "bg-yellow-50 dark:bg-yellow-950/30",
            border: "border-yellow-200 dark:border-yellow-800",
            text: "text-yellow-600",
            label: "⚠ Warning"
        },
        high: {
            gradient: "from-orange-500 to-red-500",
            bg: "bg-orange-50 dark:bg-orange-950/30",
            border: "border-orange-200 dark:border-orange-800",
            text: "text-orange-600",
            label: "⚠ At Risk"
        },
        critical: {
            gradient: "from-red-500 to-red-700",
            bg: "bg-red-50 dark:bg-red-950/30",
            border: "border-red-200 dark:border-red-800",
            text: "text-red-600",
            label: "⚠ Critical"
        },
    };

    const config = statusConfig[status];

    return (
        <Card
            className={`p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group ${config.bg} ${config.border} border-2`}
            onClick={() => navigate(`/subject/${subject.id}`)}
        >
            {/* Delete Button (Visible on hover) */}
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
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

                {/* Horizontal Progress Bar with Stats */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <div className="relative h-8 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-500 flex items-center justify-center`}
                                    style={{ width: `${Math.max(5, attendancePct)}%` }}
                                >
                                    <span className="text-white text-xs font-bold drop-shadow-md">{attendancePct}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right min-w-[80px]">
                            <p className="text-sm font-bold">{subject.attendedClasses}/{subject.totalClasses}</p>
                            <p className="text-xs text-muted-foreground">attended</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Target: {subject.requiredPercentage}%</span>
                        <span className={config.text}>
                            {config.label}
                        </span>
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
            </div>
        </Card>
    );
};

export default SubjectCard;
