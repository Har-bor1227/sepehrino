import "server-only";

import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";

export type LoginResult =
  | {
      success: true;
      user: {
        id: string;
        name: string;
        email: string;
        role: "ADMIN" | "EMPLOYEE";
      };
    }
  | {
      success: false;
      reason: "INVALID_CREDENTIALS" | "ACCOUNT_DISABLED";
    };

export async function authenticateUser(
  email: string,
  password: string,
): Promise<LoginResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    return {
      success: false,
      reason: "INVALID_CREDENTIALS",
    };
  }

  if (!user.isActive) {
    return {
      success: false,
      reason: "ACCOUNT_DISABLED",
    };
  }

  const passwordIsValid = await verifyPassword(
    password,
    user.passwordHash,
  );

  if (!passwordIsValid) {
    return {
      success: false,
      reason: "INVALID_CREDENTIALS",
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}