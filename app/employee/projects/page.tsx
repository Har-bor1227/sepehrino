import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListChecks,
} from "lucide-react";

import { getEmployeeProjects } from "@/lib/services/project.service";
import { requireEmployee } from "@/lib/auth/guards";

type EmployeeProject = Extract<
  Awaited<
    ReturnType<typeof getEmployeeProjects>
  >[number],
  {
    tasks: unknown[];
  }
>;

const PROJECT_STATUS_LABELS = {
  PLANNED: "برنامه‌ریزی شده",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل شده",
  ARCHIVED: "آرشیو شده",
} as const;

function getProjectStatusClass(
  status: keyof typeof PROJECT_STATUS_LABELS,
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

function getProgressTone(
  progress: number,
) {
  if (progress >= 80) {
    return {
      bar: "bg-emerald-500",
      text: "text-emerald-700",
      track: "bg-emerald-500/10",
    };
  }

  if (progress >= 40) {
    return {
      bar: "bg-blue-500",
      text: "text-blue-700",
      track: "bg-blue-500/10",
    };
  }

  return {
    bar: "bg-slate-800",
    text: "text-slate-700",
    track: "bg-slate-900/7",
  };
}

export default async function EmployeeProjectsPage() {
  await requireEmployee();

  const allProjects =
    await getEmployeeProjects();

  const projects =
    allProjects.filter(
      (
        project,
      ): project is EmployeeProject =>
        "tasks" in project,
    );

  const activeCount =
    projects.filter(
      (project) =>
        project.status ===
        "IN_PROGRESS",
    ).length;

  const completedCount =
    projects.filter(
      (project) =>
        project.status ===
        "COMPLETED",
    ).length;

  const totalTasks =
    projects.reduce(
      (total, project) =>
        total +
        project.tasks.length,
      0,
    );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="glass-strong overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-11 items-center justify-center rounded-2xl">
                  <FolderKanban className="size-5 text-slate-600" />
                </div>

                <span className="text-xs font-bold text-slate-400">
                  فضای کاری
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                پروژه‌های من
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                پروژه‌هایی که در آن‌ها عضو هستید و Taskهای اختصاص‌یافته به شما.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[430px]">
              <div className="glass-chip rounded-2xl p-3.5">
                <p className="text-[11px] text-slate-400">
                  کل پروژه‌ها
                </p>

                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  {projects.length.toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200/40 bg-blue-50/35 p-3.5">
                <p className="text-[11px] text-blue-600">
                  فعال
                </p>

                <p className="mt-1 text-xl font-extrabold text-blue-800">
                  {activeCount.toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200/40 bg-emerald-50/35 p-3.5">
                <p className="text-[11px] text-emerald-600">
                  تکمیل شده
                </p>

                <p className="mt-1 text-xl font-extrabold text-emerald-800">
                  {completedCount.toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-violet-200/40 bg-violet-50/35 p-3.5">
                <p className="text-[11px] text-violet-600">
                  کل Task
                </p>

                <p className="mt-1 text-xl font-extrabold text-violet-800">
                  {totalTasks.toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {projects.length === 0 ? (
          <section className="glass-card soft-grid flex min-h-80 flex-col items-center justify-center rounded-[2rem] px-6 text-center">
            <div className="glass-icon flex size-16 items-center justify-center rounded-3xl">
              <FolderKanban className="size-7 text-slate-400" />
            </div>

            <h2 className="mt-5 text-lg font-extrabold text-slate-800">
              پروژه‌ای برای شما ثبت نشده است
            </h2>

            <p className="mt-2 max-w-md text-sm leading-7 text-slate-400">
              در حال حاضر در هیچ پروژه‌ای عضو نیستید.
            </p>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map(
              (project) => {
                const totalProjectTasks =
                  project.tasks.length;

                const completedTasks =
                  project.tasks.filter(
                    (task) =>
                      task.status ===
                      "COMPLETED",
                  ).length;

                const inProgressTasks =
                  project.tasks.filter(
                    (task) =>
                      task.status ===
                      "IN_PROGRESS",
                  ).length;

                const progress =
                  totalProjectTasks ===
                  0
                    ? 0
                    : Math.round(
                        (completedTasks /
                          totalProjectTasks) *
                          100,
                      );

                const progressTone =
                  getProgressTone(
                    progress,
                  );

                return (
                  <Link
                    key={
                      project.id
                    }
                    href={`/employee/projects/${project.id}`}
                    className="glass-card group relative overflow-hidden rounded-[2rem] p-5 transition duration-200 hover:-translate-y-1 hover:bg-white/42 sm:p-6"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-white/80" />

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="glass-icon flex size-12 shrink-0 items-center justify-center rounded-2xl">
                          <FolderKanban className="size-5 text-slate-600" />
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate font-extrabold text-slate-800">
                            {
                              project.title
                            }
                          </h2>

                          <p className="mt-1 text-[11px] text-slate-400">
                            پروژه کاری شما
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold ${getProjectStatusClass(
                          project.status,
                        )}`}
                      >
                        {
                          PROJECT_STATUS_LABELS[
                            project.status
                          ]
                        }
                      </span>
                    </div>

                    {project.description ? (
                      <p className="mt-5 line-clamp-3 min-h-[4.5rem] text-sm leading-7 text-slate-400">
                        {
                          project.description
                        }
                      </p>
                    ) : (
                      <div className="mt-5 min-h-[4.5rem] rounded-2xl border border-dashed border-white/45 bg-white/15 px-4 py-3">
                        <p className="text-xs leading-6 text-slate-300">
                          توضیحی برای این پروژه ثبت نشده است.
                        </p>
                      </div>
                    )}

                    <div className="mt-6 rounded-2xl border border-white/45 bg-white/22 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-slate-400">
                          پیشرفت Taskهای من
                        </span>

                        <strong
                          className={`text-sm font-extrabold ${progressTone.text}`}
                        >
                          {progress.toLocaleString(
                            "fa-IR",
                          )}
                          ٪
                        </strong>
                      </div>

                      <div
                        className={`h-2.5 overflow-hidden rounded-full ${progressTone.track}`}
                      >
                        <div
                          className={`h-full rounded-full transition-all ${progressTone.bar}`}
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          {completedTasks.toLocaleString(
                            "fa-IR",
                          )}{" "}
                          تکمیل شده
                        </span>

                        <span>
                          از{" "}
                          {totalProjectTasks.toLocaleString(
                            "fa-IR",
                          )}{" "}
                          Task
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/45 bg-white/22 p-3.5">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <ListChecks className="size-3.5" />
                          کل Task
                        </div>

                        <p className="mt-2 text-lg font-extrabold text-slate-800">
                          {totalProjectTasks.toLocaleString(
                            "fa-IR",
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-emerald-200/30 bg-emerald-50/30 p-3.5">
                        <div className="flex items-center gap-2 text-xs text-emerald-600">
                          <CheckCircle2 className="size-3.5" />
                          تکمیل شده
                        </div>

                        <p className="mt-2 text-lg font-extrabold text-emerald-800">
                          {completedTasks.toLocaleString(
                            "fa-IR",
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/24 px-3 py-1.5 text-[11px] font-medium text-slate-400">
                        <Clock3 className="size-3.5" />
                        {inProgressTasks.toLocaleString(
                          "fa-IR",
                        )}{" "}
                        در حال انجام
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/24 px-3 py-1.5 text-[11px] font-medium text-slate-400">
                        <CalendarDays className="size-3.5" />
                        {formatDate(
                          project.deadline,
                        )}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/35 pt-5 text-sm">
                      <span className="font-bold text-slate-500">
                        مشاهده جزئیات پروژه
                      </span>

                      <span className="flex size-9 items-center justify-center rounded-xl bg-white/35 text-slate-400 transition group-hover:bg-slate-900 group-hover:text-white">
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                );
              },
            )}
          </section>
        )}
      </div>
    </main>
  );
}