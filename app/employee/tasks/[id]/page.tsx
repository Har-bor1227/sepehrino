import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Repeat2,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";

import TaskOccurrenceStatusActions from "@/components/tasks/task-occurrence-status-actions";
import TaskComments from "@/components/tasks/task-comments";
import TaskStatusActions from "@/components/tasks/task-status-actions";

import { requireEmployee } from "@/lib/auth/guards";
import {
  getTaskById,
  isTaskOverdue,
} from "@/lib/services/task.service";

type EmployeeTaskPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

type RecurrenceType =
  | "NONE"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

const STATUS_LABELS: Record<
  TaskStatus,
  string
> = {
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

const RECURRENCE_LABELS: Record<
  RecurrenceType,
  string
> = {
  NONE: "",
  DAILY: "روزانه",
  WEEKLY: "هفتگی",
  MONTHLY: "ماهانه",
};

const WEEKDAY_LABELS: Record<
  number,
  string
> = {
  1: "دوشنبه",
  2: "سه‌شنبه",
  3: "چهارشنبه",
  4: "پنجشنبه",
  5: "جمعه",
  6: "شنبه",
  7: "یکشنبه",
};

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

function getTodayDateKey() {
  const today = new Date();

  const year =
    today.getUTCFullYear();

  const month = String(
    today.getUTCMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    today.getUTCDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateKey(date: Date) {
  const year =
    date.getUTCFullYear();

  const month = String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getUTCDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStatusClass(
  status: TaskStatus,
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

function formatDateTime(
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
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function getRecurrenceDescription(
  type: RecurrenceType,
  weekdays: number[],
  dayOfMonth:
    | number
    | null,
) {
  if (type === "DAILY") {
    return "هر روز";
  }

  if (type === "WEEKLY") {
    if (weekdays.length === 0) {
      return "برنامه هفتگی";
    }

    return weekdays
      .sort((a, b) => a - b)
      .map(
        (weekday) =>
          WEEKDAY_LABELS[
            weekday
          ],
      )
      .filter(Boolean)
      .join("، ");
  }

  if (type === "MONTHLY") {
    if (!dayOfMonth) {
      return "برنامه ماهانه";
    }

    return `روز ${dayOfMonth.toLocaleString(
      "fa-IR",
    )} هر ماه`;
  }

  return "";
}

function formatOccurrenceCompletedAt(
  completedAt:
    | Date
    | null
    | undefined,
) {
  if (!completedAt) {
    return "ثبت نشده";
  }

  return formatDateTime(
    completedAt,
  );
}

export default async function EmployeeTaskPage({
  params,
}: EmployeeTaskPageProps) {
  await requireEmployee();

  const { id } =
    await params;

  const task =
    await getTaskById(id);

  if (!task) {
    notFound();
  }

  const todayDateKey =
    getTodayDateKey();

  const recurring =
    task.isRecurring;

  const recurrenceType =
    task.recurrenceType as RecurrenceType;

  const overdue =
    !recurring &&
    isTaskOverdue(
      task.deadline,
      task.status,
    );

  const recurrenceDescription =
    recurring
      ? getRecurrenceDescription(
          recurrenceType,
          task.recurrenceWeekdays,
          task.recurrenceDayOfMonth,
        )
      : "";

  return (
    <main
      className="min-h-screen"
      dir="rtl"
    >
      <div className="mx-auto max-w-[1250px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <Link
          href="/employee/tasks"
          className="glass-icon inline-flex h-10 items-center gap-2 rounded-2xl px-4 text-sm font-semibold text-slate-600 transition hover:-translate-y-px hover:bg-white/70"
        >
          <ArrowRight className="size-4" />
          بازگشت به Taskهای من
        </Link>

        <section className="glass-strong rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {recurring ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/60 bg-violet-50/65 px-3 py-1.5 text-xs font-bold text-violet-700">
                  <Repeat2 className="size-3.5" />
                  {
                    RECURRENCE_LABELS[
                      recurrenceType
                    ]
                  }
                </span>

                {task.recurrenceActive ? (
                  <span className="rounded-full border border-emerald-200/55 bg-emerald-50/60 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    تکرار فعال
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-200/55 bg-slate-500/8 px-3 py-1.5 text-xs font-bold text-slate-600">
                    تکرار متوقف شده
                  </span>
                )}

                {task.todayOccurrence ? (
                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                      task.todayOccurrence
                        .completed
                        ? "border-emerald-200/55 bg-emerald-50/60 text-emerald-700"
                        : "border-amber-200/55 bg-amber-50/60 text-amber-700"
                    }`}
                  >
                    {task.todayOccurrence
                      .completed
                      ? "امروز انجام شده"
                      : "امروز در انتظار انجام"}
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-200/55 bg-slate-500/8 px-3 py-1.5 text-xs font-bold text-slate-500">
                    امروز برنامه ندارد
                  </span>
                )}
              </>
            ) : (
              <>
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

                {overdue ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-200/55 bg-red-50/65 px-3 py-1.5 text-xs font-bold text-red-700">
                    <AlertTriangle className="size-3.5" />
                    عقب‌افتاده
                  </span>
                ) : null}
              </>
            )}

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
          </div>

          <h1 className="mt-5 break-words text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            {task.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
            <span>
              پروژه:
            </span>

            <strong className="text-slate-700">
              {
                task.project
                  .title
              }
            </strong>

            <span className="text-slate-300">
              /
            </span>

            <span>
              زیرپروژه:
            </span>

            <strong className="text-slate-700">
              {task.subProject
                ? SUB_PROJECT_LABELS[
                    task
                      .subProject
                      .type
                  ]
                : "انتخاب نشده"}
            </strong>
          </div>

          {recurring ? (
            <div className="mt-6 rounded-3xl border border-violet-200/45 bg-violet-50/35 p-5">
              <div className="flex items-center gap-2 text-sm font-extrabold text-violet-800">
                <Repeat2 className="size-4.5" />
                برنامه تکرار
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/45 bg-white/30 p-4">
                  <p className="text-[11px] text-slate-400">
                    نوع تکرار
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {
                      RECURRENCE_LABELS[
                        recurrenceType
                      ]
                    }
                  </p>
                </div>

                <div className="rounded-2xl border border-white/45 bg-white/30 p-4">
                  <p className="text-[11px] text-slate-400">
                    برنامه
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {
                      recurrenceDescription
                    }
                  </p>
                </div>

                <div className="rounded-2xl border border-white/45 bg-white/30 p-4">
                  <p className="text-[11px] text-slate-400">
                    شروع
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {task.recurrenceStartDate
                      ? formatDate(
                          task.recurrenceStartDate,
                        )
                      : formatDate(
                          task.deadline,
                        )}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-sky-200/45 bg-sky-50/45 p-4">
                <p className="text-xs font-bold text-sky-800">
                  این Task با یک Task جدید در هر روز
                  تکثیر نمی‌شود؛ تکمیل هر روز در
                  Occurrence همان تاریخ ثبت می‌شود.
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/45 bg-white/25 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <UserRound className="size-4" />
                مسئول‌های Task
              </div>

              {task.assignees.length >
              0 ? (
                <div className="mt-3 space-y-2">
                  {task.assignees.map(
                    (assignee) => (
                      <div
                        key={
                          assignee.user
                            .id
                        }
                      >
                        <p className="font-bold text-slate-800">
                          {
                            assignee
                              .user
                              .name
                          }
                        </p>

                        <p
                          dir="ltr"
                          className="mt-1 text-xs text-slate-400"
                        >
                          {
                            assignee
                              .user
                              .email
                          }
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm font-semibold text-slate-400">
                  بدون مسئول
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-white/45 bg-white/25 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <CalendarDays className="size-4" />

                {recurring
                  ? "شروع تکرار"
                  : "Deadline"}
              </div>

              <p
                className={`mt-3 font-bold ${
                  overdue
                    ? "text-red-600"
                    : "text-slate-800"
                }`}
              >
                {recurring
                  ? task.recurrenceStartDate
                    ? formatDate(
                        task.recurrenceStartDate,
                      )
                    : formatDate(
                        task.deadline,
                      )
                  : formatDate(
                      task.deadline,
                    )}
              </p>
            </div>

            <div className="rounded-3xl border border-white/45 bg-white/25 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Clock3 className="size-4" />
                آخرین بروزرسانی
              </div>

              <p className="mt-3 font-bold text-slate-800">
                {formatDateTime(
                  task.updatedAt,
                )}
              </p>
            </div>
          </div>
        </section>

        {recurring ? (
          <section className="glass-card rounded-[2rem] p-5 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                    <CheckCircle2 className="size-5 text-slate-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      انجام Task برای امروز
                    </h2>

                    <p className="mt-1 text-xs leading-6 text-slate-400">
                      فقط Occurrence مربوط به امروز تغییر
                      می‌کند و سابقه روزهای قبلی حفظ می‌شود.
                    </p>
                  </div>
                </div>
              </div>

              {task.todayOccurrence ? (
                <div className="rounded-2xl border border-white/50 bg-white/30 px-4 py-3 text-left">
                  <p className="text-[11px] text-slate-400">
                    تاریخ Occurrence
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {formatDate(
                      task
                        .todayOccurrence
                        .occurrenceDate,
                    )}
                  </p>
                </div>
              ) : null}
            </div>

            {task.todayOccurrence ? (
              <div className="flex flex-col gap-4">
                <div
                  className={`rounded-3xl border p-5 ${
                    task.todayOccurrence
                      .completed
                      ? "border-emerald-200/55 bg-emerald-50/45"
                      : "border-amber-200/55 bg-amber-50/45"
                  }`}
                >
                  <p className="text-xs text-slate-400">
                    وضعیت امروز
                  </p>

                  <p
                    className={`mt-2 text-lg font-extrabold ${
                      task.todayOccurrence
                        .completed
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {task.todayOccurrence
                      .completed
                      ? "انجام امروز ثبت شده است"
                      : "امروز هنوز انجام نشده است"}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    زمان ثبت:
                    <span className="mr-1 font-semibold text-slate-600">
                      {formatOccurrenceCompletedAt(
                        task
                          .todayOccurrence
                          .completedAt,
                      )}
                    </span>
                  </p>
                </div>

                <div className="flex justify-start">
                  <TaskOccurrenceStatusActions
                    taskId={
                      task.id
                    }
                    occurrenceDate={
                      getDateKey(
                        task
                          .todayOccurrence
                          .occurrenceDate,
                      )
                    }
                    completed={
                      task
                        .todayOccurrence
                        .completed
                    }
                    disabled={
                      !task
                        .recurrenceActive
                    }
                  />
                </div>

                {!task.recurrenceActive ? (
                  <p className="text-xs leading-6 text-slate-400">
                    تکرار این Task متوقف شده است؛
                    سابقه Occurrenceهای قبلی حفظ می‌شود.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300/45 bg-white/20 p-7 text-center">
                <div className="glass-icon mx-auto flex size-12 items-center justify-center rounded-2xl">
                  <CalendarDays className="size-5 text-slate-400" />
                </div>

                <p className="mt-4 font-bold text-slate-700">
                  امروز Occurrence فعالی برای این Task وجود ندارد.
                </p>

                <p className="mt-2 text-sm leading-7 text-slate-400">
                  این تاریخ در برنامه تکرار Task قرار ندارد یا
                  تکرار Task متوقف شده است.
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/50 bg-white/30 px-4 py-3 text-xs text-slate-400">
                  <CalendarDays className="size-4" />
                  امروز:
                  <span className="font-bold text-slate-600">
                    {formatDate(
                      new Date(
                        `${todayDateKey}T00:00:00.000Z`,
                      ),
                    )}
                  </span>
                </div>
              </div>
            )}
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
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
                توضیحی برای این Task ثبت نشده است.
              </div>
            )}
          </section>

          {!recurring ? (
            <section className="glass-card rounded-[2rem] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                  <Clock3 className="size-5 text-slate-600" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    وضعیت Task
                  </h2>

                  <p className="mt-1 text-xs leading-6 text-slate-400">
                    وضعیت Task را پس از انجام هر مرحله بروزرسانی کنید.
                  </p>
                </div>
              </div>

              <TaskStatusActions
                taskId={
                  task.id
                }
                currentStatus={
                  task.status
                }
              />
            </section>
          ) : (
            <section className="glass-card rounded-[2rem] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                  <Repeat2 className="size-5 text-slate-600" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    وضعیت تکرار
                  </h2>

                  <p className="mt-1 text-xs leading-6 text-slate-400">
                    وضعیت والد Task جدا از Occurrenceهای روزانه نگهداری می‌شود.
                  </p>
                </div>
              </div>

              <div
                className={`rounded-2xl border p-4 ${
                  task.recurrenceActive
                    ? "border-emerald-200/45 bg-emerald-50/35"
                    : "border-slate-200/45 bg-slate-500/5"
                }`}
              >
                <p
                  className={`text-sm font-extrabold ${
                    task.recurrenceActive
                      ? "text-emerald-700"
                      : "text-slate-600"
                  }`}
                >
                  {task.recurrenceActive
                    ? "تکرار فعال است"
                    : "تکرار متوقف شده"}
                </p>

                <p className="mt-2 text-xs leading-6 text-slate-400">
                  {
                    recurrenceDescription
                  }
                </p>
              </div>
            </section>
          )}
        </div>

        <TaskComments
          taskId={task.id}
          comments={
            task.comments
          }
        />

        <section className="glass-card rounded-[2rem] p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
              <CheckCircle2 className="size-5 text-slate-600" />
            </div>

            <h2 className="text-lg font-extrabold text-slate-900">
              اطلاعات Task
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
                {formatDateTime(
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

            {recurring ? (
              <div className="rounded-2xl border border-white/40 bg-white/20 p-4 sm:col-span-2">
                <p className="text-xs text-slate-400">
                  وضعیت امروز
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {task.todayOccurrence
                    ? task.todayOccurrence
                        .completed
                      ? "Occurrence امروز تکمیل شده است."
                      : "Occurrence امروز هنوز تکمیل نشده است."
                    : "برای امروز Occurrence وجود ندارد."}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}