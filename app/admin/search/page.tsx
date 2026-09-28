import {
  Search,
  Sparkles,
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
  const params =
    await searchParams;

  const query =
    params.q?.trim() ?? "";

  const data =
    await searchSystem(query);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="glass-strong overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <div className="glass-icon flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900/7">
                <Search className="size-5 text-slate-600" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold text-slate-400">
                    پنل مدیریت
                  </p>

                  <span className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/25 px-2.5 py-1 text-[10px] font-bold text-slate-400">
                    <Sparkles className="size-3" />
                    جست‌وجوی سریع
                  </span>
                </div>

                <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  جست‌وجوی سراسری
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                  جست‌وجو در کارمندان، پروژه‌ها و Taskهای سیستم از یک نقطه.
                </p>
              </div>
            </div>

            <SearchForm
              action="/admin/search"
              defaultValue={query}
            />
          </div>
        </section>

        <SearchResults
          query={data.query}
          employees={data.employees}
          projects={data.projects}
          tasks={data.tasks}
          total={data.total}
        />
      </div>
    </main>
  );
}