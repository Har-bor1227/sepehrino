import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  ListOrdered,
  LockKeyhole,
  MessageSquare,
  Paperclip,
  Trash2,
  UserRound,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { deleteTaskAction } from "@/lib/actions/task.actions";
import { getAdminProjects } from "@/lib/services/project.service";
import {
  getTaskById,
  isTaskOverdue,
} from "@/lib/services/task.service";

import TaskStatusActions from "@/components/tasks/task-status-actions";
import EditTaskForm from "@/components/tasks/edit-task-form";
import TaskComments from "@/components/tasks/task-comments";

type TaskPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

type StageStatus =
  | "LOCKED"
  | "IN_PROGRESS"
  | "COMPLETED";

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "در انتظار",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل شده",
  CANCELLED: "لغو شده",
};

const PRIORITY_LABELS = {
  LOW: "کم",
  MEDIUM: "متوسط",
  HIGH: "زیاد",
  URGENT: "فوری",
} as const;

const STAGE_STATUS_LABELS: Record<StageStatus, string> = {
  LOCKED: "قفل شده",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل شده",
};

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

function getStatusClass(status: TaskStatus) {
  const classes: Record<TaskStatus, string> = {
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
      "border-slate-200/55 bg-slate-500/8 text-slate-700",
    MEDIUM:
      "border-amber-200/55 bg-amber-50/50 text-amber-700",
    HIGH:
      "border-orange-200/55 bg-orange-50/50 text-orange-700",
    URGENT:
      "border-red-200/55 bg-red-50/50 text-red-700",
  };

  return classes[priority];
}

