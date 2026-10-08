import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { isTaskScheduledForDate } from "@/lib/services/task.service";

type DayKey = string;

type QuickAccessAssignee = {
  id: string;
  name: string;
};

type QuickAccessTask = {
  id: string;
  title: string;

  project: {
    id: string;
    title: string;
  };

  assignees: QuickAccessAssignee[];

  /*
   * برای سازگاری با بخش‌هایی از UI فعلی،
   * اولین مسئول به‌عنوان assignedTo نیز برگردانده می‌شود.
   */
  assignedTo: QuickAccessAssignee;

  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT";

  deadline: Date | null;

  completedAt: Date | null;

  completedBy: {
    id: string;
    name: string;
  } | null;

  isRecurring: boolean;

  occurrenceDate: Date | null;

  source:
    | "NORMAL"
    | "RECURRING";

  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";

  completed: boolean;

  overdue: boolean;
};

export type AdminQuickAccessDay = {
  key: DayKey;

  label:
    | "امروز"
    | "دیروز"
    | "روز قبلش";

  date: Date;

  dateKey: string;

  overview: {
    planned: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };

  completedTasks: QuickAccessTask[];

  plannedTasks: QuickAccessTask[];

  overdueTasks: QuickAccessTask[];
};

type ActivityRow = {
  id: string;
  userId: string | null;
  action: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: Date;

  user: {
    id: string;
    name: string;
  } | null;
};

type NormalTaskRow = {
  id: string;

  title: string;

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

  assignees: {
    user: QuickAccessAssignee;
  }[];

  project: {
    id: string;
    title: string;
  };
};

type RecurringTaskRow = {
  id: string;

  title: string;

  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT";

  assignees: {
    user: QuickAccessAssignee;
  }[];

  project: {
    id: string;
    title: string;
  };

  isRecurring: boolean;

  recurrenceType:
    | "NONE"
    | "DAILY"
    | "WEEKLY"
    | "MONTHLY";

  recurrenceStartDate:
    Date | null;

  recurrenceEndDate:
    Date | null;

  recurrenceWeekdays: number[];

  recurrenceDayOfMonth:
    number | null;

  recurrenceActive: boolean;
};

type RecurringOccurrenceState = {
  completed: boolean;

  completedBy: {
    id: string;
    name: string;
  } | null;

  completedAt: Date | null;

  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
};

function getPrimaryAssignee(
  assignees: {
    user: QuickAccessAssignee;
  }[],
): QuickAccessAssignee {
  return (
    assignees[0]?.user ?? {
      id: "",
      name: "بدون مسئول",
    }
  );
}

function getAssignees(
  assignees: {
    user: QuickAccessAssignee;
  }[],
) {
  return assignees.map(
    (assignee) =>
      assignee.user,
  );
}

function toDateOnly(
  date: Date,
) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );
}

function getDateKey(
  date: Date,
) {
  const normalized =
    toDateOnly(date);

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

function startOfDay(
  date: Date,
) {
  return toDateOnly(date);
}

function endOfDay(
  date: Date,
) {
  const start =
    startOfDay(date);

  return new Date(
    Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate() + 1,
    ) - 1,
  );
}

function addDays(
  date: Date,
  amount: number,
) {
  const normalized =
    toDateOnly(date);

  return new Date(
    Date.UTC(
      normalized.getUTCFullYear(),
      normalized.getUTCMonth(),
      normalized.getUTCDate() +
        amount,
    ),
  );
}

function getRecentDays() {
  const today =
    startOfDay(
      new Date(),
    );

  return [
    {
      key:
        getDateKey(today),

      label:
        "امروز" as const,

      date:
        today,
    },

    {
      key:
        getDateKey(
          addDays(
            today,
            -1,
          ),
        ),

      label:
        "دیروز" as const,

      date:
        addDays(
          today,
          -1,
        ),
    },

    {
      key:
        getDateKey(
          addDays(
            today,
            -2,
          ),
        ),

      label:
        "روز قبلش" as const,

      date:
        addDays(
          today,
          -2,
        ),
    },
  ];
}

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null
  );
}

function getMetadataBoolean(
  metadata: unknown,
  key: string,
) {
  if (!isRecord(metadata)) {
    return undefined;
  }

  const value =
    metadata[key];

  return typeof value ===
    "boolean"
    ? value
    : undefined;
}

