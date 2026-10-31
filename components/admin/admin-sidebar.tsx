"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Search,
  Users,
  X,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type AdminSidebarProps = {
  userName: string;
  unreadNotifications: number;
};

const navigationItems = [
  {
    href: "/admin/dashboard",
    label: "داشبورد",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/quick-access",
    label: "دسترسی سریع",
    icon: Zap,
  },
  {
    href: "/admin/employees",
    label: "کارمندان",
    icon: Users,
  },
  {
    href: "/admin/projects",
    label: "پروژه‌ها",
    icon: FolderKanban,
  },
  {
    href: "/admin/tasks",
    label: "Taskها",
    icon: ClipboardList,
  },
  {
    href: "/admin/reports",
    label: "گزارش‌ها",
    icon: BarChart3,
  },
  {
    href: "/admin/search",
    label: "جست‌وجو",
    icon: Search,
  },
  {
    href: "/admin/notifications",
    label: "اعلان‌ها",
    icon: Bell,
  },
];

function isActivePath(
  pathname: string,
  href: string,
) {
  if (href === "/admin/dashboard") {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

function BrandMark() {
  return (
    <div
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
    >
      <CheckCircle2 className="size-5" />
    </div>
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
      .join("") || "م";

  return (
    <div
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-bold text-foreground"
    >
      {initials}
    </div>
  );
}

function NavigationList({
  pathname,
  unreadNotifications,
  onNavigate,
}: {
  pathname: string;
  unreadNotifications: number;
  onNavigate?: () => void;
}) {
  return (
    <nav
      aria-label="ناوبری پنل مدیریت"
    >
      <ul className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const active = isActivePath(
            pathname,
            item.href,
          );

          const showBadge =
            item.href ===
              "/admin/notifications" &&
            unreadNotifications > 0;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={
                  active ? "page" : undefined
                }
                className={`relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                  active
                    ? "bg-accent font-bold text-accent-foreground"
                    : "font-medium text-slate-600 hover:bg-muted hover:text-foreground"
                }`}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-2 start-0 w-1 rounded-full bg-primary"
                  />
                ) : null}

                <Icon
                  aria-hidden="true"
                  className="size-5 shrink-0"
                />

                <span className="min-w-0 flex-1 truncate">
                  {item.label}
                </span>

                {showBadge ? (
                  <span className="min-w-6 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-xs font-bold leading-none text-white">
                    {unreadNotifications.toLocaleString(
                      "fa-IR",
                    )}
                    <span className="sr-only">
                      {" "}
                      اعلان خوانده‌نشده
                    </span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function AccountBlock({
  userName,
}: {
  userName: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar userName={userName} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">
          {userName}
        </p>

        <p className="text-xs text-muted-foreground">
          مدیر سیستم
        </p>
      </div>

      <ThemeToggle />
    </div>
  );
}

export function AdminSidebar({
  userName,
  unreadNotifications,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const drawerRef =
    useRef<HTMLElement | null>(null);

  const closeButtonRef =
    useRef<HTMLButtonElement | null>(null);

  /*
    منوی موبایل مثل یک پنجره‌ی گفت‌وگو رفتار می‌کند:
    فوکوس داخلش می‌ماند، Escape می‌بندد، اسکرول صفحه‌ی زیرین قفل
    می‌شود و پس از بسته‌شدن فوکوس به دکمه‌ی منو برمی‌گردد.
  */
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previouslyFocused =
      document.activeElement as HTMLElement | null;

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }

      if (
        event.key !== "Tab" ||
        !drawerRef.current
      ) {
        return;
      }

      const focusable =
        drawerRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];

      const last =
        focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow =
        originalOverflow;

      previouslyFocused?.focus();
    };
  }, [mobileOpen]);

  return (
    <>
      {/* دسکتاپ: ستون ثابت سمت راست */}
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-64 border-l lg:block">
        <div className="glass-sidebar flex h-full flex-col">
          <div className="flex items-center gap-3 px-4 py-5">
            <BrandMark />

            <div className="min-w-0">
              <p className="text-base font-extrabold text-foreground">
                فرتاک تسکینگ
              </p>

              <p className="text-xs text-muted-foreground">
                پنل مدیریت
              </p>
            </div>
          </div>

          <div className="thin-scrollbar flex-1 overflow-y-auto px-3 py-2">
            <NavigationList
              pathname={pathname}
              unreadNotifications={
                unreadNotifications
              }
            />
          </div>

          <div className="border-t border-border p-4">
            <AccountBlock userName={userName} />
          </div>
        </div>
      </aside>

      {/* موبایل و تبلت: نوار بالا */}
      <header className="sticky top-0 z-30 border-b border-border bg-card pt-[env(safe-area-inset-top)] lg:hidden">
        <div className="flex h-14 items-center gap-2 px-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="باز کردن منو"
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-menu"
          >
            <Menu
              aria-hidden="true"
              className="size-5"
            />
          </Button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-foreground">
              فرتاک تسکینگ
            </p>

            <p className="truncate text-xs text-muted-foreground">
              پنل مدیریت
            </p>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="بستن منو"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/50"
          />

          <aside
            id="admin-mobile-menu"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="منوی پنل مدیریت"
            className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col border-l border-border shadow-[var(--shadow-float)]"
          >
            <div className="glass-sidebar flex h-full flex-col pb-[env(safe-area-inset-bottom)]">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
                <BrandMark />

                <div className="min-w-0 flex-1">
                  <p className="text-base font-extrabold text-foreground">
                    فرتاک تسکینگ
                  </p>

                  <p className="text-xs text-muted-foreground">
                    پنل مدیریت
                  </p>
                </div>

                <Button
                  ref={closeButtonRef}
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  aria-label="بستن منو"
                >
                  <X
                    aria-hidden="true"
                    className="size-5"
                  />
                </Button>
              </div>

              <div className="thin-scrollbar flex-1 overflow-y-auto px-3 py-4">
                <NavigationList
                  pathname={pathname}
                  unreadNotifications={
                    unreadNotifications
                  }
                  onNavigate={() =>
                    setMobileOpen(false)
                  }
                />
              </div>

              <div className="border-t border-border p-4">
                <AccountBlock
                  userName={userName}
                />
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
