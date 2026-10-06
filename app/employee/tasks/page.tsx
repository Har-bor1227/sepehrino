import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  page?: string;
};

const PAGE_SIZE = 12;

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
      "border-slate-200/70 bg-slate-50 text-slate-700",
    IN_PROGRESS:
      "border-blue-200/70 bg-blue-50 text-blue-700",
    COMPLETED:
      "border-emerald-200/70 bg-emerald-50 text-emerald-700",
    CANCELLED:
      "border-red-200/70 bg-red-50 text-red-700",
  };

  return classes[status];
}

function getPriorityClass(
  priority: TaskPriority,
) {
  const classes = {
    LOW:
      "border-slate-200/70 bg-slate-50 text-slate-600",
    MEDIUM:
      "border-amber-200/70 bg-amber-50 text-amber-700",
    HIGH:
      "border-orange-200/70 bg-orange-50 text-orange-700",
    URGENT:
      "border-red-200/70 bg-red-50 text-red-700",
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

    return [...weekdays]
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

function buildPageHref(
  page: number,
  params: {
    q: string;
    status: string;
    priority: string;
    sort: keyof typeof SORT_LABELS;
  },
) {
  const search =
    new URLSearchParams();

  if (params.q) {
    search.set("q", params.q);
  }

  if (params.status) {
    search.set(
      "status",
      params.status,
    );
  }

  if (params.priority) {
    search.set(
      "priority",
      params.priority,
    );
  }

  if (params.sort) {
    search.set(
      "sort",
      params.sort,
    );
  }

  if (page > 1) {
    search.set(
      "page",
      String(page),
    );
  }

  const query =
    search.toString();

  return query
    ? `/employee/tasks?${query}`
    : "/employee/tasks";
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/60 bg-violet-50/70 px-3 py-1.5 text-[11px] font-bold text-violet-700">
      <Repeat2 className="size-3.5" />
      {RECURRENCE_LABELS[type]}
    </span>
  );
}

function TaskCard({
  task,
}: {
  task: Awaited<
    ReturnType<
      typeof getEmployeeTasks
    >
  >[number];
}) {
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

  const todayOccurrence =
    task.todayOccurrence;

  const isTodayCompleted =
    Boolean(
      task.isRecurring &&
        todayOccurrence?.completed,
    );

  return (
    <article
      className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[2rem] border p-5 text-center backdrop-blur-2xl transition duration-300 ease-out [perspective:1200px] sm:p-6 ${
        isTodayCompleted ||
        task.status ===
          "COMPLETED"
          ? "border-emerald-200/60 bg-emerald-50/45 shadow-[0_20px_45px_rgba(16,185,129,0.09),inset_0_1px_0_rgba(255,255,255,0.9)]"
          : overdue
            ? "border-red-200/65 bg-red-50/40 shadow-[0_20px_45px_rgba(239,68,68,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]"
            : "border-white/65 bg-white/48 shadow-[0_18px_42px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.9)]"
      } hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.11),inset_0_1px_0_rgba(255,255,255,0.95)]`}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/90" />

      <div className="flex min-h-[34px] flex-wrap items-center justify-center gap-2">
        {task.isRecurring ? (
          <RecurrenceBadge
            type={
              recurrenceType
            }
          />
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-50/80 px-3 py-1.5 text-[11px] font-bold text-slate-600">
            <ListChecks className="size-3.5" />
            Task معمولی
          </span>
        )}

        <span
          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-bold ${getPriorityClass(
            task.priority,
          )}`}
        >
          {PRIORITY_LABELS[
            task.priority
          ]}
        </span>
      </div>

      <div className="mx-auto mt-5 flex size-16 items-center justify-center rounded-[1.35rem] border border-white/75 bg-white/55 text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.95)] transition duration-300 group-hover:-translate-y-0.5 group-hover:rotate-1">
        {task.isRecurring ? (
          <Repeat2 className="size-7 text-violet-600" />
        ) : task.status ===
          "COMPLETED" ? (
          <CheckCircle2 className="size-7 text-emerald-600" />
        ) : overdue ? (
          <Clock3 className="size-7 text-red-600" />
        ) : (
          <ListChecks className="size-7 text-slate-600" />
        )}
      </div>

      <div className="mt-5 min-w-0">
        <Link
          href={`/employee/tasks/${task.id}`}
          className="block break-words text-lg font-extrabold leading-8 text-slate-900 transition group-hover:text-slate-700"
        >
          {task.title}
        </Link>

        <Link
          href={`/employee/projects/${task.project.id}`}
          className="mt-2 block truncate text-xs font-bold text-slate-400 transition hover:text-slate-700"
        >
          {task.project.title}
        </Link>
      </div>

      {task.description ? (
        <p className="mx-auto mt-4 line-clamp-3 max-w-[34rem] text-sm leading-7 text-slate-500">
          {task.description}
        </p>
      ) : (
        <div className="h-6" />
      )}

      <div className="mx-auto mt-5 grid w-full max-w-md gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/65 bg-white/38 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <p className="text-[10px] font-semibold text-slate-400">
            وضعیت
          </p>

          <div className="mt-2 flex justify-center">
            {task.isRecurring ? (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                  isTodayCompleted
                    ? "border-emerald-200/70 bg-emerald-50 text-emerald-700"
                    : todayOccurrence
                      ? "border-amber-200/70 bg-amber-50 text-amber-700"
                      : "border-slate-200/70 bg-slate-50 text-slate-500"
                }`}
              >
                {isTodayCompleted ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <Circle className="size-3.5" />
                )}

                {isTodayCompleted
                  ? "امروز انجام شده"
                  : todayOccurrence
                    ? "امروز در انتظار انجام"
                    : "امروز برنامه ندارد"}
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${getStatusClass(
                  task.status,
                )}`}
              >
                {task.status ===
                "COMPLETED" ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <Circle className="size-3.5" />
                )}

                {
                  STATUS_LABELS[
                    task.status
                  ]
                }
              </span>
            )}
          </div>
        </div>

        <div
          className={`rounded-2xl border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ${
            overdue
              ? "border-red-200/65 bg-red-50/45"
              : dueSoon
                ? "border-amber-200/65 bg-amber-50/45"
                : "border-white/65 bg-white/38"
          }`}
        >
          <p className="text-[10px] font-semibold text-slate-400">
            {task.isRecurring
              ? "برنامه"
              : "Deadline"}
          </p>

          <div className="mt-2 flex items-center justify-center gap-1.5">
            <CalendarDays
              className={`size-3.5 ${
                overdue
                  ? "text-red-500"
                  : dueSoon
                    ? "text-amber-500"
                    : "text-slate-400"
              }`}
            />

            <span
              className={`text-xs font-bold ${
                overdue
                  ? "text-red-600"
                  : dueSoon
                    ? "text-amber-700"
                    : "text-slate-700"
              }`}
            >
              {task.isRecurring
                ? recurrenceDescription ||
                  "برنامه تکرارشونده"
                : formatDate(
                    task.deadline,
                  )}
            </span>
          </div>

          {!task.isRecurring ? (
            <p
              className={`mt-1 text-[10px] ${
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
                  ? "Deadline نزدیک"
                  : formatDateTime(
                      task.deadline,
                    )}
            </p>
          ) : task.recurrenceStartDate ? (
            <p className="mt-1 text-[10px] text-slate-400">
              شروع از{" "}
              {formatDate(
                task.recurrenceStartDate,
              )}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid w-full max-w-md grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/65 bg-white/32 px-3 py-3">
          <p className="text-[10px] font-semibold text-slate-400">
            نوع
          </p>

          <p className="mt-1 text-xs font-bold text-slate-700">
            {task.isRecurring
              ? RECURRENCE_LABELS[
                  recurrenceType
                ]
              : "Task عادی"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/65 bg-white/32 px-3 py-3">
          <p className="text-[10px] font-semibold text-slate-400">
            ثبت شده
          </p>

          <p className="mt-1 text-xs font-bold text-slate-700">
            {formatDate(
              task.createdAt,
            )}
          </p>
        </div>
      </div>

      <div className="mt-auto flex w-full flex-col items-center gap-3 pt-5">
        <Link
          href={`/employee/tasks/${task.id}`}
          className="inline-flex min-h-11 w-full max-w-md items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/58 px-4 text-sm font-bold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-white/80 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]"
        >
          مشاهده جزئیات
          <ArrowLeft className="size-4" />
        </Link>

        <div className="flex w-full max-w-md justify-center">
          {task.isRecurring ? (
            <TaskOccurrenceStatusActions
              taskId={
                task.id
              }
              occurrenceDate={
                todayOccurrence
                  ? getDateKey(
                      todayOccurrence.occurrenceDate,
                    )
                  : getTodayDateKey()
              }
              completed={
                todayOccurrence?.completed ??
                false
              }
              disabled={
                !todayOccurrence
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
      </div>
    </article>
  );
}

function EmptyState({
  hasFilters,
}: {
  hasFilters: boolean;
}) {
  return (
    <div className="soft-grid flex min-h-72 flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300/45 bg-white/15 px-6 text-center">
      <div className="glass-icon flex size-14 items-center justify-center rounded-2xl">
        <Search className="size-6 text-slate-400" />
      </div>

      <h3 className="mt-5 font-extrabold text-slate-800">
        Taskی پیدا نشد
      </h3>

      <p className="mt-2 max-w-md text-sm leading-7 text-slate-400">
        {hasFilters
          ? "فیلترهای جست‌وجو را تغییر دهید یا همه فیلترها را پاک کنید."
          : "هنوز Taskی برای نمایش وجود ندارد."}
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
  );
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  params,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  params: {
    q: string;
    status: string;
    priority: string;
    sort: keyof typeof SORT_LABELS;
  };
}) {
  if (totalPages <= 1) {
    return null;
  }

  const startItem =
    (currentPage - 1) *
      PAGE_SIZE +
    1;

  const endItem = Math.min(
    currentPage *
      PAGE_SIZE,
    totalItems,
  );

  return (
    <nav
      aria-label="صفحه‌بندی Taskها"
      className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-white/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="text-center text-xs font-semibold text-slate-400 sm:text-right">
        نمایش{" "}
        {startItem.toLocaleString(
          "fa-IR",
        )}{" "}
        تا{" "}
        {endItem.toLocaleString(
          "fa-IR",
        )}{" "}
        از{" "}
        {totalItems.toLocaleString(
          "fa-IR",
        )}{" "}
        Task
      </div>

      <div className="flex items-center justify-center gap-2">
        {currentPage > 1 ? (
          <Link
            href={buildPageHref(
              currentPage - 1,
              params,
            )}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-white/70 bg-white/55 text-slate-600 shadow-sm transition hover:bg-white/80 hover:text-slate-900"
            aria-label="صفحه قبل"
          >
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span className="inline-flex size-10 items-center justify-center rounded-xl border border-white/40 bg-white/20 text-slate-300">
            <ChevronRight className="size-4" />
          </span>
        )}

        <div className="flex items-center gap-1.5">
          {Array.from(
            {
              length: totalPages,
            },
            (_, index) =>
              index + 1,
          ).map((page) => {
            const active =
              page ===
              currentPage;

            return (
              <Link
                key={page}
                href={buildPageHref(
                  page,
                  params,
                )}
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                className={`inline-flex size-10 items-center justify-center rounded-xl border text-xs font-extrabold transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white shadow-[0_9px_20px_rgba(15,23,42,0.14)]"
                    : "border-white/70 bg-white/50 text-slate-600 hover:bg-white/80 hover:text-slate-900"
                }`}
              >
                {page.toLocaleString(
                  "fa-IR",
                )}
              </Link>
            );
          })}
        </div>

        {currentPage <
        totalPages ? (
          <Link
            href={buildPageHref(
              currentPage + 1,
              params,
            )}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-white/70 bg-white/55 text-slate-600 shadow-sm transition hover:bg-white/80 hover:text-slate-900"
            aria-label="صفحه بعد"
          >
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span className="inline-flex size-10 items-center justify-center rounded-xl border border-white/40 bg-white/20 text-slate-300">
            <ChevronLeft className="size-4" />
          </span>
        )}
      </div>
    </nav>
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

  const rawPage =
    Number.parseInt(
      params.page ?? "1",
      10,
    );

  const requestedPage =
    Number.isFinite(rawPage) &&
    rawPage > 0
      ? rawPage
      : 1;

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

  const totalFilteredTasks =
    filteredTasks.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalFilteredTasks /
          PAGE_SIZE,
      ),
    );

  const currentPage =
    Math.min(
      requestedPage,
      totalPages,
    );

  const pageStart =
    (currentPage - 1) *
    PAGE_SIZE;

  const paginatedTasks =
    filteredTasks.slice(
      pageStart,
      pageStart + PAGE_SIZE,
    );

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
              <input
                type="hidden"
                name="page"
                value="1"
              />

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
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                Taskهای من
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                {totalFilteredTasks.toLocaleString(
                  "fa-IR",
                )}{" "}
                Task با فیلترهای فعلی پیدا شد.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 sm:justify-end">
              <span className="glass-icon flex size-8 items-center justify-center rounded-xl">
                <ListChecks className="size-3.5" />
              </span>

              هر صفحه{" "}
              {PAGE_SIZE.toLocaleString(
                "fa-IR",
              )}{" "}
              Task
            </div>
          </div>

          {totalFilteredTasks ===
          0 ? (
            <div className="p-5 sm:p-6">
              <EmptyState
                hasFilters={
                  hasFilters
                }
              />
            </div>
          ) : (
            <>
              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
                {paginatedTasks.map(
                  (task) => (
                    <TaskCard
                      key={
                        task.id
                      }
                      task={
                        task
                      }
                    />
                  ),
                )}
              </div>

              <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                <Pagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  totalItems={
                    totalFilteredTasks
                  }
                  params={{
                    q: query,
                    status,
                    priority,
                    sort,
                  }}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}