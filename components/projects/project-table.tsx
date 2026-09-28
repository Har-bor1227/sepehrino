import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ProjectRowActions } from "./project-row-actions";

type Project = {
  id: string;
  title: string;
  description: string | null;
  status:
    | "PLANNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "ARCHIVED";
  startDate: Date;
  deadline: Date;
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    cancelledTasks: number;
    overdueTasks: number;
    progress: number;
    membersCount: number;
  };
};

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
  status: Project["status"],
) {
  const labels = {
    PLANNED:
      "برنامه‌ریزی‌شده",
    IN_PROGRESS:
      "در حال انجام",
    COMPLETED:
      "تکمیل‌شده",
    ARCHIVED:
      "آرشیو",
  };

  return labels[status];
}

function getStatusClass(
  status: Project["status"],
) {
  const classes = {
    PLANNED:
      "border-slate-200/55 bg-slate-500/8 text-slate-700",
    IN_PROGRESS:
      "border-blue-200/55 bg-blue-500/8 text-blue-700",
    COMPLETED:
      "border-emerald-200/55 bg-emerald-500/8 text-emerald-700",
    ARCHIVED:
      "border-white/50 bg-white/30 text-slate-500",
  };

  return classes[status];
}

export function ProjectTable({
  projects,
}: {
  projects: Project[];
}) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
              <Users className="size-5 text-slate-600" />
            </div>

            <div>
              <CardTitle>
                پروژه‌ها
              </CardTitle>

              <p className="mt-1 text-xs text-slate-400">
                مدیریت پروژه‌های تیم
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="soft-grid flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/40 bg-white/20 px-6 text-center">
            <div className="glass-icon flex size-14 items-center justify-center rounded-2xl">
              <Users className="size-6 text-slate-400" />
            </div>

            <p className="mt-4 text-sm font-bold text-slate-700">
              هنوز هیچ پروژه‌ای ایجاد نشده است.
            </p>

            <p className="mt-1 text-xs leading-6 text-slate-400">
              پروژه‌های جدید پس از ایجاد در این بخش نمایش داده می‌شوند.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
              <Users className="size-5 text-slate-600" />
            </div>

            <div>
              <CardTitle>
                لیست پروژه‌ها
              </CardTitle>

              <p className="mt-1 text-xs text-slate-400">
                وضعیت، پیشرفت و اعضای پروژه‌ها
              </p>
            </div>
          </div>

          <span className="glass-chip w-fit rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500">
            {projects.length.toLocaleString(
              "fa-IR",
            )}{" "}
            پروژه
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="thin-scrollbar overflow-x-auto">
          <table className="w-full min-w-[1150px] text-sm">
            <thead>
              <tr className="border-y border-white/40 bg-white/25 text-right">
                <th className="px-6 py-4 font-semibold text-slate-500">
                  پروژه
                </th>

                <th className="px-6 py-4 font-semibold text-slate-500">
                  وضعیت
                </th>

                <th className="px-6 py-4 font-semibold text-slate-500">
                  پیشرفت
                </th>

                <th className="px-6 py-4 font-semibold text-slate-500">
                  Taskها
                </th>

                <th className="px-6 py-4 font-semibold text-slate-500">
                  اعضا
                </th>

                <th className="px-6 py-4 font-semibold text-slate-500">
                  Deadline
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-500">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody>
              {projects.map(
                (project) => (
                  <tr
                    key={project.id}
                    className="border-b border-white/35 transition hover:bg-white/30 last:border-b-0"
                  >
                    <td className="px-6 py-5">
                      <div className="max-w-80">
                        <p className="truncate font-bold text-slate-800">
                          {project.title}
                        </p>

                        {project.description ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                            {
                              project.description
                            }
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-slate-300">
                            بدون توضیحات
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          project.status,
                        )}`}
                      >
                        {getStatusLabel(
                          project.status,
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="w-40 space-y-2">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-bold text-slate-700">
                            {project.stats.progress.toLocaleString(
                              "fa-IR",
                            )}
                            ٪
                          </span>

                          <span className="text-slate-400">
                            {project.stats.completedTasks.toLocaleString(
                              "fa-IR",
                            )}
                            /
                            {project.stats.totalTasks.toLocaleString(
                              "fa-IR",
                            )}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-900/7">
                          <div
                            className="h-full rounded-full bg-slate-800 transition-all duration-500"
                            style={{
                              width: `${project.stats.progress}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-slate-600">
                          <CheckCircle2 className="size-3.5 text-emerald-600" />

                          <span>
                            {project.stats.completedTasks.toLocaleString(
                              "fa-IR",
                            )}{" "}
                            تکمیل‌شده
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock3 className="size-3.5 text-blue-600" />

                          <span>
                            {project.stats.inProgressTasks.toLocaleString(
                              "fa-IR",
                            )}{" "}
                            در حال انجام
                          </span>
                        </div>

                        {project.stats.overdueTasks >
                        0 ? (
                          <div className="flex items-center gap-2 font-medium text-red-600">
                            <AlertTriangle className="size-3.5" />

                            <span>
                              {project.stats.overdueTasks.toLocaleString(
                                "fa-IR",
                              )}{" "}
                              عقب‌افتاده
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-white/32 px-3 py-2">
                        <Users className="size-4 text-slate-400" />

                        <span className="font-semibold text-slate-700">
                          {project.stats.membersCount.toLocaleString(
                            "fa-IR",
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-slate-500">
                      {formatDate(
                        project.deadline,
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <ProjectRowActions
                        projectId={
                          project.id
                        }
                        projectTitle={
                          project.title
                        }
                      />
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}