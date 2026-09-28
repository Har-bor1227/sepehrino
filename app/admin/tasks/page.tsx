import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
  Plus,
  UserRound,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/guards";
import { getAdminTasks } from "@/lib/services/task.service";
import { getAdminProjects } from "@/lib/services/project.service";

import CreateTaskForm from "@/components/tasks/create-task-form";

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
      "border-blue-200/55 bg-blue-50/50 text-blue-700",
    COMPLETED:
      "border-emerald-200/55 bg-emerald-50/50 text-emerald-700",
    CANCELLED:
      "border-red-200/55 bg-red-50/50 text-red-700",
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
    | "blue"
    | "emerald"
    | "amber"
    | "red";
}) {
  const toneClasses = {
    slate: {
      icon: "bg-slate-900/7 text-slate-600",
      value: "text-slate-900",
    },
    blue: {
      icon: "bg-blue-500/8 text-blue-600",
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
    <div className="glass-card rounded-3xl p-5 transition hover:-translate-y-px">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`glass-icon flex size-11 items-center justify-center rounded-2xl ${toneClasses[tone].icon}`}
        >
          <Icon className="size-5" />
        </div>

        <span className="text-[10px] font-semibold text-slate-300">
          وضعیت
        </span>
      </div>

      <p className="mt-5 text-xs font-medium text-slate-400">
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

export default async function AdminTasksPage() {
  await requireAdmin();

  const [tasks, projects] =
    await Promise.all([
      getAdminTasks(),
      getAdminProjects(),
    ]);

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

  const todoTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "TODO",
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
    );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="glass-strong overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="glass-icon flex size-9 items-center justify-center rounded-xl">
                  <ListChecks className="size-4 text-slate-600" />
                </div>

                مدیریت Taskها
              </div>

              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                Taskهای سازمان
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                ساخت، تخصیص و پیگیری Taskهای تمام پروژه‌ها در یک محیط یکپارچه.
              </p>
            </div>

            <Link
              href="#create-task"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(15,23,42,0.16)] transition hover:-translate-y-px hover:bg-slate-800 sm:w-auto"
            >
              <Plus className="size-4" />
              ایجاد Task
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="کل Taskها"
            value={totalTasks}
            icon={ListChecks}
            tone="slate"
          />

          <StatCard
            label="در حال انجام"
            value={inProgressTasks}
            icon={Clock3}
            tone="blue"
          />

          <StatCard
            label="تکمیل شده"
            value={completedTasks}
            icon={CheckCircle2}
            tone="emerald"
          />

          <StatCard
            label="در انتظار"
            value={todoTasks}
            icon={CalendarDays}
            tone="amber"
          />

          <StatCard
            label="عقب‌افتاده"
            value={overdueTasks}
            icon={AlertTriangle}
            tone="red"
          />
        </section>

        <section
          id="create-task"
          className="glass-card scroll-mt-8 rounded-[2rem]"
        >
          <div className="border-b border-white/40 p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                    <Plus className="size-5 text-slate-600" />
                  </div>

                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                    ایجاد Task جدید
                  </h2>
                </div>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                  کارمند فقط از میان اعضای فعال همان پروژه قابل انتخاب است.
                </p>
              </div>

              <span className="glass-chip w-fit rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500">
                {activeProjects.length.toLocaleString(
                  "fa-IR",
                )}{" "}
                پروژه فعال
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 lg:p-8">
            {projects.length === 0 ? (
              <div className="soft-grid flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/40 bg-white/20 px-6 text-center">
                <div className="glass-icon flex size-14 items-center justify-center rounded-2xl">
                  <ListChecks className="size-6 text-slate-400" />
                </div>

                <p className="mt-4 font-bold text-slate-700">
                  هنوز پروژه‌ای برای ایجاد Task وجود ندارد.
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  ابتدا یک پروژه ایجاد کنید.
                </p>

                <Link
                  href="/admin/projects"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  مدیریت پروژه‌ها
                </Link>
              </div>
            ) : activeProjects.length === 0 ? (
              <div className="soft-grid flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-amber-200/50 bg-amber-50/25 px-6 text-center">
                <div className="glass-icon flex size-14 items-center justify-center rounded-2xl bg-amber-500/8">
                  <AlertTriangle className="size-6 text-amber-600" />
                </div>

                <p className="mt-4 font-bold text-slate-700">
                  پروژه فعالی برای ایجاد Task وجود ندارد.
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  پروژه‌های تکمیل‌شده و آرشیوشده در این فرم قابل انتخاب نیستند.
                </p>

                <Link
                  href="/admin/projects"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-white/60 bg-white/45 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white/70"
                >
                  مشاهده پروژه‌ها
                </Link>
              </div>
            ) : (
              <CreateTaskForm
                projects={activeProjects.map(
                  (project) => ({
                    id: project.id,
                    title: project.title,
                    status:
                      project.status,
                    members:
                      project.members.map(
                        (member) => ({
                          user: member.user,
                        }),
                      ),
                  }),
                )}
              />
            )}
          </div>
        </section>

        <section className="glass-card overflow-hidden rounded-[2rem]">
          <div className="flex flex-col gap-3 border-b border-white/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                فهرست Taskها
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                جدیدترین Taskها در ابتدای فهرست نمایش داده می‌شوند.
              </p>
            </div>

            <span className="glass-chip w-fit rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500">
              {totalTasks.toLocaleString(
                "fa-IR",
              )}{" "}
              مورد
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="soft-grid flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="glass-icon flex size-14 items-center justify-center rounded-2xl">
                <ListChecks className="size-6 text-slate-400" />
              </div>

              <h3 className="mt-4 font-bold text-slate-800">
                هنوز Taskی ثبت نشده است
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                اولین Task را از فرم بالا ایجاد کنید.
              </p>
            </div>
          ) : (
            <>
              <div className="thin-scrollbar hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1100px] text-right">
                  <thead>
                    <tr className="border-y border-white/40 bg-white/25 text-xs font-bold text-slate-500">
                      <th className="px-6 py-4">
                        Task
                      </th>

                      <th className="px-6 py-4">
                        پروژه
                      </th>

                      <th className="px-6 py-4">
                        مسئول
                      </th>

                      <th className="px-6 py-4">
                        وضعیت
                      </th>

                      <th className="px-6 py-4">
                        اولویت
                      </th>

                      <th className="px-6 py-4">
                        Deadline
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {tasks.map(
                      (task) => {
                        const overdue =
                          isOverdue(
                            task.deadline,
                            task.status,
                          );

                        return (
                          <tr
                            key={
                              task.id
                            }
                            className="border-b border-white/30 transition hover:bg-white/30 last:border-b-0"
                          >
                            <td className="px-6 py-5">
                              <div>
                                <Link
                                  href={`/admin/tasks/${task.id}`}
                                  className="block max-w-[320px] truncate font-bold text-slate-800 transition hover:text-slate-950"
                                >
                                  {
                                    task.title
                                  }
                                </Link>

                                {task.description ? (
                                  <p className="mt-1 max-w-[320px] truncate text-xs text-slate-400">
                                    {
                                      task.description
                                    }
                                  </p>
                                ) : null}

                                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                                  <span>
                                    {task._count.comments.toLocaleString(
                                      "fa-IR",
                                    )}{" "}
                                    کامنت
                                  </span>

                                  <span>
                                    {task._count.attachments.toLocaleString(
                                      "fa-IR",
                                    )}{" "}
                                    فایل
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <Link
                                href={`/admin/projects/${task.project.id}`}
                                className="font-semibold text-slate-600 transition hover:text-slate-950"
                              >
                                {
                                  task
                                    .project
                                    .title
                                }
                              </Link>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                <div className="glass-icon flex size-9 items-center justify-center rounded-xl text-slate-500">
                                  <UserRound className="size-4" />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-slate-700">
                                    {
                                      task
                                        .assignedTo
                                        .name
                                    }
                                  </p>

                                  <p
                                    dir="ltr"
                                    className="max-w-44 truncate text-xs text-slate-400"
                                  >
                                    {
                                      task
                                        .assignedTo
                                        .email
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
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
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getPriorityClass(
                                  task.priority,
                                )}`}
                              >
                                {
                                  PRIORITY_LABELS[
                                    task.priority
                                  ]
                                }
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <div
                                className={
                                  overdue
                                    ? "text-red-600"
                                    : "text-slate-500"
                                }
                              >
                                <p className="text-sm font-bold">
                                  {formatDate(
                                    task.deadline,
                                  )}
                                </p>

                                {overdue ? (
                                  <p className="mt-1 text-xs font-semibold">
                                    عقب‌افتاده
                                  </p>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/30 lg:hidden">
                {tasks.map(
                  (task) => {
                    const overdue =
                      isOverdue(
                        task.deadline,
                        task.status,
                      );

                    return (
                      <article
                        key={
                          task.id
                        }
                        className="p-5 transition hover:bg-white/18"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Link
                              href={`/admin/tasks/${task.id}`}
                              className="block break-words font-bold text-slate-800"
                            >
                              {
                                task.title
                              }
                            </Link>

                            <Link
                              href={`/admin/projects/${task.project.id}`}
                              className="mt-1 block truncate text-sm text-slate-400"
                            >
                              {
                                task
                                  .project
                                  .title
                              }
                            </Link>
                          </div>

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
                        </div>

                        {task.description ? (
                          <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-500">
                            {
                              task.description
                            }
                          </p>
                        ) : null}

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-white/45 bg-white/24 p-3">
                            <p className="text-[11px] text-slate-400">
                              مسئول
                            </p>

                            <p className="mt-1 truncate text-sm font-bold text-slate-700">
                              {
                                task
                                  .assignedTo
                                  .name
                              }
                            </p>
                          </div>

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
                                  : "text-slate-700"
                              }`}
                            >
                              {formatDate(
                                task.deadline,
                              )}
                            </p>

                            {overdue ? (
                              <p className="mt-1 text-[11px] font-semibold text-red-500">
                                عقب‌افتاده
                              </p>
                            ) : null}
                          </div>

                          <div className="rounded-2xl border border-white/45 bg-white/24 p-3">
                            <p className="text-[11px] text-slate-400">
                              تعاملات
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-700">
                              {(
                                task._count.comments +
                                task._count.attachments
                              ).toLocaleString(
                                "fa-IR",
                              )}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              کامنت و فایل
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Link
                            href={`/admin/tasks/${task.id}`}
                            className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/60 bg-white/45 text-sm font-semibold text-slate-700 transition hover:bg-white/70"
                          >
                            مشاهده جزئیات Task
                          </Link>
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