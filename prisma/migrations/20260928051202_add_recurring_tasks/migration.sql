-- CreateEnum
CREATE TYPE "TaskRecurrenceType" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurrenceActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "recurrenceDayOfMonth" INTEGER,
ADD COLUMN     "recurrenceEndDate" DATE,
ADD COLUMN     "recurrenceStartDate" DATE,
ADD COLUMN     "recurrenceType" "TaskRecurrenceType" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "recurrenceWeekdays" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- CreateTable
CREATE TABLE "task_occurrences" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "occurrenceDate" DATE NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMPTZ(3),
    "completedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "task_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_occurrences_taskId_idx" ON "task_occurrences"("taskId");

-- CreateIndex
CREATE INDEX "task_occurrences_occurrenceDate_idx" ON "task_occurrences"("occurrenceDate");

-- CreateIndex
CREATE INDEX "task_occurrences_completedById_idx" ON "task_occurrences"("completedById");

-- CreateIndex
CREATE INDEX "task_occurrences_taskId_occurrenceDate_idx" ON "task_occurrences"("taskId", "occurrenceDate");

-- CreateIndex
CREATE UNIQUE INDEX "task_occurrences_taskId_occurrenceDate_key" ON "task_occurrences"("taskId", "occurrenceDate");

-- CreateIndex
CREATE INDEX "tasks_isRecurring_idx" ON "tasks"("isRecurring");

-- CreateIndex
CREATE INDEX "tasks_recurrenceActive_idx" ON "tasks"("recurrenceActive");

-- CreateIndex
CREATE INDEX "tasks_recurrenceType_idx" ON "tasks"("recurrenceType");

-- AddForeignKey
ALTER TABLE "task_occurrences" ADD CONSTRAINT "task_occurrences_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_occurrences" ADD CONSTRAINT "task_occurrences_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
