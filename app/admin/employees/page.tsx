import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  Search,
  Users,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/guards";
import {
  getEmployees,
  type EmployeeListFilters,
} from "@/lib/services/employee.service";

import { CreateEmployeeForm } from "@/components/employees/create-employee-form";
import { EmployeeTable } from "@/components/employees/employee-table";

type SearchParams = {
  search?: string;
  status?: string;
  sort?: string;
  page?: string;
};

function parseStatus(
  value: string | undefined,
): EmployeeListFilters["status"] {
  if (
    value === "active" ||
    value === "inactive"
  ) {
    return value;
  }

  return "all";
}

function parseSort(
  value: string | undefined,
): EmployeeListFilters["sort"] {
  if (
    value === "oldest" ||
    value === "name-asc" ||
    value === "name-desc"
  ) {
    return value;
  }

  return "newest";
}

function parsePage(
  value: string | undefined,
) {
  const page = Number(value);

  if (
    !Number.isInteger(page) ||
    page < 1
  ) {
    return 1;
  }

  return page;
}

function buildPageHref({
  search,
  status,
  sort,
  page,
}: {
  search: string;
  status: EmployeeListFilters["status"];
  sort: EmployeeListFilters["sort"];
  page: number;
}) {
  const params =
    new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (
    status &&
    status !== "all"
  ) {
    params.set("status", status);
  }

  if (
    sort &&
    sort !== "newest"
  ) {
    params.set("sort", sort);
  }

  params.set(
    "page",
    String(page),
  );

  return `/admin/employees?${params.toString()}`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  tone:
    | "slate"
    | "emerald"
    | "blue"
    | "violet";
}) {
  const iconClasses = {
    slate:
      "bg-slate-900/7 text-slate-600",
    emerald:
      "bg-emerald-500/8 text-emerald-600",
    blue:
      "bg-blue-500/8 text-blue-600",
    violet:
      "bg-violet-500/8 text-violet-600",
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

export default async function AdminEmployeesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params =
    await searchParams;

  const search =
    params.search?.trim() ?? "";

  const status = parseStatus(
    params.status,
  );

  const sort = parseSort(
    params.sort,
  );

  const page = parsePage(
    params.page,
  );

  const result =
    await getEmployees({
      search,
      status,
      sort,
      page,
      pageSize: 10,
    });

  const employees =
    result.employees;

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.isActive,
    ).length;

  const totalProjects =
    employees.reduce(
      (total, employee) =>
        total +
        employee._count
          .projectMembers,
      0,
    );

  const totalTasks =
    employees.reduce(
      (total, employee) =>
        total +
        employee._count
          .assignedTasks,
      0,
    );

  const startItem =
    result.total === 0
      ? 0
      : (result.page - 1) *
          result.pageSize +
        1;

  const endItem =
    Math.min(
      result.page *
        result.pageSize,
      result.total,
    );

  const hasFilters =
    Boolean(search) ||
    status !== "all" ||
    sort !== "newest";

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1450px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="glass-strong overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                  <Users className="size-5 text-slate-600" />
                </div>

                <span className="text-xs font-bold text-slate-400">
                  مدیریت تیم
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                کارمندان
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                مدیریت حساب‌های کاربری، وضعیت فعالیت و ارتباط کارمندان با پروژه‌ها و Taskها.
              </p>
            </div>

            <div className="glass-chip w-fit rounded-2xl px-4 py-3">
              <p className="text-[11px] text-slate-400">
                نتیجه فعلی
              </p>

              <p className="mt-0.5 text-sm font-extrabold text-slate-700">
                {result.total.toLocaleString(
                  "fa-IR",
                )}{" "}
                کارمند
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="کارمندان این صفحه"
            value={employees.length}
            icon={Users}
            tone="slate"
          />

          <StatCard
            label="فعال در این صفحه"
            value={activeEmployees}
            icon={CheckCircle2}
            tone="emerald"
          />

          <StatCard
            label="عضویت پروژه"
            value={totalProjects}
            icon={BriefcaseBusiness}
            tone="blue"
          />

          <StatCard
            label="Taskهای این صفحه"
            value={totalTasks}
            icon={Users}
            tone="violet"
          />
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="glass-card overflow-hidden rounded-[2rem] lg:sticky lg:top-6">
            <div className="border-b border-white/40 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
                  <Users className="size-5 text-slate-600" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    افزودن کارمند
                  </h2>

                  <p className="mt-1 text-xs leading-6 text-slate-400">
                    ایجاد حساب کاربری جدید برای تیم.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <CreateEmployeeForm />
            </div>
          </section>

          <section className="glass-card overflow-hidden rounded-[2rem]">
            <div className="border-b border-white/40 p-5 sm:p-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    فهرست کارمندان
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    جست‌وجو، فیلتر و مرتب‌سازی حساب‌های کاربری.
                  </p>
                </div>

                <form
                  method="get"
                  className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_180px_auto]"
                >
                  <div className="relative">
                    <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                    <input
                      name="search"
                      defaultValue={
                        search
                      }
                      placeholder="جستجو با نام یا ایمیل..."
                      className="glass-field h-11 w-full rounded-xl pr-9 pl-4 text-sm font-medium text-slate-800 outline-none"
                    />
                  </div>

                  <select
                    name="status"
                    defaultValue={
                      status
                    }
                    className="glass-field h-11 w-full rounded-xl px-3 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="all">
                      همه وضعیت‌ها
                    </option>

                    <option value="active">
                      فعال
                    </option>

                    <option value="inactive">
                      غیرفعال
                    </option>
                  </select>

                  <select
                    name="sort"
                    defaultValue={
                      sort
                    }
                    className="glass-field h-11 w-full rounded-xl px-3 text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="newest">
                      جدیدترین
                    </option>

                    <option value="oldest">
                      قدیمی‌ترین
                    </option>

                    <option value="name-asc">
                      نام: الف تا ی
                    </option>

                    <option value="name-desc">
                      نام: ی تا الف
                    </option>
                  </select>

                  <button
                    type="submit"
                    className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,23,42,0.12)] transition hover:bg-slate-800"
                  >
                    اعمال فیلتر
                  </button>
                </form>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-b border-white/35 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-slate-400">
                نمایش{" "}
                <span className="font-bold text-slate-700">
                  {startItem.toLocaleString(
                    "fa-IR",
                  )}
                </span>{" "}
                تا{" "}
                <span className="font-bold text-slate-700">
                  {endItem.toLocaleString(
                    "fa-IR",
                  )}
                </span>{" "}
                از{" "}
                <span className="font-bold text-slate-700">
                  {result.total.toLocaleString(
                    "fa-IR",
                  )}
                </span>{" "}
                کارمند
              </p>

              {hasFilters ? (
                <Link
                  href="/admin/employees"
                  className="inline-flex w-fit items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-white/45 hover:text-slate-900"
                >
                  حذف فیلترها
                  <ChevronLeft className="size-3.5" />
                </Link>
              ) : null}
            </div>

            <div>
              <EmployeeTable
                employees={
                  employees
                }
              />
            </div>

            {result.totalPages >
            1 ? (
              <div className="flex flex-col gap-4 border-t border-white/35 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <p className="text-sm text-slate-400">
                  صفحه{" "}
                  <span className="font-bold text-slate-700">
                    {result.page.toLocaleString(
                      "fa-IR",
                    )}
                  </span>{" "}
                  از{" "}
                  <span className="font-bold text-slate-700">
                    {result.totalPages.toLocaleString(
                      "fa-IR",
                    )}
                  </span>
                </p>

                <div className="flex flex-wrap items-center gap-1.5">
                  {result.page >
                  1 ? (
                    <Link
                      href={buildPageHref(
                        {
                          search,
                          status,
                          sort,
                          page:
                            result.page -
                            1,
                        },
                      )}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-white/60 bg-white/35 px-3 text-xs font-bold text-slate-600 transition hover:bg-white/60"
                    >
                      قبلی
                    </Link>
                  ) : (
                    <span className="inline-flex h-9 items-center justify-center rounded-xl border border-white/40 bg-white/15 px-3 text-xs text-slate-300">
                      قبلی
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    {Array.from(
                      {
                        length:
                          result.totalPages,
                      },
                      (
                        _,
                        index,
                      ) =>
                        index +
                        1,
                    )
                      .filter(
                        (
                          pageNumber,
                        ) => {
                          if (
                            result.totalPages <=
                            7
                          ) {
                            return true;
                          }

                          return (
                            pageNumber ===
                              1 ||
                            pageNumber ===
                              result.totalPages ||
                            Math.abs(
                              pageNumber -
                                result.page,
                            ) <= 1
                          );
                        },
                      )
                      .map(
                        (
                          pageNumber,
                          index,
                          visiblePages,
                        ) => {
                          const previousPage =
                            visiblePages[
                              index -
                                1
                            ];

                          const showEllipsis =
                            previousPage !==
                              undefined &&
                            pageNumber -
                              previousPage >
                              1;

                          return (
                            <span
                              key={
                                pageNumber
                              }
                              className="contents"
                            >
                              {showEllipsis ? (
                                <span className="px-1 text-xs text-slate-300">
                                  ...
                                </span>
                              ) : null}

                              {pageNumber ===
                              result.page ? (
                                <span className="inline-flex size-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-sm">
                                  {pageNumber.toLocaleString(
                                    "fa-IR",
                                  )}
                                </span>
                              ) : (
                                <Link
                                  href={buildPageHref(
                                    {
                                      search,
                                      status,
                                      sort,
                                      page:
                                        pageNumber,
                                    },
                                  )}
                                  className="inline-flex size-9 items-center justify-center rounded-xl border border-white/55 bg-white/30 text-xs font-bold text-slate-600 transition hover:bg-white/60"
                                >
                                  {pageNumber.toLocaleString(
                                    "fa-IR",
                                  )}
                                </Link>
                              )}
                            </span>
                          );
                        },
                      )}
                  </div>

                  {result.page <
                  result.totalPages ? (
                    <Link
                      href={buildPageHref(
                        {
                          search,
                          status,
                          sort,
                          page:
                            result.page +
                            1,
                        },
                      )}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-white/60 bg-white/35 px-3 text-xs font-bold text-slate-600 transition hover:bg-white/60"
                    >
                      بعدی
                    </Link>
                  ) : (
                    <span className="inline-flex h-9 items-center justify-center rounded-xl border border-white/40 bg-white/15 px-3 text-xs text-slate-300">
                      بعدی
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}