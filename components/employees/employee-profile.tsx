import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  Mail,
  UserRound,
} from "lucide-react";

type EmployeeProfile = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;

  stats: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    completionRate: number;
  };

  projects: Array<{
    id: string;
    title: string;
    status:
      | "PLANNED"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "ARCHIVED";
    deadline: Date;
    employeeTaskCount: number;
    employeeCompletedTaskCount: number;
    progress: number;
  }>;

  assignedTasks: Array<{
    id: string;
    title: string;
    status:
      | "TODO"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "CANCELLED";
    priority:
      | "LOW"
      | "MEDIUM"
      | "HIGH"
      | "URGENT";
    deadline: Date;
    completedAt: Date | null;
    project: {
      id: string;
      title: string;
    };
  }>;

  activityLogs: Array<{
    id: string;
    action:
      | "EMPLOYEE_CREATED"
      | "EMPLOYEE_UPDATED"
      | "EMPLOYEE_STATUS_CHANGED"
      | "PROJECT_CREATED"
      | "PROJECT_UPDATED"
      | "PROJECT_DELETED"
      | "PROJECT_STATUS_CHANGED"
      | "PROJECT_MEMBER_ADDED"
      | "PROJECT_MEMBER_REMOVED"
      | "TASK_CREATED"
      | "TASK_UPDATED"
      | "TASK_DELETED"
      | "TASK_ASSIGNED"
      | "TASK_ASSIGNEE_REMOVED"
      | "TASK_STATUS_CHANGED"
      | "TASK_PRIORITY_CHANGED"
      | "TASK_DEADLINE_CHANGED"
      | "TASK_COMPLETED"
      | "COMMENT_CREATED"
      | "ATTACHMENT_ADDED"
      | "ATTACHMENT_DELETED"
      | "NOTIFICATION_CREATED"
      | "NOTIFICATION_READ";
    createdAt: Date;
  }>;
};

