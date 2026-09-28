import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FolderKanban,
  Search,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  status?: string;
  priority?: string;
  deadline?: Date;
};

type SearchResultsProps = {
  query: string;
  employees: SearchItem[];
  projects: SearchItem[];
  tasks: SearchItem[];
  total: number;
};

const STATUS_LABELS: Record<
  string,
  string
> = {
  TODO: "در انتظار",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "تکمیل شده",
  CANCELLED: "لغو شده",
  PLANNED: "برنامه‌ریزی شده",
  ARCHIVED: "آرشیو شده",
};

const PRIORITY_LABELS: Record<
  string,
  string
> = {
  LOW: "کم",
  MEDIUM: "متوسط",
  HIGH: "زیاد",
  URGENT: "فوری",
};

function formatDate(
  date: Date,
) {
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

function getStatusClass(
  status: string,
) {
  switch (status) {
    case "IN_PROGRESS":
      return "border-blue-200/50 bg-blue-50/45 text-blue-700";

    case "COMPLETED":
      return "border-emerald-200/50 bg-emerald-50/45 text-emerald-700";

    case "CANCELLED":
      return "border-red-200/50 bg-red-50/45 text-red-700";

    case "PLANNED":
      return "border-slate-200/50 bg-slate-500/7 text-slate-600";

    case "ARCHIVED":
      return "border-slate-200/50 bg-slate-500/5 text-slate-400";

    case "TODO":
    default:
      return "border-slate-200/50 bg-slate-500/7 text-slate-600";
  }
}

function getPriorityClass(
  priority: string,
) {
  switch (priority) {
    case "MEDIUM":
      return "border-amber-200/50 bg-amber-50/45 text-amber-700";

    case "HIGH":
      return "border-orange-200/50 bg-orange-50/45 text-orange-700";

    case "URGENT":
      return "border-red-200/50 bg-red-50/45 text-red-700";

    case "LOW":
    default:
      return "border-slate-200/50 bg-slate-500/7 text-slate-600";
  }
}

function EmptySearchState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="glass-card soft-grid flex min-h-72 flex-col items-center justify-center rounded-[2rem] px-6 py-10 text-center">
      <div className="glass-icon flex size-16 items-center justify-center rounded-3xl">
        <Search className="size-7 text-slate-400" />
      </div>

      <h2 className="mt-5 text-base font-extrabold text-slate-800">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-7 text-slate-400">
        {description}
      </p>
    </section>
  );
}

function ResultSection({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: LucideIcon;
  items: SearchItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="glass-card overflow-hidden rounded-[2rem]">
      <div className="flex flex-col gap-3 border-b border-white/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
            <Icon className="size-5 text-slate-600" />
          </div>

          <div>
            <h2 className="font-extrabold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {items.length.toLocaleString(
                "fa-IR",
              )}{" "}
              نتیجه
            </p>
          </div>
        </div>

        <span className="glass-chip w-fit rounded-full px-3 py-1.5 text-[11px] font-bold text-slate-400">
          نتیجه‌های قابل دسترس
        </span>
      </div>

      <div className="divide-y divide-white/30">
        {items.map(
          (item) => (
            <Link
              key={
                item.id
              }
              href={
                item.href
              }
              className="group block p-5 transition hover:bg-white/22 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="glass-icon flex size-11 shrink-0 items-center justify-center rounded-2xl">
                  <Icon className="size-5 text-slate-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-800">
                        {
                          item.title
                        }
                      </h3>

                      <p className="mt-1 truncate text-sm text-slate-400">
                        {
                          item.subtitle
                        }
                      </p>
                    </div>

                    <span className="hidden shrink-0 rounded-xl bg-white/30 p-2 text-slate-300 transition group-hover:text-slate-500 sm:block">
                      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {item.status ? (
                      <span
                        className={`rounded-full border px-2.5 py-1.5 text-[11px] font-bold ${getStatusClass(
                          item.status,
                        )}`}
                      >
                        {STATUS_LABELS[
                          item.status
                        ] ??
                          item.status}
                      </span>
                    ) : null}

                    {item.priority ? (
                      <span
                        className={`rounded-full border px-2.5 py-1.5 text-[11px] font-bold ${getPriorityClass(
                          item.priority,
                        )}`}
                      >
                        اولویت{" "}
                        {
                          PRIORITY_LABELS[
                            item.priority
                          ]
                        }
                      </span>
                    ) : null}

                    <span className="glass-chip rounded-full px-2.5 py-1.5 text-[11px] font-medium text-slate-400">
                      {
                        item.meta
                      }
                    </span>

                    {item.deadline ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/45 bg-white/22 px-2.5 py-1.5 text-[11px] font-medium text-slate-400">
                        <CalendarDays className="size-3.5" />
                        {formatDate(
                          item.deadline,
                        )}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end sm:hidden">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                  مشاهده
                  <ArrowLeft className="size-3.5" />
                </span>
              </div>
            </Link>
          ),
        )}
      </div>
    </section>
  );
}

export function SearchResults({
  query,
  employees,
  projects,
  tasks,
  total,
}: SearchResultsProps) {
  if (query.length < 2) {
    return (
      <EmptySearchState
        title="جست‌وجو را شروع کنید"
        description="برای جست‌وجو حداقل دو کاراکتر وارد کنید."
      />
    );
  }

  if (total === 0) {
    return (
      <EmptySearchState
        title="نتیجه‌ای پیدا نشد"
        description={`برای «${query}» نتیجه‌ای در بخش‌های قابل دسترس شما پیدا نشد.`}
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="glass-card rounded-[1.75rem] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="glass-icon flex size-9 items-center justify-center rounded-xl">
              <Search className="size-4 text-slate-500" />
            </div>

            <p className="text-sm text-slate-500">
              نتایج جست‌وجو برای{" "}
              <span className="font-extrabold text-slate-800">
                «{query}»
              </span>
            </p>
          </div>

          <span className="glass-chip w-fit rounded-full px-3 py-1.5 text-xs font-bold text-slate-400">
            {total.toLocaleString(
              "fa-IR",
            )}{" "}
            نتیجه
          </span>
        </div>
      </section>

      <ResultSection
        title="کارمندان"
        icon={UserRound}
        items={employees}
      />

      <ResultSection
        title="پروژه‌ها"
        icon={FolderKanban}
        items={projects}
      />

      <ResultSection
        title="Taskها"
        icon={ClipboardList}
        items={tasks}
      />
    </div>
  );
}