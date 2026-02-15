-- CreateTable
CREATE TABLE "TimeTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "semesterId" TEXT NOT NULL,
    "subjectId" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    CONSTRAINT "TimeTable_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimeTable_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "UserCourse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Semester" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "requiredPercentage" INTEGER NOT NULL DEFAULT 75,
    "userId" TEXT NOT NULL,
    "workingDays" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "Semester_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Semester" ("endDate", "id", "name", "requiredPercentage", "startDate", "userId") SELECT "endDate", "id", "name", "requiredPercentage", "startDate", "userId" FROM "Semester";
DROP TABLE "Semester";
ALTER TABLE "new_Semester" RENAME TO "Semester";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
