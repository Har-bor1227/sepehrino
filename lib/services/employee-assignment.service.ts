import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";

export async function getActiveEmployeesForAssignment() {
  await requireAdmin();

  return prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}