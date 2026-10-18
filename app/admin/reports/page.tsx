import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Mail,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

function parseFromDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return undefined;
  }

  return date;
}

function parseToDate(value?: string) {
  const date = parseFromDate(value);

  if (!date) {
    return undefined;
  }

  date.setUTCDate(date.getUTCDate() + 1);

  return date;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatNumber(value: number) {
  return value.toLocaleString("fa-IR");
}

function getProjectStatusLabel(status: string) {
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

function getProjectStatusClass(status: string) {
  switch (status) {
    case "PLANNED":
      return "border-amber-300 bg-amber-100 text-amber-800";
    case "IN_PROGRESS":
      return "border-blue-300 bg-blue-100 text-blue-800";
    case "COMPLETED":
      return "border-emerald-300 bg-emerald-100 text-emerald-800";
    case "ARCHIVED":
      return "border-slate-300 bg-slate-100 text-slate-700";
    default:
      return "border-slate-300 bg-slate-100 text-slate-700";
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
  icon: LucideIcon;
  tone: "slate" | "blue" | "emerald" | "red";
}) {
  const toneClasses = {
    slate: {
      card: "border-slate-300 bg-gradient-to-br from-white to-slate-100",
      accent: "bg-slate-500",
      icon: "border-slate-200 bg-slate-200 text-slate-700",
      label: "text-slate-600",
      value: "text-slate-950",
    },
    blue: {
      card: "border-blue-300 bg-gradient-to-br from-white to-blue-50",
      accent: "bg-blue-600",
      icon: "border-blue-200 bg-blue-100 text-blue-700",
      label: "text-blue-800",
      value: "text-blue-900",
    },
    emerald: {
      card: "border-emerald-300 bg-gradient-to-br from-white to-emerald-50",
      accent: "bg-emerald-500",
      icon: "border-emerald-200 bg-emerald-100 text-emerald-700",
      label: "text-emerald-800",
      value: "text-emerald-900",
    },
    red: {
      card: "border-red-300 bg-gradient-to-br from-white to-red-50",
      accent: "bg-red-500",
      icon: "border-red-200 bg-red-100 text-red-700",
      label: "text-red-800",
      value: "text-red-900",
    },
  };

  const styles = toneClasses[tone];

  return (
    <article
      className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md ${styles.card}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${styles.accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-sm font-bold ${styles.label}`}>{label}</p>

          <p className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${styles.value}`}>
            {formatNumber(value)}
          </p>
        </div>

        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${styles.icon}`}
        >
          <Icon className="size-6" />
        </div>
      </div>

      {suffix ? (
        <p className="mt-3 border-t border-slate-200/70 pt-3 text-xs font-semibold leading-6 text-slate-500">
          {suffix}
        </p>
      ) : (
        <div className="mt-3 border-t border-slate-200/70 pt-3 text-xs font-semibold text-slate-500">
          مشاهده در گزارش
        </div>
      )}
    </article>
  );
}

function DetailMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "blue" | "emerald" | "red";
}) {
  const classes = {
    default: "border-slate-200 bg-slate-50 text-slate-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    red: "border-red-200 bg-red-50 text-red-900",
  };

  return (
    <div className={`rounded-2xl border p-4 ${classes[tone]}`}>
      <p className="text-xs font-bold text-slate-600">{label}</p>

      <p className="mt-2 text-2xl font-black">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  tone = "blue",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "blue" | "emerald" | "violet" | "amber";
}) {
  const tones = {
    blue: "bg-blue-600 text-white",
    emerald: "bg-emerald-600 text-white",
    violet: "bg-violet-600 text-white",
    amber: "bg-amber-500 text-white",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${tones[tone]}`}
      >
        <Icon className="size-6" />
      </div>

      <div className="min-w-0">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const data = await getAdminReportData({
    from: parseFromDate(params.from),
    to: parseToDate(params.to),
    employeeId: params.employeeId?.trim() || undefined,
    projectId: params.projectId?.trim() || undefined,
    status: params.status?.trim() || undefined,
  });

  const hasFilters =
    Boolean(params.from) ||
    Boolean(params.to) ||
    Boolean(params.employeeId) ||
    Boolean(params.projectId) ||
    Boolean(params.status);

  const selectedEmployeeName = data.details.employee?.name;
  const selectedProjectTitle = data.details.project?.title;

  return (
    <main className="min-h-screen bg-slate-100/90">
      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-blue-900/20 bg-gradient-to-l from-slate-950 via-blue-950 to-indigo-900 p-5 text-white shadow-lg sm:p-7 lg:p-9">
          <div className="pointer-events-none absolute -left-16 -top-20 -z-10 size-64 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 -z-10 size-80 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-blue-100">
                <span className="flex size-8 items-center justify-center rounded-xl bg-cyan-300/20 text-cyan-200">
                  <ClipboardList className="size-4" />
                </span>
                پنل مدیریت / گزارش‌ها
              </div>

              <h1 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                گزارش‌گیری مدیریتی
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100/85 sm:text-base">
                عملکرد کارمندان، روند پروژه‌ها و وضعیت Taskها را با فیلترهای
                دلخواه تحلیل کنید.
              </p>
            </div>

            <Link
              href="/admin/dashboard"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/20 sm:w-fit"
            >
              بازگشت به داشبورد
              <ArrowLeft className="size-4" />
            </Link>
          </div>

          <div className="relative mt-7 grid grid-cols-3 gap-2 border-t border-white/15 pt-5 sm:gap-3">
            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:gap-3 sm:p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
                <Users className="size-4 sm:size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-blue-100/70 sm:text-xs">
                  گزارش
                </p>
                <p className="mt-1 truncate text-xs font-extrabold text-white sm:text-sm">
                  کارمندان
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:gap-3 sm:p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-200">
                <FolderKanban className="size-4 sm:size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-blue-100/70 sm:text-xs">
                  گزارش
                </p>
                <p className="mt-1 truncate text-xs font-extrabold text-white sm:text-sm">
                  پروژه‌ها
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:gap-3 sm:p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/15 text-violet-200">
                <CheckCircle2 className="size-4 sm:size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-blue-100/70 sm:text-xs">
                  گزارش
                </p>
                <p className="mt-1 truncate text-xs font-extrabold text-white sm:text-sm">
                  Taskها
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-l from-blue-50 to-white p-5 sm:p-6">
            <SectionHeader
              icon={ClipboardList}
              title="فیلتر گزارش‌ها"
              description="بازه زمانی، کارمند، پروژه یا وضعیت Task را انتخاب کنید."
              tone="blue"
            />
          </div>

          <div className="p-4 sm:p-6">
            <ReportFilters
              employees={data.options.employees}
              projects={data.options.projects}
              initialValues={{
                from: data.filters.from,
                to: data.filters.to,
                employeeId: data.filters.employeeId,
                projectId: data.filters.projectId,
                status: data.filters.status,
              }}
            />
          </div>
        </section>

        {hasFilters ? (
          <section className="rounded-2xl border border-blue-300 bg-blue-50 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Sparkles className="size-5" />
                </div>

                <div className="min-w-0">
                  <p className="font-extrabold text-blue-950">
                    فیلترهای گزارش فعال هستند
                  </p>
                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    آمار و نمودارهای زیر بر اساس فیلترهای انتخاب‌شده محاسبه
                    شده‌اند.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/reports"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-4 text-sm font-extrabold text-blue-800 transition hover:bg-blue-100"
              >
                حذف همه فیلترها
                <ArrowLeft className="size-4" />
              </Link>
            </div>
          </section>
        ) : null}

        {/* Overview statistics */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="کارمندان فعال"
            value={data.overview.activeEmployeeCount}
            suffix={`از ${formatNumber(data.overview.employeeTotal)} کارمند`}
            icon={Users}
            tone="slate"
          />

          <StatCard
            label="پروژه‌های فعال"
            value={data.overview.activeProjectCount}
            suffix={`از ${formatNumber(data.overview.projectTotal)} پروژه`}
            icon={FolderKanban}
            tone="blue"
          />

          <StatCard
            label="نرخ تکمیل Task"
            value={data.overview.completionRate}
            suffix={`${formatNumber(data.overview.completedTaskCount)} از ${formatNumber(data.overview.taskTotal)} Task`}
            icon={CheckCircle2}
            tone="emerald"
          />

          <StatCard
            label="Taskهای عقب‌افتاده"
            value={data.overview.overdueTaskCount}
            suffix="نیازمند پیگیری"
            icon={AlertTriangle}
            tone="red"
          />
        </section>

        {/* Employee report */}
        {selectedEmployeeName ? (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-emerald-200 bg-gradient-to-l from-emerald-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                  <UserCheck className="size-6" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-800">
                    گزارش اختصاصی کارمند
                  </p>
                  <h2 className="mt-1 break-words text-xl font-black text-slate-950">
                    {selectedEmployeeName}
                  </h2>

                  {data.details.employee?.email ? (
                    <p
                      dir="ltr"
                      className="mt-2 flex w-fit items-center gap-2 text-sm text-slate-500"
                    >
                      <Mail className="size-3.5 text-emerald-600" />
                      {data.details.employee.email}
                    </p>
                  ) : null}
                </div>
              </div>

              <span
                className={`inline-flex w-fit items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-extrabold ${
                  data.details.employee?.isActive
                    ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                    : "border-slate-300 bg-slate-100 text-slate-700"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    data.details.employee?.isActive
                      ? "bg-emerald-600"
                      : "bg-slate-400"
                  }`}
                />
                {data.details.employee?.isActive ? "فعال" : "غیرفعال"}
              </span>
            </div>

            {data.details.employee ? (
              <>
                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
                  <DetailMetric
                    label="کل Task"
                    value={data.details.employee.totalTasks}
                  />

                  <DetailMetric
                    label="فعال"
                    value={data.details.employee.activeTasks}
                    tone="blue"
                  />

                  <DetailMetric
                    label="تکمیل شده"
                    value={data.details.employee.completedTasks}
                    tone="emerald"
                  />

                  <DetailMetric
                    label="عقب‌افتاده"
                    value={data.details.employee.overdueTasks}
                    tone="red"
                  />
                </div>

                <div className="border-t border-slate-200 p-4 sm:p-6">
                  <SectionHeader
                    icon={FolderKanban}
                    title="پروژه‌های این کارمند"
                    description="مقایسه تعداد و پیشرفت Taskهای هر پروژه"
                    tone="emerald"
                  />

                  {data.details.employee.projects.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center text-sm font-medium leading-7 text-slate-500">
                      در این بازه یا با این فیلترها Taskی برای این کارمند
                      وجود ندارد.
                    </div>
                  ) : (
                    <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full min-w-[650px]">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs font-extrabold text-slate-600">
                            <th className="px-4 py-4">پروژه</th>
                            <th className="px-4 py-4">کل Task</th>
                            <th className="px-4 py-4">تکمیل شده</th>
                            <th className="px-4 py-4">پیشرفت</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {data.details.employee.projects.map((project) => (
                            <tr
                              key={project.id}
                              className="transition hover:bg-emerald-50/40"
                            >
                              <td className="px-4 py-4 font-extrabold text-slate-800">
                                {project.title}
                              </td>

                              <td className="px-4 py-4 text-sm font-bold text-slate-600">
                                {formatNumber(project.totalTasks)}
                              </td>

                              <td className="px-4 py-4">
                                <span className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-sm font-extrabold text-emerald-800">
                                  {formatNumber(project.completedTasks)}
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full rounded-full bg-emerald-500"
                                      style={{
                                        width: `${project.progress}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs font-extrabold text-slate-700">
                                    {formatNumber(project.progress)}٪
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {/* Project report */}
        {selectedProjectTitle ? (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-indigo-200 bg-gradient-to-l from-indigo-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <SectionHeader
                icon={FolderKanban}
                title={selectedProjectTitle}
                description="گزارش عملکرد و توزیع Taskهای پروژه انتخاب‌شده"
                tone="violet"
              />

              {data.details.project ? (
                <span
                  className={`w-fit shrink-0 rounded-xl border px-3.5 py-2 text-xs font-extrabold ${getProjectStatusClass(data.details.project.status)}`}
                >
                  {getProjectStatusLabel(data.details.project.status)}
                </span>
              ) : null}
            </div>

            {data.details.project ? (
              <>
                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-5">
                  <DetailMetric
                    label="کل Task"
                    value={data.details.project.totalTasks}
                  />

                  <DetailMetric
                    label="در انتظار"
                    value={data.details.project.todoTasks}
                  />

                  <DetailMetric
                    label="در حال انجام"
                    value={data.details.project.inProgressTasks}
                    tone="blue"
                  />

                  <DetailMetric
                    label="تکمیل شده"
                    value={data.details.project.completedTasks}
                    tone="emerald"
                  />

                  <DetailMetric
                    label="عقب‌افتاده"
                    value={data.details.project.overdueTasks}
                    tone="red"
                  />
                </div>

                <div className="border-t border-slate-200 p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-950">
                        پیشرفت پروژه
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        بر اساس Taskهای منطبق با فیلتر فعلی
                      </p>
                    </div>

                    <span className="text-2xl font-black text-indigo-800">
                      {formatNumber(data.details.project.progress)}٪
                    </span>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-indigo-600 to-blue-500 transition-all"
                      style={{
                        width: `${data.details.project.progress}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 p-5 sm:p-6">
                  <SectionHeader
                    icon={Users}
                    title="توزیع Task بین کارمندان"
                    description="مقایسه سهم و درصد تکمیل Taskهای کارمندان پروژه"
                    tone="violet"
                  />

                  {data.details.project.employees.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center text-sm font-medium leading-7 text-slate-500">
                      با فیلترهای فعلی Taskی برای این پروژه پیدا نشد.
                    </div>
                  ) : (
                    <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs font-extrabold text-slate-600">
                            <th className="px-4 py-4">کارمند</th>
                            <th className="px-4 py-4">کل Task</th>
                            <th className="px-4 py-4">تکمیل شده</th>
                            <th className="px-4 py-4">درصد تکمیل</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {data.details.project.employees.map((employee) => {
                            const percentage =
                              employee.totalTasks === 0
                                ? 0
                                : Math.round(
                                    (employee.completedTasks /
                                      employee.totalTasks) *
                                      100,
                                  );

                            return (
                              <tr
                                key={employee.id}
                                className="transition hover:bg-indigo-50/40"
                              >
                                <td className="px-4 py-4 font-extrabold text-slate-800">
                                  {employee.name}
                                </td>

                                <td className="px-4 py-4 text-sm font-bold text-slate-600">
                                  {formatNumber(employee.totalTasks)}
                                </td>

                                <td className="px-4 py-4">
                                  <span className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-sm font-extrabold text-emerald-800">
                                    {formatNumber(employee.completedTasks)}
                                  </span>
                                </td>

                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-100">
                                      <div
                                        className="h-full rounded-full bg-emerald-500 transition-all"
                                        style={{
                                          width: `${percentage}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs font-extrabold text-slate-700">
                                      {formatNumber(percentage)}٪
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6">
                  <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    <CalendarDays className="size-4 text-indigo-600" />
                    <span className="font-semibold">Deadline پروژه:</span>
                    <span className="font-extrabold text-slate-900">
                      {formatDate(new Date(data.details.project.deadline))}
                    </span>
                  </div>
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {/* Charts */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-l from-violet-50 to-white p-5 sm:p-6">
            <SectionHeader
              icon={Sparkles}
              title="نمودارها و تحلیل عملکرد"
              description="نمایی بصری از وضعیت Taskها، پروژه‌ها، بار کاری و روند زمانی"
              tone="violet"
            />
          </div>

          <div className="min-w-0 p-4 sm:p-6">
            <ReportCharts
              taskStatusData={data.tasks.statusData}
              projectStatusData={data.projects.statusData}
              employeeWorkload={data.employees.workload}
              projectProgress={data.projects.progress}
              taskTrend={data.trend.taskTrend}
            />
          </div>
        </section>

        {/* Recurring tasks */}
        <section className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">
          <div className="border-b border-amber-200 bg-gradient-to-l from-amber-50 to-white p-5 sm:p-6">
            <SectionHeader
              icon={CalendarDays}
              title="Taskهای تکرارشونده امروز"
              description="بررسی برنامه روزانه Taskهایی که به‌صورت تکرارشونده تعریف شده‌اند"
              tone="amber"
            />
          </div>

          <div className="min-w-0 p-4 sm:p-6">
            <RecurringTasksToday />
          </div>
        </section>

        <div className="flex items-center justify-center gap-2 pb-2 text-xs font-semibold text-slate-400">
          <span className="size-2 rounded-full bg-indigo-500" />
          گزارش‌گیری مدیریتی فرتاک تسکینگ
        </div>
      </div>
    </main>
  );
}