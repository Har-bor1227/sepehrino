import "dotenv/config";

import { prisma } from "../lib/db/prisma";
import {
  createSession,
  deleteSession,
  getSession,
} from "../lib/auth/session";

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      email: "admin@example.com",
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    throw new Error("Seed admin user was not found.");
  }

  console.log("Creating session...");

  const session = await createSession(user.id);

  console.log("Session created:", {
    id: session.id,
    userId: session.userId,
    expiresAt: session.expiresAt,
  });

  console.log("Reading session...");

  const currentSession = await getSession();

  console.log("Current session:", currentSession);

  console.log("Deleting session...");

  await deleteSession();

  console.log("Session deleted.");

  const deletedSession = await getSession();

  console.log("Session after deletion:", deletedSession);
}

main()
  .catch((error) => {
    console.error("Session test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });