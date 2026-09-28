
import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";

type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_DEADLINE_NEAR"
  | "TASK_COMPLETED"
  | "PROJECT_STATUS_CHANGED";

type NotificationEntityType =
  | "USER"
  | "PROJECT"
  | "TASK"
  | "COMMENT"
  | "ATTACHMENT"
  | "NOTIFICATION"
  | "SYSTEM";

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: NotificationEntityType;
  entityId?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      entityType: input.entityType,
      entityId: input.entityId,
    },
  });
}

export async function notifyTaskAssigned(input: {
  userId: string;
  taskId: string;
  taskTitle: string;
  projectTitle: string;
}) {
  return createNotification({
    userId: input.userId,
    type: "TASK_ASSIGNED",
    title: "Task جدید به شما تخصیص داده شد",
    message: `Task «${input.taskTitle}» در پروژه «${input.projectTitle}» به شما تخصیص داده شد.`,
    entityType: "TASK",
    entityId: input.taskId,
  });
}

export async function notifyTaskStatusChanged(input: {
  userId: string;
  taskId: string;
  taskTitle: string;
  newStatus:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
}) {
  const statusLabel = {
    TODO: "در انتظار",
    IN_PROGRESS: "در حال انجام",
    COMPLETED: "تکمیل شده",
    CANCELLED: "لغو شده",
  }[input.newStatus];

  return createNotification({
    userId: input.userId,
    type: "TASK_COMPLETED",
    title: "وضعیت Task تغییر کرد",
    message: `وضعیت Task «${input.taskTitle}» به «${statusLabel}» تغییر کرد.`,
    entityType: "TASK",
    entityId: input.taskId,
  });
}

export async function notifyTaskCompleted(input: {
  userId: string;
  taskId: string;
  taskTitle: string;
}) {
  return createNotification({
    userId: input.userId,
    type: "TASK_COMPLETED",
    title: "Task تکمیل شد",
    message: `Task «${input.taskTitle}» با موفقیت تکمیل شد.`,
    entityType: "TASK",
    entityId: input.taskId,
  });
}

export async function getUserNotifications() {
  const session = await requireUser();

  return prisma.notification.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      entityType: true,
      entityId: true,
      readAt: true,
      createdAt: true,
    },
  });
}

export async function getUnreadNotificationCount() {
  const session = await requireUser();

  return prisma.notification.count({
    where: {
      userId: session.user.id,
      readAt: null,
    },
  });
}

export async function markNotificationAsRead(
  notificationId: string,
) {
  const session = await requireUser();

  const result =
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: {
        readAt: new Date(),
      },
    });

  if (result.count === 0) {
    throw new Error(
      "NOTIFICATION_NOT_FOUND",
    );
  }

  return {
    success: true,
  };
}

export async function markAllNotificationsAsRead() {
  const session = await requireUser();

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return {
    success: true,
  };
}

