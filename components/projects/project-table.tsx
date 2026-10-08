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

function getStatusLabel(status: Project["status"]) {
  const labels = {
    PLANNED: "برنامه‌ریزی‌شده",
    IN_PROGRESS: "در حال انجام",
    COMPLETED: "تکمیل‌شده",
    ARCHIVED: "آرشیو",
  };

  return labels[status];
}

function getStatusClass(status: Project["status"]) {
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
        <CardHeader className="p-5">
          <div className="flex items-center gap-3">
            <div className="glass-icon flex size-9 items-center justify-center rounded-xl">
              <Users className="size-4.5 text-slate-600" />
            </div>

            <div>
              <CardTitle>پروژه‌ها</CardTitle>

              <p className="mt-0.5 text-xs text-slate-400">
                مدیریت پروژه‌های تیم
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5 pt-0">
          <div className="soft-grid flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/40 bg-white/20 px-5 text-center">
            <div className="glass-icon flex size-12 items-center justify-center rounded-xl">
              <Users className="size-5 text-slate-400" />
            </div>

            <p className="mt-3 text-sm font-bold text-slate-700">
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
    <Card className="overflow-hidden">
      <CardHeader className="px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="glass-icon flex size-9 shrink-0 items-center justify-center rounded-xl">
              <Users className="size-4.5 text-slate-600" />
            </div>

            <div className="min-w-0">
              <CardTitle className="text-base">
                لیست پروژه‌ها
              </CardTitle>

              <p className="mt-0.5 truncate text-xs text-slate-400">
                وضعیت، پیشرفت و اعضای پروژه‌ها
              </p>
            </div>
          </div>

          <span className="glass-chip shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-500">
            {projects.length.toLocaleString("fa-IR")} پروژه
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <table
          dir="rtl"
          className="w-full table-fixed border-collapse text-sm"
        >
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[11%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[7%]" />
            <col className="w-[30%]" />
          </colgroup>

          <thead>
            <tr className="border-y border-white/40 bg-white/25 text-right">
              <th className="px-3 py-3 text-xs font-bold text-slate-500">
                پروژه
              </th>

              <th className="px-2 py-3 text-xs font-bold text-slate-500">
                وضعیت
              </th>

              <th className="px-2 py-3 text-xs font-bold text-slate-500">
                پیشرفت
              </th>

              <th className="px-2 py-3 text-xs font-bold text-slate-500">
                Taskها
              </th>

              <th className="px-2 py-3 text-xs font-bold text-slate-500">
                اعضا
              </th>

              <th className="px-3 py-3 text-xs font-bold text-slate-500">
                عملیات
              </th>
            </tr>
          </thead>

          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                className="border-b border-white/30 transition last:border-b-0 hover:bg-white/25"
              >
                <td className="px-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold text-slate-800">
                      {project.title}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {project.description || "بدون توضیحات"}
                    </p>
                  </div>
                </td>

                <td className="px-2 py-3">
                  <span
                    className={`inline-flex h-8 max-w-full items-center justify-center rounded-lg border px-2 text-[10px] font-bold whitespace-nowrap ${getStatusClass(
                      project.status,
                    )}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </td>

                <td className="px-2 py-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center justify-between gap-1.5 text-[10px]">
                      <span className="font-extrabold text-slate-700">
                        {project.stats.progress.toLocaleString("fa-IR")}٪
                      </span>

                      <span className="truncate text-slate-400">
                        {project.stats.completedTasks.toLocaleString("fa-IR")}
                        /
                        {project.stats.totalTasks.toLocaleString("fa-IR")}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-900/7">
                      <div
                        className="h-full rounded-full bg-slate-800 transition-all duration-500"
                        style={{
                          width: `${project.stats.progress}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>

                <td className="px-2 py-3">
                  <div className="flex min-w-0 flex-col gap-1 text-[10px]">
                    <div className="flex items-center gap-1.5 truncate text-slate-600">
                      <CheckCircle2 className="size-3 shrink-0 text-emerald-600" />

                      <span className="truncate">
                        {project.stats.completedTasks.toLocaleString(
                          "fa-IR",
                        )}{" "}
                        تکمیل
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate text-slate-600">
                      <Clock3 className="size-3 shrink-0 text-blue-600" />

                      <span className="truncate">
                        {project.stats.inProgressTasks.toLocaleString(
                          "fa-IR",
                        )}{" "}
                        در حال انجام
                      </span>
                    </div>

                    {project.stats.overdueTasks > 0 ? (
                      <div className="flex items-center gap-1.5 truncate font-semibold text-red-600">
                        <AlertTriangle className="size-3 shrink-0" />

                        <span className="truncate">
                          {project.stats.overdueTasks.toLocaleString(
                            "fa-IR",
                          )}{" "}
                          عقب‌افتاده
                        </span>
                      </div>
                    ) : null}
                  </div>
                </td>

                <td className="px-2 py-3">
                  <div className="inline-flex h-8 items-center gap-1 rounded-lg bg-white/32 px-2">
                    <Users className="size-3.5 shrink-0 text-slate-400" />

                    <span className="text-xs font-bold text-slate-700">
                      {project.stats.membersCount.toLocaleString("fa-IR")}
                    </span>
                  </div>
                </td>

                <td
                  dir="rtl"
                  className="px-3 py-3"
                >
                  <div
                    className="
                      flex w-full min-w-0 flex-nowrap items-center justify-start gap-1.5
                      whitespace-nowrap
                      [&>div]:!flex
                      [&>div]:!w-full
                      [&>div]:!min-w-0
                      [&>div]:!flex-nowrap
                      [&>div]:!items-center
                      [&>div]:!justify-start
                      [&>div]:!gap-1.5
                      [&>div]:!whitespace-nowrap
                      [&_button]:!h-8
                      [&_button]:!min-h-8
                      [&_button]:!rounded-lg
                      [&_button]:!px-2.5
                      [&_button]:!py-1
                      [&_button]:!text-[10px]
                      [&_button]:!whitespace-nowrap
                      [&_a]:!h-8
                      [&_a]:!min-h-8
                      [&_a]:!rounded-lg
                      [&_a]:!px-2.5
                      [&_a]:!py-1
                      [&_a]:!text-[10px]
                      [&_a]:!whitespace-nowrap
                    "
                  >
                    <ProjectRowActions
                      projectId={project.id}
                      projectTitle={project.title}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}