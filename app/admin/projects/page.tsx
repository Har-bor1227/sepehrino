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
  tone:
    | "slate"
    | "blue"
    | "violet"
    | "emerald";
}) {
  const iconClasses = {
    slate:
      "bg-slate-900/7 text-slate-600",
    blue:
      "bg-blue-500/8 text-blue-600",
    violet:
      "bg-violet-500/8 text-violet-600",
    emerald:
      "bg-emerald-500/8 text-emerald-600",
  };

  return (
    <div className="glass-card rounded-[1.75rem] p-5 transition hover:-translate-y-px">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`glass-icon flex size-11 items-center justify-center rounded-2xl ${iconClasses[tone]}`}
        >
          <Icon className="size-5" />
        </div>

        <span className="text-[10px] font-bold text-slate-300">
          آمار
        </span>
      </div>

      <p className="mt-5 text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
        {value.toLocaleString("fa-IR")}
      </p>
    </div>
  );
}

export default async function AdminProjectsPage() {
  await requireAdmin();

  const projects =
    await getAdminProjects();

  const activeProjects =
    projects.filter(
      (project) =>
        project.status ===
        "IN_PROGRESS",
    ).length;

  const totalTasks =
    projects.reduce(
      (total, project) =>
        total +
        project.stats
          .totalTasks,
      0,
    );

  const completedTasks =
    projects.reduce(
      (total, project) =>
        total +
        project.stats
          .completedTasks,
      0,
    );

  const membersCount =
    projects.reduce(
      (total, project) =>
        total +
        project.stats
          .membersCount,
      0,
    );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1450px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="glass-strong overflow-visible rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                  <FolderKanban className="size-5 text-slate-600" />
                </div>

                <span className="text-xs font-bold text-slate-400">
                  مدیریت پروژه
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                پروژه‌ها
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                ایجاد، مدیریت و پیگیری پروژه‌های تیم، اعضا و Taskهای مرتبط.
              </p>
            </div>

            <Link
              href="#create-project"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.14)] transition hover:bg-slate-800 sm:w-auto"
            >
              <Plus className="size-4" />
              ایجاد پروژه
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="کل پروژه‌ها"
            value={projects.length}
            icon={FolderKanban}
            tone="slate"
          />

          <StatCard
            label="پروژه فعال"
            value={activeProjects}
            icon={CheckCircle2}
            tone="blue"
          />

          <StatCard
            label="کل Taskها"
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

<div
  id="create-project"
  className="relative z-20 grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]"
>
  <section className="glass-card relative z-30 overflow-visible rounded-[2rem] lg:sticky lg:top-6">
            <div className="border-b border-white/40 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                  <Plus className="size-5 text-slate-600" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    ایجاد پروژه جدید
                  </h2>

                  <p className="mt-1 text-xs leading-6 text-slate-400">
                    پروژه را ایجاد کنید و اعضای تیم را مدیریت کنید.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <CreateProjectForm />
            </div>
          </section>

          <section className="glass-card relative z-10 overflow-hidden rounded-[2rem]">
            <div className="flex flex-col gap-3 border-b border-white/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  فهرست پروژه‌ها
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  وضعیت، اعضا و Taskهای هر پروژه را مدیریت کنید.
                </p>
              </div>

              <span className="glass-chip w-fit rounded-full px-3 py-1.5 text-xs font-bold text-slate-500">
                {projects.length.toLocaleString(
                  "fa-IR",
                )}{" "}
                پروژه
              </span>
            </div>

            <ProjectTable
              projects={
                projects
              }
            />
          </section>
        </div>

        <section className="glass-card rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                <CheckCircle2 className="size-5 text-emerald-600" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Taskهای تکمیل‌شده در تمام پروژه‌ها
                </p>

                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  {completedTasks.toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>
            </div>

            <Link
              href="/admin/tasks"
              className="inline-flex w-fit items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-white/40 hover:text-slate-900"
            >
              مشاهده Taskها
              <ArrowLeft className="size-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}