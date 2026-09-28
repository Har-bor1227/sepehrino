"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import {
  Edit,
  Eye,
  Loader2,
  Power,
  Trash2,
} from "lucide-react";

import {
  deleteEmployeeAction,
  toggleEmployeeStatusAction,
} from "@/lib/actions/employee.actions";

import { Button } from "@/components/ui/button";

type EmployeeRowActionsProps = {
  employeeId: string;
  employeeName: string;
  isActive: boolean;
};

export function EmployeeRowActions({
  employeeId,
  employeeName,
  isActive,
}: EmployeeRowActionsProps) {
  const [isPending, startTransition] =
    useTransition();

  const [error, setError] =
    useState<string | null>(null);

  function handleToggle() {
    setError(null);

    startTransition(async () => {
      const result =
        await toggleEmployeeStatusAction(
          employeeId,
        );

      if (!result.success) {
        setError(result.message);
      }
    });
  }

  function handleDelete() {
    const confirmed =
      window.confirm(
        `آیا از حذف «${employeeName}» مطمئن هستید؟`,
      );

    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result =
        await deleteEmployeeAction(
          employeeId,
        );

      if (!result.success) {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link
        href={`/admin/employees/${employeeId}`}
        aria-label={`مشاهده ${employeeName}`}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/38 px-3 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_5px_16px_rgba(15,23,42,0.04)] backdrop-blur-xl transition hover:-translate-y-px hover:bg-white/65 hover:text-slate-950"
      >
        <Eye className="size-4" />
        مشاهده
      </Link>

      <Link
        href={`/admin/employees/${employeeId}/edit`}
        aria-label={`ویرایش ${employeeName}`}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/38 px-3 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_5px_16px_rgba(15,23,42,0.04)] backdrop-blur-xl transition hover:-translate-y-px hover:bg-white/65 hover:text-slate-950"
      >
        <Edit className="size-4" />
        ویرایش
      </Link>

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleToggle}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Power className="size-4" />
        )}

        {isActive
          ? "غیرفعال"
          : "فعال"}
      </Button>

      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}

        حذف
      </Button>

      {error ? (
        <span className="w-full max-w-64 rounded-xl bg-red-50/70 px-3 py-2 text-xs leading-5 text-red-600">
          {error}
        </span>
      ) : null}
    </div>
  );
}