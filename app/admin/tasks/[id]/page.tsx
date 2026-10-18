import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  ListOrdered,
  LockKeyhole,
  MessageSquare,
  Paperclip,
  Repeat2,
  Sparkles,
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
  BOOTH_CONSTRUCTION: "غرفه‌سازی",
  PROGRAMMING: "برنامه‌نویسی",
} as const;

function getStatusClass(status: TaskStatus) {
  const classes: Record<TaskStatus, string> = {
    TODO: "border-slate-300 bg-slate-100 text-slate-700",
    IN_PROGRESS: "border-blue-300 bg-blue-100 text-blue-800",
    COMPLETED: "border-emerald-300 bg-emerald-100 text-emerald-800",
    CANCELLED: "border-red-300 bg-red-100 text-red-800",
  };

  return classes[status];
}

function getPriorityClass(
  priority: keyof typeof PRIORITY_LABELS,
) {
  const classes = {
    LOW: "border-slate-300 bg-slate-100 text-slate-700",
    MEDIUM: "border-amber-300 bg-amber-100 text-amber-800",
    HIGH: "border-orange-300 bg-orange-100 text-orange-800",
    URGENT: "border-red-300 bg-red-100 text-red-800",
  };

  return classes[priority];
}

function getStageStatusClass(status: StageStatus) {
  const classes: Record<StageStatus, string> = {
    LOCKED: "border-slate-300 bg-slate-100 text-slate-600",
    IN_PROGRESS: "border-blue-300 bg-blue-100 text-blue-800",
    COMPLETED: "border-emerald-300 bg-emerald-100 text-emerald-800",
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
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

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

function InfoCard({
  label,
  icon: Icon,
  children,
  tone = "slate",
}: {
  label: string;
  icon: typeof CalendarDays;
  children: React.ReactNode;
  tone?: "slate" | "blue" | "emerald" | "violet";
}) {
  const tones = {
    slate: {
      card: "border-slate-200 bg-white",
      icon: "bg-slate-100 text-slate-600",
      label: "text-slate-500",
    },
    blue: {
      card: "border-blue-200 bg-blue-50/70",
      icon: "bg-blue-100 text-blue-700",
      label: "text-blue-700",
    },
    emerald: {
      card: "border-emerald-200 bg-emerald-50/70",
      icon: "bg-emerald-100 text-emerald-700",
      label: "text-emerald-700",
    },
    violet: {
      card: "border-violet-200 bg-violet-50/70",
      icon: "bg-violet-100 text-violet-700",
      label: "text-violet-700",
    },
  };

  const style = tones[tone];

  return (
    <div className={`min-w-0 rounded-2xl border p-4 ${style.card}`}>
      <div className="flex items-center gap-2.5">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
        >
          <Icon className="size-4.5" />
        </span>

        <p className={`text-xs font-bold ${style.label}`}>{label}</p>
      </div>

      <div className="mt-3 min-w-0">{children}</div>
    </div>
  );
}

function StageTime({
  label,
  value,
  tone,
}: {
  label: string;
  value: Date | null;
  tone: "blue" | "emerald";
}) {
  const styles = {
    blue: {
      icon: "bg-blue-100 text-blue-700",
      value: "text-blue-900",
    },
    emerald: {
      icon: "bg-emerald-100 text-emerald-700",
      value: "text-emerald-900",
    },
  };

  const style = styles[tone];

  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${style.icon}`}
      >
        {tone === "blue" ? (
          <Clock3 className="size-4" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">{label}</p>

        <p
          className={`mt-1 break-words text-sm font-bold leading-6 ${
            value ? style.value : "text-slate-400"
          }`}
        >
          {value ? formatDateTime(value) : "ثبت نشده"}
        </p>
      </div>
    </div>
  );
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

  const stageProgress =
    stages.length > 0
      ? Math.round((completedStageCount / stages.length) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-slate-100/90" dir="rtl">
      <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/tasks"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
          >
            <ArrowRight className="size-4" />
            بازگشت به تسک‌ها
          </Link>

          <form action={handleDeleteTask.bind(null, task.id)}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50"
            >
              <Trash2 className="size-4" />
              حذف تسک
            </button>
          </form>
        </div>

        {/* Main task header */}
        <section className="relative isolate overflow-hidden rounded-3xl border border-blue-950/20 bg-gradient-to-l from-slate-950 via-blue-950 to-indigo-900 p-5 text-white shadow-md sm:p-7">
          <div className="pointer-events-none absolute -left-12 -top-16 -z-10 size-56 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 -z-10 size-64 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${getStatusClass(
                  task.status,
                )}`}
              >
                {STATUS_LABELS[task.status]}
              </span>

              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${getPriorityClass(
                  task.priority,
                )}`}
              >
                اولویت {PRIORITY_LABELS[task.priority]}
              </span>

              {isStaged ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/40 bg-indigo-300/15 px-3 py-1.5 text-xs font-bold text-indigo-100">
                  <ListOrdered className="size-3.5" />
                  چندمرحله‌ای
                </span>
              ) : null}

              {task.isRecurring ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/40 bg-violet-300/15 px-3 py-1.5 text-xs font-bold text-violet-100">
                  <Repeat2 className="size-3.5" />
                  تکرارشونده
                </span>
              ) : null}

              {overdue ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200/40 bg-red-400/15 px-3 py-1.5 text-xs font-extrabold text-red-100">
                  <AlertTriangle className="size-3.5" />
                  عقب‌افتاده
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 break-words text-2xl font-black leading-relaxed tracking-tight sm:text-3xl lg:text-4xl">
              {task.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-blue-100/85">
              <span className="text-blue-200/70">پروژه</span>

              <Link
                href={`/admin/projects/${task.project.id}`}
                className="font-bold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
              >
                {task.project.title}
              </Link>

              <span className="text-white/30">/</span>

              <span className="text-blue-200/70">زیرپروژه</span>

              <span className="font-semibold text-white">
                {task.subProject
                  ? SUB_PROJECT_LABELS[task.subProject.type]
                  : "انتخاب نشده"}
              </span>
            </div>
          </div>
        </section>

        {/* Key information */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            label="مسئول‌های تسک"
            icon={UserRound}
            tone="blue"
          >
            {task.assignees.length > 0 ? (
              <div className="space-y-2">
                {task.assignees.map((assignee) => (
                  <div
                    key={assignee.user.id}
                    className="min-w-0"
                  >
                    <p className="break-words text-sm font-extrabold leading-6 text-slate-900">
                      {assignee.user.name}
                    </p>

                    <p
                      dir="ltr"
                      className="mt-0.5 truncate text-xs text-slate-500"
                    >
                      {assignee.user.email}
                    </p>
                  </div>
                ))}
              </div>
            ) : isStaged ? (
              <p className="text-sm font-bold leading-6 text-slate-800">
                مسئولان در مراحل تعیین شده‌اند.
              </p>
            ) : (
              <p className="text-sm font-bold text-slate-400">
                بدون مسئول
              </p>
            )}
          </InfoCard>

          <InfoCard
            label="مهلت انجام"
            icon={CalendarDays}
            tone={overdue ? "emerald" : "slate"}
          >
            <p
              className={`text-sm font-extrabold leading-6 ${
                overdue ? "text-red-700" : "text-slate-900"
              }`}
            >
              {formatDate(task.deadline)}
            </p>

            {overdue ? (
              <p className="mt-1 text-xs font-bold text-red-600">
                مهلت انجام گذشته است.
              </p>
            ) : null}
          </InfoCard>

          <InfoCard
            label="کامنت‌ها"
            icon={MessageSquare}
            tone="violet"
          >
            <p className="text-2xl font-black text-slate-950">
              {task.comments.length.toLocaleString("fa-IR")}
              <span className="mr-1.5 text-xs font-bold text-slate-500">
                مورد
              </span>
            </p>
          </InfoCard>

          <InfoCard
            label="فایل‌های پیوست"
            icon={Paperclip}
            tone="emerald"
          >
            <p className="text-2xl font-black text-slate-950">
              {task.attachments.length.toLocaleString("fa-IR")}
              <span className="mr-1.5 text-xs font-bold text-slate-500">
                فایل
              </span>
            </p>
          </InfoCard>
        </section>

        {/* Task stages */}
        {isStaged ? (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-indigo-200 bg-gradient-to-l from-indigo-50 to-white p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                    <ListOrdered className="size-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      مراحل انجام تسک
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      ترتیب مراحل، مسئول و زمان انجام هر بخش
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500">
                      پیشرفت مراحل
                    </p>

                    <p className="mt-1 text-lg font-black text-indigo-800">
                      {completedStageCount.toLocaleString("fa-IR")}
                      <span className="mx-1 text-slate-300">/</span>
                      {stages.length.toLocaleString("fa-IR")}
                    </p>
                  </div>

                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-700">
                    {stageProgress.toLocaleString("fa-IR")}٪
                  </div>
                </div>
              </div>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-indigo-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${stageProgress}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-3 p-4 sm:p-6">
              {stages.map((stage, index) => {
                const stageStatus = stage.status as StageStatus;

                const stageTone =
                  stageStatus === "COMPLETED"
                    ? {
                        card: "border-emerald-200 bg-emerald-50/40",
                        number: "bg-emerald-600 text-white",
                        border: "border-r-emerald-400",
                      }
                    : stageStatus === "IN_PROGRESS"
                      ? {
                          card: "border-blue-300 bg-blue-50/60",
                          number: "bg-blue-600 text-white",
                          border: "border-r-blue-500",
                        }
                      : {
                          card: "border-slate-200 bg-slate-50/80",
                          number: "bg-slate-200 text-slate-600",
                          border: "border-r-slate-300",
                        };

                return (
                  <details
                    key={stage.id}
                    open={stageStatus === "IN_PROGRESS"}
                    className={`group overflow-hidden rounded-2xl border border-r-4 ${stageTone.card} ${stageTone.border}`}
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stageTone.number}`}
                      >
                        {stageStatus === "COMPLETED" ? (
                          <Check className="size-5" />
                        ) : stageStatus === "LOCKED" ? (
                          <LockKeyhole className="size-4" />
                        ) : (
                          <span className="text-sm font-black">
                            {(index + 1).toLocaleString("fa-IR")}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-sm font-black leading-6 text-slate-950 sm:text-base">
                            {stage.title}
                          </h3>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${getStageStatusClass(
                              stageStatus,
                            )}`}
                          >
                            {STAGE_STATUS_LABELS[stageStatus]}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                          مسئول: {stage.assignee.name}
                        </p>
                      </div>

                      <ChevronDown className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                    </summary>

                    <div className="border-t border-slate-200/80 bg-white/75 p-4 sm:p-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                          <div className="flex items-center gap-2">
                            <UserRound className="size-4 text-blue-600" />
                            <p className="text-xs font-bold text-slate-500">
                              مسئول مرحله
                            </p>
                          </div>

                          <p className="mt-2 break-words text-sm font-extrabold text-slate-900">
                            {stage.assignee.name}
                          </p>

                          <p
                            dir="ltr"
                            className="mt-1 break-all text-xs text-slate-500"
                          >
                            {stage.assignee.email}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-violet-600" />
                            <p className="text-xs font-bold text-slate-500">
                              توضیحات مرحله
                            </p>
                          </div>

                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                            {stage.description || "توضیحی ثبت نشده است."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5">
                          <StageTime
                            label="زمان فعال‌شدن"
                            value={stage.activatedAt}
                            tone="blue"
                          />
                        </div>

                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                          <StageTime
                            label="زمان تکمیل"
                            value={stage.completedAt}
                            tone="emerald"
                          />

                          {stage.completedBy ? (
                            <div className="mt-3 border-t border-emerald-200 pt-3">
                              <p className="text-xs font-semibold text-slate-500">
                                تکمیل‌کننده
                              </p>

                              <p className="mt-1 text-sm font-extrabold text-emerald-900">
                                {stage.completedBy.name}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Description and status */}
        <div className="grid gap-5 xl:grid-cols-2">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/80 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <FileText className="size-5" />
              </div>

              <div>
                <h2 className="font-black text-slate-950">
                  توضیحات تسک
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  شرح کار و نکات موردنیاز
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {task.description ? (
                <p className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-700">
                  {task.description}
                </p>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                  <FileText className="mx-auto size-6 text-slate-400" />
                  <p className="mt-3 text-sm font-bold text-slate-600">
                    توضیحاتی ثبت نشده است
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/80 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Clock3 className="size-5" />
              </div>

              <div>
                <h2 className="font-black text-slate-950">
                  وضعیت تسک
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  کنترل وضعیت فعلی
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {isStaged ? (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <ListOrdered className="size-4.5" />
                    </div>

                    <div>
                      <p className="text-sm font-extrabold text-indigo-950">
                        وضعیت از طریق مراحل مدیریت می‌شود
                      </p>

                      <p className="mt-2 text-sm leading-7 text-indigo-800">
                        با تکمیل مرحله‌ها، وضعیت تسک مطابق روند تعریف‌شده
                        به‌روزرسانی می‌شود.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <TaskStatusActions
                  taskId={task.id}
                  currentStatus={task.status}
                />
              )}
            </div>
          </section>
        </div>

        {/* Editable task details: collapsed by default */}
        <section className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-gradient-to-l from-blue-50 to-white p-5 [&::-webkit-details-marker]:hidden sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <Sparkles className="size-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-black text-slate-950 sm:text-lg">
                    ویرایش مشخصات تسک
                  </h2>

                  <p className="mt-1 text-xs leading-6 text-slate-500 sm:text-sm">
                    برای تغییر مشخصات و مسئول‌ها این بخش را باز کنید.
                  </p>
                </div>
              </div>

              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-700 transition-transform group-open:rotate-180">
                <ChevronDown className="size-5" />
              </span>
            </summary>

            <div className="border-t border-slate-200 p-4 sm:p-6 lg:p-7">
              <EditTaskForm
                taskId={task.id}
                projectId={task.project.id}
                isStaged={isStaged}
                defaultStages={
                  isStaged
                    ? taskStages.map((stage) => ({
                        id: stage.id,
                        title: stage.title,
                        description: stage.description,
                        position: stage.position,
                        status: stage.status,
                        assigneeId: stage.assigneeId,
                        activatedAt: stage.activatedAt,
                        completedAt: stage.completedAt,
                        completedById: stage.completedById,
                        assigneeName: stage.assignee.name,
                        completedByName: stage.completedBy?.name ?? null,
                      }))
                    : undefined
                }
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
            </div>
          </details>
        </section>

        {/* Comments */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-l from-violet-50 to-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white">
                <MessageSquare className="size-5" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  گفتگو و کامنت‌ها
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  ثبت توضیحات و پیگیری‌های مرتبط با تسک
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-0 p-4 sm:p-6">
            <TaskComments
              taskId={task.id}
              comments={task.comments}
            />
          </div>
        </section>

        {/* Audit information: collapsed by default */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <CalendarDays className="size-5" />
                </div>

                <div>
                  <h2 className="font-extrabold text-slate-900">
                    اطلاعات ثبت تسک
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    ایجادکننده، تاریخ‌ها و اطلاعات پروژه
                  </p>
                </div>
              </div>

              <ChevronDown className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>

            <div className="border-t border-slate-200 bg-slate-50/70 p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    ایجادکننده
                  </p>

                  <p className="mt-2 break-words text-sm font-extrabold text-slate-900">
                    {task.createdBy.name}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    تاریخ ایجاد
                  </p>

                  <p className="mt-2 text-sm font-extrabold text-slate-900">
                    {formatDate(task.createdAt)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    آخرین به‌روزرسانی
                  </p>

                  <p className="mt-2 text-sm font-extrabold text-slate-900">
                    {formatDate(task.updatedAt)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    وضعیت پروژه
                  </p>

                  <p className="mt-2 text-sm font-extrabold text-slate-900">
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
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 sm:col-span-2 lg:col-span-4">
                    <p className="text-xs font-bold text-indigo-700">
                      پیشرفت مراحل
                    </p>

                    <p className="mt-2 text-sm font-extrabold text-indigo-950">
                      {completedStageCount.toLocaleString("fa-IR")} از{" "}
                      {stages.length.toLocaleString("fa-IR")} مرحله تکمیل شده
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}