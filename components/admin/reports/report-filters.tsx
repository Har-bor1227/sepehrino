"use client";

import { useState } from "react";

import {
  CalendarDays,
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

import { PersianDatePicker } from "@/components/ui/persian-date-picker";

type Option = {
  id: string;
  name?: string;
  title?: string;
  email?: string;
};

type ReportFiltersProps = {
  employees: Option[];
  projects: Option[];
  initialValues: {
    from: string;
    to: string;
    employeeId: string;
    projectId: string;
    status: string;
  };
};

const STATUS_OPTIONS = [
  {
    value: "",
    label: "همه وضعیت‌ها",
  },
  {
    value: "TODO",
    label: "در انتظار",
  },
  {
    value: "IN_PROGRESS",
    label: "در حال انجام",
  },
  {
    value: "COMPLETED",
    label: "تکمیل شده",
  },
  {
    value: "CANCELLED",
    label: "لغو شده",
  },
] as const;

export function ReportFilters({
  employees,
  projects,
  initialValues,
}: ReportFiltersProps) {
  const [
    from,
    setFrom,
  ] = useState(
    initialValues.from,
  );

  const [
    to,
    setTo,
  ] = useState(
    initialValues.to,
  );

  return (
    <section className="glass-card relative z-50 overflow-visible rounded-[2rem] p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
            <Filter className="size-5 text-slate-600" />
          </div>

          <div>
            <h2 className="font-extrabold text-slate-900">
              فیلتر گزارش
            </h2>

            <p className="mt-1 text-xs leading-6 text-slate-400">
              این فیلترها روی آمار، نمودارها و جزئیات گزارش اعمال می‌شوند.
            </p>
          </div>
        </div>

        <span className="glass-chip w-fit rounded-full px-3 py-1.5 text-[11px] font-bold text-slate-400">
          فیلترهای مدیریتی
        </span>
      </div>

      <form
        method="GET"
        className="relative z-10 grid gap-4 xl:grid-cols-[180px_180px_minmax(220px,1fr)_minmax(220px,1fr)_180px_auto]"
      >
        <div className="relative z-30">
          <label
            htmlFor="report-from"
            className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500"
          >
            <CalendarDays className="size-3.5" />
            از تاریخ
          </label>

          <PersianDatePicker
            id="report-from"
            value={from}
            onChange={setFrom}
            placeholder="از تاریخ"
            className="relative z-30"
          />

          <input
            type="hidden"
            name="from"
            value={from}
          />
        </div>

        <div className="relative z-20">
          <label
            htmlFor="report-to"
            className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500"
          >
            <CalendarDays className="size-3.5" />
            تا تاریخ
          </label>

          <PersianDatePicker
            id="report-to"
            value={to}
            onChange={setTo}
            placeholder="تا تاریخ"
            className="relative z-20"
          />

          <input
            type="hidden"
            name="to"
            value={to}
          />
        </div>

        <label className="relative z-10 block">
          <span className="mb-2 block text-xs font-bold text-slate-500">
            کارمند
          </span>

          <div className="relative">
            <select
              name="employeeId"
              defaultValue={
                initialValues.employeeId
              }
              className="glass-field h-11 w-full appearance-none rounded-xl px-3 pl-10 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="">
                همه کارمندان
              </option>

              {employees.map(
                (employee) => (
                  <option
                    key={
                      employee.id
                    }
                    value={
                      employee.id
                    }
                  >
                    {employee.name ??
                      employee.email ??
                      "کارمند"}
                  </option>
                ),
              )}
            </select>

            <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </div>
        </label>

        <label className="relative z-10 block">
          <span className="mb-2 block text-xs font-bold text-slate-500">
            پروژه
          </span>

          <div className="relative">
            <select
              name="projectId"
              defaultValue={
                initialValues.projectId
              }
              className="glass-field h-11 w-full appearance-none rounded-xl px-3 pl-10 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="">
                همه پروژه‌ها
              </option>

              {projects.map(
                (project) => (
                  <option
                    key={
                      project.id
                    }
                    value={
                      project.id
                    }
                  >
                    {project.title ??
                      "پروژه"}
                  </option>
                ),
              )}
            </select>

            <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </div>
        </label>

        <label className="relative z-10 block">
          <span className="mb-2 block text-xs font-bold text-slate-500">
            وضعیت Task
          </span>

          <div className="relative">
            <select
              name="status"
              defaultValue={
                initialValues.status
              }
              className="glass-field h-11 w-full appearance-none rounded-xl px-3 pl-10 text-sm font-medium text-slate-700 outline-none"
            >
              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>

            <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </div>
        </label>

        <div className="relative z-10 flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,23,42,0.12)] transition hover:bg-slate-800"
          >
            <Search className="size-4" />
            اعمال
          </button>

          <a
            href="/admin/reports"
            aria-label="پاک کردن فیلترها"
            title="پاک کردن فیلترها"
            className="inline-flex h-11 size-11 items-center justify-center rounded-xl border border-white/60 bg-white/38 text-slate-500 transition hover:bg-white/70"
          >
            <RotateCcw className="size-4" />
          </a>
        </div>
      </form>
    </section>
  );
}