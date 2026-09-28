import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  requireAdmin,
  requireUser,
} from "@/lib/auth/guards";

import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  setTaskOccurrenceStatusSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/lib/validations/task";

import {
  notifyTaskAssigned,
  notifyTaskCompleted,
  notifyTaskStatusChanged,
} from "@/lib/services/notification.service";

type RecurrenceType =
  | "NONE"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

type RecurrenceConfig = {
  isRecurring: boolean;
  recurrenceType: RecurrenceType;
  recurrenceStartDate: Date | null;
  recurrenceEndDate: Date | null;
  recurrenceWeekdays: number[];
  recurrenceDayOfMonth: number | null;
  recurrenceActive: boolean;
};

type TaskForAccess = {
  id: string;
  title: string;
  description: string | null;
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT";
  deadline: Date;
  completedAt: Date | null;

  assignedToId: string;
  createdById: string;
  projectId: string;

  isRecurring: boolean;
  recurrenceType: RecurrenceType;
  recurrenceStartDate: Date | null;
  recurrenceEndDate: Date | null;
  recurrenceWeekdays: number[];
  recurrenceDayOfMonth: number | null;
  recurrenceActive: boolean;

  createdAt: Date;
  updatedAt: Date;

  project: {
    id: string;
    title: string;
    status:
      | "PLANNED"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "ARCHIVED";
    deadline: Date;
  };

  assignedTo: {
    id: string;
    name: string;
    email: string;
  };

  createdBy: {
    id: string;
    name: string;
  };
};

/* -------------------------------------------------------------------------- */
/* Date helpers                                                               */
/* -------------------------------------------------------------------------- */

function toDateOnly(date: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );
}

function getTodayDateOnly() {
  return toDateOnly(new Date());
}

function getDateKey(date: Date) {
  const normalized = toDateOnly(date);

  return [
    normalized.getUTCFullYear(),
    String(
      normalized.getUTCMonth() + 1,
    ).padStart(2, "0"),
    String(
      normalized.getUTCDate(),
    ).padStart(2, "0"),
  ].join("-");
}

function isSameDate(
  first: Date,
  second: Date,
) {
  return (
    getDateKey(first) ===
    getDateKey(second)
  );
}

function isDateBefore(
  first: Date,
  second: Date,
) {
  return (
    toDateOnly(first).getTime() <
    toDateOnly(second).getTime()
  );
}

function isDateAfter(
  first: Date,
  second: Date,
) {
  return (
    toDateOnly(first).getTime() >
    toDateOnly(second).getTime()
  );
}

function getIsoWeekday(date: Date) {
  const day = toDateOnly(date).getUTCDay();

  return day === 0 ? 7 : day;
}

/* -------------------------------------------------------------------------- */
/* Recurrence helpers                                                         */
/* -------------------------------------------------------------------------- */

/**
 * روزهای هفته:
 *
 * 1 = دوشنبه
 * 2 = سه‌شنبه
 * 3 = چهارشنبه
 * 4 = پنج‌شنبه
 * 5 = جمعه
 * 6 = شنبه
 * 7 = یکشنبه
 */
export function isTaskScheduledForDate(
  recurrence: RecurrenceConfig,
  date: Date,
) {
  if (!recurrence.isRecurring) {
    return false;
  }

  if (!recurrence.recurrenceActive) {
    return false;
  }

  if (!recurrence.recurrenceStartDate) {
    return false;
  }

  const targetDate = toDateOnly(date);
  const startDate = toDateOnly(
    recurrence.recurrenceStartDate,
  );

  if (
    isDateBefore(
      targetDate,
      startDate,
    )
  ) {
    return false;
  }

  if (
    recurrence.recurrenceEndDate &&
    isDateAfter(
      targetDate,
      recurrence.recurrenceEndDate,
    )
  ) {
    return false;
  }

  switch (recurrence.recurrenceType) {
    case "DAILY":
      return true;

    case "WEEKLY":
      return recurrence.recurrenceWeekdays.includes(
        getIsoWeekday(targetDate),
      );

    case "MONTHLY":
      return (
        recurrence.recurrenceDayOfMonth ===
        targetDate.getUTCDate()
      );

    case "NONE":
    default:
      return false;
  }
}

function validateRecurrenceConfig(
  config: RecurrenceConfig,
) {
  if (!config.isRecurring) {
    return;
  }

  if (
    config.recurrenceType === "NONE"
  ) {
    throw new Error(
      "RECURRENCE_INVALID",
    );
  }

  if (!config.recurrenceStartDate) {
    throw new Error(
      "RECURRENCE_INVALID",
    );
  }

  if (
    config.recurrenceEndDate &&
    isDateBefore(
      config.recurrenceEndDate,
      config.recurrenceStartDate,
    )
  ) {
    throw new Error(
      "RECURRENCE_INVALID",
    );
  }

  if (
    config.recurrenceType ===
      "WEEKLY" &&
    config.recurrenceWeekdays.length === 0
  ) {
    throw new Error(
      "RECURRENCE_INVALID",
    );
  }

  if (
    config.recurrenceType ===
      "MONTHLY"
  ) {
    const day =
      config.recurrenceDayOfMonth;

    if (
      day === null ||
      day < 1 ||
      day > 31
    ) {
      throw new Error(
        "RECURRENCE_INVALID",
      );
    }
  }
}

