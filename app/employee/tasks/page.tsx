import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  ListChecks,
  Repeat2,
  Search,
  Timer,
} from "lucide-react";

import TaskOccurrenceStatusActions from "@/components/tasks/task-occurrence-status-actions";
import { EmployeeTaskStatusActions } from "@/components/tasks/employee-task-status-actions";

import { requireEmployee } from "@/lib/auth/guards";
import { getEmployeeTasks } from "@/lib/services/task.service";

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

type RecurrenceType =
  | "NONE"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

type SearchParams = {
  q?: string;
  status?: string;
  priority?: string;
  sort?: string;
};

const STATUS_LABELS: Record<
  TaskStatus,
  string
> = {
  TODO: "در انتظار",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل شده",
  CANCELLED: "لغو شده",
};

const PRIORITY_LABELS: Record<
  TaskPriority,
  string
> = {
  LOW: "کم",
  MEDIUM: "متوسط",
  HIGH: "زیاد",
  URGENT: "فوری",
};

const RECURRENCE_LABELS: Record<
  RecurrenceType,
  string
> = {
  NONE: "",
  DAILY: "روزانه",
  WEEKLY: "هفتگی",
  MONTHLY: "ماهانه",
};

const WEEKDAY_LABELS: Record<
  number,
  string
> = {
  1: "دوشنبه",
  2: "سه‌شنبه",
  3: "چهارشنبه",
  4: "پنجشنبه",
  5: "جمعه",
  6: "شنبه",
  7: "یکشنبه",
};

const SORT_LABELS = {
  deadline_asc:
    "نزدیک‌ترین Deadline",
  deadline_desc:
    "دورترین Deadline",
  newest: "جدیدترین",
} as const;

