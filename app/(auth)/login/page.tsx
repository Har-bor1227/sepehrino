import {
  CheckCircle2,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="app-background relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[8%] top-[12%] size-72 rounded-full bg-sky-300/15 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[8%] left-[7%] size-80 rounded-full bg-violet-300/12 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[38%] top-[40%] size-64 rounded-full bg-emerald-300/8 blur-3xl"
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="grid w-full max-w-[1080px] overflow-hidden rounded-[2.25rem] border border-white/60 bg-white/25 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative hidden overflow-hidden border-l border-white/45 bg-slate-900 p-8 text-white lg:flex lg:flex-col lg:justify-between lg:p-10">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 size-72 rounded-full bg-white/8 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-20 size-80 rounded-full bg-white/6 blur-3xl"
            />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/70">
                <Sparkles className="size-3.5" />
                محیط مدیریت یکپارچه
              </div>

              <div className="mt-8 flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg">
                <Layers3 className="size-7" />
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight">
                فرتاک تسکینگ
              </h1>

              <p className="mt-3 max-w-sm text-sm leading-7 text-white/60">
                مدیریت پروژه، Taskها، کارمندان و گزارش‌ها در یک فضای متمرکز و سریع.
              </p>
            </div>

            <div className="relative space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/6 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/8">
                  <ShieldCheck className="size-4.5 text-white/80" />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    دسترسی امن
                  </p>

                  <p className="mt-1 text-xs text-white/50">
                    ورود و دسترسی بر اساس نقش کاربر
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/6 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/8">
                  <CheckCircle2 className="size-4.5 text-white/80" />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    مدیریت متمرکز
                  </p>

                  <p className="mt-1 text-xs text-white/50">
                    پروژه‌ها و وظایف را از یک محیط دنبال کنید
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center p-5 sm:p-8 lg:p-10">
            <div className="w-full max-w-[440px]">
              <div className="mb-7 text-center lg:hidden">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.14)]">
                  <Layers3 className="size-7" />
                </div>

                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
                  فرتاک تسکینگ
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  ورود به حساب کاربری
                </p>
              </div>

              <LoginForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}