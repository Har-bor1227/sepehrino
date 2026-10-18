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
  Zap,
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
  if (!entityId) return null;

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
      "border-amber-300 bg-amber-100 text-amber-800",
    IN_PROGRESS:
      "border-blue-300 bg-blue-100 text-blue-800",
    COMPLETED:
      "border-emerald-300 bg-emerald-100 text-emerald-800",
    ARCHIVED:
      "border-slate-300 bg-slate-100 text-slate-600",
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
      card: "border-slate-300 bg-gradient-to-br from-white to-slate-100",
      icon: "bg-slate-200 text-slate-700 ring-slate-300",
      label: "text-slate-600",
      value: "text-slate-950",
      accent: "bg-slate-500",
    },
    blue: {
      card: "border-blue-300 bg-gradient-to-br from-white to-blue-50",
      icon: "bg-blue-100 text-blue-700 ring-blue-200",
      label: "text-blue-800",
      value: "text-blue-900",
      accent: "bg-blue-500",
    },
    red: {
      card: "border-red-300 bg-gradient-to-br from-white to-red-50",
      icon: "bg-red-100 text-red-700 ring-red-200",
      label: "text-red-800",
      value: "text-red-800",
      accent: "bg-red-500",
    },
    emerald: {
      card: "border-emerald-300 bg-gradient-to-br from-white to-emerald-50",
      icon: "bg-emerald-100 text-emerald-700 ring-emerald-200",
      label: "text-emerald-800",
      value: "text-emerald-900",
      accent: "bg-emerald-500",
    },
  };

  const styles = toneClasses[tone];

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-3xl border p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${styles.card}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${styles.accent}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm font-bold ${styles.label}`}>
            {label}
          </p>

          <div className="mt-3 flex flex-wrap items-end gap-2">
            <p
              className={`text-3xl font-black tracking-tight sm:text-4xl ${styles.value}`}
            >
              {value.toLocaleString("fa-IR")}
            </p>

            {suffix ? (
              <span className="mb-1 text-xs font-semibold text-slate-500">
                {suffix}
              </span>
            ) : null}
          </div>
        </div>

        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1 transition group-hover:scale-105 ${styles.icon}`}
        >
          <Icon className="size-6" />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-3">
        <span className="text-xs font-semibold text-slate-500">
          مشاهده جزئیات
        </span>

        <ArrowLeft className="size-4 text-slate-400 transition group-hover:-translate-x-1 group-hover:text-slate-800" />
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
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
        <Icon className="size-6" />
      </div>

      <p className="mt-4 text-sm font-extrabold text-slate-800">
        {title}
      </p>

      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-7 text-slate-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  const taskTotal = data.tasks.total || 1;

  const todoPercentage = Math.round(
    (data.tasks.todo / taskTotal) * 100,
  );

  const inProgressPercentage = Math.round(
    (data.tasks.inProgress / taskTotal) * 100,
  );

  const completedPercentage = Math.round(
    (data.tasks.completed / taskTotal) * 100,
  );

  const cancelledPercentage = Math.round(
    (data.tasks.cancelled / taskTotal) * 100,
  );

  const taskStatusItems = [
    {
      label: "در انتظار",
      value: data.tasks.todo,
      percentage: todoPercentage,
      bar: "bg-slate-500",
      dot: "bg-slate-500",
      surface: "border-slate-200 bg-slate-50",
      number: "text-slate-800",
    },
    {
      label: "در حال انجام",
      value: data.tasks.inProgress,
      percentage: inProgressPercentage,
      bar: "bg-blue-600",
      dot: "bg-blue-600",
      surface: "border-blue-200 bg-blue-50",
      number: "text-blue-800",
    },
    {
      label: "تکمیل شده",
      value: data.tasks.completed,
      percentage: completedPercentage,
      bar: "bg-emerald-500",
      dot: "bg-emerald-500",
      surface: "border-emerald-200 bg-emerald-50",
      number: "text-emerald-800",
    },
    {
      label: "لغو شده",
      value: data.tasks.cancelled,
      percentage: cancelledPercentage,
      bar: "bg-red-500",
      dot: "bg-red-500",
      surface: "border-red-200 bg-red-50",
      number: "text-red-800",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100/90">
      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-blue-900/20 bg-gradient-to-l from-slate-950 via-blue-950 to-indigo-900 p-5 text-white shadow-lg sm:p-7 lg:p-9">
          <div className="pointer-events-none absolute -left-16 -top-20 -z-10 size-64 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 -z-10 size-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-blue-100">
                <span className="flex size-8 items-center justify-center rounded-xl bg-cyan-300/20 text-cyan-200">
                  <Activity className="size-4" />
                </span>

                پنل مدیریت
              </div>

              <h1 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                داشبورد مدیریت
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/85 sm:text-base">
                نمای کلی کارمندان، پروژه‌ها و Taskهای سیستم را از
                اینجا مدیریت و پیگیری کنید.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Link
                href="/admin/employees"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/20"
              >
                <Users className="size-4" />
                کارمندان
              </Link>

              <Link
                href="/admin/tasks"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-extrabold text-blue-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                <ListChecks className="size-4" />
                مدیریت Taskها
                <ArrowLeft className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Main statistics */}
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
            tone="emerald"
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

        {/* Projects and task status */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-l from-blue-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-900/15">
                  <FolderKanban className="size-6" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-black text-slate-950">
                    پروژه‌های فعال
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    پروژه‌های در حال اجرا و برنامه‌ریزی‌شده
                  </p>
                </div>
              </div>

              <Link
                href="/admin/projects"
                className="inline-flex min-h-10 w-fit shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-white px-3.5 text-sm font-bold text-blue-800 transition hover:border-blue-400 hover:bg-blue-50"
              >
                همه پروژه‌ها
                <ArrowLeft className="size-4" />
              </Link>
            </div>

            {data.projects.rows.length === 0 ? (
              <div className="p-4 sm:p-5">
                <EmptyState
                  icon={FolderKanban}
                  title="پروژه فعالی وجود ندارد"
                  description="در حال حاضر پروژه‌ای برای نمایش وجود ندارد."
                />
              </div>
            ) : (
              <div className="space-y-3 p-4 sm:p-5">
                {data.projects.rows.map((project) => (
                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.id}`}
                    className="group block rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition duration-200 hover:border-blue-300 hover:bg-blue-50/70 hover:shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-base font-black leading-7 text-slate-900 transition group-hover:text-blue-800">
                            {project.title}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="size-3.5 text-blue-600" />
                              {formatDate(project.deadline)}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <ListChecks className="size-3.5 text-indigo-600" />
                              {project.totalTasks.toLocaleString("fa-IR")} Task
                            </span>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-extrabold ${getProjectStatusClass(project.status)}`}
                        >
                          {PROJECT_STATUS_LABELS[project.status]}
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                        <div className="mb-2.5 flex items-center justify-between gap-3 text-xs">
                          <span className="font-bold text-slate-600">
                            پیشرفت پروژه
                          </span>

                          <strong className="text-sm font-black text-blue-800">
                            {project.progress.toLocaleString("fa-IR")}٪
                          </strong>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              project.status === "COMPLETED"
                                ? "bg-emerald-500"
                                : project.status === "ARCHIVED"
                                  ? "bg-slate-400"
                                  : project.status === "PLANNED"
                                    ? "bg-amber-500"
                                    : "bg-blue-600"
                            }`}
                            style={{
                              width: `${project.progress}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-500">
                          <span className="font-black text-emerald-700">
                            {project.completedTasks.toLocaleString("fa-IR")}
                          </span>{" "}
                          Task تکمیل شده
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-700 transition group-hover:text-blue-900">
                          مشاهده جزئیات
                          <ArrowLeft className="size-3.5 transition group-hover:-translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-gradient-to-l from-violet-50 to-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm shadow-violet-900/15">
                  <ListChecks className="size-6" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    وضعیت Taskها
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    توزیع وضعیت تمام Taskهای سیستم
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              {taskStatusItems.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-4 ${item.surface}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`size-3 rounded-full ${item.dot}`} />

                      <span className="text-sm font-extrabold text-slate-800">
                        {item.label}
                      </span>
                    </div>

                    <span className={`text-lg font-black ${item.number}`}>
                      {item.value.toLocaleString("fa-IR")}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                    <span>سهم از کل Taskها</span>
                    <span>{item.percentage.toLocaleString("fa-IR")}٪</span>
                  </div>

                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/90">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.bar}`}
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}

              <Link
                href="/admin/tasks"
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-extrabold text-white transition hover:bg-blue-950"
              >
                مشاهده همه Taskها
                <ArrowLeft className="size-4" />
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="size-4" />
                    تکمیل شده
                  </div>

                  <p className="mt-2 text-2xl font-black text-emerald-900">
                    {data.tasks.completed.toLocaleString("fa-IR")}
                  </p>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                    <AlertTriangle className="size-4" />
                    عقب‌افتاده
                  </div>

                  <p className="mt-2 text-2xl font-black text-red-900">
                    {data.tasks.overdue.toLocaleString("fa-IR")}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Employee workload */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-l from-indigo-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-900/15">
                <Users className="size-6" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  بار کاری کارمندان
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  بررسی Taskهای فعال، تکمیل‌شده و عقب‌افتاده
                </p>
              </div>
            </div>

            <Link
              href="/admin/employees"
              className="inline-flex min-h-10 w-fit items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3.5 text-sm font-bold text-indigo-800 transition hover:border-indigo-400 hover:bg-indigo-50"
            >
              مدیریت کارمندان
              <ArrowLeft className="size-4" />
            </Link>
          </div>

          {data.employees.rows.length === 0 ? (
            <div className="p-4 sm:p-5">
              <EmptyState
                icon={Users}
                title="کارمند فعالی وجود ندارد"
                description="هنوز کارمند فعالی برای تخصیص Task وجود ندارد."
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs font-extrabold text-slate-600">
                      <th className="px-6 py-4">کارمند</th>
                      <th className="px-4 py-4">کل Task</th>
                      <th className="px-4 py-4">فعال</th>
                      <th className="px-4 py-4">تکمیل شده</th>
                      <th className="px-4 py-4">عقب‌افتاده</th>
                      <th className="px-6 py-4">پروفایل</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {data.employees.rows.map((employee) => (
                      <tr
                        key={employee.id}
                        className="transition hover:bg-blue-50/50"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/employees/${employee.id}`}
                            className="group flex items-center gap-3"
                          >
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-sm font-black text-indigo-800 transition group-hover:bg-indigo-100">
                              {employee.name.slice(0, 1).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 transition group-hover:text-indigo-800">
                                {employee.name}
                              </p>

                              <p
                                dir="ltr"
                                className="mt-1 max-w-48 truncate text-xs text-slate-500"
                              >
                                {employee.email}
                              </p>
                            </div>
                          </Link>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex min-w-10 justify-center rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-sm font-extrabold text-slate-800">
                            {employee.totalTasks.toLocaleString("fa-IR")}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-800">
                            <Clock3 className="size-3.5" />
                            {employee.activeTasks.toLocaleString("fa-IR")}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800">
                            <CheckCircle2 className="size-3.5" />
                            {employee.completedTasks.toLocaleString("fa-IR")}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-extrabold ${
                              employee.overdueTasks > 0
                                ? "border-red-200 bg-red-50 text-red-800"
                                : "border-slate-200 bg-slate-100 text-slate-600"
                            }`}
                          >
                            <AlertTriangle className="size-3.5" />
                            {employee.overdueTasks.toLocaleString("fa-IR")}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/employees/${employee.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
                          >
                            مشاهده
                            <ArrowLeft className="size-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-200 lg:hidden">
                {data.employees.rows.map((employee) => (
                  <Link
                    key={employee.id}
                    href={`/admin/employees/${employee.id}`}
                    className="block p-4 transition hover:bg-indigo-50/40 sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-sm font-black text-indigo-800">
                        {employee.name.slice(0, 1).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-extrabold text-slate-900">
                              {employee.name}
                            </p>

                            <p
                              dir="ltr"
                              className="mt-1 truncate text-xs text-slate-500"
                            >
                              {employee.email}
                            </p>
                          </div>

                          <ArrowLeft className="mt-1 size-4 shrink-0 text-slate-400" />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-xs font-semibold text-slate-500">
                              کل Task
                            </p>
                            <p className="mt-1.5 text-lg font-black text-slate-900">
                              {employee.totalTasks.toLocaleString("fa-IR")}
                            </p>
                          </div>

                          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                            <p className="text-xs font-semibold text-blue-700">
                              فعال
                            </p>
                            <p className="mt-1.5 text-lg font-black text-blue-900">
                              {employee.activeTasks.toLocaleString("fa-IR")}
                            </p>
                          </div>

                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                            <p className="text-xs font-semibold text-emerald-700">
                              تکمیل
                            </p>
                            <p className="mt-1.5 text-lg font-black text-emerald-900">
                              {employee.completedTasks.toLocaleString("fa-IR")}
                            </p>
                          </div>

                          <div
                            className={`rounded-xl border p-3 ${
                              employee.overdueTasks > 0
                                ? "border-red-200 bg-red-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <p
                              className={`text-xs font-semibold ${
                                employee.overdueTasks > 0
                                  ? "text-red-700"
                                  : "text-slate-500"
                              }`}
                            >
                              عقب‌افتاده
                            </p>
                            <p
                              className={`mt-1.5 text-lg font-black ${
                                employee.overdueTasks > 0
                                  ? "text-red-900"
                                  : "text-slate-900"
                              }`}
                            >
                              {employee.overdueTasks.toLocaleString("fa-IR")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Recent activity */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-l from-violet-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm shadow-violet-900/15">
                <Activity className="size-6" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  آخرین فعالیت‌ها
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  جدیدترین تغییرات ثبت‌شده در سیستم
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-bold text-violet-800">
              <span className="size-2 rounded-full bg-violet-500" />
              <Clock3 className="size-3.5" />
              Activity Log
            </div>
          </div>

          {data.recentActivities.length === 0 ? (
            <div className="p-4 sm:p-5">
              <EmptyState
                icon={Activity}
                title="فعالیتی ثبت نشده است"
                description="با انجام تغییرات جدید، رویدادها در این بخش نمایش داده می‌شوند."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentActivities.map((activity) => {
                const activityHref = getActivityHref(
                  activity.entityType,
                  activity.entityId,
                );

                const activityContent = (
                  <>
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-violet-700 transition group-hover:border-violet-300 group-hover:bg-violet-100">
                        <Activity className="size-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="break-words font-extrabold text-slate-800 transition group-hover:text-violet-800">
                          {ACTION_LABELS[activity.action] ?? activity.action}
                        </p>

                        <p className="mt-1.5 text-sm text-slate-500">
                          توسط{" "}
                          <span className="font-extrabold text-slate-700">
                            {activity.user?.name ?? "کاربر حذف‌شده"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                      <time
                        dateTime={activity.createdAt.toISOString()}
                        className="text-xs font-semibold text-slate-500"
                      >
                        {formatDateTime(activity.createdAt)}
                      </time>

                      {activityHref ? (
                        <ArrowLeft className="size-4 text-slate-400 transition group-hover:-translate-x-1 group-hover:text-violet-700" />
                      ) : null}
                    </div>
                  </>
                );

                if (activityHref) {
                  return (
                    <Link
                      key={activity.id}
                      href={activityHref}
                      className="group flex flex-col gap-3 p-4 transition hover:bg-violet-50/40 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                      aria-label={`مشاهده ${ACTION_LABELS[activity.action] ?? activity.action}`}
                    >
                      {activityContent}
                    </Link>
                  );
                }

                return (
                  <div
                    key={activity.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >
                    {activityContent}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Project summary */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/projects"
            className="group relative overflow-hidden rounded-3xl border border-emerald-300 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  پروژه‌های تکمیل‌شده
                </p>

                <p className="mt-3 text-3xl font-black text-emerald-900">
                  {data.projects.completed.toLocaleString("fa-IR")}
                </p>

                <p className="mt-2 text-xs font-semibold text-emerald-700">
                  مشاهده وضعیت پروژه‌ها
                </p>
              </div>

              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-100 text-emerald-700">
                <UserCheck className="size-7" />
              </div>
            </div>
          </Link>

          <Link
            href="/admin/projects"
            className="group relative overflow-hidden rounded-3xl border border-slate-300 bg-gradient-to-br from-white to-slate-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-slate-500" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-700">
                  پروژه‌های آرشیو‌شده
                </p>

                <p className="mt-3 text-3xl font-black text-slate-900">
                  {data.projects.archived.toLocaleString("fa-IR")}
                </p>

                <p className="mt-2 text-xs font-semibold text-slate-500">
                  مشاهده آرشیو پروژه‌ها
                </p>
              </div>

              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-slate-300 bg-slate-200 text-slate-700">
                <FolderKanban className="size-7" />
              </div>
            </div>
          </Link>
        </section>

        <div className="flex items-center justify-center gap-2 pb-2 text-xs font-medium text-slate-400">
          <Zap className="size-3.5 text-blue-500" />
          نمای مدیریتی سیستم فرتاک تسکینگ
        </div>
      </div>
    </main>
  );
}