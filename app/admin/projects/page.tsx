import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  Plus,
  Users,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/guards";
import { getAdminProjects } from "@/lib/services/project.service";

import { CreateProjectForm } from "@/components/projects/create-project-form";
import { ProjectTable } from "@/components/projects/project-table";

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof FolderKanban;
  tone: "slate" | "blue" | "violet" | "emerald";
}) {
  const toneClasses = {
    slate: {
      surface:
        "border-slate-200 bg-gradient-to-br from-slate-200/80 via-white to-slate-50",
      icon: "bg-slate-200 text-slate-800",
      accent: "bg-slate-500",
      value: "text-slate-950",
    },
    blue: {
      surface:
        "border-blue-200 bg-gradient-to-br from-blue-100 via-white to-sky-50",
      icon: "bg-blue-200/80 text-blue-900",
      accent: "bg-blue-600",
      value: "text-blue-950",
    },
    violet: {
      surface:
        "border-violet-200 bg-gradient-to-br from-violet-100 via-white to-purple-50",
      icon: "bg-violet-200/80 text-violet-900",
      accent: "bg-violet-600",
      value: "text-violet-950",
    },
    emerald: {
      surface:
        "border-emerald-200 bg-gradient-to-br from-emerald-100 via-white to-teal-50",
      icon: "bg-emerald-200/80 text-emerald-900",
      accent: "bg-emerald-600",
      value: "text-emerald-950",
    },
  };

  const colors = toneClasses[tone];

  return (
    <article
      className={`relative flex min-h-[140px] min-w-0 flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-5 ${colors.surface}`}
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 ${colors.accent}`}
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-700">
          {label}
        </span>

        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
        >
          <Icon className="size-5" />
        </span>
      </div>

      <p
        className={`mt-4 text-3xl font-black tracking-tight sm:text-4xl ${colors.value}`}
      >
        {value.toLocaleString("fa-IR")}
      </p>
    </article>
  );
}

export default async function AdminProjectsPage() {
  await requireAdmin();

  const projects = await getAdminProjects();

  const activeProjects = projects.filter(
    (project) => project.status === "IN_PROGRESS",
  ).length;

  const totalTasks = projects.reduce(
    (total, project) => total + project.stats.totalTasks,
    0,
  );

  const completedTasks = projects.reduce(
    (total, project) => total + project.stats.completedTasks,
    0,
  );

  const membersCount = projects.reduce(
    (total, project) => total + project.stats.membersCount,
    0,
  );

  return (
    <main
      className="min-h-screen bg-slate-100/90"
      dir="rtl"
    >
      <div className="mx-auto max-w-[1450px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* سربرگ صفحه */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
                  <FolderKanban className="size-5" />
                </span>

                <span className="text-sm font-extrabold text-indigo-800">
                  مدیریت پروژه‌ها
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                پروژه‌های سازمان
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                پروژه‌ها، اعضای تیم و تسک‌های مرتبط را از یک محیط یکپارچه مدیریت کنید.
              </p>
            </div>

            <Link
              href="#create-project"
              className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 sm:w-auto"
            >
              <Plus className="size-5" />
              ایجاد پروژه جدید
            </Link>
          </div>
        </section>

        {/* آمار پروژه‌ها */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="کل پروژه‌ها"
            value={projects.length}
            icon={FolderKanban}
            tone="slate"
          />

          <StatCard
            label="پروژه‌های فعال"
            value={activeProjects}
            icon={CheckCircle2}
            tone="blue"
          />

          <StatCard
            label="کل تسک‌ها"
            value={totalTasks}
            icon={ListTodo}
            tone="violet"
          />

          <StatCard
            label="اعضای پروژه"
            value={membersCount}
            icon={Users}
            tone="emerald"
          />
        </section>

        {/* ایجاد پروژه و فهرست */}
        <div
          id="create-project"
          className="grid scroll-mt-6 items-start gap-5 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] lg:gap-6"
        >
          {/* فرم ایجاد پروژه */}
          <section className="relative min-w-0 overflow-visible rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-100/80 via-white to-blue-50 shadow-[0_8px_24px_rgba(49,46,129,0.06)] lg:sticky lg:top-6">
            <header className="border-b border-indigo-100 bg-white/65 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Plus className="size-5" />
                </span>

                <div className="min-w-0">
                  <h2 className="text-lg font-black text-slate-950">
                    ایجاد پروژه جدید
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    اطلاعات پروژه و اعضای تیم را وارد کنید.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3 py-2.5">
                <FolderKanban className="size-4 shrink-0 text-indigo-700" />

                <p className="text-xs font-bold text-indigo-900">
                  {projects.length.toLocaleString("fa-IR")} پروژه ثبت‌شده
                </p>
              </div>
            </header>

            <div className="p-4 sm:p-6">
              <CreateProjectForm />
            </div>
          </section>

          {/* فهرست پروژه‌ها */}
          <section className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.045)]">
            <header className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-l from-slate-100 via-white to-indigo-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
                  <FolderKanban className="size-5" />
                </span>

                <div className="min-w-0">
                  <h2 className="text-xl font-black tracking-tight text-slate-950">
                    فهرست پروژه‌ها
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    وضعیت، اعضا و تسک‌های هر پروژه را بررسی کنید.
                  </p>
                </div>
              </div>

              <span className="inline-flex min-h-9 w-fit shrink-0 items-center rounded-lg border border-indigo-200 bg-indigo-100/80 px-3 py-1.5 text-sm font-extrabold text-indigo-900">
                {projects.length.toLocaleString("fa-IR")} پروژه
              </span>
            </header>

            <div className="min-w-0 p-3 sm:p-5">
              <ProjectTable projects={projects} />
            </div>
          </section>
        </div>

        {/* خلاصه تسک‌های تکمیل‌شده */}
        <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-l from-emerald-100/90 via-white to-teal-50 shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-200/80 text-emerald-900">
                <CheckCircle2 className="size-6" />
              </span>

              <div className="min-w-0">
                <p className="text-sm font-bold text-emerald-900">
                  تسک‌های تکمیل‌شده در تمام پروژه‌ها
                </p>

                <p className="mt-1 text-3xl font-black tracking-tight text-emerald-950">
                  {completedTasks.toLocaleString("fa-IR")}
                </p>

                <p className="mt-1 text-xs font-semibold text-emerald-800">
                  از مجموع {totalTasks.toLocaleString("fa-IR")} تسک
                </p>
              </div>
            </div>

            <Link
              href="/admin/tasks"
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white/85 px-4 text-sm font-extrabold text-emerald-900 transition hover:border-emerald-300 hover:bg-white sm:w-auto"
            >
              مشاهده تسک‌ها
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}