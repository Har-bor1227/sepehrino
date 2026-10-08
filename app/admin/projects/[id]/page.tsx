import { notFound } from "next/navigation";
import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  Users,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/guards";
import { getAdminProjectById } from "@/lib/services/project.service";
import { getActiveEmployeesForAssignment } from "@/lib/services/employee-assignment.service";

import { ProjectMembersManager } from "@/components/projects/project-members-manager";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

function getStatusLabel(
  status:
    | "PLANNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "ARCHIVED",
) {
  const labels = {
    PLANNED: "برنامه‌ریزی‌شده",
    IN_PROGRESS: "در حال انجام",
    COMPLETED: "تکمیل‌شده",
    ARCHIVED: "آرشیو",
  };

  return labels[status];
}

function getStatusClass(
  status:
    | "PLANNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "ARCHIVED",
) {
  const classes = {
    PLANNED:
      "border-slate-200/60 bg-slate-500/8 text-slate-700",
    IN_PROGRESS:
      "border-blue-200/60 bg-blue-500/8 text-blue-700",
    COMPLETED:
      "border-emerald-200/60 bg-emerald-500/8 text-emerald-700",
    ARCHIVED:
      "border-white/60 bg-white/40 text-slate-500",
  };

  return classes[status];
}

function getTaskStatusLabel(
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED",
) {
  const labels = {
    TODO: "در انتظار",
    IN_PROGRESS: "در حال انجام",
    COMPLETED: "تکمیل‌شده",
    CANCELLED: "لغوشده",
  };

  return labels[status];
}