function buildCreateRecurrenceConfig(
  input: CreateTaskInput,
): RecurrenceConfig {
  const config: RecurrenceConfig = {
    isRecurring:
      input.isRecurring,

    recurrenceType:
      input.recurrenceType,

    recurrenceStartDate:
      input.recurrenceStartDate
        ? toDateOnly(
            input.recurrenceStartDate,
          )
        : null,

    recurrenceEndDate:
      input.recurrenceEndDate
        ? toDateOnly(
            input.recurrenceEndDate,
          )
        : null,

    recurrenceWeekdays:
      input.recurrenceWeekdays ??
      [],

    recurrenceDayOfMonth:
      input.recurrenceDayOfMonth ??
      null,

    recurrenceActive:
      input.recurrenceActive,
  };

  validateRecurrenceConfig(
    config,
  );

  return config;
}

function buildUpdateRecurrenceConfig(
  existingTask: {
    isRecurring: boolean;
    recurrenceType: RecurrenceType;
    recurrenceStartDate: Date | null;
    recurrenceEndDate: Date | null;
    recurrenceWeekdays: number[];
    recurrenceDayOfMonth: number | null;
    recurrenceActive: boolean;
    deadline: Date;
  },
  input: UpdateTaskInput,
) {
  const isRecurring =
    input.isRecurring ??
    existingTask.isRecurring;

  const recurrenceType =
    input.recurrenceType ??
    existingTask.recurrenceType;

  const recurrenceStartDate =
    input.recurrenceStartDate !==
    undefined
      ? input.recurrenceStartDate
        ? toDateOnly(
            input.recurrenceStartDate,
          )
        : null
      : existingTask.recurrenceStartDate
        ? toDateOnly(
            existingTask.recurrenceStartDate,
          )
        : null;

  const recurrenceEndDate =
    input.recurrenceEndDate !==
    undefined
      ? input.recurrenceEndDate
        ? toDateOnly(
            input.recurrenceEndDate,
          )
        : null
      : existingTask.recurrenceEndDate
        ? toDateOnly(
            existingTask.recurrenceEndDate,
          )
        : null;

  const recurrenceWeekdays =
    input.recurrenceWeekdays ??
    existingTask.recurrenceWeekdays;

  const recurrenceDayOfMonth =
    input.recurrenceDayOfMonth !==
    undefined
      ? input.recurrenceDayOfMonth
      : existingTask.recurrenceDayOfMonth;

  const recurrenceActive =
    input.recurrenceActive ??
    existingTask.recurrenceActive;

  const config: RecurrenceConfig = {
    isRecurring,
    recurrenceType,
    recurrenceStartDate,
    recurrenceEndDate,
    recurrenceWeekdays,
    recurrenceDayOfMonth,
    recurrenceActive,
  };

  validateRecurrenceConfig(
    config,
  );

  /*
   * Task معمولی:
   * deadline باید حتماً وجود داشته باشد.
   *
   * Task تکرارشونده:
   * deadline داخلی برابر تاریخ شروع recurrence خواهد بود.
   */
  const requestedDeadline =
    input.deadline !== undefined
      ? input.deadline
      : existingTask.deadline;

  const effectiveDeadline =
    isRecurring
      ? recurrenceStartDate ??
        requestedDeadline
      : requestedDeadline;

  if (!effectiveDeadline) {
    throw new Error(
      "DEADLINE_REQUIRED",
    );
  }

  return {
    config,
    deadline:
      effectiveDeadline,
  };
}

/* -------------------------------------------------------------------------- */
/* Access helper                                                             */
/* -------------------------------------------------------------------------- */

