import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { canCreateComment } from "@/lib/permissions";
import { createCommentSchema } from "@/lib/validations/task";

export async function getTaskComments(taskId: string) {
  await requireUser();

  const canView = await canCreateComment(taskId);

  if (!canView) {
    throw new Error("FORBIDDEN");
  }

  return prisma.taskComment.findMany({
    where: {
      taskId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });
}

export async function createComment(
  taskId: string,
  content: string,
) {
  const session = await requireUser();

  const validated = createCommentSchema.parse({
    taskId,
    content,
  });

  const canCreate = await canCreateComment(
    validated.taskId,
  );

  if (!canCreate) {
    throw new Error("FORBIDDEN");
  }

  const task = await prisma.task.findFirst({
    where: {
      id: validated.taskId,
      ...(session.user.role === "EMPLOYEE"
        ? {
            assignedToId: session.user.id,
            project: {
              members: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      assignedToId: true,
    },
  });

  if (!task) {
    throw new Error("TASK_NOT_FOUND");
  }

  const comment = await prisma.taskComment.create({
    data: {
      taskId: validated.taskId,
      userId: session.user.id,
      content: validated.content,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "COMMENT_CREATED",
      entityType: "COMMENT",
      entityId: comment.id,
      metadata: {
        taskId: validated.taskId,
      },
    },
  });

  return comment;
}