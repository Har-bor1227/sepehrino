import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FolderKanban,
  ListChecks,
  UserCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getAdminDashboardData } from "@/lib/services/admin-dashboard.service";

const PROJECT_STATUS_LABELS = {
  PLANNED: "برنامه‌ریزی شده",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل شده",
  ARCHIVED: "آرشیو شده",
} as const;

const ACTION_LABELS: Record<string, string> = {
  EMPLOYEE_CREATED: "کارمند ایجاد شد",
  EMPLOYEE_UPDATED: "اطلاعات کارمند بروزرسانی شد",
  EMPLOYEE_STATUS_CHANGED: "وضعیت کارمند تغییر کرد",

  PROJECT_CREATED: "پروژه ایجاد شد",
  PROJECT_UPDATED: "پروژه بروزرسانی شد",
  PROJECT_DELETED: "پروژه حذف شد",
  PROJECT_STATUS_CHANGED: "وضعیت پروژه تغییر کرد",
  PROJECT_MEMBER_ADDED: "عضو به پروژه اضافه شد",
  PROJECT_MEMBER_REMOVED: "عضو از پروژه حذف شد",

  TASK_CREATED: "Task ایجاد شد",
  TASK_UPDATED: "Task بروزرسانی شد",
  TASK_DELETED: "Task حذف شد",
  TASK_ASSIGNED: "Task تخصیص داده شد",
  TASK_STATUS_CHANGED: "وضعیت Task تغییر کرد",
  TASK_PRIORITY_CHANGED: "اولویت Task تغییر کرد",
  TASK_DEADLINE_CHANGED: "Deadline Task تغییر کرد",
  TASK_COMPLETED: "Task تکمیل شد",

  COMMENT_CREATED: "کامنت ایجاد شد",

  ATTACHMENT_ADDED: "فایل به Task اضافه شد",
  ATTACHMENT_DELETED: "فایل Task حذف شد",

  NOTIFICATION_CREATED: "اعلان ایجاد شد",
  NOTIFICATION_READ: "اعلان خوانده شد",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getActivityHref(
  entityType: string,
  entityId: string | null,
) {
  if (!entityId) {
    return null;
  }

  switch (entityType) {
    case "TASK":
      return `/admin/tasks/${entityId}`;

    case "PROJECT":
      return `/admin/projects/${entityId}`;

    case "USER":
      return `/admin/employees/${entityId}`;

    case "NOTIFICATION":
      return "/admin/notifications";

    default:
      return null;
  }
}

function getProjectStatusClass(
  status: keyof typeof PROJECT_STATUS_LABELS,
) {
  const classes = {
    PLANNED:
      "border-slate-200/60 bg-slate-500/8 text-slate-700",
    IN_PROGRESS:
      "border-blue-200/60 bg-blue-500/8 text-blue-700",
    COMPLETED:
      "border-emerald-200/60 bg-emerald-500/8 text-emerald-700",
    ARCHIVED:
      "border-white/60 bg-white/35 text-slate-500",
  };

  return classes[status];
}

function DashboardStat({
  href,
  label,
  value,
  suffix,
  icon: Icon,
  tone,
}: {
  href: string;
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  tone: "slate" | "blue" | "red" | "emerald";
}) {
  const toneClasses = {
    slate: {
      icon: "bg-slate-900/7 text-slate-600",
      glow: "group-hover:border-slate-300/45",
      value: "text-slate-900",
    },
    blue: {
      icon: "bg-blue-500/8 text-blue-600",
      glow: "group-hover:border-blue-200/55",
      value: "text-slate-900",
    },
    red: {
      icon: "bg-red-500/8 text-red-600",
      glow: "group-hover:border-red-200/55",
      value: "text-red-700",
    },
    emerald: {
      icon: "bg-emerald-500/8 text-emerald-600",
      glow: "group-hover:border-emerald-200/55",
      value: "text-slate-900",
    },
  };

  return (
    <Link
      href={href}
      className={`glass-card group rounded-[1.75rem] p-5 transition duration-200 hover:-translate-y-1 hover:bg-white/42 ${toneClasses[tone].glow}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`glass-icon flex size-11 items-center justify-center rounded-2xl ${toneClasses[tone].icon}`}
        >
          <Icon className="size-5" />
        </div>

        <ArrowLeft className="size-4 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-slate-500" />
      </div>

      <p className="mt-5 text-xs font-semibold text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-end gap-2">
        <p
          className={`text-3xl font-extrabold tracking-tight ${toneClasses[tone].value}`}
        >
          {value.toLocaleString("fa-IR")}
        </p>

        {suffix ? (
          <span className="mb-1 text-xs font-medium text-slate-400">
            {suffix}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="soft-grid flex min-h-52 flex-col items-center justify-center px-6 text-center">
      <div className="glass-icon flex size-14 items-center justify-center rounded-2xl">
        <Icon className="size-6 text-slate-400" />
      </div>

      <p className="mt-4 font-bold text-slate-700">
        {title}
      </p>

      {description ? (
        <p className="mt-1 max-w-sm text-sm leading-7 text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const data =
    await getAdminDashboardData();

  const taskTotal =
    data.tasks.total || 1;

  const todoPercentage =
    Math.round(
      (data.tasks.todo /
        taskTotal) *
        100,
    );

  const inProgressPercentage =
    Math.round(
      (data.tasks.inProgress /
        taskTotal) *
        100,
    );

  const completedPercentage =
    Math.round(
      (data.tasks.completed /
        taskTotal) *
        100,
    );

  const cancelledPercentage =
    Math.round(
      (data.tasks.cancelled /
        taskTotal) *
        100,
    );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1450px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="glass-strong relative overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="pointer-events-none absolute -left-24 -top-24 size-56 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 size-56 rounded-full bg-violet-400/8 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                  <Activity className="size-5 text-slate-600" />
                </div>

                <span className="text-xs font-bold text-slate-400">
                  پنل مدیریت
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                داشبورد مدیریت
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                نمای کلی وضعیت کارمندان، پروژه‌ها و Taskهای سیستم را از اینجا دنبال کنید.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Link
                href="/admin/employees"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/42 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white/70"
              >
                <Users className="size-4" />
                کارمندان
              </Link>

              <Link
                href="/admin/tasks"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.14)] transition hover:-translate-y-px hover:bg-slate-800"
              >
                <ListChecks className="size-4" />
                مدیریت Taskها
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStat
            href="/admin/employees"
            label="کارمندان فعال"
            value={data.employees.active}
            suffix={`از ${data.employees.total.toLocaleString("fa-IR")} نفر`}
            icon={Users}
            tone="slate"
          />

          <DashboardStat
            href="/admin/projects"
            label="پروژه‌های فعال"
            value={data.projects.active}
            suffix={`از ${data.projects.total.toLocaleString("fa-IR")} پروژه`}
            icon={FolderKanban}
            tone="slate"
          />

          <DashboardStat
            href="/admin/tasks"
            label="Task در حال انجام"
            value={data.tasks.inProgress}
            icon={ClipboardList}
            tone="blue"
          />

          <DashboardStat
            href="/admin/tasks"
            label="Taskهای عقب‌افتاده"
            value={data.tasks.overdue}
            icon={AlertTriangle}
            tone="red"
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <section className="glass-card overflow-hidden rounded-[2rem]">
            <div className="flex flex-col gap-3 border-b border-white/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-2xl">
                    <FolderKanban className="size-5 text-slate-600" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-lg font-extrabold text-slate-900">
                      پروژه‌های فعال
                    </h2>

                    <p className="mt-1 truncate text-sm text-slate-400">
                      پروژه‌هایی که در حال اجرا یا برنامه‌ریزی هستند.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/admin/projects"
                className="inline-flex w-fit shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-white/40 hover:text-slate-900"
              >
                مشاهده همه
                <ArrowLeft className="size-3.5" />
              </Link>
            </div>

            {data.projects.rows.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="پروژه فعالی وجود ندارد"
                description="در حال حاضر پروژه‌ای در وضعیت فعال نیست."
              />
            ) : (
              <div className="divide-y divide-white/30">
                {data.projects.rows.map(
                  (project) => (
                    <Link
                      key={project.id}
                      href={`/admin/projects/${project.id}`}
                      className="group block p-5 transition hover:bg-white/25 sm:p-6"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-slate-300 transition group-hover:scale-125 group-hover:bg-slate-500" />

                              <h3 className="truncate font-bold text-slate-800">
                                {project.title}
                              </h3>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="size-3.5" />
                                {formatDate(
                                  project.deadline,
                                )}
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <ListChecks className="size-3.5" />
                                {project.totalTasks.toLocaleString(
                                  "fa-IR",
                                )}{" "}
                                Task
                              </span>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold ${getProjectStatusClass(
                              project.status,
                            )}`}
                          >
                            {
                              PROJECT_STATUS_LABELS[
                                project.status
                              ]
                            }
                          </span>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-400">
                              پیشرفت پروژه
                            </span>

                            <strong className="text-slate-700">
                              {project.progress.toLocaleString(
                                "fa-IR",
                              )}
                              ٪
                            </strong>
                          </div>

                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-900/7">
                            <div
                              className="h-full rounded-full bg-slate-800 transition-all duration-500"
                              style={{
                                width: `${project.progress}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-400">
                            {project.completedTasks.toLocaleString(
                              "fa-IR",
                            )}{" "}
                            Task تکمیل شده
                          </span>

                          <span className="inline-flex items-center gap-1 font-semibold text-slate-500 transition group-hover:text-slate-900">
                            مشاهده جزئیات
                            <ArrowLeft className="size-3.5 transition group-hover:-translate-x-0.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}
          </section>

          <section className="glass-card overflow-hidden rounded-[2rem]">
            <div className="border-b border-white/40 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-2xl">
                  <ListChecks className="size-5 text-slate-600" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    وضعیت Taskها
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    توزیع وضعیت فعلی تمام Taskها.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {[
                {
                  label: "در انتظار",
                  value: data.tasks.todo,
                  percentage: todoPercentage,
                  bar: "bg-slate-400",
                  dot: "bg-slate-400",
                },
                {
                  label: "در حال انجام",
                  value: data.tasks.inProgress,
                  percentage: inProgressPercentage,
                  bar: "bg-blue-500",
                  dot: "bg-blue-500",
                },
                {
                  label: "تکمیل شده",
                  value: data.tasks.completed,
                  percentage: completedPercentage,
                  bar: "bg-emerald-500",
                  dot: "bg-emerald-500",
                },
                {
                  label: "لغو شده",
                  value: data.tasks.cancelled,
                  percentage: cancelledPercentage,
                  bar: "bg-red-500",
                  dot: "bg-red-500",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <span
                        className={`size-2.5 rounded-full ${item.dot}`}
                      />
                      {item.label}
                    </div>

                    <span className="text-sm font-extrabold text-slate-900">
                      {item.value.toLocaleString(
                        "fa-IR",
                      )}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-900/7">
                    <div
                      className={`h-full rounded-full ${item.bar}`}
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3 border-t border-white/35 pt-5">
                <div className="rounded-2xl border border-white/45 bg-white/25 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <CheckCircle2 className="size-4" />
                    تکمیل شده
                  </div>

                  <p className="mt-2 text-xl font-extrabold text-slate-900">
                    {data.tasks.completed.toLocaleString(
                      "fa-IR",
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-red-200/40 bg-red-50/35 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-600">
                    <AlertTriangle className="size-4" />
                    عقب‌افتاده
                  </div>

                  <p className="mt-2 text-xl font-extrabold text-red-800">
                    {data.tasks.overdue.toLocaleString(
                      "fa-IR",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="glass-card overflow-hidden rounded-[2rem]">
          <div className="flex flex-col gap-3 border-b border-white/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-2xl">
                  <Users className="size-5 text-slate-600" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    بار کاری کارمندان
                  </h2>

                  <p className="mt-1 truncate text-sm text-slate-400">
                    Taskهای فعال و وضعیت انجام کارمندان فعال.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/admin/employees"
              className="inline-flex w-fit shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-white/40 hover:text-slate-900"
            >
              مدیریت کارمندان
              <ArrowLeft className="size-3.5" />
            </Link>
          </div>

          {data.employees.rows.length === 0 ? (
            <EmptyState
              icon={Users}
              title="کارمند فعالی وجود ندارد"
              description="هنوز کارمند فعالی برای تخصیص Task وجود ندارد."
            />
          ) : (
            <>
              <div className="thin-scrollbar hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="border-y border-white/40 bg-white/20 text-right text-xs font-bold text-slate-500">
                      <th className="px-6 py-4">
                        کارمند
                      </th>

                      <th className="px-4 py-4">
                        کل Task
                      </th>

                      <th className="px-4 py-4">
                        فعال
                      </th>

                      <th className="px-4 py-4">
                        تکمیل شده
                      </th>

                      <th className="px-4 py-4">
                        عقب‌افتاده
                      </th>

                      <th className="px-6 py-4">
                        وضعیت
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.employees.rows.map(
                      (employee) => (
                        <tr
                          key={employee.id}
                          className="border-b border-white/30 transition hover:bg-white/24 last:border-b-0"
                        >
                          <td className="px-6 py-5">
                            <Link
                              href={`/admin/employees/${employee.id}`}
                              className="group/employee flex items-center gap-3"
                            >
                              <div className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-slate-700 transition group-hover/employee:bg-white/70">
                                {employee.name
                                  .slice(
                                    0,
                                    1,
                                  )
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-bold text-slate-800">
                                  {
                                    employee.name
                                  }
                                </p>

                                <p
                                  dir="ltr"
                                  className="mt-1 max-w-48 truncate text-xs text-slate-400"
                                >
                                  {
                                    employee.email
                                  }
                                </p>
                              </div>
                            </Link>
                          </td>

                          <td className="px-4 py-5">
                            <span className="text-sm font-bold text-slate-700">
                              {employee.totalTasks.toLocaleString(
                                "fa-IR",
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-5">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/40 bg-blue-50/40 px-3 py-1.5 text-xs font-bold text-blue-700">
                              <Clock3 className="size-3.5" />
                              {employee.activeTasks.toLocaleString(
                                "fa-IR",
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-5">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/40 bg-emerald-50/40 px-3 py-1.5 text-xs font-bold text-emerald-700">
                              <CheckCircle2 className="size-3.5" />
                              {employee.completedTasks.toLocaleString(
                                "fa-IR",
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
                                employee.overdueTasks >
                                0
                                  ? "border-red-200/40 bg-red-50/40 text-red-700"
                                  : "border-slate-200/40 bg-slate-500/6 text-slate-500"
                              }`}
                            >
                              <AlertTriangle className="size-3.5" />
                              {employee.overdueTasks.toLocaleString(
                                "fa-IR",
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <Link
                              href={`/admin/employees/${employee.id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 transition hover:text-slate-900"
                            >
                              مشاهده پروفایل
                              <ArrowLeft className="size-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/30 lg:hidden">
                {data.employees.rows.map(
                  (employee) => (
                    <Link
                      key={employee.id}
                      href={`/admin/employees/${employee.id}`}
                      className="block p-5 transition hover:bg-white/22"
                    >
                      <div className="flex items-start gap-3">
                        <div className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-slate-700">
                          {employee.name
                            .slice(
                              0,
                              1,
                            )
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-800">
                                {
                                  employee.name
                                }
                              </p>

                              <p
                                dir="ltr"
                                className="mt-1 truncate text-xs text-slate-400"
                              >
                                {
                                  employee.email
                                }
                              </p>
                            </div>

                            <ArrowLeft className="size-4 shrink-0 text-slate-400" />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <div className="rounded-xl border border-white/40 bg-white/22 p-3">
                              <p className="text-[11px] text-slate-400">
                                کل
                              </p>

                              <p className="mt-1 text-sm font-extrabold text-slate-800">
                                {employee.totalTasks.toLocaleString(
                                  "fa-IR",
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl border border-blue-200/35 bg-blue-50/35 p-3">
                              <p className="text-[11px] text-blue-600">
                                فعال
                              </p>

                              <p className="mt-1 text-sm font-extrabold text-blue-800">
                                {employee.activeTasks.toLocaleString(
                                  "fa-IR",
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl border border-emerald-200/35 bg-emerald-50/35 p-3">
                              <p className="text-[11px] text-emerald-600">
                                تکمیل
                              </p>

                              <p className="mt-1 text-sm font-extrabold text-emerald-800">
                                {employee.completedTasks.toLocaleString(
                                  "fa-IR",
                                )}
                              </p>
                            </div>

                            <div
                              className={`rounded-xl border p-3 ${
                                employee.overdueTasks >
                                0
                                  ? "border-red-200/35 bg-red-50/35"
                                  : "border-white/40 bg-white/22"
                              }`}
                            >
                              <p
                                className={`text-[11px] ${
                                  employee.overdueTasks >
                                  0
                                    ? "text-red-600"
                                    : "text-slate-400"
                                }`}
                              >
                                عقب‌افتاده
                              </p>

                              <p
                                className={`mt-1 text-sm font-extrabold ${
                                  employee.overdueTasks >
                                  0
                                    ? "text-red-800"
                                    : "text-slate-800"
                                }`}
                              >
                                {employee.overdueTasks.toLocaleString(
                                  "fa-IR",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            </>
          )}
        </section>

        <section className="glass-card overflow-hidden rounded-[2rem]">
          <div className="flex flex-col gap-3 border-b border-white/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-2xl">
                  <Activity className="size-5 text-slate-600" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    آخرین فعالیت‌ها
                  </h2>

                  <p className="mt-1 truncate text-sm text-slate-400">
                    جدیدترین تغییرات ثبت‌شده در سیستم.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-white/50 bg-white/25 px-3 py-1.5 text-[11px] font-bold text-slate-400">
              <Clock3 className="size-3.5" />
              Activity Log
            </div>
          </div>

          {data.recentActivities.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="فعالیتی ثبت نشده است"
            />
          ) : (
            <div className="divide-y divide-white/30">
              {data.recentActivities.map(
                (activity) => {
                  const activityHref =
                    getActivityHref(
                      activity.entityType,
                      activity.entityId,
                    );

                  const activityContent = (
                    <>
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="glass-icon mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl transition group-hover:bg-white/70">
                          <Activity className="size-4 text-slate-500 transition group-hover:text-slate-700" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-slate-700 transition group-hover:text-slate-900">
                            {ACTION_LABELS[
                              activity.action
                            ] ??
                              activity.action}
                          </p>

                          <p className="mt-1 truncate text-sm text-slate-400">
                            توسط{" "}
                            <span className="font-bold text-slate-600">
                              {activity.user?.name ??
                                "کاربر حذف‌شده"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <time
                          dateTime={activity.createdAt.toISOString()}
                          className="text-xs font-medium text-slate-400"
                        >
                          {formatDateTime(
                            activity.createdAt,
                          )}
                        </time>

                        {activityHref ? (
                          <ArrowLeft className="size-4 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-slate-600" />
                        ) : null}
                      </div>
                    </>
                  );

                  if (activityHref) {
                    return (
                      <Link
                        key={activity.id}
                        href={activityHref}
                        className="group flex flex-col gap-3 p-5 transition hover:bg-white/25 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                        aria-label={`مشاهده ${ACTION_LABELS[activity.action] ?? activity.action}`}
                      >
                        {activityContent}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={activity.id}
                      className="flex flex-col gap-3 p-5 transition hover:bg-white/16 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      {activityContent}
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="glass-card rounded-[1.75rem] p-5 transition hover:-translate-y-0.5 hover:bg-white/40">
            <div className="flex items-center gap-3">
              <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                <UserCheck className="size-5 text-slate-600" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  پروژه‌های تکمیل شده
                </p>

                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  {data.projects.completed.toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5 transition hover:-translate-y-0.5 hover:bg-white/40">
            <div className="flex items-center gap-3">
              <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                <FolderKanban className="size-5 text-slate-600" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  پروژه‌های آرشیو شده
                </p>

                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  {data.projects.archived.toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}