async function getAccessibleTask(
  taskId: string,
  userId: string,
  isAdmin: boolean,
): Promise<TaskForAccess | null> {
  const where = isAdmin
    ? {
        id: taskId,
      }
    : {
        id: taskId,

        assignedToId:
          userId,

        project: {
          members: {
            some: {
              userId,
            },
          },
        },
      };

  return prisma.task.findFirst({
    where,

    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      deadline: true,
      completedAt: true,

      assignedToId: true,
      createdById: true,
      projectId: true,

      isRecurring: true,
      recurrenceType: true,
      recurrenceStartDate: true,
      recurrenceEndDate: true,
      recurrenceWeekdays: true,
      recurrenceDayOfMonth: true,
      recurrenceActive: true,

      createdAt: true,
      updatedAt: true,

      project: {
        select: {
          id: true,
          title: true,
          status: true,
          deadline: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Occurrence creation                                                       */
/* -------------------------------------------------------------------------- */

export async function ensureTaskOccurrence(
  taskId: string,
  occurrenceDate: Date,
) {
  const task =
    await prisma.task.findUnique({
      where: {
        id: taskId,
      },

      select: {
        id: true,

        isRecurring: true,
        recurrenceType: true,
        recurrenceStartDate: true,
        recurrenceEndDate: true,
        recurrenceWeekdays: true,
        recurrenceDayOfMonth: true,
        recurrenceActive: true,
      },
    });

  if (
    !task ||
    !task.isRecurring
  ) {
    return null;
  }

  const normalizedDate =
    toDateOnly(
      occurrenceDate,
    );

  const config: RecurrenceConfig = {
    isRecurring:
      task.isRecurring,

    recurrenceType:
      task.recurrenceType,

    recurrenceStartDate:
      task.recurrenceStartDate,

    recurrenceEndDate:
      task.recurrenceEndDate,

    recurrenceWeekdays:
      task.recurrenceWeekdays,

    recurrenceDayOfMonth:
      task.recurrenceDayOfMonth,

    recurrenceActive:
      task.recurrenceActive,
  };

  if (
    !isTaskScheduledForDate(
      config,
      normalizedDate,
    )
  ) {
    return null;
  }

  return prisma.taskOccurrence.upsert({
    where: {
      taskId_occurrenceDate: {
        taskId,

        occurrenceDate:
          normalizedDate,
      },
    },

    create: {
      taskId,

      occurrenceDate:
        normalizedDate,
    },

    update: {},
  });
}

/* -------------------------------------------------------------------------- */
/* Task queries                                                               */
/* -------------------------------------------------------------------------- */

export async function getAdminTasks() {
  await requireAdmin();

  const tasks =
    await prisma.task.findMany({
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

        isRecurring: true,
        recurrenceType: true,
        recurrenceStartDate: true,
        recurrenceEndDate: true,
        recurrenceWeekdays: true,
        recurrenceDayOfMonth: true,
        recurrenceActive: true,

        createdAt: true,
        updatedAt: true,

        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },

        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },

        _count: {
          select: {
            comments: true,
            attachments: true,
            occurrences: true,
          },
        },
      },
    });

  const today =
    getTodayDateOnly();

  return Promise.all(
    tasks.map(
      async (task) => {
        const todayOccurrence =
          task.isRecurring
            ? await ensureTaskOccurrence(
                task.id,
                today,
              )
            : null;

        return {
          ...task,
          todayOccurrence,
        };
      },
    ),
  );
}

export async function getEmployeeTasks() {
  const session =
    await requireUser();

  if (
    session.user.role ===
    "ADMIN"
  ) {
    return getAdminTasks();
  }

  const tasks =
    await prisma.task.findMany({
      where: {
        assignedToId:
          session.user.id,

        project: {
          members: {
            some: {
              userId:
                session.user.id,
            },
          },
        },
      },

      orderBy: [
        {
          deadline: "asc",
        },
        {
          createdAt: "desc",
        },
      ],

      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        deadline: true,
        completedAt: true,

        isRecurring: true,
        recurrenceType: true,
        recurrenceStartDate: true,
        recurrenceEndDate: true,
        recurrenceWeekdays: true,
        recurrenceDayOfMonth: true,
        recurrenceActive: true,

        createdAt: true,
        updatedAt: true,

        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },

        _count: {
          select: {
            comments: true,
            attachments: true,
            occurrences: true,
          },
        },
      },
    });

  const today =
    getTodayDateOnly();

  return Promise.all(
    tasks.map(
      async (task) => {
        const todayOccurrence =
          task.isRecurring
            ? await ensureTaskOccurrence(
                task.id,
                today,
              )
            : null;

        return {
          ...task,
          todayOccurrence,
        };
      },
    ),
  );
}

