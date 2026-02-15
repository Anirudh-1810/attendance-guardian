-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "semesterId" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "teacher" TEXT,
    "totalClassesConducted" INTEGER NOT NULL DEFAULT 0,
    "totalClassesAttended" INTEGER NOT NULL DEFAULT 0,
    "classesPerWeek" INTEGER NOT NULL,
    "requiredPercentage" INTEGER NOT NULL DEFAULT 75,
    "maxAllowedAbsences" INTEGER NOT NULL,
    "medicalLeavesAllowed" INTEGER NOT NULL DEFAULT 0,
    "dutyLeavesAllowed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserCourse_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserCourse" ("classesPerWeek", "courseCode", "courseName", "createdAt", "dutyLeavesAllowed", "id", "maxAllowedAbsences", "medicalLeavesAllowed", "semesterId", "teacher", "totalClassesAttended", "totalClassesConducted") SELECT "classesPerWeek", "courseCode", "courseName", "createdAt", "dutyLeavesAllowed", "id", "maxAllowedAbsences", "medicalLeavesAllowed", "semesterId", "teacher", "totalClassesAttended", "totalClassesConducted" FROM "UserCourse";
DROP TABLE "UserCourse";
ALTER TABLE "new_UserCourse" RENAME TO "UserCourse";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
