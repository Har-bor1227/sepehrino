import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
  if (value === "active" || value === "inactive") {
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

function parsePage(value: string | undefined) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
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
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (status && status !== "all") {
    params.set("status", status);
  }

  if (sort && sort !== "newest") {
    params.set("sort", sort);
  }

  params.set("page", String(page));

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
  tone: "slate" | "emerald" | "blue" | "violet";
}) {
  const toneClasses = {
    slate: {
      surface:
        "border-slate-200 bg-gradient-to-br from-slate-200/80 via-white to-slate-50",
      icon: "bg-slate-200 text-slate-800",
      accent: "bg-slate-500",
      value: "text-slate-950",
    },
    emerald: {
      surface:
        "border-emerald-200 bg-gradient-to-br from-emerald-100 via-white to-teal-50",
      icon: "bg-emerald-200/80 text-emerald-900",
      accent: "bg-emerald-600",
      value: "text-emerald-950",
    },
    blue: {
      surface:
        "border-blue-200 bg-gradient-to-br from-blue-100 via-white to-sky-50",
      icon: "bg-blue-200/80 text-blue-900",
      accent: "bg-blue-600",
      value: "text-blue-950",
    },
    violet: {
      surface:
        "border-violet-200 bg-gradient-to-br from-violet-100 via-white to-purple-50",
      icon: "bg-violet-200/80 text-violet-900",
      accent: "bg-violet-600",
      value: "text-violet-950",
    },
  };

  const colors = toneClasses[tone];

  return (
    <article
      className={`relative flex min-h-[140px] min-w-0 flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-5 ${colors.surface}`}
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 ${colors.accent}`}
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold leading-6 text-slate-700">
          {label}
        </span>

        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
        >
          <Icon className="size-5" />
        </span>
      </div>

      <p
        className={`mt-4 text-3xl font-black tracking-tight sm:text-4xl ${colors.value}`}
      >
        {value.toLocaleString("fa-IR")}
      </p>
    </article>
  );
}

function PaginationButton({
  href,
  children,
  disabled = false,
  active = false,
  ariaLabel,
}: {
  href?: string;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  ariaLabel?: string;
}) {
  const className = [
    "inline-flex size-10 shrink-0 items-center justify-center rounded-xl border text-sm font-extrabold transition",
    active
      ? "border-indigo-700 bg-indigo-700 text-white shadow-sm"
      : disabled
        ? "border-slate-200 bg-slate-100 text-slate-300"
        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800",
  ].join(" ");

  if (disabled || !href) {
    return (
      <span
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}

export default async function AdminEmployeesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const status = parseStatus(params.status);
  const sort = parseSort(params.sort);
  const page = parsePage(params.page);

  const result = await getEmployees({
    search,
    status,
    sort,
    page,
    pageSize: 10,
  });

  const employees = result.employees;

  const activeEmployees = employees.filter(
    (employee) => employee.isActive,
  ).length;

  const totalProjects = employees.reduce(
    (total, employee) =>
      total + employee._count.projectMembers,
    0,
  );

  const totalTasks = employees.reduce(
    (total, employee) =>
      total + employee._count.assignedTasks,
    0,
  );

  const startItem =
    result.total === 0
      ? 0
      : (result.page - 1) * result.pageSize + 1;

  const endItem = Math.min(
    result.page * result.pageSize,
    result.total,
  );

  const hasFilters =
    Boolean(search) ||
    status !== "all" ||
    sort !== "newest";

  const visiblePages = Array.from(
    new Set([
      1,
      result.page - 1,
      result.page,
      result.page + 1,
      result.totalPages,
    ]),
  )
    .filter(
      (pageNumber) =>
        pageNumber >= 1 &&
        pageNumber <= result.totalPages,
    )
    .sort((a, b) => a - b);

  return (
    <main
      className="min-h-screen bg-slate-100/90"
      dir="rtl"
    >
      <div className="mx-auto max-w-[1450px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* سربرگ */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:p-7 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
                  <Users className="size-5" />
                </span>

                <span className="text-sm font-extrabold text-indigo-800">
                  مدیریت تیم
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                کارمندان
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                حساب‌های کاربری، وضعیت فعالیت، عضویت در پروژه‌ها و تسک‌های
                تخصیص‌یافته به اعضای تیم را مدیریت کنید.
              </p>
            </div>

            <div className="flex w-full items-center gap-3 rounded-xl border border-indigo-200 bg-gradient-to-l from-indigo-100/80 to-white p-4 sm:w-auto sm:min-w-52">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-200/80 text-indigo-900">
                <Users className="size-5" />
              </span>

              <div className="min-w-0">
                <p className="text-xs font-bold text-indigo-800">
                  نتیجه فیلتر فعلی
                </p>

                <p className="mt-1 text-xl font-black text-indigo-950">
                  {result.total.toLocaleString("fa-IR")}
                  <span className="mr-1 text-sm font-bold">
                    کارمند
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* آمار */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
            label="عضویت در پروژه‌ها"
            value={totalProjects}
            icon={BriefcaseBusiness}
            tone="blue"
          />

          <StatCard
            label="تسک‌های این صفحه"
            value={totalTasks}
            icon={Users}
            tone="violet"
          />
        </section>

        {/* فرم ایجاد و فهرست کارمندان */}
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(300px,350px)_minmax(0,1fr)] lg:gap-6">
          <section className="relative min-w-0 overflow-visible rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-100/80 via-white to-teal-50 shadow-[0_8px_24px_rgba(6,95,70,0.055)] lg:sticky lg:top-6">
            <header className="border-b border-emerald-100 bg-white/65 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Users className="size-5" />
                </span>

                <div className="min-w-0">
                  <h2 className="text-lg font-black text-slate-950">
                    افزودن کارمند
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    ایجاد حساب کاربری جدید برای تیم.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-800" />

                <p className="text-xs font-extrabold text-emerald-900">
                  مدیریت اعضای تیم
                </p>
              </div>
            </header>

            <div className="p-4 sm:p-6">
              <CreateEmployeeForm />
            </div>
          </section>

          <section className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.045)]">
            {/* عنوان فهرست */}
            <header className="border-b border-slate-200 bg-gradient-to-l from-slate-100 via-white to-indigo-50/60 p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
                    <Users className="size-5" />
                  </span>

                  <div className="min-w-0">
                    <h2 className="text-xl font-black tracking-tight text-slate-950">
                      فهرست کارمندان
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      جست‌وجو و مدیریت حساب‌های کاربری.
                    </p>
                  </div>
                </div>

                <span className="inline-flex min-h-9 w-fit shrink-0 items-center rounded-lg border border-indigo-200 bg-indigo-100/80 px-3 py-1.5 text-sm font-extrabold text-indigo-900">
                  {result.total.toLocaleString("fa-IR")} کارمند
                </span>
              </div>
            </header>

            {/* جست‌وجو و فیلتر */}
            <div className="border-b border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <form
                method="get"
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_145px_155px_auto]"
              >
                <div className="relative min-w-0">
                  <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-indigo-600" />

                  <input
                    name="search"
                    defaultValue={search}
                    placeholder="جست‌وجو با نام یا ایمیل..."
                    aria-label="جست‌وجوی کارمندان"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <select
                  name="status"
                  defaultValue={status}
                  aria-label="فیلتر وضعیت کارمند"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="active">فعال</option>
                  <option value="inactive">غیرفعال</option>
                </select>

                <select
                  name="sort"
                  defaultValue={sort}
                  aria-label="مرتب‌سازی کارمندان"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="oldest">قدیمی‌ترین</option>
                  <option value="name-asc">نام: الف تا ی</option>
                  <option value="name-desc">نام: ی تا الف</option>
                </select>

                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
                >
                  <Search className="size-4" />
                  اعمال فیلتر
                </button>
              </form>
            </div>

            {/* شمارنده نتایج */}
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-sm leading-7 text-slate-600">
                نمایش{" "}
                <strong className="font-black text-slate-950">
                  {startItem.toLocaleString("fa-IR")}
                </strong>{" "}
                تا{" "}
                <strong className="font-black text-slate-950">
                  {endItem.toLocaleString("fa-IR")}
                </strong>{" "}
                از{" "}
                <strong className="font-black text-slate-950">
                  {result.total.toLocaleString("fa-IR")}
                </strong>{" "}
                کارمند
              </p>

              {hasFilters && (
                <Link
                  href="/admin/employees"
                  className="inline-flex min-h-9 w-fit items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-extrabold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800"
                >
                  حذف فیلترها
                  <ChevronLeft className="size-3.5" />
                </Link>
              )}
            </div>

            {/* جدول */}
            <div className="min-w-0 bg-white p-2 sm:p-4">
              <EmployeeTable employees={employees} />
            </div>

            {/* صفحه‌بندی */}
            {result.totalPages > 1 && (
              <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <p className="text-sm font-medium text-slate-600">
                  صفحه{" "}
                  <strong className="font-black text-slate-950">
                    {result.page.toLocaleString("fa-IR")}
                  </strong>{" "}
                  از{" "}
                  <strong className="font-black text-slate-950">
                    {result.totalPages.toLocaleString("fa-IR")}
                  </strong>
                </p>

                <nav
                  aria-label="صفحه‌بندی کارمندان"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  <PaginationButton
                    href={
                      result.page > 1
                        ? buildPageHref({
                            search,
                            status,
                            sort,
                            page: result.page - 1,
                          })
                        : undefined
                    }
                    disabled={result.page <= 1}
                    ariaLabel="صفحه قبل"
                  >
                    <ChevronRight className="size-4" />
                  </PaginationButton>

                  {visiblePages.map((pageNumber, index) => {
                    const previousPage =
                      visiblePages[index - 1];

                    const showEllipsis =
                      previousPage !== undefined &&
                      pageNumber - previousPage > 1;

                    return (
                      <span
                        key={pageNumber}
                        className="contents"
                      >
                        {showEllipsis && (
                          <span className="px-1 text-sm font-bold text-slate-400">
                            …
                          </span>
                        )}

                        <PaginationButton
                          href={buildPageHref({
                            search,
                            status,
                            sort,
                            page: pageNumber,
                          })}
                          active={pageNumber === result.page}
                        >
                          {pageNumber.toLocaleString("fa-IR")}
                        </PaginationButton>
                      </span>
                    );
                  })}

                  <PaginationButton
                    href={
                      result.page < result.totalPages
                        ? buildPageHref({
                            search,
                            status,
                            sort,
                            page: result.page + 1,
                          })
                        : undefined
                    }
                    disabled={result.page >= result.totalPages}
                    ariaLabel="صفحه بعد"
                  >
                    <ChevronLeft className="size-4" />
                  </PaginationButton>
                </nav>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}