import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";

type PermissionUser = {
  id: string;
  role: "ADMIN" | "EMPLOYEE";
};

export async function getPermissionUser(): Promise<PermissionUser> {
  const session = await requireUser();

  return {
    id: session.user.id,
    role: session.user.role,
  };
}

export function isAdmin(user: PermissionUser) {
  return user.role === "ADMIN";
}

export function isEmployee(user: PermissionUser) {
  return user.role === "EMPLOYEE";
}

export async function canManageEmployees() {
  const user = await getPermissionUser();

  return isAdmin(user);
}

export async function canManageProjects() {
  const user = await getPermissionUser();

  return isAdmin(user);
}

export async function canViewReports() {
  const user = await getPermissionUser();

  return isAdmin(user);
}

export async function canViewProject(projectId: string) {
  const user = await getPermissionUser();

  if (user.role === "ADMIN") {
    return true;
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: user.id,
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(membership);
}

export async function canViewTask(taskId: string) {
  const user = await getPermissionUser();

  if (user.role === "ADMIN") {
    return true;
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      assignees: {
        some: {
          userId: user.id,
        },
      },
      project: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(task);
}

export async function canEditTask(taskId: string) {
  const user = await getPermissionUser();

  if (user.role === "ADMIN") {
    return true;
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      assignees: {
        some: {
          userId: user.id,
        },
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(task);
}

export async function canChangeTaskStatus(
  taskId: string,
) {
  return canEditTask(taskId);
}

export async function canCreateComment(taskId: string) {
  return canViewTask(taskId);
}