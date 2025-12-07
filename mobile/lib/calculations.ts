// Attendance calculation utilities (matching web app logic)

export interface Subject {
    id: string;
    name: string;
    code: string;
    teacher: string;
    totalClasses: number;
    attendedClasses: number;
    requiredPercentage: number;
}

export type AttendanceStatus = 'safe' | 'warning' | 'high' | 'critical';

/**
 * Calculate the attendance status based on current percentage
 * @param subject - Subject with attendance data
 * @returns Status: 'safe', 'warning', 'high', or 'critical'
 */
export const calculateStatus = (subject: Subject): AttendanceStatus => {
    const percentage = (subject.attendedClasses / subject.totalClasses) * 100;

    if (percentage >= 85) return 'safe';
    if (percentage >= subject.requiredPercentage) return 'warning';
    if (percentage >= subject.requiredPercentage - 10) return 'high';
    return 'critical';
};

/**
 * Calculate how many classes can be bunked while maintaining required percentage
 * @param subject - Subject with attendance data
 * @returns Number of classes that can be bunked
 */
export const calculateBunks = (subject: Subject): number => {
    // How many classes can I miss and still maintain required %?
    // Formula: (attended) / (total + x) >= required/100
    let bunks = 0;
    const { attendedClasses, totalClasses, requiredPercentage } = subject;

    while (
        attendedClasses / (totalClasses + bunks + 1) >=
        requiredPercentage / 100
    ) {
        bunks++;
    }
    return bunks;
};

/**
 * Calculate how many consecutive classes must be attended to reach required percentage
 * @param subject - Subject with attendance data
 * @returns Number of classes that must be attended
 */
export const calculateMustAttend = (subject: Subject): number => {
    // How many consecutive classes must I attend to reach required %?
    let classesNeeded = 0;
    const { attendedClasses, totalClasses, requiredPercentage } = subject;

    let currentAttended = attendedClasses;
    let currentTotal = totalClasses;

    while ((currentAttended / currentTotal) * 100 < requiredPercentage) {
        classesNeeded++;
        currentAttended++;
        currentTotal++;
    }
    return classesNeeded;
};

/**
 * Calculate attendance percentage
 * @param attendedClasses - Number of classes attended
 * @param totalClasses - Total number of classes
 * @returns Attendance percentage (0-100)
 */
export const calculatePercentage = (attendedClasses: number, totalClasses: number): number => {
    if (totalClasses === 0) return 0;
    return Math.round((attendedClasses / totalClasses) * 100);
};
