import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin, requireUser } from "@/lib/auth/guards";
import {
  createProjectSchema,
  projectMemberSchema,
  updateProjectSchema,
} from "@/lib/validations/project";

export async function getAdminProjects() {
  await requireAdmin();

  const projects = await prisma.project.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      startDate: true,
      deadline: true,
      createdAt: true,
      updatedAt: true,

      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },

      members: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
            },
          },
          joinedAt: true,
        },
      },

      tasks: {
        select: {
          id: true,
          status: true,
          deadline: true,
        },
      },
    },
  });

  return projects.map((project) => {
    const totalTasks = project.tasks.length;

    const completedTasks = project.tasks.filter(
      (task) => task.status === "COMPLETED",
    ).length;

    const inProgressTasks = project.tasks.filter(
      (task) => task.status === "IN_PROGRESS",
    ).length;

    const todoTasks = project.tasks.filter(
      (task) => task.status === "TODO",
    ).length;

    const cancelledTasks = project.tasks.filter(
      (task) => task.status === "CANCELLED",
    ).length;

    const now = new Date();

    const overdueTasks = project.tasks.filter(
      (task) =>
        task.deadline < now &&
        task.status !== "COMPLETED" &&
        task.status !== "CANCELLED",
    ).length;

    const progress =
      totalTasks === 0
        ? 0
        : Math.round(
            (completedTasks / totalTasks) * 100,
          );

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      deadline: project.deadline,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      createdBy: project.createdBy,
      members: project.members,
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        cancelledTasks,
        overdueTasks,
        progress,
        membersCount: project.members.length,
      },
    };
  });
}

export async function getAdminProjectById(
  projectId: string,
) {
  await requireAdmin();

  return prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      startDate: true,
      deadline: true,
      createdAt: true,
      updatedAt: true,

      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },

      members: {
        orderBy: {
          joinedAt: "asc",
        },
        select: {
          id: true,
          joinedAt: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
            },
          },
        },
      },

      tasks: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          deadline: true,
          completedAt: true,
          createdAt: true,

          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function getEmployeeProjects() {
  const session = await requireUser();

  if (session.user.role === "ADMIN") {
    return getAdminProjects();
  }

  return prisma.project.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      startDate: true,
      deadline: true,

      _count: {
        select: {
          tasks: true,
        },
      },

      tasks: {
        where: {
          assignedToId: session.user.id,
        },
        select: {
          id: true,
          status: true,
          deadline: true,
          completedAt: true,
        },
      },
    },
  });
}

export async function getProjectById(
  projectId: string,
) {
  const session = await requireUser();

  if (session.user.role === "ADMIN") {
    return getAdminProjectById(projectId);
  }

  return prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      startDate: true,
      deadline: true,
      createdAt: true,

      members: {
        where: {
          userId: session.user.id,
        },
        select: {
          joinedAt: true,

          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      tasks: {
        where: {
          assignedToId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          deadline: true,
          completedAt: true,
        },
      },
    },
  });
}

export async function createProject(input: {
  title: string;
  description?: string;
  startDate: Date;
  deadline: Date;
}) {
  const session = await requireAdmin();

  const validated = createProjectSchema.parse(input);

  if (validated.deadline < validated.startDate) {
    throw new Error("INVALID_PROJECT_DATE_RANGE");
  }

  const project = await prisma.project.create({
    data: {
      title: validated.title,
      description:
        validated.description?.trim() || null,
      startDate: validated.startDate,
      deadline: validated.deadline,
      createdById: session.user.id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      startDate: true,
      deadline: true,
      createdAt: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
      entityId: project.id,
      metadata: {
        title: project.title,
      },
    },
  });

  return project;
}

