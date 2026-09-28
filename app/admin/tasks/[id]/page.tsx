import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
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

function formatDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      calendar:
        "persian",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).format(date);
}

function toDateInputValue(
  date: Date,
) {
  const year =
    date.getFullYear();

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

  const result =
    await deleteTaskAction(
      taskId,
    );

  if (!result.success) {
    throw new Error(
      result.message,
    );
  }

  redirect("/admin/tasks");
}

export default async function AdminTaskPage({
  params,
}: TaskPageProps) {
  const { id } =
    await params;

  const [task, projects] =
    await Promise.all([
      getTaskById(id),
      getAdminProjects(),
    ]);

  if (!task) {
    notFound();
  }

  const currentProject =
    projects.find(
      (project) =>
        project.id ===
        task.project.id,
    );

  if (!currentProject) {
    notFound();
  }

  const overdue =
    isTaskOverdue(
      task.deadline,
      task.status,
    );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/admin/tasks"
            className="glass-icon inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-slate-600 transition hover:-translate-y-px hover:bg-white/70"
          >
            <ArrowRight className="size-4" />
            بازگشت به Taskها
          </Link>

          <form
            action={handleDeleteTask.bind(
              null,
              task.id,
            )}
          >
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200/55 bg-red-50/65 px-4 text-sm font-semibold text-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition hover:bg-red-100/75 sm:w-auto"
            >
              <Trash2 className="size-4" />
              حذف Task
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
                  {
                    STATUS_LABELS[
                      task.status
                    ]
                  }
                </span>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getPriorityClass(
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

              <Link
                href={`/admin/projects/${task.project.id}`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-800"
              >
                پروژه:
                <strong className="text-slate-700">
                  {
                    task.project
                      .title
                  }
                </strong>
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/45 bg-white/25 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <UserRound className="size-4" />
                مسئول
              </div>

              <p className="mt-3 font-bold text-slate-800">
                {
                  task
                    .assignedTo
                    .name
                }
              </p>

              <p
                dir="ltr"
                className="mt-1 text-xs text-slate-400"
              >
                {
                  task
                    .assignedTo
                    .email
                }
              </p>
            </div>

            <div className="rounded-3xl border border-white/45 bg-white/25 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <CalendarDays className="size-4" />
                Deadline
              </div>

              <p
                className={`mt-3 font-bold ${
                  overdue
                    ? "text-red-600"
                    : "text-slate-800"
                }`}
              >
                {formatDate(
                  task.deadline,
                )}
              </p>
            </div>

            <div className="rounded-3xl border border-white/45 bg-white/25 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <MessageSquare className="size-4" />
                کامنت‌ها
              </div>

              <p className="mt-3 font-bold text-slate-800">
                {task.comments.length.toLocaleString(
                  "fa-IR",
                )}{" "}
                مورد
              </p>
            </div>

            <div className="rounded-3xl border border-white/45 bg-white/25 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Paperclip className="size-4" />
                فایل‌ها
              </div>

              <p className="mt-3 font-bold text-slate-800">
                {task.attachments.length.toLocaleString(
                  "fa-IR",
                )}{" "}
                مورد
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.6fr)]">
          <section className="glass-card rounded-[2rem] p-5 sm:p-6 lg:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                <FileText className="size-5 text-slate-600" />
              </div>

              <h2 className="text-lg font-extrabold text-slate-900">
                توضیحات Task
              </h2>
            </div>

            {task.description ? (
              <p className="whitespace-pre-wrap text-sm leading-8 text-slate-600">
                {
                  task.description
                }
              </p>
            ) : (
              <div className="soft-grid rounded-3xl border border-dashed border-slate-300/40 bg-white/20 p-7 text-center text-sm text-slate-400">
                توضیحاتی برای این Task ثبت نشده است.
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
                  تغییر وضعیت
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  وضعیت فعلی Task را مدیریت کنید.
                </p>
              </div>
            </div>

            <TaskStatusActions
              taskId={task.id}
              currentStatus={
                task.status
              }
            />
          </section>
        </div>

        <section className="glass-card rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-slate-900">
              ویرایش Task
            </h2>

            <p className="mt-1 text-sm leading-7 text-slate-400">
              مشخصات، مسئول، اولویت و Deadline را ویرایش کنید.
            </p>
          </div>

      <EditTaskForm
        taskId={task.id}
        projectId={
          task.project.id
        }
        defaultValues={{
          title:
            task.title,
          description:
            task.description ??
            "",
          assignedToId:
            task.assignedTo.id,
          priority:
            task.priority,
          deadline:
            toDateInputValue(
              task.deadline,
            ),

          isRecurring:
            task.isRecurring,

          recurrenceType:
            task.recurrenceType,

          recurrenceStartDate:
            task.recurrenceStartDate
              ? toDateInputValue(
                  task.recurrenceStartDate,
                )
              : toDateInputValue(
                  task.deadline,
                ),

          recurrenceEndDate:
            null,

          recurrenceWeekdays:
            task.recurrenceWeekdays,

          recurrenceDayOfMonth:
            task.recurrenceDayOfMonth,

          recurrenceActive:
            task.recurrenceActive,
        }}
        employees={
          currentProject.members.map(
            (member) =>
              member.user,
          )
        }
      />
        </section>

        <TaskComments
          taskId={task.id}
          comments={
            task.comments
          }
        />

        <section className="glass-card rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
              <CheckCircle2 className="size-5 text-slate-600" />
            </div>

            <h2 className="text-lg font-extrabold text-slate-900">
              اطلاعات ثبت Task
            </h2>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-white/40 bg-white/20 p-4">
              <p className="text-xs text-slate-400">
                ایجادکننده
              </p>

              <p className="mt-1 font-bold text-slate-800">
                {
                  task.createdBy
                    .name
                }
              </p>
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/20 p-4">
              <p className="text-xs text-slate-400">
                تاریخ ایجاد
              </p>

              <p className="mt-1 font-bold text-slate-800">
                {formatDate(
                  task.createdAt,
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/20 p-4">
              <p className="text-xs text-slate-400">
                آخرین بروزرسانی
              </p>

              <p className="mt-1 font-bold text-slate-800">
                {formatDate(
                  task.updatedAt,
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/20 p-4">
              <p className="text-xs text-slate-400">
                وضعیت پروژه
              </p>

              <p className="mt-1 font-bold text-slate-800">
                {task.project.status ===
                "PLANNED"
                  ? "برنامه‌ریزی شده"
                  : task.project
                        .status ===
                      "IN_PROGRESS"
                    ? "در حال انجام"
                    : task.project
                          .status ===
                        "COMPLETED"
                      ? "تکمیل شده"
                      : "آرشیو شده"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}