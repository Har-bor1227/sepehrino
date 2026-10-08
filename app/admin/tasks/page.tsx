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
  BRAND_IDENTITY_DESIGN:
    "طراحی هویت بصری",
  CRM_MANAGEMENT: "مدیریت CRM",
  BOOTH_CONSTRUCTION:
    "غرفه سازی",
  PROGRAMMING: "برنامه نویسی",
} as const;

const PAGE_SIZE = 12;

function getStatusClass(
  status: keyof typeof STATUS_LABELS,
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
  priority: keyof typeof PRIORITY_LABELS,
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
      month: "long",
      day: "numeric",
    },
  ).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      calendar: "persian",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    <div className="glass-card rounded-3xl p-4 transition hover:-translate-y-px sm:p-5">
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

      <p className="mt-4 text-xs font-medium text-slate-400">
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

function TaskCard({
  task,
}: {
  task: Awaited<
    ReturnType<
      typeof getAdminTasks
    >
  >[number];
}) {
  const overdue = isOverdue(
    task.deadline,
    task.status,
  );

  const recurringCompleted =
    task.isRecurring &&
    task.todayOccurrence?.completed;

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/52 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:bg-white/65 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_38px_rgba(15,23,42,0.07)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {task.isRecurring ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-200/70 bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
              <Repeat2 className="size-3" />
              تکرارشونده
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/70 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
              <ListChecks className="size-3" />
              معمولی
            </span>
          )}

          {overdue ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-200/70 bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700">
              <AlertTriangle className="size-3" />
              عقب‌افتاده
            </span>
          ) : null}
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getPriorityClass(
            task.priority,
          )}`}
        >
          {PRIORITY_LABELS[
            task.priority
          ]}
        </span>
      </div>

      <div className="mt-4 min-w-0">
        <Link
          href={`/admin/tasks/${task.id}`}
          className="block break-words text-base font-extrabold leading-7 text-slate-900 transition group-hover:text-slate-700"
        >
          {task.title}
        </Link>

        <Link
          href={`/admin/projects/${task.project.id}`}
          className="mt-1 block truncate text-xs font-semibold text-slate-400 transition hover:text-slate-700"
        >
          {task.project.title}
        </Link>

        {task.subProject ? (
          <span className="mt-2 inline-flex max-w-full truncate rounded-full border border-slate-200/70 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
            {SUB_PROJECT_LABELS[
              task.subProject.type
            ]}
          </span>
        ) : null}
      </div>

      {task.description ? (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
          {task.description}
        </p>
      ) : (
        <div className="mt-4 h-[72px]" />
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="min-w-0 rounded-2xl border border-white/55 bg-white/38 p-3">
          <p className="text-[10px] font-medium text-slate-400">
            مسئول‌ها
          </p>

          {task.assignees.length >
          0 ? (
            <div className="mt-1 space-y-1">
              {task.assignees
                .slice(0, 3)
                .map(
                  (assignee) => (
                    <p
                      key={
                        assignee.user
                          .id
                      }
                      className="flex items-center gap-1.5 truncate text-xs font-bold text-slate-700"
                    >
                      <UserRound className="size-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">
                        {
                          assignee
                            .user
                            .name
                        }
                      </span>
                    </p>
                  ),
                )}

              {task.assignees.length >
              3 ? (
                <p className="text-[10px] font-semibold text-slate-400">
                  +
                  {(
                    task
                      .assignees
                      .length - 3
                  ).toLocaleString(
                    "fa-IR",
                  )}{" "}
                  نفر دیگر
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-1 text-xs font-bold text-slate-400">
              بدون مسئول
            </p>
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-white/55 bg-white/38 p-3">
          <p className="text-[10px] font-medium text-slate-400">
            وضعیت
          </p>

          <span
            className={`mt-1 inline-flex max-w-full items-center truncate rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
              task.status,
            )}`}
          >
            {task.isRecurring
              ? recurringCompleted
                ? "انجام امروز"
                : "برنامه امروز"
              : STATUS_LABELS[
                  task.status
                ]}
          </span>
        </div>

        <div
          className={`min-w-0 rounded-2xl border p-3 ${
            overdue
              ? "border-red-200/60 bg-red-50/45"
              : "border-white/55 bg-white/38"
          }`}
        >
          <p className="text-[10px] font-medium text-slate-400">
            Deadline
          </p>

          <p
            className={`mt-1 truncate text-xs font-bold ${
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
            <p className="mt-1 text-[10px] font-semibold text-red-500">
              عقب‌افتاده
            </p>
          ) : null}
        </div>

        <div className="min-w-0 rounded-2xl border border-white/55 bg-white/38 p-3">
          <p className="text-[10px] font-medium text-slate-400">
            ثبت
          </p>

          <p className="mt-1 truncate text-xs font-bold text-slate-700">
            {formatDateTime(
              task.createdAt,
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/45 pt-3">
        <div className="flex min-w-0 items-center gap-2 text-[11px] font-medium text-slate-400">
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-slate-300" />
            {task._count.comments.toLocaleString(
              "fa-IR",
            )}{" "}
            کامنت
          </span>

          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-slate-300" />
            {task._count.attachments.toLocaleString(
              "fa-IR",
            )}{" "}
            فایل
          </span>
        </div>

        <Link
          href={`/admin/tasks/${task.id}`}
          className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-3.5 text-xs font-bold text-white shadow-[0_8px_18px_rgba(15,23,42,0.12)] transition hover:bg-slate-800"
        >
          جزئیات
        </Link>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="soft-grid flex min-h-64 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300/45 bg-white/15 px-6 text-center">
      <div className="glass-icon flex size-14 items-center justify-center rounded-2xl">
        <ListChecks className="size-6 text-slate-400" />
      </div>

      <h3 className="mt-4 font-bold text-slate-800">
        هنوز Taskی ثبت نشده است
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        اولین Task را از بخش ایجاد Task جدید ثبت کنید.
      </p>

      <a
        href="#create-task"
        className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        ایجاد Task
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
    {
      length: totalPages,
    },
    (_, index) => index + 1,
  );

  return (
    <nav
      aria-label="صفحه‌بندی Taskها"
      className="flex flex-col gap-3 border-t border-white/45 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <p className="text-xs font-semibold text-slate-400">
        صفحه{" "}
        {currentPage.toLocaleString(
          "fa-IR",
        )}{" "}
        از{" "}
        {totalPages.toLocaleString(
          "fa-IR",
        )}
      </p>

      <div className="flex items-center gap-2">
        {currentPage > 1 ? (
          <Link
            href={`/admin/tasks?page=${currentPage - 1}`}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-white/60 bg-white/45 text-slate-600 transition hover:bg-white/75 hover:text-slate-900"
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
          {pages.map((page) => (
            <Link
              key={page}
              href={`/admin/tasks?page=${page}`}
              aria-current={
                page === currentPage
                  ? "page"
                  : undefined
              }
              className={`inline-flex size-10 items-center justify-center rounded-xl border text-xs font-bold transition ${
                page === currentPage
                  ? "border-slate-900 bg-slate-900 text-white shadow-[0_8px_18px_rgba(15,23,42,0.12)]"
                  : "border-white/60 bg-white/40 text-slate-600 hover:bg-white/75 hover:text-slate-900"
              }`}
            >
              {page.toLocaleString(
                "fa-IR",
              )}
            </Link>
          ))}
        </div>

        {currentPage <
        totalPages ? (
          <Link
            href={`/admin/tasks?page=${currentPage + 1}`}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-white/60 bg-white/45 text-slate-600 transition hover:bg-white/75 hover:text-slate-900"
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

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  await requireAdmin();

  const [tasks, projects, params] =
    await Promise.all([
      getAdminTasks(),
      getAdminProjects(),
      searchParams,
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

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalTasks /
          PAGE_SIZE,
      ),
    );

  const parsedPage =
    Number.parseInt(
      params.page ?? "1",
      10,
    );

  const currentPage =
    Number.isFinite(
      parsedPage,
    )
      ? Math.min(
          Math.max(
            parsedPage,
            1,
          ),
          totalPages,
        )
      : 1;

  const pageStart =
    (currentPage - 1) *
    PAGE_SIZE;

  const paginatedTasks =
    tasks.slice(
      pageStart,
      pageStart + PAGE_SIZE,
    );

  return (
    <main
      className="min-h-screen"
      dir="rtl"
    >
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

            <a
              href="#create-task"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(15,23,42,0.16)] transition hover:-translate-y-px hover:bg-slate-800 sm:w-auto"
            >
              <Plus className="size-4" />
              ایجاد Task جدید
            </a>
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
          className="glass-card scroll-mt-8 overflow-hidden rounded-[2rem]"
        >
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 outline-none transition hover:bg-white/18 [&::-webkit-details-marker]:hidden sm:p-6 lg:p-7">
              <div className="flex min-w-0 items-center gap-3">
                <div className="glass-icon flex size-11 shrink-0 items-center justify-center rounded-2xl">
                  <Plus className="size-5 text-slate-600" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                    ایجاد Task جدید
                  </h2>

                  <p className="mt-1 truncate text-xs leading-6 text-slate-400 sm:text-sm">
                    برای ساخت Task، این بخش را باز کنید.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden rounded-full border border-white/60 bg-white/45 px-3 py-1.5 text-xs font-semibold text-slate-500 sm:inline-flex">
                  {activeProjects.length.toLocaleString(
                    "fa-IR",
                  )}{" "}
                  پروژه فعال
                </span>

                <span className="glass-icon flex size-10 items-center justify-center rounded-xl text-slate-500 transition-transform duration-200 group-open:rotate-180">
                  <ChevronDown className="size-5" />
                </span>
              </div>
            </summary>

            <div className="border-t border-white/40 p-5 sm:p-6 lg:p-8">
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
              ) : activeProjects.length ===
                0 ? (
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
                      subProjects:
                        project.subProjects.map(
                          (
                            subProject,
                          ) => ({
                            id: subProject.id,
                            type: subProject.type,
                          }),
                        ),
                      members:
                        project.members.map(
                          (
                            member,
                          ) => ({
                            user: member.user,
                          }),
                        ),
                    }),
                  )}
                />
              )}
            </div>
          </details>
        </section>

        <section className="glass-card overflow-hidden rounded-[2rem]">
          <div className="flex flex-col gap-4 border-b border-white/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                فهرست Taskها
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Taskها به‌صورت کارت نمایش داده می‌شوند تا بررسی آن‌ها سریع‌تر باشد.
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
            <div className="p-5 sm:p-6">
              <EmptyState />
            </div>
          ) : (
            <>
              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
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

              <Pagination
                currentPage={
                  currentPage
                }
                totalPages={
                  totalPages
                }
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}