function getMetadataString(
  metadata: unknown,
  key: string,
) {
  if (!isRecord(metadata)) {
    return undefined;
  }

  const value =
    metadata[key];

  return typeof value ===
    "string"
    ? value
    : undefined;
}

function isRecurringActivity(
  activity: ActivityRow,
) {
  return (
    getMetadataBoolean(
      activity.metadata,
      "recurring",
    ) === true
  );
}

function getOccurrenceDateFromActivity(
  activity: ActivityRow,
) {
  return getMetadataString(
    activity.metadata,
    "occurrenceDate",
  );
}

function getActivityStatus(
  activity: ActivityRow,
):
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | null {
  if (
    activity.action ===
    "TASK_COMPLETED"
  ) {
    return "COMPLETED";
  }

  if (
    !isRecord(
      activity.metadata,
    )
  ) {
    return null;
  }

  const value =
    activity.metadata[
      "newStatus"
    ];

  if (
    value === "TODO" ||
    value === "IN_PROGRESS" ||
    value === "COMPLETED" ||
    value === "CANCELLED"
  ) {
    return value;
  }

  return null;
}

async function getActivityLogs(
  taskIds: string[],
  until: Date,
): Promise<ActivityRow[]> {
  if (
    taskIds.length ===
    0
  ) {
    return [];
  }

  const rows =
    await prisma.activityLog.findMany(
      {
        where: {
          entityType:
            "TASK",

          entityId: {
            in: taskIds,
          },

          action: {
            in: [
              "TASK_COMPLETED",
              "TASK_STATUS_CHANGED",
            ],
          },

          createdAt: {
            lte: until,
          },
        },

        orderBy: [
          {
            createdAt:
              "asc",
          },

          {
            id: "asc",
          },
        ],

        select: {
          id: true,
          userId: true,
          action: true,
          entityId: true,
          metadata: true,
          createdAt: true,

          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    );

  return rows.filter(
    (row) =>
      row.action ===
        "TASK_COMPLETED" ||
      row.action ===
        "TASK_STATUS_CHANGED",
  );
}

async function getRecentCompletionActivities(
  from: Date,
  to: Date,
): Promise<ActivityRow[]> {
  const rows =
    await prisma.activityLog.findMany(
      {
        where: {
          entityType:
            "TASK",

          action:
            "TASK_COMPLETED",

          createdAt: {
            gte: from,
            lte: to,
          },
        },

        orderBy: [
          {
            createdAt:
              "asc",
          },

          {
            id: "asc",
          },
        ],

        select: {
          id: true,
          userId: true,
          action: true,
          entityId: true,
          metadata: true,
          createdAt: true,

          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    );

  return rows.filter(
    (row) =>
      row.action ===
      "TASK_COMPLETED",
  );
}

function buildNormalTaskHistory(
  task: NormalTaskRow,
  activities: ActivityRow[],
  targetEnd: Date,
) {
  let currentStatus:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED" =
    "TODO";

  let completedAt:
    | Date
    | null = null;

  let completedBy:
    | {
        id: string;
        name: string;
      }
    | null = null;

  for (
    const activity of activities
  ) {
    if (
      activity.entityId !==
        task.id ||
      activity.createdAt >
        targetEnd ||
      isRecurringActivity(
        activity,
      )
    ) {
      continue;
    }

    const nextStatus =
      getActivityStatus(
        activity,
      );

    if (!nextStatus) {
      continue;
    }

    currentStatus =
      nextStatus;

    if (
      nextStatus ===
      "COMPLETED"
    ) {
      completedAt =
        activity.createdAt;

      completedBy =
        activity.user;
    } else {
      completedAt =
        null;

      completedBy =
        null;
    }
  }

  /*
   * برای داده‌های قدیمی که ActivityLog
   * کامل ندارند، completedAt خود Task را
   * نیز به عنوان fallback در نظر می‌گیریم.
   */
  if (
    currentStatus !==
      "COMPLETED" &&
    task.completedAt &&
    task.completedAt <=
      targetEnd
  ) {
    currentStatus =
      "COMPLETED";

    completedAt =
      task.completedAt;
  }

  const completed =
    currentStatus ===
    "COMPLETED";

  return {
    currentStatus,
    completed,
    completedAt,
    completedBy,
  };
}

function buildRecurringOccurrenceHistory(
  task: RecurringTaskRow,
  targetDate: Date,
  activities: ActivityRow[],
):
  RecurringOccurrenceState {
  const targetKey =
    getDateKey(
      targetDate,
    );

  let completed =
    false;

  let completedAt:
    | Date
    | null = null;

  let completedBy:
    | {
        id: string;
        name: string;
      }
    | null = null;

  let status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED" =
    "TODO";

  for (
    const activity of activities
  ) {
    if (
      activity.entityId !==
        task.id ||
      !isRecurringActivity(
        activity,
      )
    ) {
      continue;
    }

    const occurrenceDate =
      getOccurrenceDateFromActivity(
        activity,
      );

    if (
      occurrenceDate !==
      targetKey
    ) {
      continue;
    }

    const nextStatus =
      getActivityStatus(
        activity,
      );

    if (!nextStatus) {
      continue;
    }

    status =
      nextStatus;

    if (
      nextStatus ===
      "COMPLETED"
    ) {
      completed =
        true;

      completedAt =
        activity.createdAt;

      completedBy =
        activity.user;
    } else {
      completed =
        false;

      completedAt =
        null;

      completedBy =
        null;
    }
  }

  return {
    completed,
    completedAt,
    completedBy,
    status,
  };
}

function isRecurringScheduledOnDate(
  task: RecurringTaskRow,
  date: Date,
) {
  /*
   * recurrenceActive را برای تاریخ‌های گذشته
   * در تصمیم‌گیری دخالت نمی‌دهیم؛ چون ممکن است
   * Task بعداً غیرفعال شده باشد اما در تاریخ گذشته
   * واقعاً جزو برنامه بوده باشد.
   */
  return isTaskScheduledForDate(
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
        true,
    },
    date,
  );
}

function getCompletionRate(
  planned: number,
  completed: number,
) {
  if (
    planned === 0
  ) {
    return 0;
  }

  return Math.round(
    (completed /
      planned) *
      100,
  );
}

function sortTasks(
  tasks: QuickAccessTask[],
) {
  return [...tasks].sort(
    (
      first,
      second,
    ) => {
      if (
        first.completed !==
        second.completed
      ) {
        return first.completed
          ? -1
          : 1;
      }

      if (
        first.overdue !==
        second.overdue
      ) {
        return first.overdue
          ? -1
          : 1;
      }

      const firstTime =
        first.deadline?.getTime() ??
        Number.MAX_SAFE_INTEGER;

      const secondTime =
        second.deadline?.getTime() ??
        Number.MAX_SAFE_INTEGER;

      return (
        firstTime -
        secondTime
      );
    },
  );
}

export async function getAdminQuickAccessData(): Promise<
  AdminQuickAccessDay[]
> {
  await requireAdmin();

  const days =
    getRecentDays();

  const oldestDay =
    days[
      days.length - 1
    ];

  const newestDay =
    days[0];

  const oldestStart =
    startOfDay(
      oldestDay.date,
    );

  const newestEnd =
    endOfDay(
      newestDay.date,
    );

  /*
   * تکمیل‌های سه روز اخیر را جداگانه می‌گیریم
   * تا Task معمولی صرفاً به خاطر خارج بودن
   * Deadline از بازه، از گزارش حذف نشود.
   */
  const recentCompletionActivities =
    await getRecentCompletionActivities(
      oldestStart,
      newestEnd,
    );

  const completedNormalTaskIds =
    Array.from(
      new Set(
        recentCompletionActivities
          .filter(
            (activity) =>
              !isRecurringActivity(
                activity,
              ),
          )
          .map(
            (activity) =>
              activity.entityId,
          )
          .filter(
            (
              taskId,
            ): taskId is string =>
              Boolean(taskId),
          ),
      ),
    );

  const normalTasks =
    await prisma.task.findMany({
      where: {
        OR: [
          {
            deadline: {
              gte:
                oldestStart,
              lte:
                newestEnd,
            },
          },

          {
            id: {
              in:
                completedNormalTaskIds,
            },
          },
        ],
      },

      orderBy: {
        deadline:
          "asc",
      },

      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        deadline: true,
        completedAt: true,

        assignees: {
          orderBy: {
            assignedAt:
              "asc",
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

        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

  const recurringTasks =
    await prisma.task.findMany({
      where: {
        isRecurring:
          true,

        recurrenceType: {
          not:
            "NONE",
        },

        recurrenceStartDate: {
          lte:
            newestEnd,
        },

        OR: [
          {
            recurrenceEndDate:
              null,
          },

          {
            recurrenceEndDate: {
              gte:
                oldestStart,
            },
          },
        ],
      },

      orderBy: {
        createdAt:
          "desc",
      },

      select: {
        id: true,
        title: true,
        priority: true,

        assignees: {
          orderBy: {
            assignedAt:
              "asc",
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

        project: {
          select: {
            id: true,
            title: true,
          },
        },

        isRecurring:
          true,

        recurrenceType:
          true,

        recurrenceStartDate:
          true,

        recurrenceEndDate:
          true,

        recurrenceWeekdays:
          true,

        recurrenceDayOfMonth:
          true,

        recurrenceActive:
          true,
      },
    });

  const taskIds = [
    ...normalTasks.map(
      (task) =>
        task.id,
    ),

    ...recurringTasks.map(
      (task) =>
        task.id,
    ),
  ];

  const activities =
    await getActivityLogs(
      taskIds,
      newestEnd,
    );

  const activitiesByTask =
    new Map<
      string,
      ActivityRow[]
    >();

  for (
    const activity of activities
  ) {
    if (
      !activity.entityId
    ) {
      continue;
    }

    const current =
      activitiesByTask.get(
        activity.entityId,
      ) ?? [];

    current.push(
      activity,
    );

    activitiesByTask.set(
      activity.entityId,
      current,
    );
  }

  return days.map(
    (day) => {
      const dayStart =
        startOfDay(
          day.date,
        );

      const dayEnd =
        endOfDay(
          day.date,
        );

      const plannedTasks:
        QuickAccessTask[] =
        [];

      /*
       * Taskهای معمولی که Deadline آنها
       * در روز انتخاب‌شده است.
       */
      for (
        const task of normalTasks
      ) {
        if (
          task.deadline <
            dayStart ||
          task.deadline >
            dayEnd
        ) {
          continue;
        }

        const history =
          buildNormalTaskHistory(
            task,
            activitiesByTask.get(
              task.id,
            ) ?? [],
            dayEnd,
          );

        const assignees =
          getAssignees(
            task.assignees,
          );

        const assignedTo =
          getPrimaryAssignee(
            task.assignees,
          );

        const overdue =
          !history.completed &&
          (
            day.key !==
              days[0].key ||
            task.deadline <
              new Date()
          ) &&
          history.currentStatus !==
            "CANCELLED";

        plannedTasks.push({
          id:
            task.id,

          title:
            task.title,

          project:
            task.project,

          assignees,

          assignedTo,

          priority:
            task.priority,

          deadline:
            task.deadline,

          completedAt:
            history.completedAt,

          completedBy:
            history.completedBy,

          isRecurring:
            false,

          occurrenceDate:
            null,

          source:
            "NORMAL",

          status:
            history.currentStatus,

          completed:
            history.completed,

          overdue,
        });
      }

      /*
       * Taskهای تکرارشونده‌ای که در همان روز
       * طبق Schedule باید اجرا می‌شده‌اند.
       */
      for (
        const task of recurringTasks
      ) {
        if (
          !isRecurringScheduledOnDate(
            task,
            day.date,
          )
        ) {
          continue;
        }

        const history =
          buildRecurringOccurrenceHistory(
            task,
            day.date,
            activitiesByTask.get(
              task.id,
            ) ?? [],
          );

        const assignees =
          getAssignees(
            task.assignees,
          );

        const assignedTo =
          getPrimaryAssignee(
            task.assignees,
          );

        const overdue =
          !history.completed &&
          day.key !==
            days[0].key;

        plannedTasks.push({
          id:
            task.id,

          title:
            task.title,

          project:
            task.project,

          assignees,

          assignedTo,

          priority:
            task.priority,

          deadline:
            null,

          completedAt:
            history.completedAt,

          completedBy:
            history.completedBy,

          isRecurring:
            true,

          occurrenceDate:
            day.date,

          source:
            "RECURRING",

          status:
            history.status,

          completed:
            history.completed,

          overdue,
        });
      }

      /*
       * Taskهایی که واقعاً در همان روز
       * تکمیل شده‌اند؛ چه موعدشان همان روز بوده
       * چه نبوده باشد.
       */
      const completedTasks:
        QuickAccessTask[] =
        [];

      for (
        const task of normalTasks
      ) {
        const completionActivity =
          (
            activitiesByTask.get(
              task.id,
            ) ?? []
          )
            .filter(
              (activity) =>
                !isRecurringActivity(
                  activity,
                ) &&
                activity.action ===
                  "TASK_COMPLETED" &&
                activity.createdAt >=
                  dayStart &&
                activity.createdAt <=
                  dayEnd,
            )
            .at(-1);

        if (
          !completionActivity
        ) {
          continue;
        }

        const assignees =
          getAssignees(
            task.assignees,
          );

        const assignedTo =
          getPrimaryAssignee(
            task.assignees,
          );

        completedTasks.push({
          id:
            task.id,

          title:
            task.title,

          project:
            task.project,

          assignees,

          assignedTo,

          priority:
            task.priority,

          deadline:
            task.deadline,

          completedAt:
            completionActivity.createdAt,

          completedBy:
            completionActivity.user,

          isRecurring:
            false,

          occurrenceDate:
            null,

          source:
            "NORMAL",

          status:
            "COMPLETED",

          completed:
            true,

          overdue:
            false,
        });
      }

      for (
        const task of recurringTasks
      ) {
        const completionActivity =
          (
            activitiesByTask.get(
              task.id,
            ) ?? []
          )
            .filter(
              (activity) =>
                isRecurringActivity(
                  activity,
                ) &&
                activity.action ===
                  "TASK_COMPLETED" &&
                getOccurrenceDateFromActivity(
                  activity,
                ) ===
                  day.key &&
                activity.createdAt >=
                  dayStart &&
                activity.createdAt <=
                  dayEnd,
            )
            .at(-1);

        if (
          !completionActivity
        ) {
          continue;
        }

        const assignees =
          getAssignees(
            task.assignees,
          );

        const assignedTo =
          getPrimaryAssignee(
            task.assignees,
          );

        completedTasks.push({
          id:
            task.id,

          title:
            task.title,

          project:
            task.project,

          assignees,

          assignedTo,

          priority:
            task.priority,

          deadline:
            null,

          completedAt:
            completionActivity.createdAt,

          completedBy:
            completionActivity.user,

          isRecurring:
            true,

          occurrenceDate:
            day.date,

          source:
            "RECURRING",

          status:
            "COMPLETED",

          completed:
            true,

          overdue:
            false,
        });
      }

      const uniqueCompletedTasks =
        Array.from(
          new Map(
            completedTasks.map(
              (task) => [
                `${task.id}:${task.occurrenceDate ? getDateKey(task.occurrenceDate) : "normal"}`,
                task,
              ],
            ),
          ).values(),
        );

      const sortedPlannedTasks =
        sortTasks(
          plannedTasks,
        );

      const sortedCompletedTasks =
        sortTasks(
          uniqueCompletedTasks,
        );

      const overdueTasks =
        sortedPlannedTasks.filter(
          (task) =>
            task.overdue,
        );

      const completedPlanned =
        sortedPlannedTasks.filter(
          (task) =>
            task.completed,
        ).length;

      return {
        key:
          day.key,

        label:
          day.label,

        date:
          day.date,

        dateKey:
          day.key,

        overview: {
          planned:
            sortedPlannedTasks.length,

          completed:
            completedPlanned,

          pending:
            sortedPlannedTasks.length -
            completedPlanned,

          overdue:
            overdueTasks.length,

          completionRate:
            getCompletionRate(
              sortedPlannedTasks.length,
              completedPlanned,
            ),
        },

        completedTasks:
          sortedCompletedTasks,

        plannedTasks:
          sortedPlannedTasks,

        overdueTasks:
          overdueTasks,
      };
    },
  );
}