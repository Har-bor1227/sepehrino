import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
  Users,
} from "lucide-react";

import { requireEmployee } from "@/lib/auth/guards";
import { getProjectById } from "@/lib/services/project.service";

const STATUS_LABELS = {
  TODO: "در انتظار",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل شده",
  CANCELLED: "لغو شده",
} as const;

const PRIORITY_LABELS = {
  LOW: "کم",
  MEDIUM: "متوسط",
  HIGH: "زیاد",
  URGENT: "فوری",
} as const;

const PROJECT_STATUS_LABELS = {
  PLANNED: "برنامه‌ریزی شده",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل شده",
  ARCHIVED: "آرشیو شده",
} as const;

function getStatusClass(
  status: keyof typeof STATUS_LABELS,
) {
  const classes = {
    TODO:
      "border-slate-200/60 bg-slate-500/8 text-slate-600",
    IN_PROGRESS:
      "border-blue-200/60 bg-blue-500/8 text-blue-700",
    COMPLETED:
      "border-emerald-200/60 bg-emerald-500/8 text-emerald-700",
    CANCELLED:
      "border-red-200/60 bg-red-500/8 text-red-700",
  };

  return classes[status];
}

function getPriorityClass(
  priority: keyof typeof PRIORITY_LABELS,
) {
  const classes = {
    LOW:
      "border-slate-200/60 bg-slate-500/8 text-slate-600",
    MEDIUM:
      "border-amber-200/60 bg-amber-500/8 text-amber-700",
    HIGH:
      "border-orange-200/60 bg-orange-500/8 text-orange-700",
    URGENT:
      "border-red-200/60 bg-red-500/8 text-red-700",
  };

  return classes[priority];
}