export async function updateProject(
  projectId: string,
  input: {
    title?: string;
    description?: string | null;
    status?:
      | "PLANNED"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "ARCHIVED";
    startDate?: Date;
    deadline?: Date;
  },
) {
  const session = await requireAdmin();

  const validated = updateProjectSchema.parse(input);

  const existingProject = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      status: true,
      startDate: true,
      deadline: true,
    },
  });

  if (!existingProject) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const effectiveStartDate =
    validated.startDate ??
    existingProject.startDate;

  const effectiveDeadline =
    validated.deadline ??
    existingProject.deadline;

  if (effectiveDeadline < effectiveStartDate) {
    throw new Error("INVALID_PROJECT_DATE_RANGE");
  }

  const project = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      ...(validated.title !== undefined && {
        title: validated.title,
      }),

      ...(validated.description !== undefined && {
        description:
          validated.description?.trim() || null,
      }),

      ...(validated.status !== undefined && {
        status: validated.status,
      }),

      ...(validated.startDate !== undefined && {
        startDate: validated.startDate,
      }),

      ...(validated.deadline !== undefined && {
        deadline: validated.deadline,
      }),
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      startDate: true,
      deadline: true,
      updatedAt: true,
    },
  });

  const statusChanged =
    validated.status !== undefined &&
    validated.status !== existingProject.status;

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: statusChanged
        ? "PROJECT_STATUS_CHANGED"
        : "PROJECT_UPDATED",
      entityType: "PROJECT",
      entityId: project.id,
      metadata: {
        oldStatus: existingProject.status,
        newStatus: project.status,
      },
    },
  });

  return project;
}

export async function deleteProject(
  projectId: string,
) {
  const session = await requireAdmin();

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      title: true,

      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  if (project._count.tasks > 0) {
    throw new Error("PROJECT_HAS_TASKS");
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "PROJECT_DELETED",
      entityType: "PROJECT",
      entityId: projectId,
      metadata: {
        title: project.title,
      },
    },
  });

  return {
    success: true,
  };
}

export async function addProjectMember(
  projectId: string,
  employeeId: string,
) {
  const session = await requireAdmin();

  const validated = projectMemberSchema.parse({
    projectId,
    employeeId,
  });

  const [project, employee] =
    await prisma.$transaction([
      prisma.project.findUnique({
        where: {
          id: validated.projectId,
        },
        select: {
          id: true,
          title: true,
        },
      }),

      prisma.user.findFirst({
        where: {
          id: validated.employeeId,
          role: "EMPLOYEE",
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  if (!employee) {
    throw new Error("EMPLOYEE_NOT_FOUND");
  }

  const membership =
    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: validated.projectId,
          userId: validated.employeeId,
        },
      },
      update: {},
      create: {
        projectId: validated.projectId,
        userId: validated.employeeId,
      },
    });

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "PROJECT_MEMBER_ADDED",
      entityType: "PROJECT",
      entityId: validated.projectId,
      metadata: {
        employeeId: employee.id,
        employeeName: employee.name,
      },
    },
  });

  return membership;
}

export async function removeProjectMember(
  projectId: string,
  employeeId: string,
) {
  const session = await requireAdmin();

  const validated = projectMemberSchema.parse({
    projectId,
    employeeId,
  });

  const membership =
    await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: validated.projectId,
          userId: validated.employeeId,
        },
      },
      select: {
        id: true,
      },
    });

  if (!membership) {
    throw new Error("PROJECT_MEMBER_NOT_FOUND");
  }

  const assignedTaskCount = await prisma.task.count({
    where: {
      projectId: validated.projectId,
      assignedToId: validated.employeeId,
      status: {
        not: "CANCELLED",
      },
    },
  });

  if (assignedTaskCount > 0) {
    throw new Error("PROJECT_MEMBER_HAS_TASKS");
  }

  await prisma.projectMember.delete({
    where: {
      id: membership.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "PROJECT_MEMBER_REMOVED",
      entityType: "PROJECT",
      entityId: validated.projectId,
      metadata: {
        employeeId: validated.employeeId,
      },
    },
  });

  return {
    success: true,
  };
}