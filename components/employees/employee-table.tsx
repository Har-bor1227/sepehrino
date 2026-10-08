import {
  CheckCircle2,
  CircleOff,
  FolderKanban,
  ListTodo,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { EmployeeRowActions } from "./employee-row-actions";

type Employee = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  _count: {
    projectMembers: number;
    assignedTasks: number;
  };
};

function StatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  return isActive ? (
    <span className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-lg border border-emerald-200/60 bg-emerald-50/60 px-2 text-[11px] font-bold text-emerald-700">
      <CheckCircle2 className="size-3.5 shrink-0" />
      فعال
    </span>
  ) : (
    <span className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-lg border border-white/55 bg-white/38 px-2 text-[11px] font-bold text-slate-500">
      <CircleOff className="size-3.5 shrink-0" />
      غیرفعال
    </span>
  );
}

export function EmployeeTable({
  employees,
}: {
  employees: Employee[];
}) {
  if (employees.length === 0) {
    return (
      <Card>
        <CardHeader className="p-5">
          <div className="flex items-center gap-3">
            <div className="glass-icon flex size-9 items-center justify-center rounded-xl">
              <Users className="size-4.5 text-slate-600" />
            </div>

            <div>
              <CardTitle>کارمندان</CardTitle>

              <p className="mt-0.5 text-xs text-slate-400">
                مدیریت اعضای تیم
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5 pt-0">
          <div className="soft-grid flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/40 bg-white/24 px-5 text-center">
            <div className="glass-icon flex size-12 items-center justify-center rounded-xl text-slate-400">
              <Users className="size-5" />
            </div>

            <p className="mt-3 text-sm font-bold text-slate-700">
              هنوز هیچ کارمندی ایجاد نشده است.
            </p>

            <p className="mt-1 text-xs leading-6 text-slate-400">
              پس از ایجاد اولین حساب، اعضای تیم در این بخش نمایش داده می‌شوند.
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
                لیست کارمندان
              </CardTitle>

              <p className="mt-0.5 truncate text-xs text-slate-400">
                اعضای تیم و وضعیت فعالیت آن‌ها
              </p>
            </div>
          </div>

          <span className="glass-chip shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-500">
            {employees.length.toLocaleString("fa-IR")} کارمند
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <table
          dir="rtl"
          className="w-full table-fixed border-collapse text-sm"
        >
          <colgroup>
            <col className="w-[33%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[33%]" />
          </colgroup>

          <thead>
            <tr className="border-y border-white/40 bg-white/25 text-right">
              <th className="px-3 py-3 text-xs font-bold text-slate-500">
                کارمند
              </th>

              <th className="px-2 py-3 text-xs font-bold text-slate-500">
                وضعیت
              </th>

              <th className="px-2 py-3 text-xs font-bold text-slate-500">
                پروژه‌ها
              </th>

              <th className="px-2 py-3 text-xs font-bold text-slate-500">
                Taskها
              </th>

              <th className="px-3 py-3 text-xs font-bold text-slate-500">
                عملیات
              </th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="border-b border-white/30 transition last:border-b-0 hover:bg-white/25"
              >
                <td className="px-3 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="glass-icon flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-slate-600">
                      {employee.name.trim().slice(0, 1)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold text-slate-800">
                        {employee.name}
                      </p>

                      <p
                        dir="ltr"
                        className="mt-0.5 truncate text-[10px] text-slate-400"
                      >
                        {employee.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-2 py-3">
                  <StatusBadge isActive={employee.isActive} />
                </td>

                <td className="px-2 py-3">
                  <div className="inline-flex h-8 items-center gap-1 rounded-lg bg-white/32 px-2">
                    <FolderKanban className="size-3.5 shrink-0 text-slate-400" />

                    <span className="text-xs font-bold text-slate-700">
                      {employee._count.projectMembers.toLocaleString(
                        "fa-IR",
                      )}
                    </span>
                  </div>
                </td>

                <td className="px-2 py-3">
                  <div className="inline-flex h-8 items-center gap-1 rounded-lg bg-white/32 px-2">
                    <ListTodo className="size-3.5 shrink-0 text-slate-400" />

                    <span className="text-xs font-bold text-slate-700">
                      {employee._count.assignedTasks.toLocaleString(
                        "fa-IR",
                      )}
                    </span>
                  </div>
                </td>

                <td
                  dir="rtl"
                  className="px-3 py-3"
                >
                  <div
                    className="
                      flex w-full min-w-0 flex-nowrap items-center
                      justify-start gap-1
                      whitespace-nowrap
                      [&>div]:!flex
                      [&>div]:!flex-nowrap
                      [&>div]:!items-center
                      [&>div]:!justify-start
                      [&>div]:!gap-1
                      [&>div]:!whitespace-nowrap
                      [&_button]:!h-8
                      [&_button]:!min-h-8
                      [&_button]:!rounded-lg
                      [&_button]:!px-2
                      [&_button]:!py-1
                      [&_button]:!text-[10px]
                      [&_button]:!whitespace-nowrap
                      [&_a]:!h-8
                      [&_a]:!min-h-8
                      [&_a]:!rounded-lg
                      [&_a]:!px-2
                      [&_a]:!py-1
                      [&_a]:!text-[10px]
                      [&_a]:!whitespace-nowrap
                    "
                  >
                    <EmployeeRowActions
                      employeeId={employee.id}
                      employeeName={employee.name}
                      isActive={employee.isActive}
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