function getTaskStatusClass(
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED",
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

function getProgressRingStyle(
  progress: number,
) {
  const degree = Math.min(
    Math.max(progress, 0),
    100,
  ) * 3.6;

  return {
    background: `conic-gradient(rgb(15 23 42) ${degree}deg, rgba(15, 23, 42, 0.07) ${degree}deg)`,
  };
}

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const [project, employees] =
    await Promise.all([
      getAdminProjectById(id),
      getActiveEmployeesForAssignment(),
    ]);

  if (!project) {
    notFound();
  }

  const totalTasks =
    project.tasks.length;

  const completedTasks =
    project.tasks.filter(
      (task) =>
        task.status === "COMPLETED",
    ).length;

  const inProgressTasks =
    project.tasks.filter(
      (task) =>
        task.status === "IN_PROGRESS",
    ).length;

  const todoTasks =
    project.tasks.filter(
      (task) =>
        task.status === "TODO",
    ).length;

  const cancelledTasks =
    project.tasks.filter(
      (task) =>
        task.status === "CANCELLED",
    ).length;

  const now = new Date();

  const overdueTasks =
    project.tasks.filter(
      (task) =>
        task.deadline < now &&
        task.status !== "COMPLETED" &&
        task.status !== "CANCELLED",
    ).length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks /
            totalTasks) *
            100,
        );

  const memberCount =
    project.members.length;

  return (
    <main
      className="min-h-screen"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:space-y-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin/projects"
              aria-label="بازگشت به لیست پروژه‌ها"
              className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-2xl text-slate-600 transition hover:-translate-y-px hover:bg-white/80"
            >
              <ArrowRight className="size-5" />
            </Link>

            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400">
                مدیریت پروژه
              </p>

              <h1 className="mt-1 truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                {project.title}
              </h1>
            </div>
          </div>

          <Link
            href={`/admin/projects/${id}/edit`}
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)] transition hover:-translate-y-px hover:bg-slate-800 sm:w-auto"
          >
            ویرایش پروژه
          </Link>
        </div>

        <Card className="overflow-visible">
          <CardContent className="p-5 sm:p-6 lg:p-7">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClass(
                      project.status,
                    )}`}
                  >
                    {getStatusLabel(
                      project.status,
                    )}
                  </span>

                  <span className="glass-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500">
                    <CalendarDays className="size-3.5" />

                    <span>مهلت پروژه</span>

                    <strong className="text-slate-700">
                      {formatDate(
                        project.deadline,
                      )}
                    </strong>
                  </span>
                </div>

                <div className="mt-6 flex items-start gap-4">
                  <div className="glass-icon flex size-12 shrink-0 items-center justify-center rounded-2xl">
                    <FolderKanban className="size-6 text-slate-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-400">
                      توضیحات پروژه
                    </p>

                    {project.description ? (
                      <p className="mt-2 max-w-4xl whitespace-pre-wrap text-sm leading-8 text-slate-600">
                        {
                          project.description
                        }
                      </p>
                    ) : (
                      <p className="mt-2 text-sm leading-7 text-slate-400">
                        توضیحی برای این پروژه ثبت نشده است.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="elevated-hover rounded-2xl border border-white/50 bg-white/28 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <ListTodo className="size-4" />
                      کل Taskها
                    </div>

                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                      {totalTasks.toLocaleString(
                        "fa-IR",
                      )}
                    </p>
                  </div>

                  <div className="elevated-hover rounded-2xl border border-emerald-200/45 bg-emerald-50/45 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="size-4" />
                      تکمیل‌شده
                    </div>

                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-emerald-800">
                      {completedTasks.toLocaleString(
                        "fa-IR",
                      )}
                    </p>
                  </div>

                  <div className="elevated-hover rounded-2xl border border-blue-200/45 bg-blue-50/45 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
                      <Clock3 className="size-4" />
                      در حال انجام
                    </div>

                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-blue-800">
                      {inProgressTasks.toLocaleString(
                        "fa-IR",
                      )}
                    </p>
                  </div>

                  <div className="elevated-hover rounded-2xl border border-red-200/45 bg-red-50/45 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-red-700">
                      <AlertTriangle className="size-4" />
                      عقب‌افتاده
                    </div>

                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-red-800">
                      {overdueTasks.toLocaleString(
                        "fa-IR",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-strong flex flex-col justify-between rounded-[2rem] p-5 sm:p-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        پیشرفت پروژه
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
                      <div className="flex size-full items-center justify-center rounded-full bg-white/90 shadow-inner">
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
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-white/55 bg-white/35 p-3">
                    <p className="text-[11px] font-medium text-slate-400">
                      Taskهای تکمیل‌شده
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-slate-800">
                      {completedTasks.toLocaleString(
                        "fa-IR",
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/55 bg-white/35 p-3">
                    <p className="text-[11px] font-medium text-slate-400">
                      اعضای پروژه
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-slate-800">
                      {memberCount.toLocaleString(
                        "fa-IR",
                      )}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-6 text-slate-400">
                  {completedTasks.toLocaleString(
                    "fa-IR",
                  )}{" "}
                  از{" "}
                  {totalTasks.toLocaleString(
                    "fa-IR",
                  )}{" "}
                  Task این پروژه تکمیل شده است.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <ProjectMembersManager
            projectId={project.id}
            members={project.members}
            employees={employees}
          />

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                  <ListTodo className="size-5 text-slate-600" />
                </div>

                <div>
                  <CardTitle>
                    خلاصه وضعیت Taskها
                  </CardTitle>

                  <p className="mt-1 text-xs text-slate-400">
                    توزیع وضعیت فعلی Taskهای پروژه
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              <div className="flex items-center justify-between rounded-2xl border border-white/45 bg-white/24 p-4">
                <span className="text-sm font-medium text-slate-600">
                  در انتظار
                </span>

                <span className="rounded-full bg-slate-900/7 px-3 py-1 text-sm font-bold text-slate-700">
                  {todoTasks.toLocaleString(
                    "fa-IR",
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-blue-200/35 bg-blue-50/35 p-4">
                <span className="text-sm font-medium text-blue-700">
                  در حال انجام
                </span>

                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm font-bold text-blue-700">
                  {inProgressTasks.toLocaleString(
                    "fa-IR",
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-emerald-200/35 bg-emerald-50/35 p-4">
                <span className="text-sm font-medium text-emerald-700">
                  تکمیل‌شده
                </span>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-700">
                  {completedTasks.toLocaleString(
                    "fa-IR",
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-red-200/35 bg-red-50/35 p-4">
                <span className="text-sm font-medium text-red-700">
                  لغوشده
                </span>

                <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm font-bold text-red-700">
                  {cancelledTasks.toLocaleString(
                    "fa-IR",
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-red-200/50 bg-red-50/55 p-4">
                <span className="text-sm font-bold text-red-700">
                  عقب‌افتاده
                </span>

                <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow-[0_6px_14px_rgba(239,68,68,0.2)]">
                  {overdueTasks.toLocaleString(
                    "fa-IR",
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                  <FolderKanban className="size-5 text-slate-600" />
                </div>

                <div>
                  <CardTitle>
                    Taskهای پروژه
                  </CardTitle>

                  <p className="mt-1 text-xs text-slate-400">
                    فهرست کامل Taskهای این پروژه
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500">
                  <ListTodo className="size-3.5" />
                  {totalTasks.toLocaleString(
                    "fa-IR",
                  )}
                  <span>Task</span>
                </span>

                <span className="glass-chip hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 sm:inline-flex">
                  <Users className="size-3.5" />
                  {memberCount.toLocaleString(
                    "fa-IR",
                  )}
                  عضو
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {project.tasks.length === 0 ? (
              <div className="soft-grid m-5 flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/40 bg-white/20 px-6 text-center sm:m-6">
                <div className="glass-icon flex size-14 items-center justify-center rounded-2xl">
                  <ListTodo className="size-6 text-slate-400" />
                </div>

                <p className="mt-4 text-sm font-bold text-slate-700">
                  هنوز Taskی برای این پروژه ایجاد نشده است.
                </p>

                <p className="mt-1 max-w-md text-xs leading-6 text-slate-400">
                  می‌توانید Taskهای پروژه را از بخش مدیریت Taskها ایجاد کنید.
                </p>
              </div>
            ) : (
              <div className="thin-scrollbar overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead>
                    <tr className="border-y border-white/40 bg-white/25 text-right">
                      <th className="px-6 py-4 font-semibold text-slate-500">
                        Task
                      </th>

                      <th className="px-6 py-4 font-semibold text-slate-500">
                        زیرپروژه
                      </th>

                      <th className="px-6 py-4 font-semibold text-slate-500">
                        مسئول‌ها
                      </th>

                      <th className="px-6 py-4 font-semibold text-slate-500">
                        وضعیت
                      </th>

                      <th className="px-6 py-4 font-semibold text-slate-500">
                        مهلت
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {project.tasks.map(
                      (task) => (
                        <tr
                          key={task.id}
                          className="border-b border-white/30 transition hover:bg-white/35 last:border-b-0"
                        >
                          <td className="px-6 py-5">
                            <Link
                              href={`/admin/tasks/${task.id}`}
                              className="block max-w-[22rem] truncate font-bold text-slate-800 transition hover:text-slate-950"
                            >
                              {task.title}
                            </Link>
                          </td>

                          <td className="px-6 py-5">
                            {task.subProject ? (
                              <span className="inline-flex rounded-full border border-slate-200/60 bg-white/45 px-2.5 py-1 text-xs font-bold text-slate-600">
                                {
                                  SUB_PROJECT_LABELS[
                                    task
                                      .subProject
                                      .type
                                  ]
                                }
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-slate-400">
                                انتخاب نشده
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            {task.assignees.length >
                            0 ? (
                              <div className="max-w-72 space-y-1.5">
                                {task.assignees.map(
                                  (
                                    assignee,
                                  ) => (
                                    <div
                                      key={
                                        assignee
                                          .user
                                          .id
                                      }
                                      className="flex items-center gap-2"
                                    >
                                      <span className="glass-icon flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-slate-500">
                                        {assignee.user.name
                                          .trim()
                                          .slice(
                                            0,
                                            1,
                                          )}
                                      </span>

                                      <span className="truncate text-sm font-medium text-slate-700">
                                        {
                                          assignee
                                            .user
                                            .name
                                        }
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-slate-400">
                                بدون مسئول
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getTaskStatusClass(
                                task.status,
                              )}`}
                            >
                              {getTaskStatusLabel(
                                task.status,
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-slate-500">
                            {formatDate(
                              task.deadline,
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}