function formatDate(
  date: Date,
) {
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

function getProjectStatusLabel(
  status: EmployeeProfile["projects"][number]["status"],
) {
  const labels = {
    PLANNED: "برنامه‌ریزی‌شده",
    IN_PROGRESS: "در حال انجام",
    COMPLETED: "تکمیل‌شده",
    ARCHIVED: "آرشیو",
  };

  return labels[status];
}

function getProjectStatusClass(
  status: EmployeeProfile["projects"][number]["status"],
) {
  const classes = {
    PLANNED:
      "border-slate-200/55 bg-slate-500/8 text-slate-700",
    IN_PROGRESS:
      "border-blue-200/55 bg-blue-50/45 text-blue-700",
    COMPLETED:
      "border-emerald-200/55 bg-emerald-50/45 text-emerald-700",
    ARCHIVED:
      "border-slate-200/55 bg-slate-500/6 text-slate-500",
  };

  return classes[status];
}

function getTaskStatusLabel(
  status: EmployeeProfile["assignedTasks"][number]["status"],
) {
  const labels = {
    TODO: "در انتظار",
    IN_PROGRESS: "در حال انجام",
    COMPLETED: "تکمیل‌شده",
    CANCELLED: "لغوشده",
  };

  return labels[status];
}

function getPriorityLabel(
  priority: EmployeeProfile["assignedTasks"][number]["priority"],
) {
  const labels = {
    LOW: "کم",
    MEDIUM: "متوسط",
    HIGH: "زیاد",
    URGENT: "فوری",
  };

  return labels[priority];
}

function getPriorityClass(
  priority: EmployeeProfile["assignedTasks"][number]["priority"],
) {
  const classes = {
    LOW:
      "border-slate-200/55 bg-slate-500/8 text-slate-600",
    MEDIUM:
      "border-amber-200/55 bg-amber-50/45 text-amber-700",
    HIGH:
      "border-orange-200/55 bg-orange-50/45 text-orange-700",
    URGENT:
      "border-red-200/55 bg-red-50/45 text-red-700",
  };

  return classes[priority];
}

function getTaskStatusClass(
  status: EmployeeProfile["assignedTasks"][number]["status"],
) {
  const classes = {
    TODO:
      "border-slate-200/55 bg-slate-500/8 text-slate-600",
    IN_PROGRESS:
      "border-blue-200/55 bg-blue-50/45 text-blue-700",
    COMPLETED:
      "border-emerald-200/55 bg-emerald-50/45 text-emerald-700",
    CANCELLED:
      "border-red-200/55 bg-red-50/45 text-red-700",
  };

  return classes[status];
}

function getActivityLabel(
  action: EmployeeProfile["activityLogs"][number]["action"],
) {
  const labels = {
    EMPLOYEE_CREATED:
      "کارمند ایجاد شد",
    EMPLOYEE_UPDATED:
      "اطلاعات کارمند ویرایش شد",
    EMPLOYEE_STATUS_CHANGED:
      "وضعیت کارمند تغییر کرد",
    PROJECT_CREATED:
      "پروژه ایجاد شد",
    PROJECT_UPDATED:
      "پروژه ویرایش شد",
    PROJECT_DELETED:
      "پروژه حذف شد",
    PROJECT_STATUS_CHANGED:
      "وضعیت پروژه تغییر کرد",
    PROJECT_MEMBER_ADDED:
      "عضویت در پروژه اضافه شد",
    PROJECT_MEMBER_REMOVED:
      "عضویت از پروژه حذف شد",
    TASK_CREATED:
      "Task ایجاد شد",
    TASK_UPDATED:
      "Task ویرایش شد",
    TASK_DELETED:
      "Task حذف شد",
    TASK_ASSIGNED:
      "Task اختصاص داده شد",
    TASK_ASSIGNEE_REMOVED:
      "مسئول Task حذف شد",
    TASK_STATUS_CHANGED:
      "وضعیت Task تغییر کرد",
    TASK_PRIORITY_CHANGED:
      "اولویت Task تغییر کرد",
    TASK_DEADLINE_CHANGED:
      "Deadline Task تغییر کرد",
    TASK_COMPLETED:
      "Task تکمیل شد",
    COMMENT_CREATED:
      "کامنت ثبت شد",
    ATTACHMENT_ADDED:
      "فایل اضافه شد",
    ATTACHMENT_DELETED:
      "فایل حذف شد",
    NOTIFICATION_CREATED:
      "اعلان ایجاد شد",
    NOTIFICATION_READ:
      "اعلان خوانده شد",
  };

  return labels[action];
}

const statConfig = [
  {
    key: "totalProjects",
    label: "پروژه‌ها",
    icon: FolderKanban,
    tone: "slate",
  },
  {
    key: "totalTasks",
    label: "کل Taskها",
    icon: ListTodo,
    tone: "blue",
  },
  {
    key: "completedTasks",
    label: "تکمیل‌شده",
    icon: CheckCircle2,
    tone: "emerald",
  },
  {
    key: "inProgressTasks",
    label: "در حال انجام",
    icon: Clock3,
    tone: "orange",
  },
  {
    key: "overdueTasks",
    label: "عقب‌افتاده",
    icon: AlertTriangle,
    tone: "red",
  },
] as const;

export function EmployeeProfile({
  employee,
}: {
  employee: EmployeeProfile;
}) {
  const now =
    new Date();

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden rounded-[2rem]">
        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-white/80" />

          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="relative">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-slate-900 text-white shadow-[0_16px_34px_rgba(15,23,42,0.15)] sm:size-20">
                  <UserRound className="size-7 sm:size-8" />
                </div>

                <span
                  className={`absolute -bottom-1 -left-1 size-4 rounded-full border-[3px] border-white ${
                    employee.isActive
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  }`}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                    {employee.name}
                  </h2>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                      employee.isActive
                        ? "border-emerald-200/55 bg-emerald-50/50 text-emerald-700"
                        : "border-slate-200/55 bg-slate-500/7 text-slate-500"
                    }`}
                  >
                    {employee.isActive
                      ? "فعال"
                      : "غیرفعال"}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <Mail className="size-3.5 shrink-0" />

                    <span
                      dir="ltr"
                      className="truncate"
                    >
                      {employee.email}
                    </span>
                  </span>

                  <span>
                    ایجاد حساب:{" "}
                    {formatDate(
                      employee.createdAt,
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-strong rounded-2xl px-5 py-4 sm:min-w-40">
              <p className="text-[11px] font-medium text-slate-400">
                نرخ تکمیل Task
              </p>

              <div className="mt-1 flex items-end gap-1.5">
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {employee.stats.completionRate.toLocaleString(
                    "fa-IR",
                  )}
                </p>

                <span className="mb-1 text-sm font-bold text-slate-400">
                  ٪
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-900/7">
                <div
                  className="h-full rounded-full bg-slate-800"
                  style={{
                    width: `${employee.stats.completionRate}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statConfig.map(
          (stat) => {
            const Icon =
              stat.icon;

            const value =
              employee.stats[
                stat.key
              ];

            const iconClass = {
              slate:
                "bg-slate-900/7 text-slate-600",
              blue:
                "bg-blue-500/8 text-blue-600",
              emerald:
                "bg-emerald-500/8 text-emerald-600",
              orange:
                "bg-orange-500/8 text-orange-600",
              red:
                "bg-red-500/8 text-red-600",
            }[stat.tone];

            return (
              <div
                key={
                  stat.key
                }
                className="glass-card rounded-[1.75rem] p-5 transition hover:-translate-y-px"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`glass-icon flex size-11 items-center justify-center rounded-2xl ${iconClass}`}
                  >
                    <Icon className="size-5" />
                  </div>

                  <span className="text-[10px] font-bold text-slate-300">
                    آمار
                  </span>
                </div>

                <p className="mt-5 text-xs font-medium text-slate-400">
                  {stat.label}
                </p>

                <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                  {value.toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>
            );
          },
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-card overflow-hidden rounded-[2rem]">
          <div className="border-b border-white/40 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                  <FolderKanban className="size-5 text-slate-600" />
                </div>

                <div>
                  <h2 className="font-extrabold text-slate-900">
                    پروژه‌های کارمند
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    وضعیت پروژه‌ها و میزان پیشرفت Taskها.
                  </p>
                </div>
              </div>

              <span className="glass-chip rounded-full px-3 py-1.5 text-[11px] font-bold text-slate-500">
                {employee.projects.length.toLocaleString(
                  "fa-IR",
                )}{" "}
                پروژه
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {employee.projects.length ===
            0 ? (
              <div className="soft-grid rounded-2xl border border-dashed border-slate-300/45 bg-white/18 p-8 text-center">
                <div className="glass-icon mx-auto flex size-12 items-center justify-center rounded-2xl">
                  <FolderKanban className="size-5 text-slate-400" />
                </div>

                <p className="mt-4 text-sm font-bold text-slate-600">
                  این کارمند هنوز عضو پروژه‌ای نیست.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {employee.projects.map(
                  (project) => (
                    <div
                      key={
                        project.id
                      }
                      className="group rounded-2xl border border-white/50 bg-white/25 p-4 transition hover:bg-white/42"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-800">
                            {
                              project.title
                            }
                          </p>

                          <span
                            className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${getProjectStatusClass(
                              project.status,
                            )}`}
                          >
                            {getProjectStatusLabel(
                              project.status,
                            )}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white">
                            {project.progress.toLocaleString(
                              "fa-IR",
                            )}
                            ٪
                          </span>

                          <ArrowLeft className="size-4 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-slate-500" />
                        </div>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900/7">
                        <div
                          className="h-full rounded-full bg-slate-800 transition-all"
                          style={{
                            width: `${project.progress}%`,
                          }}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                        <span>
                          {project.employeeCompletedTaskCount.toLocaleString(
                            "fa-IR",
                          )}{" "}
                          از{" "}
                          {project.employeeTaskCount.toLocaleString(
                            "fa-IR",
                          )}{" "}
                          Task
                        </span>

                        <span>
                          Deadline:{" "}
                          {formatDate(
                            project.deadline,
                          )}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>

        <section className="glass-card overflow-hidden rounded-[2rem]">
          <div className="border-b border-white/40 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                  <ListTodo className="size-5 text-slate-600" />
                </div>

                <div>
                  <h2 className="font-extrabold text-slate-900">
                    Taskهای کارمند
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    آخرین Taskهای اختصاص‌یافته به این کارمند.
                  </p>
                </div>
              </div>

              <span className="glass-chip rounded-full px-3 py-1.5 text-[11px] font-bold text-slate-500">
                ۱۰ مورد اخیر
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {employee.assignedTasks.length ===
            0 ? (
              <div className="soft-grid rounded-2xl border border-dashed border-slate-300/45 bg-white/18 p-8 text-center">
                <div className="glass-icon mx-auto flex size-12 items-center justify-center rounded-2xl">
                  <ListTodo className="size-5 text-slate-400" />
                </div>

                <p className="mt-4 text-sm font-bold text-slate-600">
                  هنوز Taskی به این کارمند اختصاص داده نشده است.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {employee.assignedTasks
                  .slice(0, 10)
                  .map(
                    (task) => {
                      const overdue =
                        task.deadline <
                          now &&
                        task.status !==
                          "COMPLETED" &&
                        task.status !==
                          "CANCELLED";

                      return (
                        <div
                          key={
                            task.id
                          }
                          className="rounded-2xl border border-white/50 bg-white/25 p-4 transition hover:bg-white/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-800">
                                {
                                  task.title
                                }
                              </p>

                              <p className="mt-1 truncate text-xs text-slate-400">
                                {
                                  task.project.title
                                }
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                                overdue
                                  ? "border-red-200/55 bg-red-50/60 text-red-700"
                                  : getTaskStatusClass(
                                      task.status,
                                    )
                              }`}
                            >
                              {overdue
                                ? "عقب‌افتاده"
                                : getTaskStatusLabel(
                                    task.status,
                                  )}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getPriorityClass(
                                task.priority,
                              )}`}
                            >
                              اولویت{" "}
                              {
                                getPriorityLabel(
                                  task.priority,
                                )
                              }
                            </span>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                                overdue
                                  ? "border-red-200/40 bg-red-50/45 text-red-600"
                                  : "border-white/50 bg-white/25 text-slate-400"
                              }`}
                            >
                              {formatDate(
                                task.deadline,
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    },
                  )}
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="glass-card overflow-hidden rounded-[2rem]">
        <div className="border-b border-white/40 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                <Clock3 className="size-5 text-slate-600" />
              </div>

              <div>
                <h2 className="font-extrabold text-slate-900">
                  آخرین فعالیت‌ها
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  رویدادهای ثبت‌شده مرتبط با این کارمند.
                </p>
              </div>
            </div>

            <span className="glass-chip w-fit rounded-full px-3 py-1.5 text-[11px] font-bold text-slate-400">
              Activity Log
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {employee.activityLogs.length ===
          0 ? (
            <div className="soft-grid rounded-2xl border border-dashed border-slate-300/45 bg-white/18 p-8 text-center">
              <p className="text-sm font-bold text-slate-500">
                فعالیتی ثبت نشده است.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {employee.activityLogs.map(
                (activity) => (
                  <div
                    key={
                      activity.id
                    }
                    className="flex flex-col gap-3 rounded-2xl border border-white/45 bg-white/22 p-4 transition hover:bg-white/38 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-900/7 text-[11px] font-extrabold text-slate-500">
                        {activity.action.slice(
                          0,
                          1,
                        )}
                      </span>

                      <p className="truncate text-sm font-semibold text-slate-700">
                        {getActivityLabel(
                          activity.action,
                        )}
                      </p>
                    </div>

                    <time className="shrink-0 text-xs font-medium text-slate-400">
                      {formatDate(
                        activity.createdAt,
                      )}
                    </time>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </section>

      <section className="glass-card rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-800">
              نرخ تکمیل Task
            </p>

            <p className="mt-1 max-w-2xl text-xs leading-6 text-slate-400">
              درصد Taskهای تکمیل‌شده نسبت به کل Taskهای تخصیص‌داده‌شده.
            </p>
          </div>

          <div className="glass-strong rounded-2xl px-6 py-3 text-center sm:min-w-36">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              {employee.stats.completionRate.toLocaleString(
                "fa-IR",
              )}
              ٪
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}