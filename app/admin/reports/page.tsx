import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Mail,
  UserCheck,
  Users,
} from "lucide-react";
import RecurringTasksToday from "@/components/admin/reports/recurring-tasks-today";

import { ReportCharts } from "@/components/admin/reports/report-charts";
import { ReportFilters } from "@/components/admin/reports/report-filters";
import { getAdminReportData } from "@/lib/services/admin-report.service";

type SearchParams = {
  from?: string;
  to?: string;
  employeeId?: string;
  projectId?: string;
  status?: string;
};

function parseFromDate(
  value?: string,
) {
  if (
    !value ||
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    return undefined;
  }

  const date = new Date(
    `${value}T00:00:00.000Z`,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return undefined;
  }

  return date;
}

function parseToDate(
  value?: string,
) {
  const date =
    parseFromDate(value);

  if (!date) {
    return undefined;
  }

  date.setUTCDate(
    date.getUTCDate() + 1,
  );

  return date;
}

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

function formatNumber(
  value: number,
) {
  return value.toLocaleString(
    "fa-IR",
  );
}

function getProjectStatusLabel(
  status: string,
) {
  switch (status) {
    case "PLANNED":
      return "برنامه‌ریزی شده";

    case "IN_PROGRESS":
      return "در حال انجام";

    case "COMPLETED":
      return "تکمیل شده";

    case "ARCHIVED":
      return "آرشیو شده";

    default:
      return status;
  }
}

