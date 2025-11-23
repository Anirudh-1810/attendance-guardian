import { Subject } from "@/hooks/useAttendanceData";

export const calculateStatus = (subject: Subject) => {
  const percentage = (subject.attendedClasses / subject.totalClasses) * 100;
  
  if (percentage >= 85) return "safe";
  if (percentage >= subject.requiredPercentage) return "warning";
  if (percentage >= subject.requiredPercentage - 10) return "high";
  return "critical";
};

export const calculateBunks = (subject: Subject) => {
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

export const calculateMustAttend = (subject: Subject) => {
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