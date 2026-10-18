import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListChecks,
  ListOrdered,
  LockKeyhole,
  MessageSquare,
  Paperclip,
  Plus,
  Repeat2,
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

const SUB_PROJECT_LABELS = {
  WEB_DESIGN: "طراحی سایت",
  SEO: "سئو",
  SOCIAL_MEDIA: "سوشال مدیا",
  PHOTOGRAPHY: "عکاسی",
  VIDEOGRAPHY: "فیلمبرداری",
  TEASER_PRODUCTION: "تیزرسازی",
  CATALOG: "کاتالوگ",
  BRAND_IDENTITY_DESIGN: "طراحی هویت بصری",
  CRM_MANAGEMENT: "مدیریت CRM",
  BOOTH_CONSTRUCTION: "غرفه سازی",
  PROGRAMMING: "برنامه نویسی",
} as const;

const PAGE_SIZE = 12;

function getStatusClass(
  status: keyof typeof STATUS_LABELS,
) {
  const classes = {
    TODO: "border-amber-200 bg-amber-100/80 text-amber-900",
    IN_PROGRESS: "border-blue-200 bg-blue-100/80 text-blue-900",
    COMPLETED: "border-emerald-200 bg-emerald-100/80 text-emerald-900",
    CANCELLED: "border-rose-200 bg-rose-100/80 text-rose-900",
  };

  return classes[status];
}

