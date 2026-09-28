import { notFound } from "next/navigation";
import Link from "next/link";

import {
  ArrowRight,
  Edit3,
  UserRound,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/guards";
import { getEmployeeById } from "@/lib/services/employee.service";

import { EmployeeProfile } from "@/components/employees/employee-profile";

export default async function EmployeeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } =
    await params;

  const employee =
    await getEmployeeById(id);

  if (!employee) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1450px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="glass-strong overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/admin/employees"
                aria-label="بازگشت به لیست کارمندان"
                className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/70 hover:text-slate-900"
              >
                <ArrowRight className="size-5" />
              </Link>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <UserRound className="size-3.5" />
                  مدیریت کارمندان
                </div>

                <h1 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  پروفایل و عملکرد کارمند
                </h1>
              </div>
            </div>

            <Link
              href={`/admin/employees/${employee.id}/edit`}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,23,42,0.12)] transition hover:bg-slate-800 sm:w-auto"
            >
              <Edit3 className="size-4" />
              ویرایش کارمند
            </Link>
          </div>
        </section>

        <EmployeeProfile
          employee={employee}
        />
      </div>
    </main>
  );
}