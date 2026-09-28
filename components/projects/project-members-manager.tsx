"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  Loader2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

import {
  addProjectMemberAction,
  removeProjectMemberAction,
} from "@/lib/actions/project.actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Employee = {
  id: string;
  name: string;
  email: string;
};

type Member = {
  id: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
};

type Props = {
  projectId: string;
  members: Member[];
  employees: Employee[];
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

export function ProjectMembersManager({
  projectId,
  members,
  employees,
}: Props) {
  const [
    selectedEmployeeId,
    setSelectedEmployeeId,
  ] = useState("");

  const [isPending, startTransition] =
    useTransition();

  const [error, setError] =
    useState<string | null>(null);

  const memberIds = new Set(
    members.map(
      (member) =>
        member.user.id,
    ),
  );

  const availableEmployees =
    employees.filter(
      (employee) =>
        !memberIds.has(employee.id),
    );

  function handleAdd() {
    if (!selectedEmployeeId) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result =
        await addProjectMemberAction(
          projectId,
          selectedEmployeeId,
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSelectedEmployeeId("");
    });
  }

  function handleRemove(
    employeeId: string,
  ) {
    const member = members.find(
      (item) =>
        item.user.id ===
        employeeId,
    );

    if (!member) {
      return;
    }

    const confirmed =
      window.confirm(
        `آیا می‌خواهید «${member.user.name}» را از این پروژه حذف کنید؟`,
      );

    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result =
        await removeProjectMemberAction(
          projectId,
          employeeId,
        );

      if (!result.success) {
        setError(result.message);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
            <Users className="size-5 text-slate-600" />
          </div>

          <div>
            <CardTitle>
              اعضای پروژه
            </CardTitle>

            <p className="mt-1 text-xs text-slate-400">
              مدیریت اعضای تیم این پروژه
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {error ? (
          <div className="rounded-2xl border border-red-200/60 bg-red-50/65 p-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="rounded-3xl border border-white/55 bg-white/24 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={
                selectedEmployeeId
              }
              onChange={(event) =>
                setSelectedEmployeeId(
                  event.target.value,
                )
              }
              disabled={
                isPending ||
                availableEmployees.length ===
                  0
              }
              className="glass-field h-11 min-w-0 flex-1 rounded-xl px-3.5 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="">
                {availableEmployees.length ===
                0
                  ? "همه کارمندان در پروژه هستند"
                  : "انتخاب کارمند"}
              </option>

              {availableEmployees.map(
                (employee) => (
                  <option
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.name} —{" "}
                    {employee.email}
                  </option>
                ),
              )}
            </select>

            <Button
              type="button"
              size="lg"
              onClick={handleAdd}
              disabled={
                isPending ||
                !selectedEmployeeId
              }
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}

              افزودن عضو
            </Button>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="soft-grid rounded-3xl border border-dashed border-slate-300/40 bg-white/20 p-9 text-center">
            <div className="glass-icon mx-auto flex size-12 items-center justify-center rounded-2xl">
              <Users className="size-5 text-slate-400" />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-600">
              هنوز عضوی به پروژه اضافه نشده است.
            </p>

            <p className="mt-1 text-xs leading-6 text-slate-400">
              از بخش انتخاب کارمند، اعضای پروژه را اضافه کنید.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map(
              (member) => (
                <div
                  key={member.id}
                  className="rounded-3xl border border-white/50 bg-white/26 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition hover:bg-white/38 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="glass-icon flex size-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-slate-600">
                        {member.user.name
                          .trim()
                          .slice(0, 1)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-bold text-slate-800">
                            {member.user.name}
                          </p>

                          {member.user
                            .isActive ? (
                            <span className="rounded-full border border-emerald-200/60 bg-emerald-50/65 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              فعال
                            </span>
                          ) : (
                            <span className="glass-chip rounded-full px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              غیرفعال
                            </span>
                          )}
                        </div>

                        <p
                          dir="ltr"
                          className="mt-1 truncate text-xs text-slate-400"
                        >
                          {member.user.email}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          عضویت از{" "}
                          {formatDate(
                            member.joinedAt,
                          )}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={
                        isPending
                      }
                      onClick={() =>
                        handleRemove(
                          member.user.id,
                        )
                      }
                      className="w-full sm:w-auto"
                    >
                      {isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <UserMinus className="size-4" />
                      )}

                      حذف عضو
                    </Button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}