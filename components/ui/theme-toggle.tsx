"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains(
    "dark",
  );
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle({
  className,
}: {
  className?: string;
}) {
  const isDark = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  function toggleTheme() {
    const next = !isDark;

    document.documentElement.classList.toggle(
      "dark",
      next,
    );

    try {
      localStorage.setItem(
        "theme",
        next ? "dark" : "light",
      );
    } catch {
      /* ذخیره‌سازی در دسترس نیست؛ تم فقط برای همین بازدید می‌ماند */
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label={
        isDark
          ? "فعال‌سازی حالت روشن"
          : "فعال‌سازی حالت تاریک"
      }
    >
      {isDark ? (
        <Sun aria-hidden="true" className="size-5" />
      ) : (
        <Moon aria-hidden="true" className="size-5" />
      )}
    </Button>
  );
}
