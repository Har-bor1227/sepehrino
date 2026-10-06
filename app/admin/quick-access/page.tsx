import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  ListChecks,
  Repeat2,
  UserRound,
  Zap,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/guards";
import {
  getAdminQuickAccessData,
  type AdminQuickAccessDay,
} from "@/lib/services/admin-quick-access.service";

const DAY_OPTIONS = [
  {
    value: "today",
    label: "امروز",
    index: 0,
  },
  {
    value: "yesterday",
    label: "دیروز",
    index: 1,
  },
  {
    value: "before",
    label: "روز قبلش",
    index: 2,
  },
] as const;

type DayValue =
  (typeof DAY_OPTIONS)[number]["value"];

function getSelectedDayIndex(
  value: string | undefined,
) {
  return (
    DAY_OPTIONS.find(
      (option) =>
        option.value === value,
    )?.index ?? 0
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      calendar: "persian",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(date);
}

function formatTime(date: Date | null) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function getPriorityLabel(
  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT",
) {
  const labels = {
    LOW: "کم",
    MEDIUM: "متوسط",
    HIGH: "زیاد",
    URGENT: "فوری",
  };

  return labels[priority];
}

function getPriorityClass(
  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT",
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

function getStatusLabel(
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED",
) {
  const labels = {
    TODO: "در انتظار",
    IN_PROGRESS: "در حال انجام",
    COMPLETED: "تکمیل شده",
    CANCELLED: "لغو شده",
  };

  return labels[status];
}

function getOverallStatus(
  day: AdminQuickAccessDay,
) {
  if (
    day.overview.planned === 0
  ) {
    return {
      label: "برنامه‌ای برای این روز ثبت نشده",
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
    };
  }

  if (day.overview.overdue > 0) {
    return {
      label: "نیازمند پیگیری",
      className:
        "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (
    day.overview.pending === 0
  ) {
    return {
      label: "روز کامل انجام شده",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (
    day.key !==
    getDateKey(new Date())
  ) {
    return {
      label: "بخشی از برنامه انجام نشده",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "در حال پیگیری",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  };
}

function getDateKey(date: Date) {
  return [
    date.getUTCFullYear(),
    String(
      date.getUTCMonth() + 1,
    ).padStart(2, "0"),
    String(
      date.getUTCDate(),
    ).padStart(2, "0"),
  ].join("-");
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof ListChecks;
  tone:
    | "slate"
    | "emerald"
    | "amber"
    | "red";
}) {
  const toneClasses = {
    slate: {
      icon: "bg-slate-900/7 text-slate-600",
      value: "text-slate-900",
    },
    emerald: {
      icon: "bg-emerald-500/8 text-emerald-600",
      value: "text-slate-900",
    },
    amber: {
      icon: "bg-amber-500/8 text-amber-600",
      value: "text-slate-900",
    },
    red: {
      icon: "bg-red-500/8 text-red-600",
      value: "text-red-700",
    },
  };

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`glass-icon flex size-11 items-center justify-center rounded-2xl ${toneClasses[tone].icon}`}
        >
          <Icon className="size-5" />
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-3xl font-extrabold tracking-tight ${toneClasses[tone].value}`}
      >
        {value.toLocaleString(
          "fa-IR",
        )}
      </p>
    </div>
  );
}

function TaskTypeBadge({
  recurring,
}: {
  recurring: boolean;
}) {
  return recurring ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
      <Repeat2 className="size-3" />
      تکرارشونده
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
      <ListChecks className="size-3" />
      معمولی
    </span>
  );
}

function TaskRow({
  task,
  completedView = false,
}: {
  task: AdminQuickAccessDay["plannedTasks"][number];
  completedView?: boolean;
}) {
  const completionTime =
    formatTime(
      task.completedAt,
    );

  return (
    <article
      className={`rounded-2xl border p-4 transition ${
        task.completed
          ? "border-emerald-200/60 bg-emerald-50/35"
          : task.overdue
            ? "border-red-200/70 bg-red-50/35"
            : "border-white/55 bg-white/40"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <TaskTypeBadge
                recurring={
                  task.isRecurring
                }
              />

              {task.overdue ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700">
                  <AlertTriangle className="size-3" />
                  عقب‌افتاده
                </span>
              ) : null}

              {!completedView &&
              task.completed ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="size-3" />
                  انجام شده
                </span>
              ) : null}
            </div>

            <Link
              href={`/admin/tasks/${task.id}`}
              className="mt-3 block break-words text-base font-extrabold leading-7 text-slate-900 transition hover:text-slate-600"
            >
              {task.title}
            </Link>

            <Link
              href={`/admin/projects/${task.project.id}`}
              className="mt-1 block truncate text-xs font-medium text-slate-400 transition hover:text-slate-700"
            >
              {task.project.title}
            </Link>
          </div>

          <span
            className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getPriorityClass(
              task.priority,
            )}`}
          >
            اولویت{" "}
            {getPriorityLabel(
              task.priority,
            )}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/55 bg-white/35 px-3 py-2.5">
            <p className="text-[10px] font-medium text-slate-400">
              مسئول Task
            </p>

            <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-bold text-slate-700">
              <UserRound className="size-3.5 shrink-0 text-slate-400" />
              {task.assignedTo.name}
            </p>
          </div>

          <div className="rounded-xl border border-white/55 bg-white/35 px-3 py-2.5">
            <p className="text-[10px] font-medium text-slate-400">
              وضعیت
            </p>

            <p className="mt-1 text-xs font-bold text-slate-700">
              {task.completed
                ? "تکمیل شده"
                : getStatusLabel(
                    task.status,
                  )}
            </p>
          </div>

          <div className="rounded-xl border border-white/55 bg-white/35 px-3 py-2.5">
            <p className="text-[10px] font-medium text-slate-400">
              {completedView
                ? "زمان انجام"
                : "Deadline"}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-700">
              {completedView
                ? completionTime ||
                  "ثبت شده"
                : task.deadline
                  ? formatTime(
                      task.deadline,
                    ) || "—"
                  : task.occurrenceDate
                    ? "برنامه روز"
                    : "—"}
            </p>
          </div>

          <div className="rounded-xl border border-white/55 bg-white/35 px-3 py-2.5">
            <p className="text-[10px] font-medium text-slate-400">
              {task.completed
                ? "انجام‌دهنده"
                : "وضعیت پیگیری"}
            </p>

            <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-bold text-slate-700">
              {task.completed ? (
                <>
                  <UserRound className="size-3.5 shrink-0 text-emerald-500" />
                  {task.completedBy?.name ||
                    task.assignedTo.name}
                </>
              ) : task.overdue ? (
                <>
                  <AlertTriangle className="size-3.5 shrink-0 text-red-500" />
                  نیازمند پیگیری
                </>
              ) : (
                <>
                  <Clock3 className="size-3.5 shrink-0 text-amber-500" />
                  در انتظار انجام
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/45 pt-3 sm:flex-row sm:items-center sm:justify-between">
          {task.completed && task.completedAt ? (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="size-3.5" />
              در {completionTime} تکمیل شد
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              {task.isRecurring ? (
                <>
                  <Repeat2 className="size-3.5" />
                  نوبت این روز
                </>
              ) : (
                <>
                  <CalendarDays className="size-3.5" />
                  Task معمولی
                </>
              )}
            </div>
          )}

          <Link
            href={`/admin/tasks/${task.id}`}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-white/60 bg-white/55 px-3.5 text-xs font-bold text-slate-700 transition hover:bg-white/80"
          >
            مشاهده Task
            <ArrowUpLeft className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/50 px-5 py-8 text-center">
      <div className="glass-icon flex size-12 items-center justify-center rounded-2xl">
        <ListChecks className="size-5 text-slate-400" />
      </div>

      <p className="mt-3 text-sm font-bold text-slate-700">
        {title}
      </p>

      <p className="mt-1 max-w-md text-xs leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default async function AdminQuickAccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    day?: string;
  }>;
}) {
  await requireAdmin();

  const [
    days,
    params,
  ] = await Promise.all([
    getAdminQuickAccessData(),
    searchParams,
  ]);

  const selectedIndex =
    getSelectedDayIndex(
      params.day,
    );

  const selectedDay =
    days[selectedIndex];

  const overallStatus =
    getOverallStatus(
      selectedDay,
    );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="glass-strong overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="glass-icon flex size-9 items-center justify-center rounded-xl">
                  <Zap className="size-4 text-slate-600" />
                </div>

                مدیریت سریع وضعیت Taskها
              </div>

              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                دسترسی سریع
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                وضعیت انجام Taskها را برای امروز،
                دیروز و روز قبلش در یک نگاه بررسی کنید.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 bg-white/45 px-3.5 py-2 text-xs font-bold text-slate-600">
              <CalendarDays className="size-4 text-slate-400" />
              {formatDate(
                selectedDay.date,
              )}
            </div>
          </div>
        </section>

        <section
          aria-label="انتخاب روز"
          className="glass-card rounded-[2rem] p-3 sm:p-4"
        >
          <div className="grid grid-cols-3 gap-2">
            {DAY_OPTIONS.map(
              (option) => {
                const active =
                  option.index ===
                  selectedIndex;

                return (
                  <Link
                    key={
                      option.value
                    }
                    href={`/admin/quick-access?day=${option.value}`}
                    className={`flex min-h-12 items-center justify-center rounded-2xl border px-3 text-sm font-extrabold transition sm:min-h-14 ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white shadow-[0_12px_26px_rgba(15,23,42,0.16)]"
                        : "border-white/60 bg-white/35 text-slate-600 hover:bg-white/70 hover:text-slate-950"
                    }`}
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                  >
                    {option.label}
                  </Link>
                );
              },
            )}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="کل برنامه روز"
            value={
              selectedDay
                .overview
                .planned
            }
            icon={ListChecks}
            tone="slate"
          />

          <StatCard
            label="تکمیل شده"
            value={
              selectedDay
                .completedTasks
                .length
            }
            icon={
              CheckCircle2
            }
            tone="emerald"
          />

          <StatCard
            label="انجام نشده"
            value={
              selectedDay
                .overview
                .pending
            }
            icon={Clock3}
            tone="amber"
          />

          <StatCard
            label="عقب‌افتاده"
            value={
              selectedDay
                .overview
                .overdue
            }
            icon={
              AlertTriangle
            }
            tone="red"
          />
        </section>

        <section className="glass-card rounded-[2rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">
                جمع‌بندی روز
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                وضعیت کلی {selectedDay.label}
              </h2>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-extrabold ${overallStatus.className}`}
            >
              {selectedDay.overview.overdue >
              0 ? (
                <AlertTriangle className="size-3.5" />
              ) : selectedDay.overview.pending ===
                0 &&
                selectedDay.overview.planned >
                  0 ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <Clock3 className="size-3.5" />
              )}

              {overallStatus.label}
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-500">
                  میزان تکمیل برنامه
                </span>

                <span className="font-extrabold text-slate-800">
                  {selectedDay.overview.completionRate.toLocaleString(
                    "fa-IR",
                  )}
                  ٪
                </span>
              </div>

              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all"
                  style={{
                    width: `${selectedDay.overview.completionRate}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/55 bg-white/40 px-4 py-3 text-center">
              <p className="text-[10px] font-medium text-slate-400">
                تاریخ
              </p>

              <p className="mt-1 text-sm font-extrabold text-slate-800">
                {formatDate(
                  selectedDay.date,
                )}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="glass-card rounded-[2rem] p-5 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-white/45 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="glass-icon flex size-10 items-center justify-center rounded-2xl bg-emerald-500/8">
                    <CheckCircle2 className="size-5 text-emerald-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      تکمیل‌شده‌ها
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Taskهایی که واقعاً در این روز تکمیل شده‌اند
                    </p>
                  </div>
                </div>
              </div>

              <span className="glass-chip w-fit rounded-full px-3 py-1.5 text-xs font-bold text-slate-500">
                {selectedDay.completedTasks.length.toLocaleString(
                  "fa-IR",
                )}{" "}
                مورد
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {selectedDay.completedTasks.length ===
              0 ? (
                <EmptyState
                  title="هنوز Taskی در این روز تکمیل نشده است"
                  description="در صورت ثبت تکمیل Task، انجام‌دهنده و زمان ثبت آن اینجا نمایش داده می‌شود."
                />
              ) : (
                selectedDay.completedTasks.map(
                  (task) => (
                    <TaskRow
                      key={`${task.id}-${task.occurrenceDate?.toISOString() ?? "normal"}`}
                      task={task}
                      completedView
                    />
                  ),
                )
              )}
            </div>
          </section>

          <section className="glass-card rounded-[2rem] p-5 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-white/45 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="glass-icon flex size-10 items-center justify-center rounded-2xl bg-amber-500/8">
                    <Clock3 className="size-5 text-amber-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      برنامه روز
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Taskهایی که طبق برنامه باید انجام می‌شدند
                    </p>
                  </div>
                </div>
              </div>

              <span className="glass-chip w-fit rounded-full px-3 py-1.5 text-xs font-bold text-slate-500">
                {selectedDay.plannedTasks.length.toLocaleString(
                  "fa-IR",
                )}{" "}
                مورد
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {selectedDay.plannedTasks.length ===
              0 ? (
                <EmptyState
                  title="برای این روز Task برنامه‌ریزی نشده است"
                  description="اگر Task معمولی با Deadline این روز یا Task تکرارشونده‌ای در برنامه وجود داشته باشد، اینجا نمایش داده می‌شود."
                />
              ) : (
                selectedDay.plannedTasks.map(
                  (task) => (
                    <TaskRow
                      key={`${task.id}-${task.occurrenceDate?.toISOString() ?? "normal"}`}
                      task={task}
                    />
                  ),
                )
              )}
            </div>
          </section>
        </div>

        <section className="glass-card rounded-[2rem] p-5 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-white/45 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl bg-red-500/8">
                  <AlertTriangle className="size-5 text-red-600" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Taskهای عقب‌افتاده
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    مواردی که باید انجام می‌شدند اما هنوز تکمیل نشده‌اند
                  </p>
                </div>
              </div>
            </div>

            <span className="glass-chip w-fit rounded-full px-3 py-1.5 text-xs font-bold text-slate-500">
              {selectedDay.overdueTasks.length.toLocaleString(
                "fa-IR",
              )}{" "}
              مورد
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {selectedDay.overdueTasks.length ===
            0 ? (
              <div className="flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-emerald-200/70 bg-emerald-50/35 px-5 text-center">
                <div>
                  <CheckCircle2 className="mx-auto size-7 text-emerald-500" />

                  <p className="mt-2 text-sm font-bold text-emerald-700">
                    مورد عقب‌افتاده‌ای وجود ندارد
                  </p>

                  <p className="mt-1 text-xs text-emerald-600/70">
                    وضعیت این روز از نظر تأخیر مناسب است.
                  </p>
                </div>
              </div>
            ) : (
              selectedDay.overdueTasks.map(
                (task) => (
                  <TaskRow
                    key={`${task.id}-${task.occurrenceDate?.toISOString() ?? "normal"}`}
                    task={task}
                  />
                ),
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}