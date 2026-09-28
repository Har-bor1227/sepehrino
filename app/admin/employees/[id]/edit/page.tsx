import { notFound } from "next/navigation";
import Link from "next/link";

import {
  ArrowRight,
  Edit3,
  UserRound,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/guards";
import { getEmployeeById } from "@/lib/services/employee.service";

import { EditEmployeeForm } from "@/components/employees/edit-employee-form";

export default async function EditEmployeePage({
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
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="glass-strong overflow-hidden rounded-[2rem] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/employees/${employee.id}`}
              aria-label="بازگشت به پروفایل کارمند"
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
                ویرایش کارمند
              </h1>

              <p className="mt-1 truncate text-sm text-slate-400">
                {employee.name}
              </p>
            </div>
          </div>
        </section>

        <section className="glass-card overflow-hidden rounded-[2rem]">
          <div className="border-b border-white/40 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                <Edit3 className="size-5 text-slate-600" />
              </div>

              <div>
                <h2 className="font-extrabold text-slate-900">
                  اطلاعات حساب
                </h2>

                <p className="mt-1 text-xs leading-6 text-slate-400">
                  اطلاعات پایه و وضعیت حساب کارمند را ویرایش کنید.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 lg:p-7">
            <EditEmployeeForm
              employee={{
                id: employee.id,
                name: employee.name,
                email: employee.email,
                isActive:
                  employee.isActive,
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}