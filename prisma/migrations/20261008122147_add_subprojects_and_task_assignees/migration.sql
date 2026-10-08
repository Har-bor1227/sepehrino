/*
  Warnings:

  - You are about to drop the column `assignedToId` on the `tasks` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProjectSubProjectType" AS ENUM ('WEB_DESIGN', 'SEO', 'SOCIAL_MEDIA', 'PHOTOGRAPHY', 'VIDEOGRAPHY', 'TEASER_PRODUCTION', 'CATALOG', 'BRAND_IDENTITY_DESIGN', 'CRM_MANAGEMENT', 'BOOTH_CONSTRUCTION', 'PROGRAMMING');

-- AlterEnum
ALTER TYPE "ActivityAction" ADD VALUE 'TASK_ASSIGNEE_REMOVED';

-- AlterEnum
ALTER TYPE "ActivityEntityType" ADD VALUE 'SUB_PROJECT';

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assignedToId_fkey";

-- DropIndex
DROP INDEX "tasks_assignedToId_deadline_idx";

-- DropIndex
DROP INDEX "tasks_assignedToId_idx";

-- DropIndex
DROP INDEX "tasks_assignedToId_status_idx";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "assignedToId",
ADD COLUMN     "subProjectId" UUID;

-- CreateTable
CREATE TABLE "project_sub_projects" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "type" "ProjectSubProjectType" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "project_sub_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_assignees" (
    "taskId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "assignedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_assignees_pkey" PRIMARY KEY ("taskId","userId")
);

-- CreateIndex
CREATE INDEX "project_sub_projects_projectId_idx" ON "project_sub_projects"("projectId");

-- CreateIndex
CREATE INDEX "project_sub_projects_type_idx" ON "project_sub_projects"("type");

-- CreateIndex
CREATE UNIQUE INDEX "project_sub_projects_projectId_type_key" ON "project_sub_projects"("projectId", "type");

-- CreateIndex
CREATE INDEX "task_assignees_taskId_idx" ON "task_assignees"("taskId");

-- CreateIndex
CREATE INDEX "task_assignees_userId_idx" ON "task_assignees"("userId");

-- CreateIndex
CREATE INDEX "task_assignees_userId_taskId_idx" ON "task_assignees"("userId", "taskId");

-- CreateIndex
CREATE INDEX "tasks_subProjectId_idx" ON "tasks"("subProjectId");

-- CreateIndex
CREATE INDEX "tasks_subProjectId_status_idx" ON "tasks"("subProjectId", "status");

-- AddForeignKey
ALTER TABLE "project_sub_projects" ADD CONSTRAINT "project_sub_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_subProjectId_fkey" FOREIGN KEY ("subProjectId") REFERENCES "project_sub_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
