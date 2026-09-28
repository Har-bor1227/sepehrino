import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListChecks,
  Timer,
} from "lucide-react";

import { requireEmployee } from "@/lib/auth/guards";
import { getEmployeeProjects } from "@/lib/services/project.service";
import { getEmployeeTasks } from "@/lib/services/task.service";
import {
  getUnreadNotificationCount,
} from "@/lib/services/notification.service";

type EmployeeProject = Extract<
  Awaited<
    ReturnType<typeof getEmployeeProjects>
  >[number],
  {
    tasks: unknown[];
  }
>;

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

function getStatusClass(
  status: keyof typeof STATUS_LABELS,
) {
  const classes = {
    TODO:
      "border-slate-200/55 bg-slate-500/8 text-slate-700",
    IN_PROGRESS:
      "border-blue-200/55 bg-blue-50/45 text-blue-700",
    COMPLETED:
      "border-emerald-200/55 bg-emerald-50/45 text-emerald-700",
    CANCELLED:
      "border-red-200/55 bg-red-50/45 text-red-700",
  };

  return classes[status];
}

function getPriorityClass(
  priority: keyof typeof PRIORITY_LABELS,
) {
  const classes = {
    LOW:
      "border-slate-200/55 bg-slate-500/8 text-slate-600",
    MEDIUM:
      "border-amber-200/55 bg-amber-50/45 text-amber-700",
    HIGH:
      "border-orange-200/55 bg-orange-50/45 text-orange-700",
    URGENT:
      "border-red-200/55 bg-red-50/45 text-red-700",
  };

  return classes[priority];
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

function DashboardStat({
  label,
  value,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: number;
  icon: typeof FolderKanban;
  tone:
    | "slate"
    | "blue"
    | "emerald"
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
    red:
      "bg-red-500/8 text-red-600",
  };

  const content = (
    <div className="glass-card rounded-[1.75rem] p-5 transition duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`glass-icon flex size-11 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
        >
          <Icon className="size-5" />
        </div>

        {href ? (
          <ArrowLeft className="size-4 text-slate-300" />
        ) : null}
      </div>

      <p className="mt-5 text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
        {value.toLocaleString("fa-IR")}
      </p>
    </div>
  );

  return href ? (
    <Link
      href={href}
      className="block"
    >
      {content}
    </Link>
  ) : (
    content
  );
}

export default async function EmployeeDashboardPage() {
  const session =
    await requireEmployee();

  const [
    projects,
    tasks,
    unreadNotifications,
  ] = await Promise.all([
    getEmployeeProjects(),
    getEmployeeTasks(),
    getUnreadNotificationCount(),
  ]);

  const employeeProjects =
    projects.filter(
      (
        project,
      ): project is EmployeeProject =>
        "tasks" in project,
    );

  const totalTasks =
    tasks.length;

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "COMPLETED",
    ).length;

  const inProgressTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "IN_PROGRESS",
    ).length;

  const overdueTasks =
    tasks.filter((task) =>
      isOverdue(
        task.deadline,
        task.status,
      ),
    ).length;

  const activeProjects =
    projects.filter(
      (project) =>
        project.status !==
          "COMPLETED" &&
        project.status !==
          "ARCHIVED",
    ).length;

  const upcomingTasks =
    tasks
      .filter(
        (task) =>
          task.status !==
            "COMPLETED" &&
          task.status !==
            "CANCELLED",
      )
      .sort(
        (a, b) =>
          a.deadline.getTime() -
          b.deadline.getTime(),
      )
      .slice(0, 5);

  const recentProjects =
    employeeProjects.slice(
      0,
      5,
    );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="glass-strong overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                  <FolderKanban className="size-5 text-slate-600" />
                </div>

                <span className="text-xs font-bold text-slate-400">
                  پنل کارمند
                </span>
              </div>

              <h1 className="mt-4 truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                سلام، {session.user.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                نمای کلی پروژه‌ها، وظایف و وضعیت کاری شما در یک نگاه.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Link
                href="/employee/tasks"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.14)] transition hover:bg-slate-800"
              >
                <ListChecks className="size-4" />
                Taskهای من
              </Link>

              <Link
                href="/employee/notifications"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/42 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white/65"
              >
                <Bell className="size-4" />
                اعلان‌ها

                {unreadNotifications >
                0 ? (
                  <span className="flex size-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                    {unreadNotifications.toLocaleString(
                      "fa-IR",
                    )}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardStat
            label="پروژه‌های فعال"
            value={activeProjects}
            icon={FolderKanban}
            tone="slate"
            href="/employee/projects"
          />

          <DashboardStat
            label="کل Taskهای من"
            value={totalTasks}
            icon={ListChecks}
            tone="slate"
            href="/employee/tasks"
          />

          <DashboardStat
            label="در حال انجام"
            value={inProgressTasks}
            icon={Clock3}
            tone="blue"
            href="/employee/tasks?status=IN_PROGRESS"
          />

          <DashboardStat
            label="تکمیل شده"
            value={completedTasks}
            icon={CheckCircle2}
            tone="emerald"
            href="/employee/tasks?status=COMPLETED"
          />

          <DashboardStat
            label="عقب‌افتاده"
            value={overdueTasks}
            icon={AlertTriangle}
            tone="red"
            href="/employee/tasks"
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <section className="glass-card overflow-hidden rounded-[2rem]">
            <div className="flex flex-col gap-3 border-b border-white/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                    <Timer className="size-5 text-slate-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Taskهای نزدیک
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      وظایفی که باید زودتر پیگیری شوند.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/employee/tasks"
                className="inline-flex w-fit items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-white/40 hover:text-slate-900"
              >
                مشاهده همه
                <ArrowLeft className="size-3.5" />
              </Link>
            </div>

            {upcomingTasks.length ===
            0 ? (
              <div className="soft-grid flex min-h-52 flex-col items-center justify-center px-6 text-center">
                <div className="glass-icon flex size-14 items-center justify-center rounded-2xl">
                  <Timer className="size-6 text-slate-400" />
                </div>

                <p className="mt-4 font-bold text-slate-700">
                  Task فعالی ندارید
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  در حال حاضر وظیفه‌ای برای پیگیری وجود ندارد.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/30">
                {upcomingTasks.map(
                  (task) => {
                    const overdue =
                      isOverdue(
                        task.deadline,
                        task.status,
                      );

                    return (
                      <Link
                        key={
                          task.id
                        }
                        href={`/employee/tasks/${task.id}`}
                        className="block p-5 transition hover:bg-white/22 sm:p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-800">
                              {
                                task.title
                              }
                            </h3>

                            <p className="mt-1 truncate text-sm text-slate-400">
                              {
                                task
                                  .project
                                  .title
                              }
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold ${getStatusClass(
                              task.status,
                            )}`}
                          >
                            {
                              STATUS_LABELS[
                                task.status
                              ]
                            }
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${getPriorityClass(
                              task.priority,
                            )}`}
                          >
                            اولویت{" "}
                            {
                              PRIORITY_LABELS[
                                task.priority
                              ]
                            }
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                              overdue
                                ? "border-red-200/40 bg-red-50/40 text-red-700"
                                : "border-white/50 bg-white/24 text-slate-500"
                            }`}
                          >
                            {overdue ? (
                              <AlertTriangle className="size-3.5" />
                            ) : (
                              <CalendarDays className="size-3.5" />
                            )}

                            {formatDate(
                              task.deadline,
                            )}

                            {overdue
                              ? " — عقب‌افتاده"
                              : ""}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                            مشاهده Task
                            <ArrowLeft className="size-3.5" />
                          </span>
                        </div>
                      </Link>
                    );
                  },
                )}
              </div>
            )}
          </section>

          <section className="glass-card overflow-hidden rounded-[2rem]">
            <div className="flex flex-col gap-3 border-b border-white/40 p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                    <FolderKanban className="size-5 text-slate-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      پروژه‌های من
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      پروژه‌هایی که عضو آن‌ها هستید.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/employee/projects"
                className="inline-flex w-fit items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-white/40 hover:text-slate-900"
              >
                مشاهده همه
                <ArrowLeft className="size-3.5" />
              </Link>
            </div>

            {recentProjects.length ===
            0 ? (
              <div className="soft-grid flex min-h-52 flex-col items-center justify-center px-6 text-center">
                <div className="glass-icon flex size-14 items-center justify-center rounded-2xl">
                  <FolderKanban className="size-6 text-slate-400" />
                </div>

                <p className="mt-4 font-bold text-slate-700">
                  هنوز عضو پروژه‌ای نیستید
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/30">
                {recentProjects.map(
                  (project) => {
                    const ownCompleted =
                      project.tasks.filter(
                        (task) =>
                          task.status ===
                          "COMPLETED",
                      ).length;

                    const ownTotal =
                      project.tasks
                        .length;

                    const ownProgress =
                      ownTotal === 0
                        ? 0
                        : Math.round(
                            (ownCompleted /
                              ownTotal) *
                              100,
                          );

                    return (
                      <Link
                        key={
                          project.id
                        }
                        href={`/employee/projects/${project.id}`}
                        className="block p-5 transition hover:bg-white/22 sm:p-6"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-800">
                              {
                                project.title
                              }
                            </h3>

                            {project.description ? (
                              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
                                {
                                  project.description
                                }
                              </p>
                            ) : null}
                          </div>

                          <span className="shrink-0 rounded-full border border-white/50 bg-white/24 px-3 py-1.5 text-[11px] font-bold text-slate-500">
                            {project.status ===
                            "PLANNED"
                              ? "برنامه‌ریزی"
                              : project.status ===
                                  "IN_PROGRESS"
                                ? "در حال انجام"
                                : project.status ===
                                    "COMPLETED"
                                  ? "تکمیل شده"
                                  : "آرشیو شده"}
                          </span>
                        </div>

                        <div className="mt-5">
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                              پیشرفت Taskهای من
                            </span>

                            <strong className="text-slate-700">
                              {ownProgress.toLocaleString(
                                "fa-IR",
                              )}
                              ٪
                            </strong>
                          </div>

                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-900/7">
                            <div
                              className="h-full rounded-full bg-slate-800 transition-all"
                              style={{
                                width: `${ownProgress}%`,
                              }}
                            />
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
                            <span>
                              {ownTotal.toLocaleString(
                                "fa-IR",
                              )}{" "}
                              Task
                            </span>

                            <span>
                              {ownCompleted.toLocaleString(
                                "fa-IR",
                              )}{" "}
                              تکمیل شده
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  },
                )}
              </div>
            )}
          </section>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <Link
            href="/employee/projects"
            className="glass-card group rounded-[1.75rem] p-5 transition hover:-translate-y-0.5 hover:bg-white/42 sm:p-6"
          >
            <div className="glass-icon flex size-11 items-center justify-center rounded-2xl">
              <FolderKanban className="size-5 text-slate-600" />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <h3 className="font-extrabold text-slate-800">
                پروژه‌های من
              </h3>

              <ArrowLeft className="size-4 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-slate-500" />
            </div>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              مشاهده پروژه‌ها، وضعیت پیشرفت و Taskهای هر پروژه.
            </p>
          </Link>

          <Link
            href="/employee/tasks"
            className="glass-card group rounded-[1.75rem] p-5 transition hover:-translate-y-0.5 hover:bg-white/42 sm:p-6"
          >
            <div className="glass-icon flex size-11 items-center justify-center rounded-2xl">
              <ListChecks className="size-5 text-slate-600" />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <h3 className="font-extrabold text-slate-800">
                Taskهای من
              </h3>

              <ArrowLeft className="size-4 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-slate-500" />
            </div>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              مشاهده و بروزرسانی وضعیت تمام Taskهای اختصاص‌یافته.
            </p>
          </Link>

          <Link
            href="/employee/notifications"
            className="glass-card group rounded-[1.75rem] p-5 transition hover:-translate-y-0.5 hover:bg-white/42 sm:p-6"
          >
            <div className="glass-icon flex size-11 items-center justify-center rounded-2xl">
              <Bell className="size-5 text-slate-600" />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <h3 className="font-extrabold text-slate-800">
                اعلان‌ها
              </h3>

              <ArrowLeft className="size-4 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-slate-500" />
            </div>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              مشاهده اعلان‌های مربوط به Taskها و پروژه‌های شما.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}