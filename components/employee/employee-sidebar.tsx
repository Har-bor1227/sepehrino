"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";

type EmployeeSidebarProps = {
  userName: string;
  unreadNotifications: number;
};

const navigationItems = [
  {
    href: "/employee/dashboard",
    label: "داشبورد",
    icon: LayoutDashboard,
  },
  {
    href: "/employee/projects",
    label: "پروژه‌های من",
    icon: FolderKanban,
  },
  {
    href: "/employee/tasks",
    label: "Taskهای من",
    icon: ClipboardList,
  },
  {
    href: "/employee/search",
    label: "جست‌وجو",
    icon: Search,
  },
  {
    href: "/employee/notifications",
    label: "اعلان‌ها",
    icon: Bell,
  },
];

function isActivePath(
  pathname: string,
  href: string,
) {
  if (href === "/employee/dashboard") {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

function UserAvatar({
  userName,
}: {
  userName: string;
}) {
  const initials =
    userName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.slice(0, 1))
      .join("") || "ک";

  return (
    <div className="glass-icon flex size-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-slate-700">
      {initials}
    </div>
  );
}

export function EmployeeSidebar({
  userName,
  unreadNotifications,
}: EmployeeSidebarProps) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const navigation = (
    <nav
      aria-label="ناوبری پنل کارمند"
      className="space-y-2"
    >
      {navigationItems.map((item) => {
        const Icon = item.icon;

        const active = isActivePath(
          pathname,
          item.href,
        );

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() =>
              setMobileOpen(false)
            }
            aria-current={
              active ? "page" : undefined
            }
            className={`group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              active
                ? "border border-white/55 bg-slate-900 text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)]"
                : "border border-transparent text-slate-600 hover:border-white/55 hover:bg-white/45 hover:text-slate-950 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
            }`}
          >
            {active ? (
              <span
                aria-hidden="true"
                className="absolute inset-y-2 right-0 w-1 rounded-l-full bg-white/80"
              />
            ) : null}

            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition ${
                active
                  ? "bg-white/12 text-white"
                  : "bg-white/42 text-slate-500 group-hover:bg-white/70 group-hover:text-slate-900"
              }`}
            >
              <Icon className="size-4.5" />
            </span>

            <span className="min-w-0 flex-1 truncate">
              {item.label}
            </span>

            {item.href ===
              "/employee/notifications" &&
              unreadNotifications > 0 ? (
              <span
                className={`flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                  active
                    ? "bg-white/15 text-white"
                    : "bg-red-500 text-white shadow-[0_5px_14px_rgba(239,68,68,0.24)]"
                }`}
              >
                {unreadNotifications.toLocaleString(
                  "fa-IR",
                )}
              </span>
            ) : active ? (
              <ChevronLeft className="size-4 shrink-0 text-white/55" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const profileCard = (
    <div className="rounded-3xl border border-white/55 bg-white/42 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <UserAvatar userName={userName} />

        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-400">
            حساب کاربری
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-800">
            {userName}
          </p>

          <p className="mt-1 text-[11px] font-medium text-slate-400">
            کارمند
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-64 border-l border-white/60 lg:block">
        <div className="glass-sidebar flex h-full flex-col">
          <div className="px-4 pb-4 pt-5">
            <div className="rounded-3xl border border-white/65 bg-white/48 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_28px_rgba(15,23,42,0.04)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                  <CheckCircle2 className="size-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-extrabold tracking-tight text-slate-900">
                    سپهرینو
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    پنل کارمند
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-white/50 pt-3">
                <p className="truncate text-xs font-semibold text-slate-700">
                  {userName}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  دسترسی کارمند
                </p>
              </div>
            </div>
          </div>

          <div className="thin-scrollbar flex-1 overflow-y-auto px-4 py-2">
            {navigation}
          </div>

          <div className="mt-auto border-t border-white/45 p-4">
            {profileCard}
          </div>
        </div>
      </aside>

      <div className="sticky top-0 z-30 border-b border-white/60 lg:hidden">
        <div className="glass-sidebar px-3 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMobileOpen(true)
              }
              aria-label="باز کردن منو"
              aria-expanded={mobileOpen}
              className="glass-icon flex size-11 shrink-0 items-center justify-center rounded-2xl text-slate-700 transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/10"
            >
              <Menu className="size-5" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold tracking-tight text-slate-900">
                سپهرینو
              </p>

              <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                پنل کارمند · {userName}
              </p>
            </div>

            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/55 bg-white/42 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl">
              <UserRound className="size-5 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="بستن منو"
            onClick={() =>
              setMobileOpen(false)
            }
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-[3px]"
          />

          <aside className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col overflow-hidden border-l border-white/65">
            <div className="glass-sidebar flex h-full flex-col shadow-[0_0_80px_rgba(15,23,42,0.2)]">
              <div className="border-b border-white/45 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                    <CheckCircle2 className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-slate-900">
                      سپهرینو
                    </p>

                    <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
                      پنل کارمند · {userName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    aria-label="بستن منو"
                    className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-white/75 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/10"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              <div className="thin-scrollbar flex-1 overflow-y-auto px-4 py-5">
                {navigation}
              </div>

              <div className="border-t border-white/45 p-4">
                {profileCard}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}