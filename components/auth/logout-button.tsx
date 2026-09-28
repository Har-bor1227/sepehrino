"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
} from "lucide-react";

import { logoutAction } from "@/lib/auth/actions";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [
    isPending,
    startTransition,
  ] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();

      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      disabled={isPending}
      className="w-full rounded-2xl border-red-200/60 bg-red-50/45 text-red-700 shadow-none hover:bg-red-50/75 hover:text-red-800"
      aria-label="خروج از حساب کاربری"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}

      <span>
        {isPending
          ? "در حال خروج..."
          : "خروج از حساب"}
      </span>
    </Button>
  );
}