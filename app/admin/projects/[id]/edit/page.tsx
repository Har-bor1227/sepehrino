import { notFound } from "next/navigation";
import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  FolderKanban,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/guards";
import { getProjectById } from "@/lib/services/project.service";

import { EditProjectForm } from "@/components/projects/edit-project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const project =
    await getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/admin/projects/${id}`}
              aria-label="بازگشت به پروژه"
              className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-2xl text-slate-600 transition hover:-translate-y-px hover:bg-white/80"
            >
              <ArrowRight className="size-5" />
            </Link>

            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400">
                مدیریت پروژه
              </p>

              <div className="mt-1 flex min-w-0 items-center gap-2">
                <FolderKanban className="size-4 shrink-0 text-slate-400" />

                <h1 className="truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  ویرایش پروژه
                </h1>
              </div>
            </div>
          </div>

          <div className="glass-chip hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-slate-500 sm:inline-flex">
            <CalendarDays className="size-3.5" />

            اطلاعات پروژه
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <div className="glass-card rounded-2xl px-4 py-3">
            <p className="text-[11px] font-semibold text-slate-400">
              نام پروژه
            </p>

            <p className="mt-1 truncate text-sm font-bold text-slate-800">
              {project.title}
            </p>
          </div>

          <div className="glass-card rounded-2xl px-4 py-3">
            <p className="text-[11px] font-semibold text-slate-400">
              مهلت فعلی
            </p>

            <p className="mt-1 text-sm font-bold text-slate-800">
              {new Intl.DateTimeFormat(
                "fa-IR",
                {
                  calendar: "persian",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                },
              ).format(project.deadline)}
            </p>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-1">
          <EditProjectForm
            project={{
              id: project.id,
              title: project.title,
              description:
                project.description,
              status: project.status,
              startDate:
                project.startDate
                  .toISOString()
                  .slice(0, 10),
              deadline:
                project.deadline
                  .toISOString()
                  .slice(0, 10),
            }}
          />
        </div>
      </div>
    </main>
  );
}