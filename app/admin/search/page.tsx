import {
  Search,
  Sparkles,
  Users,
  FolderKanban,
  ListChecks,
  ArrowLeft,
} from "lucide-react";

import { SearchForm } from "@/components/search/search-form";
import { SearchResults } from "@/components/search/search-results";
import { searchSystem } from "@/lib/services/search.service";

type SearchParams = {
  q?: string;
};

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const data = await searchSystem(query);

  return (
    <main className="min-h-screen bg-slate-100/90">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-blue-900/20 bg-gradient-to-l from-slate-950 via-blue-950 to-indigo-900 p-5 text-white shadow-lg sm:p-7 lg:p-9">
          <div className="pointer-events-none absolute -left-16 -top-20 -z-10 size-64 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 -z-10 size-80 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cyan-200 shadow-inner">
              <Search className="size-7" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-blue-200">
                  پنل مدیریت
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
                  <Sparkles className="size-3.5" />
                  جست‌وجوی سریع
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                جست‌وجوی سراسری
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100/85 sm:text-base">
                کارمندان، پروژه‌ها و Taskهای سیستم را از یک نقطه پیدا کنید.
              </p>
            </div>
          </div>

          <div className="relative mt-7 grid grid-cols-3 gap-2 border-t border-white/15 pt-5 sm:gap-3">
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 sm:gap-3 sm:p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
                <Users className="size-4 sm:size-5" />
              </span>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-blue-100/70">
                  جست‌وجو در
                </p>
                <p className="mt-1 text-xs font-extrabold text-white sm:text-sm">
                  کارمندان
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 sm:gap-3 sm:p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-200">
                <FolderKanban className="size-4 sm:size-5" />
              </span>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-blue-100/70">
                  جست‌وجو در
                </p>
                <p className="mt-1 text-xs font-extrabold text-white sm:text-sm">
                  پروژه‌ها
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 sm:gap-3 sm:p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/15 text-violet-200">
                <ListChecks className="size-4 sm:size-5" />
              </span>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-blue-100/70">
                  جست‌وجو در
                </p>
                <p className="mt-1 text-xs font-extrabold text-white sm:text-sm">
                  Taskها
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search form */}
        <section className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-l from-blue-50 to-white px-5 py-4 sm:px-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-900/15">
              <Search className="size-5" />
            </div>

            <div>
              <h2 className="text-base font-black text-slate-950">
                عبارت موردنظر را وارد کنید
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                نام، عنوان یا اطلاعات مرتبط با مورد جست‌وجو را بنویسید.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <SearchForm
              action="/admin/search"
              defaultValue={query}
            />

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <Users className="size-3.5 text-emerald-600" />
                کارمندان
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <FolderKanban className="size-3.5 text-amber-600" />
                پروژه‌ها
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <ListChecks className="size-3.5 text-violet-600" />
                Taskها
              </span>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="min-w-0">
          {query ? (
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Search className="size-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-blue-700">
                    نتایج جست‌وجو برای
                  </p>
                  <p className="mt-1 break-words text-base font-black text-slate-950">
                    «{query}»
                  </p>
                </div>
              </div>

              <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-white px-3.5 py-2.5">
                <span className="text-xs font-semibold text-slate-500">
                  تعداد نتایج
                </span>
                <span className="text-lg font-black text-blue-800">
                  {data.total.toLocaleString("fa-IR")}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Sparkles className="size-5" />
              </div>

              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  آماده جست‌وجو هستید؟
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  عبارت موردنظر را در کادر بالا وارد کنید تا نتایج مرتبط
                  نمایش داده شوند.
                </p>
              </div>
            </div>
          )}

          <SearchResults
            query={data.query}
            employees={data.employees}
            projects={data.projects}
            tasks={data.tasks}
            total={data.total}
          />
        </section>

        <div className="flex items-center justify-center gap-2 pb-2 text-xs font-medium text-slate-400">
          <ZapIcon />
          جست‌وجوی یکپارچه در فرتاک تسکینگ
        </div>
      </div>
    </main>
  );
}

function ZapIcon() {
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
      <Sparkles className="size-3.5" />
    </span>
  );
}