function getProjectStatusClass(
  status: keyof typeof PROJECT_STATUS_LABELS,
) {
  const classes = {
    PLANNED:
      "border-slate-200/60 bg-slate-500/8 text-slate-600",
    IN_PROGRESS:
      "border-blue-200/60 bg-blue-500/8 text-blue-700",
    COMPLETED:
      "border-emerald-200/60 bg-emerald-500/8 text-emerald-700",
    ARCHIVED:
      "border-white/60 bg-white/40 text-slate-500",
  };

  return classes[status];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function isOverdue(
  deadline: Date,
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED",
) {
  return (
    deadline < new Date() &&
    status !== "COMPLETED" &&
    status !== "CANCELLED"
  );
}

function getProgressRingStyle(progress: number) {
  const safeProgress = Math.min(
    Math.max(progress, 0),
    100,
  );

  const degree = safeProgress * 3.6;

  return {
    background: `conic-gradient(rgb(15 23 42) ${degree}deg, rgba(15, 23, 42, 0.08) ${degree}deg)`,
  };
}

export default async function EmployeeProjectDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  await requireEmployee();

  const { id } = await params;

  let project;

  try {
    project = await getProjectById(id);
  } catch {
    notFound();
  }

  if (!project || !("tasks" in project)) {
    notFound();
  }

  const totalTasks = project.tasks.length;

  const completedTasks = project.tasks.filter(
    (task) =>
      task.status === "COMPLETED",
  ).length;

  const inProgressTasks = project.tasks.filter(
    (task) =>
      task.status === "IN_PROGRESS",
  ).length;

  const todoTasks = project.tasks.filter(
    (task) =>
      task.status === "TODO",
  ).length;

  const cancelledTasks = project.tasks.filter(
    (task) =>
      task.status === "CANCELLED",
  ).length;

  const overdueTasks = project.tasks.filter(
    (task) =>
      isOverdue(
        task.deadline,
        task.status,
      ),
  ).length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) *
            100,
        );

  const sortedTasks = [...project.tasks].sort(
    (a, b) =>
      a.deadline.getTime() -
      b.deadline.getTime(),
  );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-5 sm:px-6 lg:space-y-6 lg:px-8 lg:py-8">
        <Link
          href="/employee/projects"
          className="glass-icon inline-flex h-10 items-center gap-2 rounded-2xl px-4 text-sm font-semibold text-slate-600 transition hover:-translate-y-px hover:bg-white/80"
        >
          <ArrowRight className="size-4" />
          بازگشت به پروژه‌ها
        </Link>

        <section className="glass-strong overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getProjectStatusClass(
                    project.status,
                  )}`}
                >
                  {PROJECT_STATUS_LABELS[
                    project.status
                  ]}
                </span>

                <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500">
                  پروژه
                </span>
              </div>

              <h1 className="mt-5 break-words text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                {project.title}
              </h1>

              {project.description ? (
                <p className="mt-3 max-w-4xl whitespace-pre-wrap text-sm leading-8 text-slate-500">
                  {project.description}
                </p>
              ) : (
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  توضیحی برای این پروژه ثبت نشده است.
                </p>
              )}

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="elevated-hover rounded-2xl border border-white/50 bg-white/28 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    کل Task
                  </p>

                  <p className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
                    {totalTasks.toLocaleString(
                      "fa-IR",
                    )}
                  </p>
                </div>

                <div className="elevated-hover rounded-2xl border border-emerald-200/45 bg-emerald-50/45 p-4">
                  <p className="text-xs font-medium text-emerald-700">
                    تکمیل شده
                  </p>

                  <p className="mt-2 text-xl font-extrabold tracking-tight text-emerald-800">
                    {completedTasks.toLocaleString(
                      "fa-IR",
                    )}
                  </p>
                </div>

                <div className="elevated-hover rounded-2xl border border-blue-200/45 bg-blue-50/45 p-4">
                  <p className="text-xs font-medium text-blue-700">
                    در حال انجام
                  </p>

                  <p className="mt-2 text-xl font-extrabold tracking-tight text-blue-800">
                    {inProgressTasks.toLocaleString(
                      "fa-IR",
                    )}
                  </p>
                </div>

                <div className="elevated-hover rounded-2xl border border-red-200/45 bg-red-50/45 p-4">
                  <p className="text-xs font-medium text-red-700">
                    عقب‌افتاده
                  </p>

                  <p className="mt-2 text-xl font-extrabold tracking-tight text-red-800">
                    {overdueTasks.toLocaleString(
                      "fa-IR",
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    پیشرفت Taskهای من
                  </p>

                  <p className="mt-1 text-4xl font-extrabold tracking-tight text-slate-900">
                    {progress.toLocaleString(
                      "fa-IR",
                    )}

                    <span className="mr-1 text-lg text-slate-400">
                      ٪
                    </span>
                  </p>
                </div>

                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-full p-1"
                  style={getProgressRingStyle(
                    progress,
                  )}
                >
                  <div className="flex size-full items-center justify-center rounded-full bg-white/90">
                    <CheckCircle2 className="size-5 text-slate-700" />
                  </div>
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-900/7">
                <div
                  className="h-full rounded-full bg-slate-800 transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs leading-6 text-slate-400">
                {completedTasks.toLocaleString(
                  "fa-IR",
                )}{" "}
                از{" "}
                {totalTasks.toLocaleString(
                  "fa-IR",
                )}{" "}
                Task تکمیل شده است.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-white/55 bg-white/35 p-3">
                  <p className="text-[11px] font-medium text-slate-400">
                    در انتظار
                  </p>

                  <p className="mt-1 text-sm font-extrabold text-slate-800">
                    {todoTasks.toLocaleString(
                      "fa-IR",
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/55 bg-white/35 p-3">
                  <p className="text-[11px] font-medium text-slate-400">
                    در حال انجام
                  </p>

                  <p className="mt-1 text-sm font-extrabold text-slate-800">
                    {inProgressTasks.toLocaleString(
                      "fa-IR",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 border-t border-white/40 pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="glass-chip rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500">
                {todoTasks.toLocaleString(
                  "fa-IR",
                )}{" "}
                در انتظار
              </span>

              <span className="rounded-full border border-blue-200/55 bg-blue-50/45 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {inProgressTasks.toLocaleString(
                  "fa-IR",
                )}{" "}
                در حال انجام
              </span>

              <span className="rounded-full border border-emerald-200/55 bg-emerald-50/45 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                {completedTasks.toLocaleString(
                  "fa-IR",
                )}{" "}
                تکمیل شده
              </span>

              <span className="rounded-full border border-red-200/55 bg-red-50/45 px-3 py-1.5 text-xs font-semibold text-red-700">
                {cancelledTasks.toLocaleString(
                  "fa-IR",
                )}{" "}
                لغو شده
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="elevated-hover flex items-center gap-3 rounded-2xl border border-white/45 bg-white/25 p-4">
              <div className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-xl">
                <CalendarDays className="size-4.5 text-slate-500" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-400">
                  تاریخ شروع
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {formatDate(
                    project.startDate,
                  )}
                </p>
              </div>
            </div>

            <div className="elevated-hover flex items-center gap-3 rounded-2xl border border-white/45 bg-white/25 p-4">
              <div className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-xl">
                <CalendarDays className="size-4.5 text-slate-500" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-400">
                  Deadline پروژه
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {formatDate(
                    project.deadline,
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card overflow-hidden rounded-[2rem]">
          <div className="border-b border-white/40 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-11 items-center justify-center rounded-2xl">
                  <ListChecks className="size-5 text-slate-600" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Taskهای پروژه
                  </h2>

                  <p className="mt-1 text-xs leading-6 text-slate-400">
                    Taskهایی که برای شما قابل مشاهده هستند در این بخش نمایش داده می‌شوند.
                  </p>
                </div>
              </div>

              <span className="glass-chip inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500">
                <ListChecks className="size-3.5" />

                {sortedTasks.length.toLocaleString(
                  "fa-IR",
                )}{" "}
                Task
              </span>
            </div>
          </div>

          {sortedTasks.length === 0 ? (
            <div className="soft-grid px-6 py-14 text-center sm:px-12">
              <div className="glass-icon mx-auto flex size-14 items-center justify-center rounded-2xl">
                <ListChecks className="size-6 text-slate-400" />
              </div>

              <p className="mt-4 font-bold text-slate-800">
                Taskی برای این پروژه ندارید
              </p>

              <p className="mx-auto mt-1 max-w-md text-sm leading-7 text-slate-400">
                هنوز وظیفه‌ای از این پروژه به شما اختصاص داده نشده است.
              </p>

              <Link
                href="/employee/tasks"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition hover:-translate-y-px hover:bg-slate-800"
              >
                مشاهده Taskهای من
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/35">
              {sortedTasks.map(
                (task) => {
                  const overdue =
                    isOverdue(
                      task.deadline,
                      task.status,
                    );

                  return (
                    <Link
                      key={task.id}
                      href={`/employee/tasks/${task.id}`}
                      className="group block p-5 transition hover:bg-white/25 sm:p-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-words font-bold text-slate-800 transition group-hover:text-slate-950">
                              {task.title}
                            </h3>

                            {overdue ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-red-200/55 bg-red-50/65 px-2.5 py-1 text-[11px] font-bold text-red-700">
                                <AlertTriangle className="size-3" />
                                عقب‌افتاده
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                                task.status,
                              )}`}
                            >
                              {STATUS_LABELS[
                                task.status
                              ]}
                            </span>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${getPriorityClass(
                                task.priority,
                              )}`}
                            >
                              اولویت{" "}
                              {PRIORITY_LABELS[
                                task.priority
                              ]}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center lg:shrink-0 lg:justify-end">
                          <div className="glass-chip inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-slate-500">
                            <CalendarDays className="size-3.5" />

                            {formatDate(
                              task.deadline,
                            )}
                          </div>

                          <div className="glass-chip inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-slate-500">
                            <Clock3 className="size-3.5" />

                            مشاهده Task
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                },
              )}
            </div>
          )}
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <ListChecks className="size-4" />
              کل Taskها
            </div>

            <p className="mt-2 text-xl font-extrabold text-slate-900">
              {totalTasks.toLocaleString(
                "fa-IR",
              )}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="size-4" />
              تکمیل‌شده
            </div>

            <p className="mt-2 text-xl font-extrabold text-emerald-800">
              {completedTasks.toLocaleString(
                "fa-IR",
              )}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Users className="size-4" />
              وضعیت پروژه
            </div>

            <p className="mt-2 text-sm font-extrabold text-slate-800">
              {PROJECT_STATUS_LABELS[
                project.status
              ]}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}