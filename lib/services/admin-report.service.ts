import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";

const TASK_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

const PROJECT_STATUSES = [
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
] as const;

type ReportFilters = {
  from?: Date;
  to?: Date;
  status?: string;
  employeeId?: string;
  projectId?: string;
};

function getStatusLabel(
  status: (typeof TASK_STATUSES)[number],
) {
  switch (status) {
    case "TODO":
      return "در انتظار";

    case "IN_PROGRESS":
      return "در حال انجام";

    case "COMPLETED":
      return "تکمیل شده";

    case "CANCELLED":
      return "لغو شده";
  }
}

function getProjectStatusLabel(
  status: (typeof PROJECT_STATUSES)[number],
) {
  switch (status) {
    case "PLANNED":
      return "برنامه‌ریزی شده";

    case "IN_PROGRESS":
      return "در حال انجام";

    case "COMPLETED":
      return "تکمیل شده";

    case "ARCHIVED":
      return "آرشیو شده";
  }
}

function getDateKey(
  date: Date,
) {
  return date.toISOString().slice(0, 10);
}

function formatTrendDate(
  dateKey: string,
) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      month: "short",
      day: "numeric",
    },
  ).format(
    new Date(
      `${dateKey}T00:00:00.000Z`,
    ),
  );
}

function getDateRangeWhere(
  filters: ReportFilters,
) {
  if (
    !filters.from &&
    !filters.to
  ) {
    return undefined;
  }

  return {
    ...(filters.from
      ? {
          gte: filters.from,
        }
      : {}),

    ...(filters.to
      ? {
          lt: filters.to,
        }
      : {}),
  };
}

function getValidTaskStatus(
  value?: string,
) {
  if (
    value &&
    TASK_STATUSES.includes(
      value as (typeof TASK_STATUSES)[number],
    )
  ) {
    return value as (typeof TASK_STATUSES)[number];
  }

  return undefined;
}

function getTaskStatusCounts(
  tasks: {
    status:
      (typeof TASK_STATUSES)[number];
  }[],
) {
  return TASK_STATUSES.map(
    (status) => {
      const value =
        tasks.filter(
          (task) =>
            task.status ===
            status,
        ).length;

      return {
        status,
        name:
          getStatusLabel(status),
        value,
      };
    },
  );
}