export async function getTaskById(
  taskId: string,
) {
  const session =
    await requireUser();

  const task =
    await getAccessibleTask(
      taskId,
      session.user.id,
      session.user.role ===
        "ADMIN",
    );

  if (!task) {
    return null;
  }

  const today =
    getTodayDateOnly();

  const todayOccurrence =
    task.isRecurring
      ? await ensureTaskOccurrence(
          task.id,
          today,
        )
      : null;

  const occurrences =
    task.isRecurring
      ? await prisma.taskOccurrence.findMany(
          {
            where: {
              taskId:
                task.id,
            },

            orderBy: {
              occurrenceDate:
                "desc",
            },

            take: 90,

            select: {
              id: true,
              occurrenceDate: true,
              completed: true,
              completedAt: true,

              completedBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        )
      : [];

  const comments =
    await prisma.taskComment.findMany(
      {
        where: {
          taskId: task.id,
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
      },
    );

  const attachments =
    await prisma.taskAttachment.findMany(
      {
        where: {
          taskId: task.id,
        },

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          fileName: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,

          uploadedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    );

  return {
    id: task.id,

    title: task.title,
    description: task.description,

    status: task.status,
    priority: task.priority,

    deadline: task.deadline,
    completedAt:
      task.completedAt,

    isRecurring:
      task.isRecurring,

    recurrenceType:
      task.recurrenceType,

    recurrenceStartDate:
      task.recurrenceStartDate,

    recurrenceEndDate:
      task.recurrenceEndDate,

    recurrenceWeekdays:
      task.recurrenceWeekdays,

    recurrenceDayOfMonth:
      task.recurrenceDayOfMonth,

    recurrenceActive:
      task.recurrenceActive,

    createdAt:
      task.createdAt,

    updatedAt:
      task.updatedAt,

    todayOccurrence,

    occurrences,

    project: {
      id:
        task.project.id,

      title:
        task.project.title,

      status:
        task.project.status,

      deadline:
        task.project.deadline,
    },

    assignedTo: {
      id:
        task.assignedTo.id,

      name:
        task.assignedTo.name,

      email:
        task.assignedTo.email,
    },

    createdBy: {
      id:
        task.createdBy.id,

      name:
        task.createdBy.name,
    },

    comments,

    attachments,
  };
}

/* -------------------------------------------------------------------------- */
/* Create task                                                                */
/* -------------------------------------------------------------------------- */

export async function createTask(
  input: CreateTaskInput,
) {
  const session =
    await requireAdmin();

  const validated =
    createTaskSchema.parse(input);

  const project =
    await prisma.project.findUnique({
      where: {
        id:
          validated.projectId,
      },

      select: {
        id: true,
        title: true,
      },
    });

  if (!project) {
    throw new Error(
      "PROJECT_NOT_FOUND",
    );
  }

  const employee =
    await prisma.user.findFirst({
      where: {
        id:
          validated.assignedToId,

        role:
          "EMPLOYEE",

        isActive:
          true,
      },

      select: {
        id: true,
        name: true,
      },
    });

  if (!employee) {
    throw new Error(
      "EMPLOYEE_NOT_FOUND",
    );
  }

  const membership =
    await prisma.projectMember.findUnique(
      {
        where: {
          projectId_userId: {
            projectId:
              validated.projectId,

            userId:
              validated.assignedToId,
          },
        },

        select: {
          id: true,
        },
      },
    );

  if (!membership) {
    throw new Error(
      "EMPLOYEE_NOT_PROJECT_MEMBER",
    );
  }

  const recurrence =
    buildCreateRecurrenceConfig(
      validated,
    );

  const effectiveDeadline =
    recurrence.isRecurring
      ? recurrence.recurrenceStartDate ??
        validated.deadline
      : validated.deadline;

  if (!effectiveDeadline) {
    throw new Error(
      "DEADLINE_REQUIRED",
    );
  }

  const task =
    await prisma.task.create({
      data: {
        projectId:
          validated.projectId,

        title:
          validated.title,

        description:
          validated.description?.trim() ||
          null,

        assignedToId:
          validated.assignedToId,

        createdById:
          session.user.id,

        priority:
          validated.priority,

        deadline:
          effectiveDeadline,

        isRecurring:
          recurrence.isRecurring,

        recurrenceType:
          recurrence.recurrenceType,

        recurrenceStartDate:
          recurrence.recurrenceStartDate,

        recurrenceEndDate:
          recurrence.recurrenceEndDate,

        recurrenceWeekdays:
          recurrence.recurrenceWeekdays,

        recurrenceDayOfMonth:
          recurrence.recurrenceDayOfMonth,

        recurrenceActive:
          recurrence.recurrenceActive,
      },

      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        deadline: true,
        createdAt: true,

        isRecurring: true,
        recurrenceType: true,
        recurrenceStartDate: true,
        recurrenceEndDate: true,
        recurrenceWeekdays: true,
        recurrenceDayOfMonth: true,
        recurrenceActive: true,

        project: {
          select: {
            id: true,
            title: true,
          },
        },

        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  /*
   * برای Task روزانه/هفتگی/ماهانه،
   * occurrence تاریخ شروع فقط در صورتی ایجاد می‌شود
   * که خود آن تاریخ در schedule قرار بگیرد.
   */
  if (
    task.isRecurring &&
    recurrence.recurrenceStartDate
  ) {
    await ensureTaskOccurrence(
      task.id,
      recurrence.recurrenceStartDate,
    );
  }

  await prisma.activityLog.create({
    data: {
      userId:
        session.user.id,

      action:
        "TASK_CREATED",

      entityType:
        "TASK",

      entityId:
        task.id,

      metadata: {
        projectId:
          task.project.id,

        assignedToId:
          task.assignedTo.id,

        isRecurring:
          task.isRecurring,

        recurrenceType:
          task.recurrenceType,

        recurrenceStartDate:
          recurrence.recurrenceStartDate
            ? getDateKey(
                recurrence.recurrenceStartDate,
              )
            : null,
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      userId:
        session.user.id,

      action:
        "TASK_ASSIGNED",

      entityType:
        "TASK",

      entityId:
        task.id,

      metadata: {
        assignedToId:
          task.assignedTo.id,

        assignedToName:
          task.assignedTo.name,
      },
    },
  });

  try {
    await notifyTaskAssigned({
      userId:
        task.assignedTo.id,

      taskId:
        task.id,

      taskTitle:
        task.title,

      projectTitle:
        task.project.title,
    });
  } catch (error) {
    console.error(
      "Failed to create task assignment notification:",
      error,
    );
  }

  return task;
}

/* -------------------------------------------------------------------------- */
/* Update task                                                                */
/* -------------------------------------------------------------------------- */

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
) {
  const session =
    await requireAdmin();

  const validated =
    updateTaskSchema.parse(input);

  const existingTask =
    await prisma.task.findUnique({
      where: {
        id: taskId,
      },

      select: {
        id: true,
        title: true,
        assignedToId: true,
        priority: true,
        deadline: true,

        isRecurring: true,
        recurrenceType: true,
        recurrenceStartDate: true,
        recurrenceEndDate: true,
        recurrenceWeekdays: true,
        recurrenceDayOfMonth: true,
        recurrenceActive: true,

        projectId: true,

        project: {
          select: {
            title: true,
          },
        },
      },
    });

  if (!existingTask) {
    throw new Error(
      "TASK_NOT_FOUND",
    );
  }

  if (
    validated.assignedToId !==
    undefined
  ) {
    const employee =
      await prisma.user.findFirst({
        where: {
          id:
            validated.assignedToId,

          role:
            "EMPLOYEE",

          isActive:
            true,
        },

        select: {
          id: true,
        },
      });

    if (!employee) {
      throw new Error(
        "EMPLOYEE_NOT_FOUND",
      );
    }

    const membership =
      await prisma.projectMember.findUnique(
        {
          where: {
            projectId_userId: {
              projectId:
                existingTask.projectId,

              userId:
                validated.assignedToId,
            },
          },

          select: {
            id: true,
          },
        },
      );

    if (!membership) {
      throw new Error(
        "EMPLOYEE_NOT_PROJECT_MEMBER",
      );
    }
  }

  const recurrence =
    buildUpdateRecurrenceConfig(
      existingTask,
      validated,
    );

  const task =
    await prisma.task.update({
      where: {
        id: taskId,
      },

      data: {
        ...(validated.title !==
          undefined && {
          title:
            validated.title,
        }),

        ...(validated.description !==
          undefined && {
          description:
            validated.description?.trim() ||
            null,
        }),

        ...(validated.assignedToId !==
          undefined && {
          assignedToId:
            validated.assignedToId,
        }),

        ...(validated.priority !==
          undefined && {
          priority:
            validated.priority,
        }),

        deadline:
          recurrence.deadline,

        isRecurring:
          recurrence.config
            .isRecurring,

        recurrenceType:
          recurrence.config
            .recurrenceType,

        recurrenceStartDate:
          recurrence.config
            .recurrenceStartDate,

        recurrenceEndDate:
          recurrence.config
            .recurrenceEndDate,

        recurrenceWeekdays:
          recurrence.config
            .recurrenceWeekdays,

        recurrenceDayOfMonth:
          recurrence.config
            .recurrenceDayOfMonth,

        recurrenceActive:
          recurrence.config
            .recurrenceActive,
      },

      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        deadline: true,
        completedAt: true,
        updatedAt: true,

        isRecurring: true,
        recurrenceType: true,
        recurrenceStartDate: true,
        recurrenceEndDate: true,
        recurrenceWeekdays: true,
        recurrenceDayOfMonth: true,
        recurrenceActive: true,

        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },

        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

  await prisma.activityLog.create({
    data: {
      userId:
        session.user.id,

      action:
        "TASK_UPDATED",

      entityType:
        "TASK",

      entityId:
        task.id,

      metadata: {
        changedFields:
          Object.keys(
            validated,
          ),

        isRecurring:
          task.isRecurring,

        recurrenceType:
          task.recurrenceType,
      },
    },
  });

  if (
    validated.assignedToId !==
      undefined &&
    validated.assignedToId !==
      existingTask.assignedToId
  ) {
    await prisma.activityLog.create({
      data: {
        userId:
          session.user.id,

        action:
          "TASK_ASSIGNED",

        entityType:
          "TASK",

        entityId:
          task.id,

        metadata: {
          oldAssignedToId:
            existingTask.assignedToId,

          newAssignedToId:
            validated.assignedToId,
        },
      },
    });

    try {
      await notifyTaskAssigned({
        userId:
          task.assignedTo.id,

        taskId:
          task.id,

        taskTitle:
          task.title,

        projectTitle:
          task.project.title,
      });
    } catch (error) {
      console.error(
        "Failed to create task reassignment notification:",
        error,
      );
    }
  }

  if (
    validated.priority !==
      undefined &&
    validated.priority !==
      existingTask.priority
  ) {
    await prisma.activityLog.create({
      data: {
        userId:
          session.user.id,

        action:
          "TASK_PRIORITY_CHANGED",

        entityType:
          "TASK",

        entityId:
          task.id,

        metadata: {
          oldPriority:
            existingTask.priority,

          newPriority:
            validated.priority,
        },
      },
    });
  }

  if (
    recurrence.deadline.getTime() !==
    existingTask.deadline.getTime()
  ) {
    await prisma.activityLog.create({
      data: {
        userId:
          session.user.id,

        action:
          "TASK_DEADLINE_CHANGED",

        entityType:
          "TASK",

        entityId:
          task.id,

        metadata: {
          oldDeadline:
            existingTask.deadline.toISOString(),

          newDeadline:
            recurrence.deadline.toISOString(),
        },
      },
    });
  }

  /*
   * اگر Task تازه recurring شده باشد،
   * occurrence تاریخ شروع در صورت معتبر بودن schedule
   * ایجاد می‌شود.
   */
  if (
    task.isRecurring &&
    recurrence.config
      .recurrenceStartDate
  ) {
    await ensureTaskOccurrence(
      task.id,
      recurrence.config
        .recurrenceStartDate,
    );
  }

  return task;
}

/* -------------------------------------------------------------------------- */
/* Normal task status                                                         */
/* -------------------------------------------------------------------------- */

export async function updateTaskStatus(
  taskId: string,
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED",
) {
  const session =
    await requireUser();

  const validated =
    updateTaskStatusSchema.parse({
      taskId,
      status,
    });

  const task =
    await getAccessibleTask(
      validated.taskId,
      session.user.id,
      session.user.role ===
        "ADMIN",
    );

  if (!task) {
    throw new Error(
      "TASK_NOT_FOUND",
    );
  }

  /*
   * وضعیت parent برای recurring task
   * نباید نماینده completion روزانه باشد.
   */
  if (task.isRecurring) {
    throw new Error(
      "RECURRING_TASK_STATUS_USE_OCCURRENCE",
    );
  }

  const completedAt =
    validated.status ===
    "COMPLETED"
      ? task.completedAt ??
        new Date()
      : null;

  const updatedTask =
    await prisma.task.update({
      where: {
        id:
          validated.taskId,
      },

      data: {
        status:
          validated.status,

        completedAt,
      },

      select: {
        id: true,
        title: true,
        status: true,
        completedAt: true,
        assignedToId: true,
        createdById: true,
      },
    });

  await prisma.activityLog.create({
    data: {
      userId:
        session.user.id,

      action:
        validated.status ===
        "COMPLETED"
          ? "TASK_COMPLETED"
          : "TASK_STATUS_CHANGED",

      entityType:
        "TASK",

      entityId:
        validated.taskId,

      metadata: {
        oldStatus:
          task.status,

        newStatus:
          validated.status,
      },
    },
  });

  if (
    validated.status ===
    "COMPLETED"
  ) {
    const notificationUserId =
      session.user.role ===
      "ADMIN"
        ? task.assignedToId
        : task.createdById;

    if (
      notificationUserId !==
      session.user.id
    ) {
      try {
        await notifyTaskCompleted({
          userId:
            notificationUserId,

          taskId:
            task.id,

          taskTitle:
            task.title,
        });
      } catch (error) {
        console.error(
          "Failed to create task completion notification:",
          error,
        );
      }
    }
  } else if (
    session.user.role ===
      "ADMIN" &&
    validated.status !==
      task.status
  ) {
    try {
      await notifyTaskStatusChanged({
        userId:
          task.assignedToId,

        taskId:
          task.id,

        taskTitle:
          task.title,

        newStatus:
          validated.status,
      });
    } catch (error) {
      console.error(
        "Failed to create task status notification:",
        error,
      );
    }
  }

  return updatedTask;
}

/* -------------------------------------------------------------------------- */
/* Recurring occurrence                                                       */
/* -------------------------------------------------------------------------- */

export async function getTaskOccurrence(
  taskId: string,
  occurrenceDate: Date,
) {
  const session =
    await requireUser();

  const task =
    await getAccessibleTask(
      taskId,
      session.user.id,
      session.user.role ===
        "ADMIN",
    );

  if (!task) {
    throw new Error(
      "TASK_NOT_FOUND",
    );
  }

  if (!task.isRecurring) {
    return null;
  }

  const normalizedDate =
    toDateOnly(
      occurrenceDate,
    );

  /*
   * اگر occurrence از قبل وجود دارد،
   * آن را برمی‌گردانیم تا تاریخچه از بین نرود.
   */
  const existingOccurrence =
    await prisma.taskOccurrence.findUnique(
      {
        where: {
          taskId_occurrenceDate: {
            taskId:
              task.id,

            occurrenceDate:
              normalizedDate,
          },
        },

        select: {
          id: true,
          occurrenceDate: true,
          completed: true,
          completedAt: true,

          completedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    );

  if (existingOccurrence) {
    return existingOccurrence;
  }

  /*
   * اگر occurrence مربوط به این تاریخ
   * هنوز ساخته نشده باشد، در صورت scheduled بودن
   * آن را ایجاد می‌کنیم.
   */
  return ensureTaskOccurrence(
    task.id,
    normalizedDate,
  );
}

export async function getTaskOccurrenceHistory(
  taskId: string,
  limit = 90,
) {
  const session =
    await requireUser();

  const task =
    await getAccessibleTask(
      taskId,
      session.user.id,
      session.user.role ===
        "ADMIN",
    );

  if (!task) {
    throw new Error(
      "TASK_NOT_FOUND",
    );
  }

  if (!task.isRecurring) {
    return [];
  }

  const safeLimit =
    Math.min(
      Math.max(
        Math.floor(limit),
        1,
      ),
      365,
    );

  return prisma.taskOccurrence.findMany(
    {
      where: {
        taskId,
      },

      orderBy: {
        occurrenceDate:
          "desc",
      },

      take: safeLimit,

      select: {
        id: true,
        occurrenceDate: true,
        completed: true,
        completedAt: true,

        completedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  );
}

export async function setTaskOccurrenceStatus(
  taskId: string,
  occurrenceDate: Date,
  completed: boolean,
) {
  const session =
    await requireUser();

  const validated =
    setTaskOccurrenceStatusSchema.parse(
      {
        taskId,
        occurrenceDate,
        completed,
      },
    );

  const task =
    await getAccessibleTask(
      validated.taskId,
      session.user.id,
      session.user.role ===
        "ADMIN",
    );

  if (!task) {
    throw new Error(
      "TASK_NOT_FOUND",
    );
  }

  if (!task.isRecurring) {
    throw new Error(
      "RECURRING_TASK_REQUIRED",
    );
  }

  const normalizedDate =
    toDateOnly(
      validated.occurrenceDate,
    );

  const today =
    getTodayDateOnly();

  /*
   * Employee فقط اجازه دارد
   * occurrence همان روز را تکمیل کند.
   *
   * Admin می‌تواند تاریخ‌های دیگر را
   * برای مدیریت/اصلاح تاریخچه تغییر دهد.
   */
  if (
    session.user.role !==
      "ADMIN" &&
    !isSameDate(
      normalizedDate,
      today,
    )
  ) {
    throw new Error(
      "OCCURRENCE_DATE_NOT_ALLOWED",
    );
  }

  /*
   * Task غیرفعال دیگر occurrence جدید تولید نمی‌کند.
   * Admin همچنان امکان مدیریت occurrenceهای قبلی را دارد.
   */
  if (
    session.user.role !==
      "ADMIN" &&
    !task.recurrenceActive
  ) {
    throw new Error(
      "RECURRENCE_INACTIVE",
    );
  }

  const recurrence: RecurrenceConfig =
    {
      isRecurring:
        task.isRecurring,

      recurrenceType:
        task.recurrenceType,

      recurrenceStartDate:
        task.recurrenceStartDate,

      recurrenceEndDate:
        task.recurrenceEndDate,

      recurrenceWeekdays:
        task.recurrenceWeekdays,

      recurrenceDayOfMonth:
        task.recurrenceDayOfMonth,

      recurrenceActive:
        task.recurrenceActive,
    };

  const scheduled =
    isTaskScheduledForDate(
      recurrence,
      normalizedDate,
    );

  const existingOccurrence =
    await prisma.taskOccurrence.findUnique(
      {
        where: {
          taskId_occurrenceDate: {
            taskId:
              task.id,

            occurrenceDate:
              normalizedDate,
          },
        },
      },
    );

  /*
   * occurrence موجود می‌تواند
   * بخشی از تاریخچه باشد و Admin بتواند آن را تغییر دهد.
   *
   * برای occurrence جدید، تاریخ باید واقعاً
   * در برنامه recurring قرار داشته باشد.
   */
  if (
    !scheduled &&
    !existingOccurrence
  ) {
    throw new Error(
      "OCCURRENCE_NOT_SCHEDULED",
    );
  }

  let occurrence =
    existingOccurrence;

  if (!occurrence) {
    occurrence =
      await ensureTaskOccurrence(
        task.id,
        normalizedDate,
      );
  }

  if (!occurrence) {
    throw new Error(
      "OCCURRENCE_NOT_SCHEDULED",
    );
  }

  const now =
    new Date();

  const updatedOccurrence =
    await prisma.taskOccurrence.update(
      {
        where: {
          id:
            occurrence.id,
        },

        data: {
          completed:
            validated.completed,

          completedAt:
            validated.completed
              ? occurrence.completedAt ??
                now
              : null,

          completedById:
            validated.completed
              ? session.user.id
              : null,
        },

        select: {
          id: true,
          taskId: true,
          occurrenceDate: true,
          completed: true,
          completedAt: true,

          completedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    );

  await prisma.activityLog.create({
    data: {
      userId:
        session.user.id,

      action:
        validated.completed
          ? "TASK_COMPLETED"
          : "TASK_STATUS_CHANGED",

      entityType:
        "TASK",

      entityId:
        task.id,

      metadata: {
        recurring:
          true,

        occurrenceId:
          occurrence.id,

        occurrenceDate:
          getDateKey(
            normalizedDate,
          ),

        completed:
          validated.completed,
      },
    },
  });

  /*
   * هنگام تکمیل occurrence،
   * به صاحب Task اطلاع داده می‌شود.
   */
  if (
    validated.completed
  ) {
    const notificationUserId =
      session.user.role ===
      "ADMIN"
        ? task.assignedToId
        : task.createdById;

    if (
      notificationUserId !==
      session.user.id
    ) {
      try {
        await notifyTaskCompleted({
          userId:
            notificationUserId,

          taskId:
            task.id,

          taskTitle:
            task.title,
        });
      } catch (error) {
        console.error(
          "Failed to create recurring task completion notification:",
          error,
        );
      }
    }
  }

  return updatedOccurrence;
}

/* -------------------------------------------------------------------------- */
/* Delete task                                                                */
/* -------------------------------------------------------------------------- */

export async function deleteTask(
  taskId: string,
) {
  const session =
    await requireAdmin();

  const task =
    await prisma.task.findUnique({
      where: {
        id: taskId,
      },

      select: {
        id: true,
        title: true,
      },
    });

  if (!task) {
    throw new Error(
      "TASK_NOT_FOUND",
    );
  }

  /*
   * به دلیل onDelete: Cascade،
   * occurrenceهای Task نیز حذف می‌شوند.
   */
  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId:
        session.user.id,

      action:
        "TASK_DELETED",

      entityType:
        "TASK",

      entityId:
        taskId,

      metadata: {
        title:
          task.title,
      },
    },
  });

  return {
    success: true,
  };
}

/* -------------------------------------------------------------------------- */
/* Deadline helper                                                            */
/* -------------------------------------------------------------------------- */

export function isTaskOverdue(
  deadline: Date,
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED",
  now = new Date(),
) {
  return (
    deadline < now &&
    status !==
      "COMPLETED" &&
    status !==
      "CANCELLED"
  );
}
export async function getAdminRecurringTasksToday() {
  await requireAdmin();

  const now = new Date();

  const today = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );

  const rows = await prisma.task.findMany({
    where: {
      isRecurring: true,
      recurrenceActive: true,
      recurrenceType: {
        not: "NONE",
      },
      recurrenceStartDate: {
        lte: today,
      },
      OR: [
        {
          recurrenceEndDate: null,
        },
        {
          recurrenceEndDate: {
            gte: today,
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      recurrenceType: true,
      recurrenceStartDate: true,
      recurrenceEndDate: true,
      recurrenceWeekdays: true,
      recurrenceDayOfMonth: true,

      project: {
        select: {
          id: true,
          title: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      occurrences: {
        where: {
          occurrenceDate: today,
        },
        take: 1,
        select: {
          id: true,
          occurrenceDate: true,
          completed: true,
          completedAt: true,
          completedById: true,
          completedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const isoWeekday =
    today.getUTCDay() === 0
      ? 7
      : today.getUTCDay();

  const dayOfMonth = today.getUTCDate();

  const scheduledRows = rows.filter((task) => {
    if (task.recurrenceType === "DAILY") {
      return true;
    }

    if (task.recurrenceType === "WEEKLY") {
      return task.recurrenceWeekdays.includes(
        isoWeekday,
      );
    }

    if (task.recurrenceType === "MONTHLY") {
      return (
        task.recurrenceDayOfMonth === dayOfMonth
      );
    }

    return false;
  });

  const result = await Promise.all(
    scheduledRows.map(async (task) => {
      const existingOccurrence =
        task.occurrences[0] ?? null;

      const todayOccurrence =
        existingOccurrence ??
        (await prisma.taskOccurrence.upsert({
          where: {
            taskId_occurrenceDate: {
              taskId: task.id,
              occurrenceDate: today,
            },
          },
          create: {
            taskId: task.id,
            occurrenceDate: today,
          },
          update: {},
          select: {
            id: true,
            occurrenceDate: true,
            completed: true,
            completedAt: true,
            completedById: true,
            completedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }));

      return {
        id: task.id,
        title: task.title,
        recurrenceType: task.recurrenceType,
        recurrenceStartDate:
          task.recurrenceStartDate,
        recurrenceEndDate:
          task.recurrenceEndDate,
        recurrenceWeekdays:
          task.recurrenceWeekdays,
        recurrenceDayOfMonth:
          task.recurrenceDayOfMonth,
        project: task.project,
        assignedTo: task.assignedTo,
        todayOccurrence,
      };
    }),
  );

  return result;
}