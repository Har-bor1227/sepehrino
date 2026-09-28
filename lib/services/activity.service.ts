import "server-only";

import { prisma } from "@/lib/db/prisma";
import { Prisma } from "../../generated/prisma/client";
import {
  requireAdmin,
  requireUser,
} from "@/lib/auth/guards";

export type ActivityAction =
  | "EMPLOYEE_CREATED"
  | "EMPLOYEE_UPDATED"
  | "EMPLOYEE_STATUS_CHANGED"
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_DELETED"
  | "PROJECT_STATUS_CHANGED"
  | "PROJECT_MEMBER_ADDED"
  | "PROJECT_MEMBER_REMOVED"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "TASK_ASSIGNED"
  | "TASK_STATUS_CHANGED"
  | "TASK_PRIORITY_CHANGED"
  | "TASK_DEADLINE_CHANGED"
  | "TASK_COMPLETED"
  | "COMMENT_CREATED"
  | "ATTACHMENT_ADDED"
  | "ATTACHMENT_DELETED"
  | "NOTIFICATION_CREATED"
  | "NOTIFICATION_READ";

export type ActivityEntityType =
  | "USER"
  | "PROJECT"
  | "TASK"
  | "COMMENT"
  | "ATTACHMENT"
  | "NOTIFICATION"
  | "SYSTEM";

type JsonPrimitive =
  | string
  | number
  | boolean
  | null;

type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | {
      [key: string]: JsonValue;
    };

export async function createActivity(input: {
  userId?: string | null;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId?: string | null;
  metadata?: JsonValue;
}) {
  return prisma.activityLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata:
  input.metadata === null
    ? Prisma.JsonNull
    : input.metadata,
    },
  });
}

export async function createCurrentUserActivity(input: {
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId?: string | null;
  metadata?: JsonValue;
}) {
  const session = await requireUser();

  return createActivity({
    userId: session.user.id,
    ...input,
  });
}
export async function getRecentActivities(limit = 20) {
  await requireAdmin();

  return prisma.activityLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: Math.min(Math.max(limit, 1), 100),
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      metadata: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function getEntityActivities(
  entityType: ActivityEntityType,
  entityId: string,
) {
  await requireUser();

  return prisma.activityLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      metadata: true,
      createdAt: true,

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