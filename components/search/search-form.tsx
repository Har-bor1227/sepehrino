import {
  ArrowLeft,
  Search,
} from "lucide-react";

type SearchFormProps = {
  action: string;
  defaultValue: string;
};

export function SearchForm({
  action,
  defaultValue,
}: SearchFormProps) {
  return (
    <form
      method="GET"
      action={action}
      className="glass-card rounded-[1.75rem] p-3 sm:p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            name="q"
            defaultValue={
              defaultValue
            }
            autoComplete="off"
            placeholder="نام کارمند، پروژه یا Task را جست‌وجو کنید..."
            className="glass-field h-12 w-full rounded-2xl pr-12 pl-4 text-sm font-medium text-slate-800 outline-none"
          />
        </div>

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition hover:bg-slate-800"
        >
          <Search className="size-4" />
          جست‌وجو
          <ArrowLeft className="size-4 text-white/60" />
        </button>
      </div>
    </form>
  );
}