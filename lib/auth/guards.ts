import "server-only";

import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";

export async function requireUser() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.user.role !== "ADMIN") {
    redirect("/employee/dashboard");
  }

  return session;
}

export async function requireEmployee() {
  const session = await requireUser();

  if (session.user.role !== "EMPLOYEE") {
    redirect("/admin/dashboard");
  }

  return session;
}