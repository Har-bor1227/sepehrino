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

function StatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/55 bg-emerald-50/65 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="size-3.5" />
        فعال
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/55 bg-white/38 px-2.5 py-1 text-xs font-semibold text-slate-500">
      <CircleOff className="size-3.5" />
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
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
              <Users className="size-5 text-slate-600" />
            </div>

            <div>
              <CardTitle>
                کارمندان
              </CardTitle>

              <p className="mt-1 text-xs text-slate-400">
                مدیریت اعضای تیم
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="soft-grid flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/40 bg-white/24 px-6 text-center">
            <div className="glass-icon flex size-14 items-center justify-center rounded-2xl text-slate-400">
              <Users className="size-6" />
            </div>

            <p className="mt-4 text-sm font-bold text-slate-700">
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
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
              <Users className="size-5 text-slate-600" />
            </div>

            <div>
              <CardTitle>
                لیست کارمندان
              </CardTitle>

              <p className="mt-1 text-xs text-slate-400">
                اعضای تیم و وضعیت فعالیت آن‌ها
              </p>
            </div>
          </div>

          <span className="glass-chip w-fit rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500">
            {employees.length.toLocaleString(
              "fa-IR",
            )}{" "}
            کارمند
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="thin-scrollbar overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-y border-white/40 bg-white/25 text-right">
                <th className="px-6 py-4 font-semibold text-slate-500">
                  کارمند
                </th>

                <th className="px-6 py-4 font-semibold text-slate-500">
                  وضعیت
                </th>

                <th className="px-6 py-4 font-semibold text-slate-500">
                  پروژه‌ها
                </th>

                <th className="px-6 py-4 font-semibold text-slate-500">
                  Taskها
                </th>

                <th className="px-6 py-4 font-semibold text-slate-500">
                  تاریخ ایجاد
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-500">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody>
              {employees.map(
                (employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-white/35 transition hover:bg-white/30 last:border-b-0"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-slate-600">
                          {employee.name
                            .trim()
                            .slice(0, 1)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-800">
                            {employee.name}
                          </p>

                          <p
                            dir="ltr"
                            className="mt-1 truncate text-xs text-slate-400"
                          >
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge
                        isActive={
                          employee.isActive
                        }
                      />
                    </td>

                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-white/32 px-3 py-2">
                        <FolderKanban className="size-4 text-slate-400" />

                        <span className="font-semibold text-slate-700">
                          {employee._count.projectMembers.toLocaleString(
                            "fa-IR",
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-white/32 px-3 py-2">
                        <ListTodo className="size-4 text-slate-400" />

                        <span className="font-semibold text-slate-700">
                          {employee._count.assignedTasks.toLocaleString(
                            "fa-IR",
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-slate-500">
                      {formatDate(
                        employee.createdAt,
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <EmployeeRowActions
                        employeeId={
                          employee.id
                        }
                        employeeName={
                          employee.name
                        }
                        isActive={
                          employee.isActive
                        }
                      />
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}