export async function getAdminReportData(
  filters: ReportFilters = {},
) {
  await requireAdmin();

  const now = new Date();

  const taskCreatedAt =
    getDateRangeWhere(
      filters,
    );

  const taskStatus =
    getValidTaskStatus(
      filters.status,
    );

  const taskWhere = {
    ...(taskCreatedAt
      ? {
          createdAt:
            taskCreatedAt,
        }
      : {}),

    ...(taskStatus
      ? {
          status: taskStatus,
        }
      : {}),

    ...(filters.employeeId
      ? {
          assignees: {
            some: {
              userId:
                filters.employeeId,
            },
          },
        }
      : {}),

    ...(filters.projectId
      ? {
          projectId:
            filters.projectId,
        }
      : {}),
  };

  const projectCreatedAt =
    getDateRangeWhere(
      filters,
    );

  const [
    employeeRows,
    projectRows,
    taskStatusRows,
    projectStatusProjects,
    projectTaskRows,
    employeeTaskRows,
    overdueTasks,
    trendTasks,
  ] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "EMPLOYEE",
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    }),

    prisma.project.findMany({
      where: {
        ...(projectCreatedAt
          ? {
              createdAt:
                projectCreatedAt,
            }
          : {}),
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        title: true,
        status: true,
        deadline: true,
      },
    }),

    prisma.task.findMany({
      where: taskWhere,

      select: {
        status: true,
      },
    }),

    prisma.project.findMany({
      where: {
        ...(projectCreatedAt
          ? {
              createdAt:
                projectCreatedAt,
            }
          : {}),
      },

      select: {
        status: true,
      },
    }),

    prisma.task.findMany({
      where: taskWhere,

      select: {
        projectId: true,
        status: true,
      },
    }),

    prisma.task.findMany({
      where: taskWhere,

      select: {
        id: true,
        status: true,
        deadline: true,

        assignees: {
          select: {
            userId: true,
          },
        },
      },
    }),

    prisma.task.count({
      where: {
        ...taskWhere,

        deadline: {
          lt: now,
        },

        status: {
          notIn: [
            "COMPLETED",
            "CANCELLED",
          ],
        },
      },
    }),

    prisma.task.findMany({
      where: taskWhere,

      select: {
        createdAt: true,
        completedAt: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  const taskStatusData =
    getTaskStatusCounts(
      taskStatusRows,
    );

  const projectStatusData =
    PROJECT_STATUSES.map(
      (status) => {
        const count =
          projectStatusProjects.filter(
            (project) =>
              project.status ===
              status,
          ).length;

        return {
          status,
          name:
            getProjectStatusLabel(
              status,
            ),
          value: count,
        };
      },
    );

  const taskTotal =
    taskStatusData.reduce(
      (sum, item) =>
        sum + item.value,
      0,
    );

  const completedTaskCount =
    taskStatusData.find(
      (item) =>
        item.status ===
        "COMPLETED",
    )?.value ?? 0;

  const projectTotal =
    projectStatusData.reduce(
      (sum, item) =>
        sum + item.value,
      0,
    );

  const completedProjectCount =
    projectStatusData.find(
      (item) =>
        item.status ===
        "COMPLETED",
    )?.value ?? 0;

  const activeProjectCount =
    projectStatusData
      .filter(
        (item) =>
          item.status ===
            "PLANNED" ||
          item.status ===
            "IN_PROGRESS",
      )
      .reduce(
        (sum, item) =>
          sum + item.value,
        0,
      );

  const selectedEmployee =
    filters.employeeId
      ? employeeRows.find(
          (employee) =>
            employee.id ===
            filters.employeeId,
        )
      : undefined;

  const selectedProject =
    filters.projectId
      ? projectRows.find(
          (project) =>
            project.id ===
            filters.projectId,
        )
      : undefined;

  const employeeWorkload =
    employeeRows
      .filter(
        (employee) =>
          employee.isActive ||
          employee.id ===
            filters.employeeId,
      )
      .map(
        (employee) => {
          const employeeTasks =
            employeeTaskRows.filter(
              (task) =>
                task.assignees.some(
                  (assignee) =>
                    assignee.userId ===
                    employee.id,
                ),
            );

          const totalTasks =
            employeeTasks.length;

          const activeTasks =
            employeeTasks.filter(
              (task) =>
                task.status ===
                  "TODO" ||
                task.status ===
                  "IN_PROGRESS",
            ).length;

          const completedTasks =
            employeeTasks.filter(
              (task) =>
                task.status ===
                "COMPLETED",
            ).length;

          const overdueTasksForEmployee =
            selectedEmployee &&
            selectedEmployee.id ===
              employee.id
              ? employeeTasks.filter(
                  (task) =>
                    task.deadline <
                      now &&
                    task.status !==
                      "COMPLETED" &&
                    task.status !==
                      "CANCELLED",
                ).length
              : 0;

          return {
            id:
              employee.id,

            name:
              employee.name,

            email:
              employee.email,

            totalTasks,

            activeTasks,

            completedTasks,

            overdueTasks:
              overdueTasksForEmployee,
          };
        },
      )
      .sort(
        (a, b) => {
          if (
            b.activeTasks !==
            a.activeTasks
          ) {
            return (
              b.activeTasks -
              a.activeTasks
            );
          }

          return (
            b.totalTasks -
            a.totalTasks
          );
        },
      )
      .slice(0, 8);

  const overdueByEmployee =
    filters.employeeId
      ? overdueTasks
      : undefined;

  const projectProgressRows =
    selectedProject
      ? projectRows.filter(
          (project) =>
            project.id ===
            selectedProject.id,
        )
      : projectRows
          .filter(
            (project) =>
              project.status ===
                "PLANNED" ||
              project.status ===
                "IN_PROGRESS",
          )
          .slice(0, 8);

  const projectProgress =
    projectProgressRows.map(
      (project) => {
        const groups =
          projectTaskRows.filter(
            (task) =>
              task.projectId ===
              project.id,
          );

        const totalTasks =
          groups.length;

        const completedTasks =
          groups.filter(
            (task) =>
              task.status ===
              "COMPLETED",
          ).length;

        return {
          id:
            project.id,

          title:
            project.title,

          status:
            project.status,

          deadline:
            project.deadline.toISOString(),

          totalTasks,

          completedTasks,

          progress:
            totalTasks === 0
              ? 0
              : Math.round(
                  (completedTasks /
                    totalTasks) *
                    100,
                ),
        };
      },
    );

  const defaultTrendStart =
    new Date(now);

  defaultTrendStart.setUTCHours(
    0,
    0,
    0,
    0,
  );

  defaultTrendStart.setUTCDate(
    defaultTrendStart.getUTCDate() -
      29,
  );

  let trendStart =
    filters.from ??
    defaultTrendStart;

  let trendEnd =
    filters.to ??
    (() => {
      const date =
        new Date(now);

      date.setUTCDate(
        date.getUTCDate() +
          1,
      );

      date.setUTCHours(
        0,
        0,
        0,
        0,
      );

      return date;
    })();

  if (
    trendEnd <=
    trendStart
  ) {
    trendStart =
      defaultTrendStart;

    trendEnd =
      new Date(now);

    trendEnd.setUTCDate(
      trendEnd.getUTCDate() +
        1,
    );

    trendEnd.setUTCHours(
      0,
      0,
      0,
      0,
    );
  }

  const maxTrendDays =
    90;

  const trendDuration =
    Math.ceil(
      (trendEnd.getTime() -
        trendStart.getTime()) /
        (24 *
          60 *
          60 *
          1000),
    );

  if (
    trendDuration >
    maxTrendDays
  ) {
    trendStart =
      new Date(
        trendEnd,
      );

    trendStart.setUTCDate(
      trendStart.getUTCDate() -
        (maxTrendDays - 1),
    );

    trendStart.setUTCHours(
      0,
      0,
      0,
      0,
    );
  }

  const trendMap =
    new Map<
      string,
      {
        created: number;
        completed: number;
      }
    >();

  const trendDays =
    Math.max(
      1,
      Math.ceil(
        (trendEnd.getTime() -
          trendStart.getTime()) /
          (24 *
            60 *
            60 *
            1000),
      ),
    );

  for (
    let index = 0;
    index < trendDays;
    index += 1
  ) {
    const date =
      new Date(
        trendStart,
      );

    date.setUTCDate(
      date.getUTCDate() +
        index,
    );

    trendMap.set(
      getDateKey(date),
      {
        created: 0,
        completed: 0,
      },
    );
  }

  for (
    const task of trendTasks
  ) {
    const createdKey =
      getDateKey(
        task.createdAt,
      );

    const createdDay =
      trendMap.get(
        createdKey,
      );

    if (createdDay) {
      createdDay.created +=
        1;
    }

    if (
      task.completedAt
    ) {
      const completedKey =
        getDateKey(
          task.completedAt,
        );

      const completedDay =
        trendMap.get(
          completedKey,
        );

      if (completedDay) {
        completedDay.completed +=
          1;
      }
    }
  }

  const taskTrend =
    Array.from(
      trendMap.entries(),
    ).map(
      ([date, values]) => ({
        date,

        label:
          formatTrendDate(
            date,
          ),

        created:
          values.created,

        completed:
          values.completed,
      }),
    );

  let employeeDetail:
    | {
        id: string;
        name: string;
        email: string;
        isActive: boolean;
        totalTasks: number;
        activeTasks: number;
        completedTasks: number;
        overdueTasks: number;
        projects: {
          id: string;
          title: string;
          totalTasks: number;
          completedTasks: number;
          progress: number;
        }[];
      }
    | null = null;

  if (
    selectedEmployee
  ) {
    const employeeTaskRows =
      await prisma.task.findMany(
        {
          where: {
            ...taskWhere,

            assignees: {
              some: {
                userId:
                  selectedEmployee.id,
              },
            },
          },

          select: {
            id: true,
            status: true,
            projectId: true,
            deadline: true,

            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      );

    const projectMap =
      new Map<
        string,
        {
          id: string;
          title: string;
          totalTasks: number;
          completedTasks: number;
        }
      >();

    for (
      const task of employeeTaskRows
    ) {
      const current =
        projectMap.get(
          task.projectId,
        ) ?? {
          id:
            task.project.id,

          title:
            task.project.title,

          totalTasks: 0,

          completedTasks: 0,
        };

      current.totalTasks +=
        1;

      if (
        task.status ===
        "COMPLETED"
      ) {
        current.completedTasks +=
          1;
      }

      projectMap.set(
        task.projectId,
        current,
      );
    }

    const employeeProjects =
      Array.from(
        projectMap.values(),
      )
        .map(
          (project) => ({
            ...project,

            progress:
              project.totalTasks ===
              0
                ? 0
                : Math.round(
                    (project.completedTasks /
                      project.totalTasks) *
                      100,
                  ),
          }),
        )
        .sort(
          (a, b) =>
            b.totalTasks -
            a.totalTasks,
        );

    const totalTasks =
      employeeTaskRows.length;

    const activeTasks =
      employeeTaskRows.filter(
        (task) =>
          task.status ===
            "TODO" ||
          task.status ===
            "IN_PROGRESS",
      ).length;

    const completedTasks =
      employeeTaskRows.filter(
        (task) =>
          task.status ===
          "COMPLETED",
      ).length;

    const overdueTasksForEmployee =
      employeeTaskRows.filter(
        (task) =>
          task.deadline < now &&
          task.status !==
            "COMPLETED" &&
          task.status !==
            "CANCELLED",
      ).length;

    employeeDetail = {
      id:
        selectedEmployee.id,

      name:
        selectedEmployee.name,

      email:
        selectedEmployee.email,

      isActive:
        selectedEmployee.isActive,

      totalTasks,

      activeTasks,

      completedTasks,

      overdueTasks:
        overdueTasksForEmployee,

      projects:
        employeeProjects,
    };
  }

  let projectDetail:
    | {
        id: string;
        title: string;
        description: string | null;
        status: string;
        deadline: string;
        totalTasks: number;
        todoTasks: number;
        inProgressTasks: number;
        completedTasks: number;
        cancelledTasks: number;
        overdueTasks: number;
        progress: number;
        employees: {
          id: string;
          name: string;
          totalTasks: number;
          completedTasks: number;
        }[];
      }
    | null = null;

  if (
    selectedProject
  ) {
    const projectTaskRows =
      await prisma.task.findMany(
        {
          where: {
            ...taskWhere,

            projectId:
              selectedProject.id,
          },

          select: {
            status: true,
            deadline: true,

            assignees: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      );

    const totalTasks =
      projectTaskRows.length;

    const todoTasks =
      projectTaskRows.filter(
        (task) =>
          task.status ===
          "TODO",
      ).length;

    const inProgressTasks =
      projectTaskRows.filter(
        (task) =>
          task.status ===
          "IN_PROGRESS",
      ).length;

    const completedTasks =
      projectTaskRows.filter(
        (task) =>
          task.status ===
          "COMPLETED",
      ).length;

    const cancelledTasks =
      projectTaskRows.filter(
        (task) =>
          task.status ===
          "CANCELLED",
      ).length;

    const overdueTasksForProject =
      projectTaskRows.filter(
        (task) =>
          task.deadline < now &&
          task.status !==
            "COMPLETED" &&
          task.status !==
            "CANCELLED",
      ).length;

    const employeeMap =
      new Map<
        string,
        {
          id: string;
          name: string;
          totalTasks: number;
          completedTasks: number;
        }
      >();

    for (
      const task of projectTaskRows
    ) {
      for (
        const assignee of
          task.assignees
      ) {
        const employee =
          assignee.user;

        const current =
          employeeMap.get(
            employee.id,
          ) ?? {
            id:
              employee.id,

            name:
              employee.name,

            totalTasks: 0,

            completedTasks: 0,
          };

        current.totalTasks +=
          1;

        if (
          task.status ===
          "COMPLETED"
        ) {
          current.completedTasks +=
            1;
        }

        employeeMap.set(
          employee.id,
          current,
        );
      }
    }

    projectDetail = {
      id:
        selectedProject.id,

      title:
        selectedProject.title,

      description:
        null,

      status:
        selectedProject.status,

      deadline:
        selectedProject.deadline.toISOString(),

      totalTasks,

      todoTasks,

      inProgressTasks,

      completedTasks,

      cancelledTasks,

      overdueTasks:
        overdueTasksForProject,

      progress:
        totalTasks === 0
          ? 0
          : Math.round(
              (completedTasks /
                totalTasks) *
                100,
            ),

      employees:
        Array.from(
          employeeMap.values(),
        ).sort(
          (a, b) =>
            b.totalTasks -
            a.totalTasks,
        ),
    };
  }

  if (
    filters.employeeId
  ) {
    employeeWorkload.forEach(
      (employee) => {
        if (
          employee.id ===
          filters.employeeId
        ) {
          employee.overdueTasks =
            overdueByEmployee ??
            0;
        }
      },
    );
  }

  return {
    filters: {
      employeeId:
        filters.employeeId ??
        "",

      projectId:
        filters.projectId ??
        "",

      status:
        taskStatus ?? "",

      from: filters.from
        ? getDateKey(
            filters.from,
          )
        : "",

      to: filters.to
        ? getDateKey(
            new Date(
              filters.to.getTime() -
                1,
            ),
          )
        : "",
    },

    options: {
      employees:
        employeeRows.map(
          (employee) => ({
            id:
              employee.id,

            name:
              employee.name,

            email:
              employee.email,

            isActive:
              employee.isActive,
          }),
        ),

      projects:
        projectRows.map(
          (project) => ({
            id:
              project.id,

            title:
              project.title,

            status:
              project.status,
          }),
        ),
    },

    overview: {
      employeeTotal:
        employeeRows.length,

      activeEmployeeCount:
        employeeRows.filter(
          (employee) =>
            employee.isActive,
        ).length,

      projectTotal,

      activeProjectCount,

      completedProjectCount,

      taskTotal,

      completedTaskCount,

      overdueTaskCount:
        overdueTasks,

      completionRate:
        taskTotal === 0
          ? 0
          : Math.round(
              (completedTaskCount /
                taskTotal) *
                100,
            ),
    },

    tasks: {
      statusData:
        taskStatusData,
    },

    projects: {
      statusData:
        projectStatusData,

      progress:
        projectProgress,
    },

    employees: {
      workload:
        employeeWorkload,
    },

    trend: {
      taskTrend,
    },

    details: {
      employee:
        employeeDetail,

      project:
        projectDetail,
    },
  };
}