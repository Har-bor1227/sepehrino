import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "@/lib/validations/employee";

export type EmployeeListFilters = {
  search?: string;
  status?: "all" | "active" | "inactive";
  sort?: "newest" | "oldest" | "name-asc" | "name-desc";
  page?: number;
  pageSize?: number;
};

export async function getEmployees(
  filters: EmployeeListFilters = {},
) {
  await requireAdmin();

  const search = filters.search?.trim() ?? "";

  const status = filters.status ?? "all";

  const sort = filters.sort ?? "newest";

  const requestedPage =
    Number.isInteger(filters.page) &&
    (filters.page ?? 1) > 0
      ? filters.page ?? 1
      : 1;

  const pageSize =
    Number.isInteger(filters.pageSize) &&
    (filters.pageSize ?? 10) > 0
      ? Math.min(filters.pageSize ?? 10, 50)
      : 10;

  const where = {
    role: "EMPLOYEE" as const,

    ...(status === "active"
      ? {
          isActive: true,
        }
      : {}),

    ...(status === "inactive"
      ? {
          isActive: false,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "oldest"
      ? { createdAt: "asc" as const }
      : sort === "name-asc"
        ? { name: "asc" as const }
        : sort === "name-desc"
          ? { name: "desc" as const }
          : { createdAt: "desc" as const };

  const select = {
    id: true,
    name: true,
    email: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,

    _count: {
      select: {
        projectMembers: true,
        taskAssignments: true,
      },
    },
  } as const;

  const [total, rawEmployees] =
    await prisma.$transaction([
      prisma.user.count({
        where,
      }),

      prisma.user.findMany({
        where,
        orderBy,
        skip:
          (requestedPage - 1) *
          pageSize,
        take: pageSize,
        select,
      }),
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      total / pageSize,
    ),
  );

  const page = Math.min(
    requestedPage,
    totalPages,
  );

  const employees =
    rawEmployees.map(
      (employee) => ({
        ...employee,

        _count: {
          projectMembers:
            employee._count
              .projectMembers,

          assignedTasks:
            employee._count
              .taskAssignments,
        },
      }),
    );

  if (
    page !== requestedPage &&
    total > 0
  ) {
    const [
      adjustedTotal,
      rawAdjustedEmployees,
    ] = await prisma.$transaction([
      prisma.user.count({
        where,
      }),

      prisma.user.findMany({
        where,
        orderBy,
        skip:
          (page - 1) *
          pageSize,
        take: pageSize,
        select,
      }),
    ]);

    const adjustedEmployees =
      rawAdjustedEmployees.map(
        (employee) => ({
          ...employee,

          _count: {
            projectMembers:
              employee._count
                .projectMembers,

            assignedTasks:
              employee._count
                .taskAssignments,
          },
        }),
      );

    return {
      employees:
        adjustedEmployees,
      total:
        adjustedTotal,
      page,
      pageSize,
      totalPages:
        Math.max(
          1,
          Math.ceil(
            adjustedTotal /
              pageSize,
          ),
        ),
    };
  }

  return {
    employees,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getEmployeeById(
  employeeId: string,
) {
  await requireAdmin();

  const employee =
    await prisma.user.findFirst({
      where: {
        id: employeeId,
        role: "EMPLOYEE",
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,

        _count: {
          select: {
            projectMembers:
              true,
            taskAssignments:
              true,
          },
        },

        projectMembers: {
          orderBy: {
            joinedAt: "desc",
          },

          select: {
            joinedAt: true,

            project: {
              select: {
                id: true,
                title: true,
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
                    assignees: {
                      some: {
                        userId:
                          employeeId,
                      },
                    },
                  },

                  select: {
                    id: true,
                    status: true,
                  },
                },
              },
            },
          },
        },

        taskAssignments: {
          orderBy: {
            task: {
              deadline: "asc",
            },
          },

          select: {
            assignedAt: true,

            task: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                deadline: true,
                completedAt: true,

                project: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },

        activityLogs: {
          orderBy: {
            createdAt: "desc",
          },

          take: 10,

          select: {
            id: true,
            action: true,
            entityType: true,
            entityId: true,
            metadata: true,
            createdAt: true,
          },
        },
      },
    });

  if (!employee) {
    return null;
  }

  const assignedTasks =
    employee.taskAssignments.map(
      (assignment) =>
        assignment.task,
    );

  const now = new Date();

  const completedTasks =
    assignedTasks.filter(
      (task) =>
        task.status ===
        "COMPLETED",
    ).length;

  const inProgressTasks =
    assignedTasks.filter(
      (task) =>
        task.status ===
        "IN_PROGRESS",
    ).length;

  const overdueTasks =
    assignedTasks.filter(
      (task) =>
        task.deadline < now &&
        task.status !==
          "COMPLETED" &&
        task.status !==
          "CANCELLED",
    ).length;

  const completionRate =
    assignedTasks.length ===
    0
      ? 0
      : Math.round(
          (completedTasks /
            assignedTasks.length) *
            100,
        );

  const projects =
    employee.projectMembers.map(
      (membership) => {
        const projectTasks =
          membership.project
            .tasks;

        const projectTotalTasks =
          projectTasks.length;

        const projectCompletedTasks =
          projectTasks.filter(
            (task) =>
              task.status ===
              "COMPLETED",
          ).length;

        const projectProgress =
          projectTotalTasks ===
          0
            ? 0
            : Math.round(
                (projectCompletedTasks /
                  projectTotalTasks) *
                  100,
              );

        return {
          ...membership.project,

          joinedAt:
            membership.joinedAt,

          employeeTaskCount:
            projectTotalTasks,

          employeeCompletedTaskCount:
            projectCompletedTasks,

          progress:
            projectProgress,
        };
      },
    );

  return {
    ...employee,

    assignedTasks,

    stats: {
      totalProjects:
        employee._count
          .projectMembers,

      totalTasks:
        assignedTasks.length,

      completedTasks,

      inProgressTasks,

      overdueTasks,

      completionRate,
    },

    projects,
  };
}

export async function createEmployee(
  input: {
    name: string;
    email: string;
    password: string;
    isActive?: boolean;
  },
) {
  const admin =
    await requireAdmin();

  const validated =
    createEmployeeSchema.parse(
      input,
    );

  const email =
    validated.email;

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },

      select: {
        id: true,
      },
    });

  if (existingUser) {
    throw new Error(
      "EMAIL_ALREADY_EXISTS",
    );
  }

  const passwordHash =
    await hashPassword(
      validated.password,
    );

  const employee =
    await prisma.user.create({
      data: {
        name:
          validated.name,

        email,

        passwordHash,

        role: "EMPLOYEE",

        isActive:
          validated.isActive,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

  await prisma.activityLog.create({
    data: {
      userId:
        admin.user.id,

      action:
        "EMPLOYEE_CREATED",

      entityType:
        "USER",

      entityId:
        employee.id,

      metadata: {
        name:
          employee.name,

        email:
          employee.email,
      },
    },
  });

  return employee;
}

export async function updateEmployee(
  employeeId: string,
  input: {
    name?: string;
    email?: string;
    password?: string;
    isActive?: boolean;
  },
) {
  const admin =
    await requireAdmin();

  const validated =
    updateEmployeeSchema.parse(
      input,
    );

  const employee =
    await prisma.user.findFirst({
      where: {
        id: employeeId,
        role: "EMPLOYEE",
      },

      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

  if (!employee) {
    throw new Error(
      "EMPLOYEE_NOT_FOUND",
    );
  }

  const data: {
    name?: string;
    email?: string;
    passwordHash?: string;
    isActive?: boolean;
  } = {};

  if (
    validated.name !==
    undefined
  ) {
    data.name =
      validated.name;
  }

  if (
    validated.email !==
    undefined
  ) {
    const email =
      validated.email;

    if (
      email !==
      employee.email
    ) {
      const existingUser =
        await prisma.user.findUnique(
          {
            where: {
              email,
            },

            select: {
              id: true,
            },
          },
        );

      if (
        existingUser &&
        existingUser.id !==
          employeeId
      ) {
        throw new Error(
          "EMAIL_ALREADY_EXISTS",
        );
      }
    }

    data.email =
      email;
  }

  if (
    validated.password !==
    undefined
  ) {
    data.passwordHash =
      await hashPassword(
        validated.password,
      );
  }

  if (
    validated.isActive !==
    undefined
  ) {
    data.isActive =
      validated.isActive;
  }

  const updatedEmployee =
    await prisma.user.update({
      where: {
        id: employeeId,
      },

      data,

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  await prisma.activityLog.create({
    data: {
      userId:
        admin.user.id,

      action:
        "EMPLOYEE_UPDATED",

      entityType:
        "USER",

      entityId:
        employeeId,

      metadata: {
        fields:
          Object.keys(data),
      },
    },
  });

  return updatedEmployee;
}

export async function toggleEmployeeStatus(
  employeeId: string,
) {
  const admin =
    await requireAdmin();

  const employee =
    await prisma.user.findFirst({
      where: {
        id: employeeId,
        role: "EMPLOYEE",
      },

      select: {
        id: true,
        isActive: true,
      },
    });

  if (!employee) {
    throw new Error(
      "EMPLOYEE_NOT_FOUND",
    );
  }

  const updatedEmployee =
    await prisma.user.update({
      where: {
        id: employeeId,
      },

      data: {
        isActive:
          !employee.isActive,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

  await prisma.activityLog.create({
    data: {
      userId:
        admin.user.id,

      action:
        "EMPLOYEE_STATUS_CHANGED",

      entityType:
        "USER",

      entityId:
        employeeId,

      metadata: {
        oldStatus:
          employee.isActive,

        newStatus:
          updatedEmployee.isActive,
      },
    },
  });

  return updatedEmployee;
}

export async function deleteEmployee(
  employeeId: string,
) {
  const admin =
    await requireAdmin();

  const employee =
    await prisma.user.findFirst({
      where: {
        id: employeeId,
        role: "EMPLOYEE",
      },

      select: {
        id: true,
        name: true,
        email: true,

        _count: {
          select: {
            projectMembers:
              true,

            taskAssignments:
              true,

            createdTasks:
              true,

            createdProjects:
              true,

            comments:
              true,

            uploadedAttachments:
              true,
          },
        },
      },
    });

  if (!employee) {
    throw new Error(
      "EMPLOYEE_NOT_FOUND",
    );
  }

  const hasDependencies =
    employee._count
      .projectMembers >
      0 ||
    employee._count
      .taskAssignments >
      0 ||
    employee._count
      .createdTasks >
      0 ||
    employee._count
      .createdProjects >
      0 ||
    employee._count
      .comments >
      0 ||
    employee._count
      .uploadedAttachments >
      0;

  if (hasDependencies) {
    throw new Error(
      "EMPLOYEE_HAS_DEPENDENCIES",
    );
  }

  await prisma.user.delete({
    where: {
      id: employeeId,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId:
        admin.user.id,

      action:
        "EMPLOYEE_STATUS_CHANGED",

      entityType:
        "USER",

      entityId:
        employeeId,

      metadata: {
        action:
          "DELETED",

        employeeName:
          employee.name,

        employeeEmail:
          employee.email,
      },
    },
  });

  return {
    success: true,
  };
}