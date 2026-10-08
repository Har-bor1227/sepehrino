import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";

const MAX_RESULTS_PER_TYPE = 10;

function normalizeQuery(
  query: string,
) {
  return query.trim().slice(0, 100);
}

export async function searchSystem(
  rawQuery: string,
) {
  const session =
    await requireUser();

  const query =
    normalizeQuery(
      rawQuery,
    );

  if (query.length < 2) {
    return {
      query,
      employees: [],
      projects: [],
      tasks: [],
      total: 0,
    };
  }

  if (
    session.user.role ===
    "ADMIN"
  ) {
    const [
      employees,
      projects,
      tasks,
    ] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: "EMPLOYEE",

          OR: [
            {
              name: {
                contains:
                  query,
                mode:
                  "insensitive",
              },
            },
            {
              email: {
                contains:
                  query,
                mode:
                  "insensitive",
              },
            },
          ],
        },

        orderBy: {
          name: "asc",
        },

        take:
          MAX_RESULTS_PER_TYPE,

        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      }),

      prisma.project.findMany({
        where: {
          OR: [
            {
              title: {
                contains:
                  query,
                mode:
                  "insensitive",
              },
            },
            {
              description: {
                contains:
                  query,
                mode:
                  "insensitive",
              },
            },
          ],
        },

        orderBy: {
          createdAt: "desc",
        },

        take:
          MAX_RESULTS_PER_TYPE,

        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          deadline: true,

          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
        },
      }),

      prisma.task.findMany({
        where: {
          OR: [
            {
              title: {
                contains:
                  query,
                mode:
                  "insensitive",
              },
            },
            {
              description: {
                contains:
                  query,
                mode:
                  "insensitive",
              },
            },
          ],
        },

        orderBy: {
          createdAt: "desc",
        },

        take:
          MAX_RESULTS_PER_TYPE,

        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          deadline: true,

          project: {
            select: {
              id: true,
              title: true,
            },
          },

          subProject: {
            select: {
              id: true,
              type: true,
            },
          },

          assignees: {
            orderBy: {
              assignedAt: "asc",
            },

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
      }),
    ]);

    return {
      query,

      employees:
        employees.map(
          (employee) => ({
            id:
              employee.id,

            title:
              employee.name,

            subtitle:
              employee.email,

            meta:
              employee.isActive
                ? "فعال"
                : "غیرفعال",

            href:
              `/admin/employees/${employee.id}`,
          }),
        ),

      projects:
        projects.map(
          (project) => ({
            id:
              project.id,

            title:
              project.title,

            subtitle:
              project.description ??
              "بدون توضیحات",

            meta:
              `${project._count.tasks} Task • ${project._count.members} عضو`,

            status:
              project.status,

            deadline:
              project.deadline,

            href:
              `/admin/projects/${project.id}`,
          }),
        ),

      tasks:
        tasks.map(
          (task) => {
            const assigneeNames =
              task.assignees
                .map(
                  ({
                    user,
                  }) =>
                    user.name,
                )
                .filter(
                  Boolean,
                );

            return {
              id:
                task.id,

              title:
                task.title,

              subtitle:
                task.project.title,

              meta:
                assigneeNames.length >
                0
                  ? assigneeNames.join(
                      "، ",
                    )
                  : "بدون مسئول",

              status:
                task.status,

              priority:
                task.priority,

              deadline:
                task.deadline,

              href:
                `/admin/tasks/${task.id}`,
            };
          },
        ),

      total:
        employees.length +
        projects.length +
        tasks.length,
    };
  }

  const [
    projects,
    tasks,
  ] = await Promise.all([
    prisma.project.findMany({
      where: {
        members: {
          some: {
            userId:
              session.user.id,
          },
        },

        OR: [
          {
            title: {
              contains:
                query,
              mode:
                "insensitive",
            },
          },
          {
            description: {
              contains:
                query,
              mode:
                "insensitive",
            },
          },
        ],
      },

      orderBy: {
        createdAt: "desc",
      },

      take:
        MAX_RESULTS_PER_TYPE,

      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        deadline: true,

        _count: {
          select: {
            tasks: {
              where: {
                assignees: {
                  some: {
                    userId:
                      session.user.id,
                  },
                },
              },
            },
          },
        },
      },
    }),

    prisma.task.findMany({
      where: {
        assignees: {
          some: {
            userId:
              session.user.id,
          },
        },

        project: {
          members: {
            some: {
              userId:
                session.user.id,
            },
          },
        },

        OR: [
          {
            title: {
              contains:
                query,
              mode:
                "insensitive",
            },
          },
          {
            description: {
              contains:
                query,
              mode:
                "insensitive",
            },
          },
          {
            project: {
              title: {
                contains:
                  query,
                mode:
                  "insensitive",
              },
            },
          },
        ],
      },

      orderBy: {
        createdAt: "desc",
      },

      take:
        MAX_RESULTS_PER_TYPE,

      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        deadline: true,

        project: {
          select: {
            id: true,
            title: true,
          },
        },

        subProject: {
          select: {
            id: true,
            type: true,
          },
        },
      },
    }),
  ]);

  return {
    query,

    employees: [],

    projects:
      projects.map(
        (project) => ({
          id:
            project.id,

          title:
            project.title,

          subtitle:
            project.description ??
            "بدون توضیحات",

          meta:
            `${project._count.tasks} Task اختصاص‌یافته به شما`,

          status:
            project.status,

          deadline:
            project.deadline,

          href:
            `/employee/projects/${project.id}`,
        }),
      ),

    tasks:
      tasks.map(
        (task) => ({
          id:
            task.id,

          title:
            task.title,

          subtitle:
            task.project.title,

          meta:
            "Task اختصاص‌یافته به شما",

          status:
            task.status,

          priority:
            task.priority,

          deadline:
            task.deadline,

          href:
            `/employee/tasks/${task.id}`,
        }),
      ),

    total:
      projects.length +
      tasks.length,
  };
}