function getTodayDateKey() {
  const today = new Date();

  const year =
    today.getUTCFullYear();

  const month = String(
    today.getUTCMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    today.getUTCDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateKey(date: Date) {
  const year =
    date.getUTCFullYear();

  const month = String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getUTCDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStatusClass(
  status: TaskStatus,
) {
  const classes = {
    TODO:
      "border-slate-200/55 bg-slate-500/8 text-slate-700",
    IN_PROGRESS:
      "border-blue-200/55 bg-blue-50/50 text-blue-700",
    COMPLETED:
      "border-emerald-200/55 bg-emerald-50/50 text-emerald-700",
    CANCELLED:
      "border-red-200/55 bg-red-50/50 text-red-700",
  };

  return classes[status];
}

function getPriorityClass(
  priority: TaskPriority,
) {
  const classes = {
    LOW:
      "border-slate-200/55 bg-slate-500/8 text-slate-600",
    MEDIUM:
      "border-amber-200/55 bg-amber-50/50 text-amber-700",
    HIGH:
      "border-orange-200/55 bg-orange-50/50 text-orange-700",
    URGENT:
      "border-red-200/55 bg-red-50/50 text-red-700",
  };

  return classes[priority];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      calendar: "persian",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).format(date);
}

function formatDateTime(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      calendar: "persian",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function isOverdue(
  deadline: Date,
  status: TaskStatus,
) {
  return (
    deadline < new Date() &&
    status !== "COMPLETED" &&
    status !== "CANCELLED"
  );
}

function isDueSoon(
  deadline: Date,
  status: TaskStatus,
) {
  if (
    status === "COMPLETED" ||
    status === "CANCELLED"
  ) {
    return false;
  }

  const diff =
    deadline.getTime() -
    Date.now();

  return (
    diff > 0 &&
    diff <=
      48 * 60 * 60 * 1000
  );
}

function normalizeParam(
  value: string | undefined,
) {
  return value?.trim() ?? "";
}

function getRecurrenceDescription(
  type: RecurrenceType,
  weekdays: number[],
  dayOfMonth:
    | number
    | null,
) {
  if (type === "DAILY") {
    return "هر روز";
  }

  if (type === "WEEKLY") {
    if (weekdays.length === 0) {
      return "برنامه هفتگی";
    }

    return weekdays
      .sort((a, b) => a - b)
      .map(
        (weekday) =>
          WEEKDAY_LABELS[
            weekday
          ],
      )
      .filter(Boolean)
      .join("، ");
  }

  if (type === "MONTHLY") {
    if (!dayOfMonth) {
      return "برنامه ماهانه";
    }

    return `روز ${dayOfMonth.toLocaleString(
      "fa-IR",
    )} هر ماه`;
  }

  return "";
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: number;
  icon: typeof ListChecks;
  tone:
    | "slate"
    | "blue"
    | "emerald"
    | "amber"
    | "red";
  href?: string;
}) {
  const toneClasses = {
    slate:
      "bg-slate-900/7 text-slate-600",
    blue:
      "bg-blue-500/8 text-blue-600",
    emerald:
      "bg-emerald-500/8 text-emerald-600",
    amber:
      "bg-amber-500/8 text-amber-600",
    red:
      "bg-red-500/8 text-red-600",
  };

  const content = (
    <div className="glass-card rounded-3xl p-4 transition hover:-translate-y-px sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`glass-icon flex size-10 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
        >
          <Icon className="size-4.5" />
        </div>

        <span className="text-[10px] font-bold text-slate-300">
          آمار
        </span>
      </div>

      <p className="mt-4 text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
        {value.toLocaleString(
          "fa-IR",
        )}
      </p>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="block"
    >
      {content}
    </Link>
  );
}

function RecurrenceBadge({
  type,
}: {
  type: RecurrenceType;
}) {
  if (type === "NONE") {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/55 bg-violet-50/60 px-2.5 py-1.5 text-[11px] font-bold text-violet-700">
      <Repeat2 className="size-3.5" />
      {RECURRENCE_LABELS[type]}
    </span>
  );
}

export default async function EmployeeTasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireEmployee();

  const params =
    await searchParams;

  const query =
    normalizeParam(
      params.q,
    );

  const status =
    normalizeParam(
      params.status,
    ) as TaskStatus | "";

  const priority =
    normalizeParam(
      params.priority,
    ) as TaskPriority | "";

  const sort =
    params.sort &&
    params.sort in
      SORT_LABELS
      ? (params.sort as keyof typeof SORT_LABELS)
      : "deadline_asc";

  const tasks =
    await getEmployeeTasks();

  const todayDateKey =
    getTodayDateKey();

  let filteredTasks =
    tasks.filter(
      (task) => {
        const normalizedQuery =
          query.toLocaleLowerCase(
            "fa",
          );

        const matchesQuery =
          query.length === 0 ||
          task.title
            .toLocaleLowerCase(
              "fa",
            )
            .includes(
              normalizedQuery,
            ) ||
          task.project.title
            .toLocaleLowerCase(
              "fa",
            )
            .includes(
              normalizedQuery,
            );

        const matchesStatus =
          status.length === 0 ||
          task.status ===
            status;

        const matchesPriority =
          priority.length === 0 ||
          task.priority ===
            priority;

        return (
          matchesQuery &&
          matchesStatus &&
          matchesPriority
        );
      },
    );

  filteredTasks = [
    ...filteredTasks,
  ].sort((a, b) => {
    if (
      sort === "newest"
    ) {
      return (
        b.createdAt.getTime() -
        a.createdAt.getTime()
      );
    }

    if (
      sort ===
      "deadline_desc"
    ) {
      return (
        b.deadline.getTime() -
        a.deadline.getTime()
      );
    }

    return (
      a.deadline.getTime() -
      b.deadline.getTime()
    );
  });

  const totalTasks =
    tasks.length;

  const todoCount =
    tasks.filter(
      (task) =>
        task.status ===
        "TODO",
    ).length;

  const inProgressCount =
    tasks.filter(
      (task) =>
        task.status ===
        "IN_PROGRESS",
    ).length;

  const completedCount =
    tasks.filter(
      (task) =>
        task.status ===
        "COMPLETED",
    ).length;

  const overdueCount =
    tasks.filter((task) =>
      isOverdue(
        task.deadline,
        task.status,
      ),
    ).length;

  const dueSoonCount =
    tasks.filter((task) =>
      isDueSoon(
        task.deadline,
        task.status,
      ),
    ).length;

  const recurringCount =
    tasks.filter(
      (task) =>
        task.isRecurring,
    ).length;

  const activeCount =
    todoCount +
    inProgressCount;

  const hasFilters =
    query.length > 0 ||
    status.length > 0 ||
    priority.length > 0;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1450px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="glass-strong rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                  <ListChecks className="size-5 text-slate-600" />
                </div>

                <span className="text-xs font-bold text-slate-400">
                  Taskهای من
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                Workspace وظایف
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                تمام Taskهای اختصاص‌یافته به شما، همراه با
                برنامه تکرار، Deadline، اولویت و وضعیت.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              <div className="glass-chip rounded-2xl px-4 py-3">
                <p className="text-xs text-slate-400">
                  کل
                </p>

                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  {totalTasks.toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200/40 bg-blue-50/40 px-4 py-3">
                <p className="text-xs text-blue-700">
                  فعال
                </p>

                <p className="mt-1 text-xl font-extrabold text-blue-800">
                  {activeCount.toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200/40 bg-emerald-50/40 px-4 py-3">
                <p className="text-xs text-emerald-700">
                  تکمیل شده
                </p>

                <p className="mt-1 text-xl font-extrabold text-emerald-800">
                  {completedCount.toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-red-200/40 bg-red-50/40 px-4 py-3">
                <p className="text-xs text-red-700">
                  عقب‌افتاده
                </p>

                <p className="mt-1 text-xl font-extrabold text-red-800">
                  {overdueCount.toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-violet-200/40 bg-violet-50/40 px-4 py-3">
                <p className="text-xs text-violet-700">
                  تکرارشونده
                </p>

                <p className="mt-1 text-xl font-extrabold text-violet-800">
                  {recurringCount.toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="همه Taskها"
            value={totalTasks}
            icon={ListChecks}
            tone="slate"
            href="/employee/tasks"
          />

          <SummaryCard
            label="در حال انجام"
            value={inProgressCount}
            icon={Clock3}
            tone="blue"
            href="/employee/tasks?status=IN_PROGRESS"
          />

          <SummaryCard
            label="تکمیل شده"
            value={completedCount}
            icon={CheckCircle2}
            tone="emerald"
            href="/employee/tasks?status=COMPLETED"
          />

          <SummaryCard
            label="Deadline نزدیک"
            value={dueSoonCount}
            icon={Timer}
            tone="amber"
          />
        </section>

        <section className="glass-card rounded-[2rem] p-4 sm:p-5">
          <form
            method="GET"
            className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_180px_180px_210px_auto]"
          >
            <label className="relative block">
              <span className="sr-only">
                جست‌وجوی Task
              </span>

              <Search className="pointer-events-none absolute right-3 top-1/2 size-4.5 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                name="q"
                defaultValue={
                  query
                }
                placeholder="جست‌وجوی Task یا پروژه..."
                className="glass-field h-11 w-full rounded-xl pr-10 pl-4 text-sm text-slate-800 outline-none"
              />
            </label>

            <label className="relative">
              <span className="sr-only">
                فیلتر وضعیت
              </span>

              <select
                name="status"
                defaultValue={
                  status
                }
                className="glass-field h-11 w-full appearance-none rounded-xl px-4 pl-10 text-sm font-medium text-slate-700 outline-none"
              >
                <option value="">
                  همه وضعیت‌ها
                </option>

                {Object.entries(
                  STATUS_LABELS,
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        label
                      }
                    </option>
                  ),
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </label>

            <label className="relative">
              <span className="sr-only">
                فیلتر اولویت
              </span>

              <select
                name="priority"
                defaultValue={
                  priority
                }
                className="glass-field h-11 w-full appearance-none rounded-xl px-4 pl-10 text-sm font-medium text-slate-700 outline-none"
              >
                <option value="">
                  همه اولویت‌ها
                </option>

                {Object.entries(
                  PRIORITY_LABELS,
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        label
                      }
                    </option>
                  ),
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </label>

            <label className="relative">
              <span className="sr-only">
                مرتب‌سازی
              </span>

              <select
                name="sort"
                defaultValue={
                  sort
                }
                className="glass-field h-11 w-full appearance-none rounded-xl px-4 pl-10 text-sm font-medium text-slate-700 outline-none"
              >
                {Object.entries(
                  SORT_LABELS,
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        label
                      }
                    </option>
                  ),
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </label>

            <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
              <button
                type="submit"
                className="h-11 flex-1 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,23,42,0.13)] transition hover:bg-slate-800"
              >
                اعمال فیلتر
              </button>

              {hasFilters ? (
                <Link
                  href="/employee/tasks"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/60 bg-white/45 px-4 text-sm font-semibold text-slate-600 transition hover:bg-white/70"
                >
                  پاک کردن
                </Link>
              ) : null}
            </div>
          </form>
        </section>

        <section className="glass-card overflow-hidden rounded-[2rem]">
          <div className="flex flex-col gap-3 border-b border-white/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                لیست Taskها
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {filteredTasks.length.toLocaleString(
                  "fa-IR",
                )}{" "}
                Task نمایش داده می‌شود.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex size-7 items-center justify-center rounded-lg bg-slate-900/7">
                <Circle className="size-2.5 fill-slate-300 text-slate-300" />
              </span>

              Taskهای تکرارشونده بر اساس Occurrence امروز مدیریت می‌شوند.
            </div>
          </div>

          {filteredTasks.length ===
          0 ? (
            <div className="soft-grid flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="glass-icon flex size-14 items-center justify-center rounded-2xl">
                <Search className="size-6 text-slate-400" />
              </div>

              <h3 className="mt-5 font-extrabold text-slate-800">
                Taskی پیدا نشد
              </h3>

              <p className="mt-2 max-w-md text-sm leading-7 text-slate-400">
                فیلترهای جست‌وجو را تغییر دهید یا همه فیلترها را پاک کنید.
              </p>

              {hasFilters ? (
                <Link
                  href="/employee/tasks"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
                >
                  نمایش همه Taskها
                </Link>
              ) : null}
            </div>
          ) : (
            <>
              <div className="thin-scrollbar hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1180px]">
                  <thead>
                    <tr className="border-y border-white/40 bg-white/25 text-right text-xs font-bold text-slate-500">
                      <th className="px-6 py-4">
                        Task
                      </th>

                      <th className="px-4 py-4">
                        پروژه
                      </th>

                      <th className="px-4 py-4">
                        وضعیت
                      </th>

                      <th className="px-4 py-4">
                        نوع
                      </th>

                      <th className="px-4 py-4">
                        برنامه
                      </th>

                      <th className="px-4 py-4">
                        Deadline
                      </th>

                      <th className="px-6 py-4">
                        عملیات
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTasks.map(
                      (task) => {
                        const overdue =
                          !task.isRecurring &&
                          isOverdue(
                            task.deadline,
                            task.status,
                          );

                        const dueSoon =
                          !task.isRecurring &&
                          isDueSoon(
                            task.deadline,
                            task.status,
                          );

                        const recurrenceType =
                          task.recurrenceType as RecurrenceType;

                        const recurrenceDescription =
                          task.isRecurring
                            ? getRecurrenceDescription(
                                recurrenceType,
                                task.recurrenceWeekdays,
                                task.recurrenceDayOfMonth,
                              )
                            : "";

                        return (
                          <tr
                            key={
                              task.id
                            }
                            className="border-b border-white/30 transition hover:bg-white/30 last:border-b-0"
                          >
                            <td className="px-6 py-5">
                              <div className="max-w-[340px]">
                                <Link
                                  href={`/employee/tasks/${task.id}`}
                                  className="block truncate font-bold text-slate-800 transition hover:text-slate-950"
                                >
                                  {
                                    task.title
                                  }
                                </Link>

                                {task.description ? (
                                  <p className="mt-1 line-clamp-2 text-xs leading-6 text-slate-400">
                                    {
                                      task.description
                                    }
                                  </p>
                                ) : null}
                              </div>
                            </td>

                            <td className="px-4 py-5">
                              <Link
                                href={`/employee/projects/${task.project.id}`}
                                className="font-semibold text-slate-600 transition hover:text-slate-950"
                              >
                                {
                                  task.project
                                    .title
                                }
                              </Link>
                            </td>

                            <td className="px-4 py-5">
                              {task.isRecurring ? (
                                <div className="space-y-2">
                                  {task.todayOccurrence ? (
                                    <span
                                      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${
                                        task.todayOccurrence
                                          .completed
                                          ? "border-emerald-200/55 bg-emerald-50/60 text-emerald-700"
                                          : "border-amber-200/55 bg-amber-50/60 text-amber-700"
                                      }`}
                                    >
                                      {task.todayOccurrence
                                        .completed
                                        ? "امروز انجام شده"
                                        : "امروز در انتظار انجام"}
                                    </span>
                                  ) : (
                                    <span className="inline-flex rounded-full border border-slate-200/55 bg-slate-500/8 px-3 py-1.5 text-xs font-bold text-slate-500">
                                      امروز برنامه ندارد
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClass(
                                    task.status,
                                  )}`}
                                >
                                  {
                                    STATUS_LABELS[
                                      task.status
                                    ]
                                  }
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-5">
                              {task.isRecurring ? (
                                <RecurrenceBadge
                                  type={
                                    recurrenceType
                                  }
                                />
                              ) : (
                                <span className="inline-flex rounded-full border border-white/55 bg-white/30 px-3 py-1.5 text-xs font-bold text-slate-400">
                                  عادی
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-5">
                              {task.isRecurring ? (
                                <div className="max-w-[210px]">
                                  <p className="text-xs font-bold text-slate-700">
                                    {
                                      recurrenceDescription
                                    }
                                  </p>

                                  {task.recurrenceStartDate ? (
                                    <p className="mt-1 text-[11px] text-slate-400">
                                      شروع:{" "}
                                      {formatDate(
                                        task.recurrenceStartDate,
                                      )}
                                    </p>
                                  ) : null}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  بدون تکرار
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-5">
                              {task.isRecurring ? (
                                <div className="flex items-start gap-2 text-xs text-slate-500">
                                  <span className="glass-icon mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg">
                                    <CalendarDays className="size-3.5" />
                                  </span>

                                  <div>
                                    <p className="font-bold text-slate-700">
                                      شروع تکرار
                                    </p>

                                    <p className="mt-1">
                                      {task.recurrenceStartDate
                                        ? formatDate(
                                            task.recurrenceStartDate,
                                          )
                                        : formatDate(
                                            task.deadline,
                                          )}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={`flex items-start gap-2 text-xs ${
                                    overdue
                                      ? "text-red-600"
                                      : dueSoon
                                        ? "text-amber-600"
                                        : "text-slate-500"
                                  }`}
                                >
                                  <span className="glass-icon mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg">
                                    <CalendarDays className="size-3.5" />
                                  </span>

                                  <div>
                                    <p
                                      className={
                                        overdue ||
                                        dueSoon
                                          ? "font-bold"
                                          : ""
                                      }
                                    >
                                      {formatDate(
                                        task.deadline,
                                      )}
                                    </p>

                                    <p className="mt-1">
                                      {overdue
                                        ? "عقب‌افتاده"
                                        : dueSoon
                                          ? "Deadline نزدیک"
                                          : formatDateTime(
                                              task.deadline,
                                            )}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </td>

                            <td className="px-6 py-5">
                              {task.isRecurring ? (
                                <TaskOccurrenceStatusActions
                                  taskId={
                                    task.id
                                  }
                                  occurrenceDate={
                                    task.todayOccurrence
                                      ? getDateKey(
                                          task
                                            .todayOccurrence
                                            .occurrenceDate,
                                        )
                                      : todayDateKey
                                  }
                                  completed={
                                    task
                                      .todayOccurrence
                                      ?.completed ??
                                    false
                                  }
                                  disabled={
                                    !task.todayOccurrence
                                  }
                                />
                              ) : (
                                <EmployeeTaskStatusActions
                                  taskId={
                                    task.id
                                  }
                                  currentStatus={
                                    task.status
                                  }
                                />
                              )}
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/30 lg:hidden">
                {filteredTasks.map(
                  (task) => {
                    const overdue =
                      !task.isRecurring &&
                      isOverdue(
                        task.deadline,
                        task.status,
                      );

                    const dueSoon =
                      !task.isRecurring &&
                      isDueSoon(
                        task.deadline,
                        task.status,
                      );

                    const recurrenceType =
                      task.recurrenceType as RecurrenceType;

                    const recurrenceDescription =
                      task.isRecurring
                        ? getRecurrenceDescription(
                            recurrenceType,
                            task.recurrenceWeekdays,
                            task.recurrenceDayOfMonth,
                          )
                        : "";

                    return (
                      <article
                        key={
                          task.id
                        }
                        className="p-5 transition hover:bg-white/18 sm:p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Link
                              href={`/employee/tasks/${task.id}`}
                              className="block break-words font-bold text-slate-800"
                            >
                              {
                                task.title
                              }
                            </Link>

                            <Link
                              href={`/employee/projects/${task.project.id}`}
                              className="mt-1 block truncate text-sm text-slate-400"
                            >
                              {
                                task
                                  .project
                                  .title
                              }
                            </Link>
                          </div>

                          {task.isRecurring ? (
                            <RecurrenceBadge
                              type={
                                recurrenceType
                              }
                            />
                          ) : (
                            <span
                              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClass(
                                task.status,
                              )}`}
                            >
                              {
                                STATUS_LABELS[
                                  task.status
                                ]
                              }
                            </span>
                          )}
                        </div>

                        {task.description ? (
                          <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-500">
                            {
                              task.description
                            }
                          </p>
                        ) : null}

                        {task.isRecurring ? (
                          <div className="mt-4 space-y-3">
                            <div className="rounded-2xl border border-violet-200/45 bg-violet-50/35 p-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-violet-700">
                                <Repeat2 className="size-4" />
                                برنامه تکرار
                              </div>

                              <p className="mt-2 text-sm font-bold text-slate-700">
                                {
                                  recurrenceDescription
                                }
                              </p>

                              {task.recurrenceStartDate ? (
                                <p className="mt-1 text-[11px] text-slate-400">
                                  شروع از{" "}
                                  {formatDate(
                                    task.recurrenceStartDate,
                                  )}
                                </p>
                              ) : null}
                            </div>

                            <div
                              className={`rounded-2xl border p-4 ${
                                task.todayOccurrence
                                  ?.completed
                                  ? "border-emerald-200/45 bg-emerald-50/35"
                                  : task.todayOccurrence
                                    ? "border-amber-200/45 bg-amber-50/35"
                                    : "border-white/45 bg-white/24"
                              }`}
                            >
                              <p className="text-[11px] text-slate-400">
                                وضعیت امروز
                              </p>

                              <p
                                className={`mt-1 text-sm font-bold ${
                                  task.todayOccurrence
                                    ?.completed
                                    ? "text-emerald-700"
                                    : task.todayOccurrence
                                      ? "text-amber-700"
                                      : "text-slate-500"
                                }`}
                              >
                                {task.todayOccurrence
                                  ? task
                                      .todayOccurrence
                                      .completed
                                    ? "امروز انجام شده"
                                    : "امروز در انتظار انجام"
                                  : "امروز برنامه ندارد"}
                              </p>
                            </div>
                          </div>
                        ) : null}

                        {!task.isRecurring ? (
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/45 bg-white/24 p-3">
                              <p className="text-[11px] text-slate-400">
                                اولویت
                              </p>

                              <span
                                className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${getPriorityClass(
                                  task.priority,
                                )}`}
                              >
                                {
                                  PRIORITY_LABELS[
                                    task.priority
                                  ]
                                }
                              </span>
                            </div>

                            <div
                              className={`rounded-2xl border p-3 ${
                                overdue
                                  ? "border-red-200/50 bg-red-50/45"
                                  : dueSoon
                                    ? "border-amber-200/50 bg-amber-50/45"
                                    : "border-white/45 bg-white/24"
                              }`}
                            >
                              <p className="text-[11px] text-slate-400">
                                Deadline
                              </p>

                              <p
                                className={`mt-1 text-sm font-bold ${
                                  overdue
                                    ? "text-red-600"
                                    : dueSoon
                                      ? "text-amber-700"
                                      : "text-slate-700"
                                }`}
                              >
                                {formatDate(
                                  task.deadline,
                                )}
                              </p>

                              <p
                                className={`mt-1 text-[11px] ${
                                  overdue
                                    ? "text-red-500"
                                    : dueSoon
                                      ? "text-amber-600"
                                      : "text-slate-400"
                                }`}
                              >
                                {overdue
                                  ? "عقب‌افتاده"
                                  : dueSoon
                                    ? "نزدیک"
                                    : "برنامه‌ریزی‌شده"}
                              </p>
                            </div>
                          </div>
                        ) : null}

                        <div className="mt-5 flex flex-col gap-3 border-t border-white/35 pt-5">
                          <Link
                            href={`/employee/tasks/${task.id}`}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/45 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white/70"
                          >
                            مشاهده جزئیات
                            <ArrowLeft className="size-4" />
                          </Link>

                          {task.isRecurring ? (
                            <TaskOccurrenceStatusActions
                              taskId={
                                task.id
                              }
                              occurrenceDate={
                                task.todayOccurrence
                                  ? getDateKey(
                                      task
                                        .todayOccurrence
                                        .occurrenceDate,
                                    )
                                  : todayDateKey
                              }
                              completed={
                                task
                                  .todayOccurrence
                                  ?.completed ??
                                false
                              }
                              disabled={
                                !task.todayOccurrence
                              }
                            />
                          ) : (
                            <EmployeeTaskStatusActions
                              taskId={
                                task.id
                              }
                              currentStatus={
                                task.status
                              }
                            />
                          )}
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}