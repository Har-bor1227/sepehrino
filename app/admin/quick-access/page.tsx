import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpLeft,
  CalendarDays,
  CheckCircle2,
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

type DayValue = (typeof DAY_OPTIONS)[number]["value"];

function getSelectedDayIndex(value: string | undefined) {
  return DAY_OPTIONS.find((option) => option.value === value)?.index ?? 0;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatTime(date: Date | null) {
  if (!date) return null;

  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPriorityLabel(
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
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
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
) {
  const classes = {
    LOW: "border-slate-300 bg-slate-100 text-slate-700",
    MEDIUM: "border-amber-300 bg-amber-100 text-amber-800",
    HIGH: "border-orange-300 bg-orange-100 text-orange-800",
    URGENT: "border-red-300 bg-red-100 text-red-800",
  };

  return classes[priority];
}

function getStatusLabel(
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
) {
  const labels = {
    TODO: "در انتظار",
    IN_PROGRESS: "در حال انجام",
    COMPLETED: "تکمیل شده",
    CANCELLED: "لغو شده",
  };

  return labels[status];
}

function getOverallStatus(day: AdminQuickAccessDay) {
  if (day.overview.planned === 0) {
    return {
      label: "برنامه‌ای برای این روز ثبت نشده",
      className: "border-slate-300 bg-slate-100 text-slate-700",
      iconClassName: "text-slate-500",
    };
  }

  if (day.overview.overdue > 0) {
    return {
      label: "نیازمند پیگیری",
      className: "border-red-300 bg-red-100 text-red-800",
      iconClassName: "text-red-600",
    };
  }

  if (day.overview.pending === 0) {
    return {
      label: "روز کامل انجام شده",
      className: "border-emerald-300 bg-emerald-100 text-emerald-800",
      iconClassName: "text-emerald-600",
    };
  }

  if (day.key !== getDateKey(new Date())) {
    return {
      label: "بخشی از برنامه انجام نشده",
      className: "border-amber-300 bg-amber-100 text-amber-800",
      iconClassName: "text-amber-600",
    };
  }

  return {
    label: "در حال پیگیری",
    className: "border-blue-300 bg-blue-100 text-blue-800",
    iconClassName: "text-blue-600",
  };
}

function getDateKey(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
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
  tone: "slate" | "emerald" | "amber" | "red";
}) {
  const toneClasses = {
    slate: {
      card: "border-slate-300 bg-gradient-to-br from-white to-slate-100",
      icon: "bg-slate-200 text-slate-700 ring-slate-300",
      label: "text-slate-600",
      value: "text-slate-900",
      accent: "bg-slate-500",
    },
    emerald: {
      card: "border-emerald-300 bg-gradient-to-br from-white to-emerald-50",
      icon: "bg-emerald-100 text-emerald-700 ring-emerald-200",
      label: "text-emerald-800",
      value: "text-emerald-800",
      accent: "bg-emerald-500",
    },
    amber: {
      card: "border-amber-300 bg-gradient-to-br from-white to-amber-50",
      icon: "bg-amber-100 text-amber-700 ring-amber-200",
      label: "text-amber-800",
      value: "text-amber-800",
      accent: "bg-amber-500",
    },
    red: {
      card: "border-red-300 bg-gradient-to-br from-white to-red-50",
      icon: "bg-red-100 text-red-700 ring-red-200",
      label: "text-red-800",
      value: "text-red-800",
      accent: "bg-red-500",
    },
  };

  const styles = toneClasses[tone];

  return (
    <article
      className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${styles.card}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${styles.accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-bold ${styles.label}`}>{label}</p>

          <p className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${styles.value}`}>
            {value.toLocaleString("fa-IR")}
          </p>
        </div>

        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${styles.icon}`}
        >
          <Icon className="size-6" />
        </div>
      </div>
    </article>
  );
}

function TaskTypeBadge({ recurring }: { recurring: boolean }) {
  return recurring ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-800">
      <Repeat2 className="size-3.5" />
      تکرارشونده
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
      <ListChecks className="size-3.5" />
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
  const completionTime = formatTime(task.completedAt);

  const taskTone = task.completed
    ? {
        card: "border-emerald-300 bg-gradient-to-l from-white to-emerald-50/80",
        accent: "bg-emerald-500",
      }
    : task.overdue
      ? {
          card: "border-red-300 bg-gradient-to-l from-white to-red-50/80",
          accent: "bg-red-500",
        }
      : {
          card: "border-slate-200 bg-white",
          accent: "bg-blue-500",
        };

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${taskTone.card}`}
    >
      <div className={`absolute inset-y-0 right-0 w-1 ${taskTone.accent}`} />

      <div className="space-y-4 p-4 pr-5 sm:p-5 sm:pr-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <TaskTypeBadge recurring={task.isRecurring} />

              {task.overdue && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-bold text-red-800">
                  <AlertTriangle className="size-3.5" />
                  عقب‌افتاده
                </span>
              )}

              {!completedView && task.completed && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="size-3.5" />
                  انجام شده
                </span>
              )}
            </div>

            <Link
              href={`/admin/tasks/${task.id}`}
              className="mt-3 block break-words text-base font-black leading-8 text-slate-950 transition hover:text-blue-700 sm:text-lg"
            >
              {task.title}
            </Link>

            <Link
              href={`/admin/projects/${task.project.id}`}
              className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-sm font-semibold text-slate-500 transition hover:text-blue-700"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-blue-500" />
              {task.project.title}
            </Link>
          </div>

          <span
            className={`inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-extrabold ${getPriorityClass(task.priority)}`}
          >
            اولویت {getPriorityLabel(task.priority)}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3">
            <p className="text-xs font-semibold text-blue-700">مسئول Task</p>

            <p className="mt-2 flex items-center gap-2 truncate text-sm font-extrabold text-slate-900">
              <UserRound className="size-4 shrink-0 text-blue-600" />
              {task.assignedTo.name}
            </p>
          </div>

          <div
            className={`rounded-xl border p-3 ${
              task.completed
                ? "border-emerald-200 bg-emerald-50"
                : task.overdue
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className="text-xs font-semibold text-slate-600">وضعیت</p>

            <p className="mt-2 text-sm font-extrabold text-slate-900">
              {task.completed ? "تکمیل شده" : getStatusLabel(task.status)}
            </p>
          </div>

          <div className="rounded-xl border border-violet-200 bg-violet-50/80 p-3">
            <p className="text-xs font-semibold text-violet-700">
              {completedView ? "زمان انجام" : "Deadline"}
            </p>

            <p className="mt-2 text-sm font-extrabold text-slate-900">
              {completedView
                ? completionTime || "ثبت شده"
                : task.deadline
                  ? formatTime(task.deadline) || "—"
                  : task.occurrenceDate
                    ? "برنامه روز"
                    : "—"}
            </p>
          </div>

          <div
            className={`rounded-xl border p-3 ${
              task.completed
                ? "border-emerald-200 bg-emerald-50"
                : task.overdue
                  ? "border-red-200 bg-red-50"
                  : "border-amber-200 bg-amber-50"
            }`}
          >
            <p className="text-xs font-semibold text-slate-600">
              {task.completed ? "انجام‌دهنده" : "وضعیت پیگیری"}
            </p>

            <p className="mt-2 flex items-center gap-2 truncate text-sm font-extrabold text-slate-900">
              {task.completed ? (
                <>
                  <UserRound className="size-4 shrink-0 text-emerald-600" />
                  {task.completedBy?.name || task.assignedTo.name}
                </>
              ) : task.overdue ? (
                <>
                  <AlertTriangle className="size-4 shrink-0 text-red-600" />
                  نیازمند پیگیری
                </>
              ) : (
                <>
                  <Clock3 className="size-4 shrink-0 text-amber-600" />
                  در انتظار انجام
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {task.completed && task.completedAt ? (
            <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle2 className="size-4" />
              </span>
              در {completionTime} تکمیل شد
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span
                className={`flex size-7 items-center justify-center rounded-lg ${
                  task.isRecurring
                    ? "bg-violet-100 text-violet-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {task.isRecurring ? (
                  <Repeat2 className="size-4" />
                ) : (
                  <CalendarDays className="size-4" />
                )}
              </span>

              {task.isRecurring ? "نوبت این روز" : "Task معمولی"}
            </div>
          )}

          <Link
            href={`/admin/tasks/${task.id}`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
          >
            مشاهده Task
            <ArrowUpLeft className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function EmptyState({
  title,
  description,
  tone = "slate",
}: {
  title: string;
  description: string;
  tone?: "slate" | "emerald" | "amber" | "red";
}) {
  const toneClasses = {
    slate: {
      box: "border-slate-300 bg-slate-50",
      icon: "bg-slate-200 text-slate-600",
      title: "text-slate-800",
      description: "text-slate-500",
    },
    emerald: {
      box: "border-emerald-300 bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-700",
      title: "text-emerald-800",
      description: "text-emerald-700",
    },
    amber: {
      box: "border-amber-300 bg-amber-50",
      icon: "bg-amber-100 text-amber-700",
      title: "text-amber-800",
      description: "text-amber-700",
    },
    red: {
      box: "border-red-300 bg-red-50",
      icon: "bg-red-100 text-red-700",
      title: "text-red-800",
      description: "text-red-700",
    },
  };

  const styles = toneClasses[tone];

  return (
    <div
      className={`flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-8 text-center ${styles.box}`}
    >
      <div
        className={`flex size-14 items-center justify-center rounded-2xl ${styles.icon}`}
      >
        <ListChecks className="size-6" />
      </div>

      <p className={`mt-4 text-sm font-extrabold ${styles.title}`}>{title}</p>

      <p className={`mt-2 max-w-md text-sm leading-7 ${styles.description}`}>
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

  const [days, params] = await Promise.all([
    getAdminQuickAccessData(),
    searchParams,
  ]);

  const selectedIndex = getSelectedDayIndex(params.day);
  const selectedDay = days[selectedIndex];
  const overallStatus = getOverallStatus(selectedDay);

  return (
    <main className="min-h-screen bg-slate-100/90">
      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-blue-900/20 bg-gradient-to-l from-slate-950 via-blue-950 to-indigo-900 p-5 text-white shadow-lg sm:p-7 lg:p-9">
          <div className="pointer-events-none absolute -left-16 -top-24 -z-10 size-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-1/3 -z-10 size-80 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-blue-100">
                <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-300/20 text-cyan-200">
                  <Zap className="size-4" />
                </span>
                مدیریت سریع وضعیت Taskها
              </div>

              <h1 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                دسترسی سریع
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/85 sm:text-base">
                وضعیت انجام Taskها را برای امروز، دیروز و روز قبلش در یک
                نگاه بررسی کنید.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
                <CalendarDays className="size-5" />
              </span>

              <div>
                <p className="text-xs font-semibold text-blue-100/70">
                  تاریخ انتخاب‌شده
                </p>
                <p className="mt-1 text-sm font-extrabold text-white">
                  {formatDate(selectedDay.date)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-label="انتخاب روز"
          className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {DAY_OPTIONS.map((option) => {
              const active = option.index === selectedIndex;

              return (
                <Link
                  key={option.value}
                  href={`/admin/quick-access?day=${option.value}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center justify-center rounded-2xl border px-3 text-sm font-extrabold transition duration-200 sm:min-h-14 sm:text-base ${
                    active
                      ? "border-blue-700 bg-gradient-to-l from-blue-700 to-indigo-700 text-white shadow-md shadow-blue-900/15"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="کل برنامه روز"
            value={selectedDay.overview.planned}
            icon={ListChecks}
            tone="slate"
          />

          <StatCard
            label="تکمیل شده"
            value={selectedDay.completedTasks.length}
            icon={CheckCircle2}
            tone="emerald"
          />

          <StatCard
            label="انجام نشده"
            value={selectedDay.overview.pending}
            icon={Clock3}
            tone="amber"
          />

          <StatCard
            label="عقب‌افتاده"
            value={selectedDay.overview.overdue}
            icon={AlertTriangle}
            tone="red"
          />
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-l from-blue-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                <span className="size-2 rounded-full bg-blue-600" />
                جمع‌بندی روز
              </div>

              <h2 className="mt-2 text-xl font-black text-slate-950">
                وضعیت کلی {selectedDay.label}
              </h2>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-extrabold ${overallStatus.className}`}
            >
              {selectedDay.overview.overdue > 0 ? (
                <AlertTriangle className={`size-4 ${overallStatus.iconClassName}`} />
              ) : selectedDay.overview.pending === 0 &&
                selectedDay.overview.planned > 0 ? (
                <CheckCircle2 className={`size-4 ${overallStatus.iconClassName}`} />
              ) : (
                <Clock3 className={`size-4 ${overallStatus.iconClassName}`} />
              )}

              {overallStatus.label}
            </span>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-bold text-slate-600">
                  میزان تکمیل برنامه
                </span>

                <span className="font-black text-blue-800">
                  {selectedDay.overview.completionRate.toLocaleString("fa-IR")}٪
                </span>
              </div>

              <div
                className="mt-3 h-4 overflow-hidden rounded-full border border-slate-200 bg-slate-100"
                role="progressbar"
                aria-valuenow={selectedDay.overview.completionRate}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="میزان تکمیل برنامه"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-l from-emerald-500 via-teal-500 to-blue-600 transition-all duration-500"
                  style={{
                    width: `${selectedDay.overview.completionRate}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 lg:min-w-56">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <CalendarDays className="size-5" />
              </span>

              <div>
                <p className="text-xs font-bold text-indigo-700">تاریخ</p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {formatDate(selectedDay.date)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-emerald-200 bg-emerald-50/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-900/15">
                  <CheckCircle2 className="size-6" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-emerald-950">
                    تکمیل‌شده‌ها
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-emerald-800">
                    Taskهایی که واقعاً در این روز تکمیل شده‌اند
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-extrabold text-emerald-800">
                {selectedDay.completedTasks.length.toLocaleString("fa-IR")} مورد
              </span>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
              {selectedDay.completedTasks.length === 0 ? (
                <EmptyState
                  title="هنوز Taskی در این روز تکمیل نشده است"
                  description="در صورت ثبت تکمیل Task، انجام‌دهنده و زمان ثبت آن اینجا نمایش داده می‌شود."
                  tone="emerald"
                />
              ) : (
                selectedDay.completedTasks.map((task) => (
                  <TaskRow
                    key={`${task.id}-${task.occurrenceDate?.toISOString() ?? "normal"}`}
                    task={task}
                    completedView
                  />
                ))
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-amber-200 bg-amber-50/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm shadow-amber-900/15">
                  <Clock3 className="size-6" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-amber-950">
                    برنامه روز
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Taskهایی که طبق برنامه باید انجام می‌شدند
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-extrabold text-amber-800">
                {selectedDay.plannedTasks.length.toLocaleString("fa-IR")} مورد
              </span>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
              {selectedDay.plannedTasks.length === 0 ? (
                <EmptyState
                  title="برای این روز Task برنامه‌ریزی نشده است"
                  description="اگر Task معمولی با Deadline این روز یا Task تکرارشونده‌ای در برنامه وجود داشته باشد، اینجا نمایش داده می‌شود."
                  tone="amber"
                />
              ) : (
                selectedDay.plannedTasks.map((task) => (
                  <TaskRow
                    key={`${task.id}-${task.occurrenceDate?.toISOString() ?? "normal"}`}
                    task={task}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-red-200 bg-red-50/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-sm shadow-red-900/15">
                <AlertTriangle className="size-6" />
              </div>

              <div>
                <h2 className="text-lg font-black text-red-950">
                  Taskهای عقب‌افتاده
                </h2>
                <p className="mt-1 text-sm leading-6 text-red-800">
                  مواردی که باید انجام می‌شدند اما هنوز تکمیل نشده‌اند
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-extrabold text-red-800">
              {selectedDay.overdueTasks.length.toLocaleString("fa-IR")} مورد
            </span>
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            {selectedDay.overdueTasks.length === 0 ? (
              <EmptyState
                title="مورد عقب‌افتاده‌ای وجود ندارد"
                description="وضعیت این روز از نظر تأخیر مناسب است."
                tone="emerald"
              />
            ) : (
              selectedDay.overdueTasks.map((task) => (
                <TaskRow
                  key={`${task.id}-${task.occurrenceDate?.toISOString() ?? "normal"}`}
                  task={task}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}