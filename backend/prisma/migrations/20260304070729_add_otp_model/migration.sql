-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "googleId" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteCode" (
    "id" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "redeemedById" TEXT,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "requiredPercentage" INTEGER NOT NULL DEFAULT 75,
    "userId" TEXT NOT NULL,
    "workingDays" TEXT NOT NULL DEFAULT '[]',

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeTable" (
    "id" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "subjectId" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,

    CONSTRAINT "TimeTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCourse" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayOfWeek" INTEGER,
    "startTime" TEXT,
    "endTime" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "weightage" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'HOLIDAY',
    "semesterId" TEXT NOT NULL,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "OTP_email_key" ON "OTP"("email");

-- CreateIndex
CREATE INDEX "OTP_email_idx" ON "OTP"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InviteCode_codeHash_key" ON "InviteCode"("codeHash");

-- CreateIndex
CREATE UNIQUE INDEX "InviteCode_redeemedById_key" ON "InviteCode"("redeemedById");

-- CreateIndex
CREATE INDEX "InviteCode_createdById_idx" ON "InviteCode"("createdById");

-- CreateIndex
CREATE INDEX "Semester_userId_idx" ON "Semester"("userId");

-- CreateIndex
CREATE INDEX "TimeTable_semesterId_idx" ON "TimeTable"("semesterId");

-- CreateIndex
CREATE INDEX "TimeTable_subjectId_idx" ON "TimeTable"("subjectId");

-- CreateIndex
CREATE INDEX "UserCourse_semesterId_idx" ON "UserCourse"("semesterId");

-- CreateIndex
CREATE INDEX "Class_subjectId_idx" ON "Class"("subjectId");

-- CreateIndex
CREATE INDEX "Class_date_idx" ON "Class"("date");

-- CreateIndex
CREATE INDEX "Class_subjectId_date_idx" ON "Class"("subjectId", "date");

-- CreateIndex
CREATE INDEX "Class_status_idx" ON "Class"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Class_subjectId_date_key" ON "Class"("subjectId", "date");

-- CreateIndex
CREATE INDEX "Holiday_semesterId_idx" ON "Holiday"("semesterId");

-- AddForeignKey
ALTER TABLE "InviteCode" ADD CONSTRAINT "InviteCode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteCode" ADD CONSTRAINT "InviteCode_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeTable" ADD CONSTRAINT "TimeTable_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeTable" ADD CONSTRAINT "TimeTable_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "UserCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourse" ADD CONSTRAINT "UserCourse_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "UserCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holiday" ADD CONSTRAINT "Holiday_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