function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: typeof Users;
  tone:
    | "slate"
    | "blue"
    | "emerald"
    | "red";
}) {
  const toneClasses = {
    slate:
      "bg-slate-900/7 text-slate-600",
    blue:
      "bg-blue-500/8 text-blue-600",
    emerald:
      "bg-emerald-500/8 text-emerald-600",
    red:
      "bg-red-500/8 text-red-600",
  };

  return (
    <div className="glass-card rounded-[1.75rem] p-5 transition hover:-translate-y-px">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`glass-icon flex size-11 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
        >
          <Icon className="size-5" />
        </div>

        <span className="text-[10px] font-bold text-slate-300">
          گزارش
        </span>
      </div>

      <p className="mt-5 text-xs font-medium text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-end gap-2">
        <p className="text-3xl font-extrabold tracking-tight text-slate-900">
          {formatNumber(value)}
        </p>

        {suffix ? (
          <span className="mb-1 text-xs text-slate-400">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function DetailMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?:
    | "default"
    | "blue"
    | "emerald"
    | "red";
}) {
  const classes = {
    default:
      "border-white/45 bg-white/24 text-slate-900",
    blue:
      "border-blue-200/40 bg-blue-50/40 text-blue-800",
    emerald:
      "border-emerald-200/40 bg-emerald-50/40 text-emerald-800",
    red:
      "border-red-200/40 bg-red-50/40 text-red-800",
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${classes[tone]}`}
    >
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-extrabold">
        {formatNumber(value)}
      </p>
    </div>
  );
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params =
    await searchParams;

  const data =
    await getAdminReportData({
      from: parseFromDate(
        params.from,
      ),
      to: parseToDate(params.to),
      employeeId:
        params.employeeId?.trim() ||
        undefined,
      projectId:
        params.projectId?.trim() ||
        undefined,
      status:
        params.status?.trim() ||
        undefined,
    });

  const hasFilters =
    Boolean(params.from) ||
    Boolean(params.to) ||
    Boolean(params.employeeId) ||
    Boolean(params.projectId) ||
    Boolean(params.status);

  const selectedEmployeeName =
    data.details.employee?.name;

  const selectedProjectTitle =
    data.details.project?.title;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1450px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="glass-strong overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-11 items-center justify-center rounded-2xl">
                  <ClipboardList className="size-5 text-slate-600" />
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400">
                    گزارش‌ها
                  </span>

                  <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                    گزارش‌گیری مدیریتی
                  </h1>
                </div>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                تحلیل کارمندان، پروژه‌ها و Taskها با امکان فیلتر و مشاهده جزئیات.
              </p>
            </div>

            <Link
              href="/admin/dashboard"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/38 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white/65 sm:w-auto"
            >
              داشبورد
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </section>

        <ReportFilters
          employees={
            data.options
              .employees
          }
          projects={
            data.options.projects
          }
          initialValues={{
            from:
              data.filters.from,
            to: data.filters.to,
            employeeId:
              data.filters.employeeId,
            projectId:
              data.filters.projectId,
            status:
              data.filters.status,
          }}
        />

        {hasFilters ? (
          <section className="rounded-[1.75rem] border border-blue-200/40 bg-blue-50/35 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/8 text-blue-600">
                  <ClipboardList className="size-4" />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-blue-900">
                    فیلتر فعال است
                  </p>

                  <p className="mt-1 text-xs leading-6 text-blue-700/75">
                    آمار و نمودارهای زیر با فیلترهای انتخاب‌شده محاسبه شده‌اند.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/reports"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/60 bg-white/55 px-4 text-xs font-bold text-blue-700 transition hover:bg-white/75"
              >
                حذف همه فیلترها
              </Link>
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="کارمندان فعال"
            value={
              data.overview
                .activeEmployeeCount
            }
            suffix={`از ${formatNumber(
              data.overview
                .employeeTotal,
            )} کارمند`}
            icon={Users}
            tone="slate"
          />

          <StatCard
            label="پروژه‌های فعال"
            value={
              data.overview
                .activeProjectCount
            }
            suffix={`از ${formatNumber(
              data.overview
                .projectTotal,
            )} پروژه`}
            icon={FolderKanban}
            tone="blue"
          />

          <StatCard
            label="نرخ تکمیل Task"
            value={
              data.overview
                .completionRate
            }
            suffix={`${formatNumber(
              data.overview
                .completedTaskCount,
            )} از ${formatNumber(
              data.overview.taskTotal,
            )} Task`}
            icon={CheckCircle2}
            tone="emerald"
          />

          <StatCard
            label="Taskهای عقب‌افتاده"
            value={
              data.overview
                .overdueTaskCount
            }
            suffix="نیازمند پیگیری"
            icon={AlertTriangle}
            tone="red"
          />
        </section>

        {selectedEmployeeName ? (
          <section className="glass-card overflow-hidden rounded-[2rem]">
            <div className="border-b border-white/40 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="glass-icon flex size-11 shrink-0 items-center justify-center rounded-2xl">
                    <UserCheck className="size-5 text-slate-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400">
                      گزارش کارمند
                    </p>

                    <h2 className="mt-1 truncate text-xl font-extrabold text-slate-900">
                      {
                        selectedEmployeeName
                      }
                    </h2>

                    {data.details
                      .employee
                      ?.email ? (
                      <p
                        dir="ltr"
                        className="mt-1 flex items-center gap-2 truncate text-sm text-slate-400"
                      >
                        <Mail className="size-3.5" />
                        {
                          data.details
                            .employee
                            .email
                        }
                      </p>
                    ) : null}
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                    data.details
                      .employee
                      ?.isActive
                      ? "border-emerald-200/40 bg-emerald-50/45 text-emerald-700"
                      : "border-slate-200/50 bg-slate-500/7 text-slate-500"
                  }`}
                >
                  {data.details
                    .employee
                    ?.isActive
                    ? "فعال"
                    : "غیرفعال"}
                </span>
              </div>
            </div>

            {data.details.employee ? (
              <>
                <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
                  <DetailMetric
                    label="کل Task"
                    value={
                      data.details
                        .employee
                        .totalTasks
                    }
                  />

                  <DetailMetric
                    label="فعال"
                    value={
                      data.details
                        .employee
                        .activeTasks
                    }
                    tone="blue"
                  />

                  <DetailMetric
                    label="تکمیل شده"
                    value={
                      data.details
                        .employee
                        .completedTasks
                    }
                    tone="emerald"
                  />

                  <DetailMetric
                    label="عقب‌افتاده"
                    value={
                      data.details
                        .employee
                        .overdueTasks
                    }
                    tone="red"
                  />
                </div>

                <div className="border-t border-white/35 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="glass-icon flex size-9 items-center justify-center rounded-xl">
                      <FolderKanban className="size-4 text-slate-600" />
                    </div>

                    <h3 className="font-extrabold text-slate-800">
                      پروژه‌های این کارمند
                    </h3>
                  </div>

                  {data.details
                    .employee
                    .projects
                    .length ===
                  0 ? (
                    <p className="mt-5 rounded-2xl border border-dashed border-slate-300/50 bg-white/20 p-6 text-center text-sm text-slate-400">
                      در این بازه یا با این فیلترها Taskی برای این کارمند وجود ندارد.
                    </p>
                  ) : (
                    <div className="thin-scrollbar mt-5 overflow-x-auto">
                      <table className="w-full min-w-[650px]">
                        <thead>
                          <tr className="border-b border-white/35 text-right text-xs font-bold text-slate-400">
                            <th className="px-4 py-3">
                              پروژه
                            </th>

                            <th className="px-4 py-3">
                              کل Task
                            </th>

                            <th className="px-4 py-3">
                              تکمیل شده
                            </th>

                            <th className="px-4 py-3">
                              پیشرفت
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {data.details
                            .employee
                            .projects
                            .map(
                              (
                                project,
                              ) => (
                                <tr
                                  key={
                                    project.id
                                  }
                                  className="border-b border-white/25 last:border-0"
                                >
                                  <td className="px-4 py-4 font-bold text-slate-700">
                                    {
                                      project.title
                                    }
                                  </td>

                                  <td className="px-4 py-4 text-sm text-slate-500">
                                    {formatNumber(
                                      project.totalTasks,
                                    )}
                                  </td>

                                  <td className="px-4 py-4 text-sm text-slate-500">
                                    {formatNumber(
                                      project.completedTasks,
                                    )}
                                  </td>

                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-900/7">
                                        <div
                                          className="h-full rounded-full bg-slate-800 transition-all"
                                          style={{
                                            width: `${project.progress}%`,
                                          }}
                                        />
                                      </div>

                                      <span className="text-xs font-bold text-slate-600">
                                        {formatNumber(
                                          project.progress,
                                        )}
                                        ٪
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              ),
                            )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {selectedProjectTitle ? (
          <section className="glass-card overflow-hidden rounded-[2rem]">
            <div className="border-b border-white/40 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-11 items-center justify-center rounded-2xl">
                  <FolderKanban className="size-5 text-slate-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-400">
                    گزارش پروژه
                  </p>

                  <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <h2 className="truncate text-xl font-extrabold text-slate-900">
                      {
                        selectedProjectTitle
                      }
                    </h2>

                    {data.details
                      .project ? (
                      <span className="w-fit rounded-full border border-white/50 bg-white/25 px-3 py-1.5 text-[11px] font-bold text-slate-500">
                        {getProjectStatusLabel(
                          data.details
                            .project
                            .status,
                        )}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {data.details.project ? (
              <>
                <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-5">
                  <DetailMetric
                    label="کل Task"
                    value={
                      data.details
                        .project
                        .totalTasks
                    }
                  />

                  <DetailMetric
                    label="در انتظار"
                    value={
                      data.details
                        .project
                        .todoTasks
                    }
                  />

                  <DetailMetric
                    label="در حال انجام"
                    value={
                      data.details
                        .project
                        .inProgressTasks
                    }
                    tone="blue"
                  />

                  <DetailMetric
                    label="تکمیل شده"
                    value={
                      data.details
                        .project
                        .completedTasks
                    }
                    tone="emerald"
                  />

                  <DetailMetric
                    label="عقب‌افتاده"
                    value={
                      data.details
                        .project
                        .overdueTasks
                    }
                    tone="red"
                  />
                </div>

                <div className="border-t border-white/35 p-5 sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">
                        پیشرفت پروژه
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        بر اساس Taskهای منطبق با فیلتر فعلی
                      </p>
                    </div>

                    <span className="text-2xl font-extrabold text-slate-900">
                      {formatNumber(
                        data.details
                          .project
                          .progress,
                      )}
                      ٪
                    </span>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-900/7">
                    <div
                      className="h-full rounded-full bg-slate-800 transition-all"
                      style={{
                        width: `${data.details.project.progress}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="border-t border-white/35 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="glass-icon flex size-9 items-center justify-center rounded-xl">
                      <Users className="size-4 text-slate-600" />
                    </div>

                    <h3 className="font-extrabold text-slate-800">
                      توزیع Task بین کارمندان
                    </h3>
                  </div>

                  {data.details
                    .project
                    .employees
                    .length ===
                  0 ? (
                    <p className="mt-5 rounded-2xl border border-dashed border-slate-300/50 bg-white/20 p-6 text-center text-sm text-slate-400">
                      با فیلترهای فعلی Taskی برای این پروژه پیدا نشد.
                    </p>
                  ) : (
                    <div className="thin-scrollbar mt-5 overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b border-white/35 text-right text-xs font-bold text-slate-400">
                            <th className="px-4 py-3">
                              کارمند
                            </th>

                            <th className="px-4 py-3">
                              کل Task
                            </th>

                            <th className="px-4 py-3">
                              تکمیل شده
                            </th>

                            <th className="px-4 py-3">
                              درصد تکمیل
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {data.details
                            .project
                            .employees
                            .map(
                              (
                                employee,
                              ) => {
                                const percentage =
                                  employee.totalTasks ===
                                  0
                                    ? 0
                                    : Math.round(
                                        (employee.completedTasks /
                                          employee.totalTasks) *
                                          100,
                                      );

                                return (
                                  <tr
                                    key={
                                      employee.id
                                    }
                                    className="border-b border-white/25 last:border-0"
                                  >
                                    <td className="px-4 py-4 font-bold text-slate-700">
                                      {
                                        employee.name
                                      }
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-500">
                                      {formatNumber(
                                        employee.totalTasks,
                                      )}
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-500">
                                      {formatNumber(
                                        employee.completedTasks,
                                      )}
                                    </td>

                                    <td className="px-4 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-900/7">
                                          <div
                                            className="h-full rounded-full bg-emerald-500 transition-all"
                                            style={{
                                              width: `${percentage}%`,
                                            }}
                                          />
                                        </div>

                                        <span className="text-xs font-bold text-slate-600">
                                          {formatNumber(
                                            percentage,
                                          )}
                                          ٪
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              },
                            )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/35 p-5 sm:p-6">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/50 bg-white/24 px-4 py-3 text-sm text-slate-500">
                    <CalendarDays className="size-4" />
                    Deadline پروژه:
                    <span className="font-bold text-slate-700">
                      {formatDate(
                        new Date(
                          data.details
                            .project
                            .deadline,
                        ),
                      )}
                    </span>
                  </div>
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        <ReportCharts
          taskStatusData={
            data.tasks
              .statusData
          }
          projectStatusData={
            data.projects
              .statusData
          }
          employeeWorkload={
            data.employees
              .workload
          }
          projectProgress={
            data.projects
              .progress
          }
          taskTrend={
            data.trend
              .taskTrend
          }
        />
                <RecurringTasksToday />
      </div>
    </main>
  );
}