function getStageStatusClass(status: StageStatus) {
  const classes: Record<StageStatus, string> = {
    LOCKED:
      "border-slate-200 bg-slate-100 text-slate-500",
    IN_PROGRESS:
      "border-blue-200 bg-blue-50 text-blue-700",
    COMPLETED:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return classes[status];
}

function getStageDescription(status: StageStatus) {
  if (status === "COMPLETED") {
    return "این مرحله تکمیل شده است.";
  }

  if (status === "IN_PROGRESS") {
    return "این مرحله فعال است و مسئول آن می‌تواند کار را انجام دهد.";
  }

  return "این مرحله تا تکمیل مراحل قبلی قفل می‌ماند.";
}

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

function toDateInputValue(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function handleDeleteTask(
  taskId: string,
): Promise<void> {
  "use server";

  const result = await deleteTaskAction(taskId);

  if (!result.success) {
    throw new Error(result.message);
  }

  redirect("/admin/tasks");
}

export default async function AdminTaskPage({
  params,
}: TaskPageProps) {
  const { id } = await params;

  const [task, projects] = await Promise.all([
    getTaskById(id),
    getAdminProjects(),
  ]);

  if (!task) {
    notFound();
  }

  const currentProject = projects.find(
    (project) => project.id === task.project.id,
  );

  if (!currentProject) {
    notFound();
  }

const taskStages = task.stages ?? [];
const isStaged = taskStages.length > 0;

const stages =
  task.isRecurring && isStaged
    ? task.todayOccurrence?.stages ?? []
    : taskStages;

const overdue = isTaskOverdue(
  task.deadline,
  task.status,
);

const assigneeIds = task.assignees.map(
  (assignee) => assignee.user.id,
);

const completedStageCount = stages.filter(
  (stage) => stage.status === "COMPLETED",
).length;

const activeStage = stages.find(
  (stage) => stage.status === "IN_PROGRESS",
);
  return (
    <main className="min-h-screen" dir="rtl">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/admin/tasks"
            className="glass-icon inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-slate-600 transition hover:-translate-y-px hover:bg-white/70"
          >
            <ArrowRight className="size-4" />
            بازگشت به تسک‌ها
          </Link>

          <form action={handleDeleteTask.bind(null, task.id)}>
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200/55 bg-red-50/65 px-4 text-sm font-semibold text-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition hover:bg-red-100/75 sm:w-auto"
            >
              <Trash2 className="size-4" />
              حذف تسک
            </button>
          </form>
        </div>

        <section className="glass-strong rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClass(
                    task.status,
                  )}`}
                >
                  {STATUS_LABELS[task.status]}
                </span>

                {isStaged ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/65 px-3 py-1.5 text-xs font-bold text-indigo-700">
                    <ListOrdered className="size-3.5" />
                    تسک چندمرحله‌ای
                  </span>
                ) : null}

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getPriorityClass(
                    task.priority,
                  )}`}
                >
                  اولویت {PRIORITY_LABELS[task.priority]}
                </span>

                {overdue ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-200/55 bg-red-50/65 px-3 py-1.5 text-xs font-bold text-red-700">
                    <AlertTriangle className="size-3.5" />
                    عقب‌افتاده
                  </span>
                ) : null}
              </div>

              <h1 className="mt-5 break-words text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                {task.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
                <span>پروژه:</span>

                <Link
                  href={`/admin/projects/${task.project.id}`}
                  className="font-bold text-slate-700 transition hover:text-slate-950"
                >
                  {task.project.title}
                </Link>

                <span className="text-slate-300">/</span>

                <span>زیرپروژه:</span>

                <strong className="text-slate-700">
                  {task.subProject
                    ? SUB_PROJECT_LABELS[task.subProject.type]
                    : "انتخاب نشده"}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/45 bg-white/25 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <UserRound className="size-4" />
                مسئول‌های تسک
              </div>

              {task.assignees.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {task.assignees.map((assignee) => (
                    <div key={assignee.user.id}>
                      <p className="font-bold text-slate-800">
                        {assignee.user.name}
                      </p>

                      <p
                        dir="ltr"
                        className="mt-0.5 text-xs text-slate-400"
                      >
                        {assignee.user.email}
                      </p>
                    </div>
                  ))}
                </div>
              ) : isStaged ? (
                <p className="mt-3 text-sm text-slate-500">
                  مسئولان از طریق مراحل تعیین شده‌اند.
                </p>
              ) : (
                <p className="mt-3 text-sm font-semibold text-slate-400">
                  بدون مسئول
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-white/45 bg-white/25 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <CalendarDays className="size-4" />
                مهلت انجام
              </div>

              <p
                className={`mt-3 font-bold ${
                  overdue ? "text-red-600" : "text-slate-800"
                }`}
              >
                {formatDate(task.deadline)}
              </p>
            </div>

            <div className="rounded-3xl border border-white/45 bg-white/25 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <MessageSquare className="size-4" />
                کامنت‌ها
              </div>

              <p className="mt-3 font-bold text-slate-800">
                {task.comments.length.toLocaleString("fa-IR")} مورد
              </p>
            </div>

            <div className="rounded-3xl border border-white/45 bg-white/25 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Paperclip className="size-4" />
                فایل‌ها
              </div>

              <p className="mt-3 font-bold text-slate-800">
                {task.attachments.length.toLocaleString("fa-IR")} مورد
              </p>
            </div>
          </div>
        </section>

        {isStaged ? (
          <section className="glass-card rounded-[2rem] p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="glass-icon flex size-11 items-center justify-center rounded-2xl">
                    <ListOrdered className="size-5 text-slate-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      مراحل انجام تسک
                    </h2>

                    <p className="mt-1 text-sm leading-7 text-slate-500">
                      ترتیب اجرا و مسئول هر مرحله را بررسی کنید.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/40 px-4 py-3 sm:min-w-36">
                <p className="text-xs text-slate-400">
                  پیشرفت مراحل
                </p>

                <p className="mt-1 text-lg font-extrabold text-slate-800">
                  {completedStageCount.toLocaleString("fa-IR")}
                  <span className="mx-1 text-slate-300">/</span>
                  {stages.length.toLocaleString("fa-IR")}
                </p>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{
                  width: `${
                    stages.length > 0
                      ? (completedStageCount / stages.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            {activeStage ? (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/45 p-4">
                <Clock3 className="mt-0.5 size-5 shrink-0 text-blue-700" />

                <div>
                  <p className="text-xs font-semibold text-blue-700">
                    مرحله فعال فعلی
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {activeStage.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    مسئول: {activeStage.assignee.name}
                  </p>
                </div>
              </div>
            ) : task.status === "COMPLETED" ? (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-700" />

                <p className="text-sm font-bold text-emerald-800">
                  همه مراحل تکمیل شده‌اند.
                </p>
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              {stages.map((stage, index) => {
                const stageStatus = stage.status as StageStatus;

                return (
                  <article
                    key={stage.id}
                    className={`rounded-3xl border p-4 sm:p-5 ${
                      stageStatus === "IN_PROGRESS"
                        ? "border-blue-200 bg-blue-50/25"
                        : stageStatus === "COMPLETED"
                          ? "border-emerald-200/70 bg-emerald-50/20"
                          : "border-slate-200/80 bg-white/25"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                          stageStatus === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-700"
                            : stageStatus === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {stageStatus === "COMPLETED" ? (
                          <Check className="size-5" />
                        ) : stageStatus === "LOCKED" ? (
                          <LockKeyhole className="size-4.5" />
                        ) : (
                          <span className="text-sm font-extrabold">
                            {(index + 1).toLocaleString("fa-IR")}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-base font-extrabold text-slate-900">
                            {stage.title}
                          </h3>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-bold ${getStageStatusClass(
                              stageStatus,
                            )}`}
                          >
                            {STAGE_STATUS_LABELS[stageStatus]}
                          </span>
                        </div>

                        <p className="mt-2 text-xs leading-6 text-slate-500">
                          {getStageDescription(stageStatus)}
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/70 bg-white/60 p-3.5">
                            <p className="text-xs text-slate-400">
                              مسئول مرحله
                            </p>

                            <p className="mt-1 font-bold text-slate-800">
                              {stage.assignee.name}
                            </p>

                            <p
                              dir="ltr"
                              className="mt-1 break-all text-xs text-slate-400"
                            >
                              {stage.assignee.email}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/70 bg-white/60 p-3.5">
                            {stageStatus === "COMPLETED" ? (
                              <>
                                <p className="text-xs text-slate-400">
                                  زمان تکمیل
                                </p>

                                <p className="mt-1 font-bold text-emerald-700">
                                  {stage.completedAt
                                    ? formatDateTime(stage.completedAt)
                                    : "تکمیل شده"}
                                </p>

                                {stage.completedBy ? (
                                  <p className="mt-1 text-xs text-slate-500">
                                    ثبت‌کننده: {stage.completedBy.name}
                                  </p>
                                ) : null}
                              </>
                            ) : stage.activatedAt ? (
                              <>
                                <p className="text-xs text-slate-400">
                                  زمان فعال‌شدن
                                </p>

                                <p className="mt-1 font-bold text-slate-700">
                                  {formatDateTime(stage.activatedAt)}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-xs text-slate-400">
                                  وضعیت اجرا
                                </p>

                                <p className="mt-1 flex items-center gap-2 font-bold text-slate-600">
                                  <LockKeyhole className="size-4" />
                                  در انتظار مراحل قبلی
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {stage.description ? (
                          <div className="mt-3 rounded-2xl border border-white/70 bg-white/45 p-3.5">
                            <p className="text-xs font-semibold text-slate-500">
                              توضیحات مرحله
                            </p>

                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                              {stage.description}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.6fr)]">
          <section className="glass-card rounded-[2rem] p-5 sm:p-6 lg:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                <FileText className="size-5 text-slate-600" />
              </div>

              <h2 className="text-lg font-extrabold text-slate-900">
                توضیحات تسک
              </h2>
            </div>

            {task.description ? (
              <p className="whitespace-pre-wrap text-sm leading-8 text-slate-600">
                {task.description}
              </p>
            ) : (
              <div className="soft-grid rounded-3xl border border-dashed border-slate-300/40 bg-white/20 p-7 text-center text-sm text-slate-400">
                توضیحاتی برای این تسک ثبت نشده است.
              </div>
            )}
          </section>

          <section className="glass-card rounded-[2rem] p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                <Clock3 className="size-5 text-slate-600" />
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  وضعیت تسک
                </h2>

                <p className="mt-1 text-xs leading-6 text-slate-400">
                  وضعیت فعلی و روند انجام تسک
                </p>
              </div>
            </div>

            {isStaged ? (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/45 p-4">
                <p className="text-sm font-bold text-indigo-900">
                  وضعیت از روی مراحل مدیریت می‌شود.
                </p>

                <p className="mt-2 text-xs leading-6 text-slate-600">
                  تسک پس از تکمیل آخرین مرحله به‌صورت خودکار تکمیل می‌شود.
                  تغییر وضعیت مستقیم از این قسمت غیرفعال است.
                </p>
              </div>
            ) : (
              <TaskStatusActions
                taskId={task.id}
                currentStatus={task.status}
              />
            )}
          </section>
        </div>

        <section className="glass-card rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-slate-900">
              ویرایش تسک
            </h2>

            <p className="mt-1 text-sm leading-7 text-slate-400">
              مشخصات، زیرپروژه، مسئول‌ها، اولویت و مهلت انجام را ویرایش کنید.
            </p>
          </div>

          <EditTaskForm
            taskId={task.id}
            projectId={task.project.id}
            isStaged={isStaged}
            defaultValues={{
              subProjectId: task.subProject?.id ?? "",
              title: task.title,
              description: task.description ?? "",
              assigneeIds,
              priority: task.priority,
              deadline: toDateInputValue(task.deadline),
              isRecurring: task.isRecurring,
              recurrenceType: task.recurrenceType,
              recurrenceStartDate: task.recurrenceStartDate
                ? toDateInputValue(task.recurrenceStartDate)
                : toDateInputValue(task.deadline),
              recurrenceEndDate: null,
              recurrenceWeekdays: task.recurrenceWeekdays,
              recurrenceDayOfMonth: task.recurrenceDayOfMonth,
              recurrenceActive: task.recurrenceActive,
            }}
            employees={currentProject.members.map(
              (member) => member.user,
            )}
            subProjects={currentProject.subProjects.map(
              (subProject) => ({
                id: subProject.id,
                type: subProject.type,
              }),
            )}
          />
        </section>

        <TaskComments
          taskId={task.id}
          comments={task.comments}
        />

        <section className="glass-card rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
              <CheckCircle2 className="size-5 text-slate-600" />
            </div>

            <h2 className="text-lg font-extrabold text-slate-900">
              اطلاعات ثبت تسک
            </h2>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-white/40 bg-white/20 p-4">
              <p className="text-xs text-slate-400">
                ایجادکننده
              </p>

              <p className="mt-1 font-bold text-slate-800">
                {task.createdBy.name}
              </p>
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/20 p-4">
              <p className="text-xs text-slate-400">
                تاریخ ایجاد
              </p>

              <p className="mt-1 font-bold text-slate-800">
                {formatDate(task.createdAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/20 p-4">
              <p className="text-xs text-slate-400">
                آخرین بروزرسانی
              </p>

              <p className="mt-1 font-bold text-slate-800">
                {formatDate(task.updatedAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/20 p-4">
              <p className="text-xs text-slate-400">
                وضعیت پروژه
              </p>

              <p className="mt-1 font-bold text-slate-800">
                {task.project.status === "PLANNED"
                  ? "برنامه‌ریزی شده"
                  : task.project.status === "IN_PROGRESS"
                    ? "در حال انجام"
                    : task.project.status === "COMPLETED"
                      ? "تکمیل شده"
                      : "آرشیو شده"}
              </p>
            </div>

            {isStaged ? (
              <div className="rounded-2xl border border-white/40 bg-white/20 p-4 sm:col-span-2">
                <p className="text-xs text-slate-400">
                  پیشرفت مراحل
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {completedStageCount.toLocaleString("fa-IR")} از{" "}
                  {stages.length.toLocaleString("fa-IR")} مرحله تکمیل شده
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}