function getPriorityClass(
  priority: keyof typeof PRIORITY_LABELS,
) {
  const classes = {
    LOW: "border-slate-200 bg-white/80 text-slate-700",
    MEDIUM: "border-amber-300 bg-amber-100 text-amber-900",
    HIGH: "border-orange-300 bg-orange-100 text-orange-900",
    URGENT: "border-red-300 bg-red-100 text-red-900",
  };

  return classes[priority];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof ListChecks;
  tone: "slate" | "blue" | "emerald" | "amber" | "red";
}) {
  const toneClasses = {
    slate: {
      surface: "border-slate-200 bg-gradient-to-br from-slate-100 to-white",
      icon: "bg-slate-200 text-slate-800",
      accent: "bg-slate-500",
      number: "text-slate-950",
    },
    blue: {
      surface: "border-blue-200 bg-gradient-to-br from-blue-100/90 to-white",
      icon: "bg-blue-200/80 text-blue-900",
      accent: "bg-blue-600",
      number: "text-blue-950",
    },
    emerald: {
      surface: "border-emerald-200 bg-gradient-to-br from-emerald-100/90 to-white",
      icon: "bg-emerald-200/80 text-emerald-900",
      accent: "bg-emerald-600",
      number: "text-emerald-950",
    },
    amber: {
      surface: "border-amber-200 bg-gradient-to-br from-amber-100/90 to-white",
      icon: "bg-amber-200/80 text-amber-900",
      accent: "bg-amber-500",
      number: "text-amber-950",
    },
    red: {
      surface: "border-red-200 bg-gradient-to-br from-red-100/90 to-white",
      icon: "bg-red-200/80 text-red-900",
      accent: "bg-red-600",
      number: "text-red-950",
    },
  };

  const colors = toneClasses[tone];

  return (
    <article
      className={`relative flex min-h-[140px] min-w-0 flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-[0_5px_18px_rgba(15,23,42,0.045)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${colors.surface}`}
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 ${colors.accent}`}
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-700">
          {label}
        </span>

        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
        >
          <Icon className="size-5" />
        </span>
      </div>

      <p
        className={`mt-4 text-3xl font-black tracking-tight sm:text-4xl ${colors.number}`}
      >
        {value.toLocaleString("fa-IR")}
      </p>
    </article>
  );
}

function TaskCard({
  task,
}: {
  task: Awaited<ReturnType<typeof getAdminTasks>>[number];
}) {
  const taskStages = task.stages ?? [];
  const isStaged = taskStages.length > 0;

  const stages =
    task.isRecurring && isStaged
      ? task.todayOccurrence?.stages ?? []
      : taskStages;

  const completedStageCount = stages.filter(
    (stage) => stage.status === "COMPLETED",
  ).length;

  const activeStage = stages.find(
    (stage) => stage.status === "IN_PROGRESS",
  );

  const progressPercent =
    stages.length > 0
      ? Math.round(
          (completedStageCount / stages.length) * 100,
        )
      : 0;

  const overdue = isOverdue(task.deadline, task.status);

  const recurringCompleted = Boolean(
    task.isRecurring && task.todayOccurrence?.completed,
  );

  const statusLabel = task.isRecurring
    ? recurringCompleted
      ? "امروز تکمیل شده"
      : "برنامه امروز"
    : STATUS_LABELS[task.status];

  const cardTheme = overdue
    ? {
        surface: "border-rose-200 bg-gradient-to-br from-rose-100/90 via-white to-rose-50/60",
        accent: "bg-rose-500",
        title: "text-rose-950",
        project: "text-rose-800",
      }
    : task.isRecurring
      ? {
          surface: "border-violet-200 bg-gradient-to-br from-violet-100/90 via-white to-violet-50/60",
          accent: "bg-violet-500",
          title: "text-slate-950",
          project: "text-violet-800",
        }
      : isStaged
        ? {
            surface: "border-indigo-200 bg-gradient-to-br from-indigo-100/90 via-white to-indigo-50/60",
            accent: "bg-indigo-600",
            title: "text-slate-950",
            project: "text-indigo-800",
          }
        : task.status === "IN_PROGRESS"
          ? {
              surface: "border-blue-200 bg-gradient-to-br from-blue-100/80 via-white to-sky-50/70",
              accent: "bg-blue-600",
              title: "text-slate-950",
              project: "text-blue-800",
            }
          : task.status === "COMPLETED"
            ? {
                surface: "border-emerald-200 bg-gradient-to-br from-emerald-100/80 via-white to-emerald-50/60",
                accent: "bg-emerald-600",
                title: "text-slate-950",
                project: "text-emerald-800",
              }
            : task.status === "CANCELLED"
              ? {
                  surface: "border-slate-300 bg-gradient-to-br from-slate-200/80 via-white to-slate-100/80",
                  accent: "bg-slate-500",
                  title: "text-slate-800",
                  project: "text-slate-700",
                }
              : {
                  surface: "border-amber-200 bg-gradient-to-br from-amber-100/80 via-white to-yellow-50/60",
                  accent: "bg-amber-500",
                  title: "text-slate-950",
                  project: "text-amber-900",
                };

  return (
    <article
      className={`relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border shadow-[0_8px_24px_rgba(15,23,42,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(15,23,42,0.11)] ${cardTheme.surface}`}
    >
      <span
        className={`absolute inset-x-0 top-0 h-1.5 ${cardTheme.accent}`}
      />

      <div className="flex flex-1 flex-col p-4 pt-5 sm:p-5 sm:pt-6">
        {/* نوع تسک و اولویت */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {task.isRecurring ? (
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-100 px-2.5 py-1 text-xs font-extrabold text-violet-900">
                <Repeat2 className="size-3.5" />
                تکرارشونده
              </span>
            ) : isStaged ? (
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-100 px-2.5 py-1 text-xs font-extrabold text-indigo-900">
                <ListOrdered className="size-3.5" />
                چندمرحله‌ای
              </span>
            ) : (
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-extrabold text-slate-700">
                <ListChecks className="size-3.5" />
                معمولی
              </span>
            )}

            {overdue && (
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-100 px-2.5 py-1 text-xs font-extrabold text-rose-900">
                <AlertTriangle className="size-3.5" />
                عقب‌افتاده
              </span>
            )}
          </div>

          <span
            className={`inline-flex min-h-8 shrink-0 items-center rounded-lg border px-2.5 py-1 text-xs font-black ${getPriorityClass(
              task.priority,
            )}`}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>

        {/* عنوان و پروژه */}
        <div className="mt-5 min-w-0">
          <Link
            href={`/admin/tasks/${task.id}`}
            className={`block min-h-[3.75rem] break-words text-xl font-black leading-8 tracking-tight transition hover:text-indigo-700 ${cardTheme.title}`}
          >
            {task.title}
          </Link>

          <Link
            href={`/admin/projects/${task.project.id}`}
            className={`mt-2 flex min-w-0 items-center gap-2 text-sm font-extrabold transition hover:underline ${cardTheme.project}`}
          >
            <span
              className={`size-2 shrink-0 rounded-full ${cardTheme.accent}`}
            />
            <span className="truncate">
              {task.project.title}
            </span>
          </Link>

          {task.subProject && (
            <div className="mt-3">
              <span className="inline-flex max-w-full items-center truncate rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-700">
                {SUB_PROJECT_LABELS[task.subProject.type]}
              </span>
            </div>
          )}
        </div>

        {/* توضیحات */}
        <div className="mt-4 min-h-[4.5rem] rounded-xl border border-white/80 bg-white/65 p-3">
          <p className="line-clamp-2 break-words text-sm font-medium leading-6 text-slate-700">
            {task.description || "توضیحاتی برای این تسک ثبت نشده است."}
          </p>
        </div>

        {/* پیشرفت مراحل */}
        {isStaged && (
          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-100/65 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-extrabold text-indigo-950">
                پیشرفت مراحل
              </span>

              <span className="shrink-0 text-sm font-black tabular-nums text-indigo-950">
                {completedStageCount.toLocaleString("fa-IR")} از{" "}
                {stages.length.toLocaleString("fa-IR")}
              </span>
            </div>

            <div
              className="mt-3 h-2.5 overflow-hidden rounded-full border border-white/80 bg-white"
              role="progressbar"
              aria-label="درصد پیشرفت مراحل"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
            >
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 text-xs font-bold text-indigo-900">
              <span>
                {progressPercent.toLocaleString("fa-IR")}٪ تکمیل
              </span>
              <span>
                {stages.length.toLocaleString("fa-IR")} مرحله
              </span>
            </div>

            <div className="mt-3 border-t border-indigo-200 pt-3">
              {activeStage ? (
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-100 text-blue-800">
                    <Clock3 className="size-4" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-indigo-800">
                      مرحله فعال
                    </p>

                    <p className="mt-1 break-words text-sm font-black leading-6 text-slate-950">
                      {activeStage.title}
                    </p>

                    <p className="mt-1 break-words text-sm font-extrabold text-blue-900">
                      مسئول: {activeStage.assignee.name}
                    </p>
                  </div>
                </div>
              ) : task.status === "COMPLETED" ? (
                <p className="flex items-center gap-2 text-sm font-extrabold text-emerald-900">
                  <CheckCircle2 className="size-4 shrink-0" />
                  همه مراحل تکمیل شده‌اند.
                </p>
              ) : (
                <p className="flex items-center gap-2 text-xs font-bold leading-5 text-slate-700">
                  <LockKeyhole className="size-4 shrink-0" />
                  مرحله فعالی ثبت نشده است.
                </p>
              )}
            </div>
          </div>
        )}

        {/* اطلاعات مهم */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* مسئولان */}
          <div className="min-w-0 rounded-xl border border-sky-200 bg-sky-100/70 p-3">
            <p className="flex items-center gap-1.5 text-xs font-extrabold text-sky-900">
              <UserRound className="size-4 shrink-0" />
              مسئول انجام
            </p>

            {task.assignees.length > 0 ? (
              <div className="mt-2 space-y-1.5">
                {task.assignees.slice(0, 2).map((assignee) => (
                  <p
                    key={assignee.user.id}
                    className="break-words text-sm font-black leading-6 text-sky-950"
                    title={assignee.user.name}
                  >
                    {assignee.user.name}
                  </p>
                ))}

                {task.assignees.length > 2 && (
                  <p className="text-xs font-extrabold text-sky-800">
                    و{" "}
                    {(task.assignees.length - 2).toLocaleString("fa-IR")} نفر دیگر
                  </p>
                )}
              </div>
            ) : isStaged ? (
              <p className="mt-2 text-xs font-bold leading-6 text-sky-900">
                مسئول در مراحل مشخص شده است.
              </p>
            ) : (
              <p className="mt-2 text-sm font-bold text-slate-600">
                بدون مسئول
              </p>
            )}
          </div>

          {/* وضعیت */}
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white/80 p-3">
            <p className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600">
              <CheckCircle2 className="size-4 shrink-0" />
              وضعیت
            </p>

            <span
              className={`mt-2 inline-flex min-h-8 max-w-full items-center rounded-lg border px-2 py-1.5 text-xs font-black ${getStatusClass(
                task.status,
              )}`}
            >
              <span className="truncate">
                {statusLabel}
              </span>
            </span>
          </div>

          {/* مهلت */}
          <div
            className={`min-w-0 rounded-xl border p-3 ${
              overdue
                ? "border-rose-300 bg-rose-100/80"
                : "border-amber-200 bg-amber-100/65"
            }`}
          >
            <p
              className={`flex items-center gap-1.5 text-xs font-extrabold ${
                overdue ? "text-rose-900" : "text-amber-950"
              }`}
            >
              <CalendarDays className="size-4 shrink-0" />
              مهلت انجام
            </p>

            <p
              className={`mt-2 break-words text-sm font-black leading-6 ${
                overdue ? "text-rose-950" : "text-amber-950"
              }`}
            >
              {formatDate(task.deadline)}
            </p>

            {overdue && (
              <p className="mt-1 text-xs font-extrabold text-rose-800">
                نیازمند پیگیری
              </p>
            )}
          </div>

          {/* تاریخ ثبت */}
          <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-100/85 p-3">
            <p className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600">
              <Clock3 className="size-4 shrink-0" />
              تاریخ ثبت
            </p>

            <p className="mt-2 break-words text-xs font-extrabold leading-6 text-slate-800">
              {formatDateTime(task.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex-1" />

        {/* پایین کارت */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/75 px-2.5 py-2">
              <MessageSquare className="size-3.5 text-indigo-600" />
              {task._count.comments.toLocaleString("fa-IR")} کامنت
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/75 px-2.5 py-2">
              <Paperclip className="size-3.5 text-indigo-600" />
              {task._count.attachments.toLocaleString("fa-IR")} فایل
            </span>
          </div>

          <Link
            href={`/admin/tasks/${task.id}`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
          >
            جزئیات تسک
            <ChevronLeft className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
        <ListChecks className="size-7" />
      </span>

      <h3 className="mt-5 text-lg font-extrabold text-slate-900">
        هنوز تسکی ثبت نشده است
      </h3>

      <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
        اولین تسک را از بخش ایجاد تسک جدید ثبت کنید.
      </p>

      <a
        href="#create-task"
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-indigo-700"
      >
        <Plus className="size-4" />
        ایجاد تسک
      </a>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from(
    new Set([
      1,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      totalPages,
    ]),
  )
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return (
    <nav
      aria-label="صفحه‌بندی تسک‌ها"
      className="flex flex-col gap-4 border-t border-slate-200/80 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <p className="text-sm font-medium text-slate-600">
        صفحه{" "}
        <strong className="font-black text-slate-900">
          {currentPage.toLocaleString("fa-IR")}
        </strong>{" "}
        از {totalPages.toLocaleString("fa-IR")}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {currentPage > 1 ? (
          <Link
            href={`/admin/tasks?page=${currentPage - 1}`}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
            aria-label="صفحه قبل"
          >
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-300">
            <ChevronRight className="size-4" />
          </span>
        )}

        {pages.map((page, index) => {
          const previousPage = pages[index - 1];
          const hasGap =
            previousPage !== undefined &&
            page - previousPage > 1;

          return (
            <div key={page} className="flex items-center gap-1.5">
              {hasGap && (
                <span className="px-1 text-sm text-slate-400">
                  …
                </span>
              )}

              <Link
                href={`/admin/tasks?page=${page}`}
                aria-current={
                  page === currentPage ? "page" : undefined
                }
                className={`inline-flex size-10 items-center justify-center rounded-xl border text-sm font-extrabold transition ${
                  page === currentPage
                    ? "border-indigo-700 bg-indigo-700 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {page.toLocaleString("fa-IR")}
              </Link>
            </div>
          );
        })}

        {currentPage < totalPages ? (
          <Link
            href={`/admin/tasks?page=${currentPage + 1}`}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
            aria-label="صفحه بعد"
          >
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-300">
            <ChevronLeft className="size-4" />
          </span>
        )}
      </div>
    </nav>
  );
}

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  await requireAdmin();

  const [tasks, projects, params] = await Promise.all([
    getAdminTasks(),
    getAdminProjects(),
    searchParams,
  ]);

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;

  const todoTasks = tasks.filter(
    (task) => task.status === "TODO",
  ).length;

  const overdueTasks = tasks.filter((task) =>
    isOverdue(task.deadline, task.status),
  ).length;

  const activeProjects = projects.filter(
    (project) =>
      project.status !== "COMPLETED" &&
      project.status !== "ARCHIVED",
  );

  const totalPages = Math.max(
    1,
    Math.ceil(totalTasks / PAGE_SIZE),
  );

  const parsedPage = Number.parseInt(params.page ?? "1", 10);

  const currentPage = Number.isFinite(parsedPage)
    ? Math.min(Math.max(parsedPage, 1), totalPages)
    : 1;

  const pageStart = (currentPage - 1) * PAGE_SIZE;

  const paginatedTasks = tasks.slice(
    pageStart,
    pageStart + PAGE_SIZE,
  );

  return (
    <main
      className="min-h-screen bg-slate-100/90"
      dir="rtl"
    >
      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* سربرگ */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-extrabold text-indigo-800">
                <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-100">
                  <ListChecks className="size-5" />
                </span>

                مدیریت تسک‌ها
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                تسک‌های سازمان
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                مدیریت، تخصیص و پیگیری تسک‌های تمام پروژه‌ها در یک محیط یکپارچه.
              </p>
            </div>

            <a
              href="#create-task"
              className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 sm:w-auto"
            >
              <Plus className="size-5" />
              ایجاد تسک جدید
            </a>
          </div>
        </section>

        {/* آمار */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="کل تسک‌ها"
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

        {/* ایجاد تسک */}
        <section
          id="create-task"
          className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 outline-none transition hover:bg-indigo-50/50 sm:p-5 [&::-webkit-details-marker]:hidden">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
                  <Plus className="size-5" />
                </span>

                <div className="min-w-0">
                  <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                    ایجاد تسک جدید
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    فرم ساخت و واگذاری تسک
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-800 sm:inline-flex">
                  {activeProjects.length.toLocaleString("fa-IR")} پروژه فعال
                </span>

                <span className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-transform group-open:rotate-180">
                  <ChevronDown className="size-4" />
                </span>
              </div>
            </summary>

            <div className="border-t border-slate-200 bg-slate-50/70 p-4 sm:p-6 lg:p-7">
              {projects.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <ListChecks className="size-6" />
                  </span>

                  <p className="mt-4 text-base font-extrabold text-slate-800">
                    هنوز پروژه‌ای برای ایجاد تسک وجود ندارد.
                  </p>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    ابتدا یک پروژه ایجاد کنید.
                  </p>

                  <Link
                    href="/admin/projects"
                    className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-indigo-700"
                  >
                    مدیریت پروژه‌ها
                  </Link>
                </div>
              ) : activeProjects.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-white text-amber-700">
                    <AlertTriangle className="size-6" />
                  </span>

                  <p className="mt-4 text-base font-extrabold text-slate-800">
                    پروژه فعالی برای ایجاد تسک وجود ندارد.
                  </p>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    پروژه‌های تکمیل‌شده و آرشیوشده در این فرم قابل انتخاب نیستند.
                  </p>

                  <Link
                    href="/admin/projects"
                    className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    مشاهده پروژه‌ها
                  </Link>
                </div>
              ) : (
                <CreateTaskForm
                  projects={activeProjects.map((project) => ({
                    id: project.id,
                    title: project.title,
                    status: project.status,
                    subProjects: project.subProjects.map((subProject) => ({
                      id: subProject.id,
                      type: subProject.type,
                    })),
                    members: project.members.map((member) => ({
                      user: member.user,
                    })),
                  }))}
                />
              )}
            </div>
          </details>
        </section>

        {/* فهرست تسک‌ها */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 shadow-sm">
          <header className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:p-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                فهرست تسک‌ها
              </h2>

              <p className="mt-1.5 text-sm leading-6 text-slate-600">
                وضعیت و پیشرفت تسک‌های سازمان را بررسی کنید.
              </p>
            </div>

            <span className="inline-flex w-fit min-h-9 items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-extrabold text-indigo-900">
              {totalTasks.toLocaleString("fa-IR")} تسک
            </span>
          </header>

          {tasks.length === 0 ? (
            <div className="p-4 sm:p-6">
              <EmptyState />
            </div>
          ) : (
            <>
              <div className="grid items-stretch gap-5 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3 xl:p-6">
                {paginatedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}