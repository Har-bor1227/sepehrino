import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";

export async function getAdminDashboardData() {
  await requireAdmin();

  const now = new Date();

  const [
    totalEmployees,
    activeEmployees,
    totalProjects,
    activeProjects,
    completedProjects,
    archivedProjects,
    totalTasks,
    todoTasks,
    inProgressTasks,
    completedTasks,
    cancelledTasks,
    overdueTasks,
    activeProjectRows,
    employeeRows,
    recentActivities,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: "EMPLOYEE",
      },
    }),

    prisma.user.count({
      where: {
        role: "EMPLOYEE",
        isActive: true,
      },
    }),

    prisma.project.count(),

    prisma.project.count({
      where: {
        status: {
          in: ["PLANNED", "IN_PROGRESS"],
        },
      },
    }),

    prisma.project.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.project.count({
      where: {
        status: "ARCHIVED",
      },
    }),

    prisma.task.count(),

    prisma.task.count({
      where: {
        status: "TODO",
      },
    }),

    prisma.task.count({
      where: {
        status: "IN_PROGRESS",
      },
    }),

    prisma.task.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.task.count({
      where: {
        status: "CANCELLED",
      },
    }),

    prisma.task.count({
      where: {
        deadline: {
          lt: now,
        },
        status: {
          notIn: ["COMPLETED", "CANCELLED"],
        },
      },
    }),

    prisma.project.findMany({
      where: {
        status: {
          in: ["PLANNED", "IN_PROGRESS"],
        },
      },
      orderBy: {
        deadline: "asc",
      },
      take: 6,
      select: {
        id: true,
        title: true,
        status: true,
        deadline: true,
        tasks: {
          select: {
            status: true,
          },
        },
      },
    }),

    prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        taskAssignments: {
          select: {
            task: {
              select: {
                id: true,
                status: true,
                deadline: true,
              },
            },
          },
        },
      },
    }),

    prisma.activityLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    }),
  ]);

  const projects = activeProjectRows.map(
    (project) => {
      const total = project.tasks.length;

      const completed =
        project.tasks.filter(
          (task) =>
            task.status === "COMPLETED",
        ).length;

      const progress =
        total === 0
          ? 0
          : Math.round(
              (completed / total) * 100,
            );

      return {
        id: project.id,
        title: project.title,
        status: project.status,
        deadline: project.deadline,
        totalTasks: total,
        completedTasks: completed,
        progress,
      };
    },
  );

  const employees = employeeRows.map(
    (employee) => {
      const tasks =
        employee.taskAssignments.map(
          (assignment) =>
            assignment.task,
        );

      const total =
        tasks.length;

      const active =
        tasks.filter(
          (task) =>
            task.status === "TODO" ||
            task.status === "IN_PROGRESS",
        ).length;

      const completed =
        tasks.filter(
          (task) =>
            task.status === "COMPLETED",
        ).length;

      const overdue =
        tasks.filter(
          (task) =>
            task.deadline < now &&
            task.status !== "COMPLETED" &&
            task.status !== "CANCELLED",
        ).length;

      return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        totalTasks: total,
        activeTasks: active,
        completedTasks: completed,
        overdueTasks: overdue,
      };
    },
  );

  employees.sort((a, b) => {
    if (b.activeTasks !== a.activeTasks) {
      return b.activeTasks - a.activeTasks;
    }

    return (
      b.totalTasks - a.totalTasks
    );
  });

  return {
    employees: {
      total: totalEmployees,
      active: activeEmployees,
      rows: employees,
    },

    projects: {
      total: totalProjects,
      active: activeProjects,
      completed: completedProjects,
      archived: archivedProjects,
      rows: projects,
    },

    tasks: {
      total: totalTasks,
      todo: todoTasks,
      inProgress: inProgressTasks,
      completed: completedTasks,
      cancelled: cancelledTasks,
      overdue: overdueTasks,
    },

    recentActivities,
  };
}