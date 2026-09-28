import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const IDS = {
  admin: "11111111-1111-1111-1111-111111111111",

  employee1: "22222222-2222-2222-2222-222222222222",
  employee2: "33333333-3333-3333-3333-333333333333",
  employee3: "44444444-4444-4444-4444-444444444444",

  project1: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  project2: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",

  task1: "00000000-0000-0000-0000-000000000001",
  task2: "00000000-0000-0000-0000-000000000002",
  task3: "00000000-0000-0000-0000-000000000003",
  task4: "00000000-0000-0000-0000-000000000004",
  task5: "00000000-0000-0000-0000-000000000005",
  task6: "00000000-0000-0000-0000-000000000006",
  task7: "00000000-0000-0000-0000-000000000007",
  task8: "00000000-0000-0000-0000-000000000008",
} as const;

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed is disabled in production.");
  }

  const adminPassword = await hash("Admin123!DevOnly", 12);
  const employeePassword = await hash("Employee123!DevOnly", 12);

  await prisma.user.upsert({
    where: { id: IDS.admin },
    update: {
      name: "مدیر سیستم",
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      id: IDS.admin,
      name: "مدیر سیستم",
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  const employees = [
    {
      id: IDS.employee1,
      name: "علی رضایی",
      email: "employee1@example.com",
    },
    {
      id: IDS.employee2,
      name: "محمد احمدی",
      email: "employee2@example.com",
    },
    {
      id: IDS.employee3,
      name: "سارا کریمی",
      email: "employee3@example.com",
    },
  ];

  for (const employee of employees) {
    await prisma.user.upsert({
      where: { id: employee.id },
      update: {
        ...employee,
        passwordHash: employeePassword,
        role: "EMPLOYEE",
        isActive: true,
      },
      create: {
        ...employee,
        passwordHash: employeePassword,
        role: "EMPLOYEE",
        isActive: true,
      },
    });
  }

  await prisma.project.upsert({
    where: { id: IDS.project1 },
    update: {
      title: "بازطراحی وب‌سایت",
      description: "پروژه بازطراحی کامل وب‌سایت شرکت.",
      status: "IN_PROGRESS",
      startDate: new Date("2026-09-01"),
      deadline: new Date("2026-10-15"),
      createdById: IDS.admin,
    },
    create: {
      id: IDS.project1,
      title: "بازطراحی وب‌سایت",
      description: "پروژه بازطراحی کامل وب‌سایت شرکت.",
      status: "IN_PROGRESS",
      startDate: new Date("2026-09-01"),
      deadline: new Date("2026-10-15"),
      createdById: IDS.admin,
    },
  });

  await prisma.project.upsert({
    where: { id: IDS.project2 },
    update: {
      title: "داشبورد داخلی",
      description: "ساخت داشبورد مدیریتی داخلی.",
      status: "PLANNED",
      startDate: new Date("2026-09-10"),
      deadline: new Date("2026-10-30"),
      createdById: IDS.admin,
    },
    create: {
      id: IDS.project2,
      title: "داشبورد داخلی",
      description: "ساخت داشبورد مدیریتی داخلی.",
      status: "PLANNED",
      startDate: new Date("2026-09-10"),
      deadline: new Date("2026-10-30"),
      createdById: IDS.admin,
    },
  });

  const memberships = [
    { projectId: IDS.project1, userId: IDS.employee1 },
    { projectId: IDS.project1, userId: IDS.employee2 },
    { projectId: IDS.project2, userId: IDS.employee2 },
    { projectId: IDS.project2, userId: IDS.employee3 },
  ];

  for (const membership of memberships) {
    await prisma.projectMember.upsert({
      where: {
        projectId_userId: membership,
      },
      update: {},
      create: membership,
    });
  }

  const tasks = [
    {
      id: IDS.task1,
      projectId: IDS.project1,
      title: "طراحی صفحه اصلی",
      description: "طراحی UI صفحه اصلی وب‌سایت.",
      status: "COMPLETED" as const,
      priority: "HIGH" as const,
      assignedToId: IDS.employee1,
      createdById: IDS.admin,
      deadline: new Date("2026-09-10T18:00:00Z"),
      completedAt: new Date("2026-09-09T15:00:00Z"),
    },
    {
      id: IDS.task2,
      projectId: IDS.project1,
      title: "پیاده‌سازی Header",
      description: "پیاده‌سازی Header ریسپانسیو.",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      assignedToId: IDS.employee1,
      createdById: IDS.admin,
      deadline: new Date("2026-09-30T18:00:00Z"),
      completedAt: null,
    },
    {
      id: IDS.task3,
      projectId: IDS.project1,
      title: "پیاده‌سازی Footer",
      description: "ساخت Footer و لینک‌های اصلی.",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
      assignedToId: IDS.employee2,
      createdById: IDS.admin,
      deadline: new Date("2026-10-02T18:00:00Z"),
      completedAt: null,
    },
    {
      id: IDS.task4,
      projectId: IDS.project1,
      title: "بهینه‌سازی تصاویر",
      description: "بهینه‌سازی تصاویر و بررسی Performance.",
      status: "COMPLETED" as const,
      priority: "MEDIUM" as const,
      assignedToId: IDS.employee2,
      createdById: IDS.admin,
      deadline: new Date("2026-09-15T18:00:00Z"),
      completedAt: new Date("2026-09-14T12:00:00Z"),
    },
    {
      id: IDS.task5,
      projectId: IDS.project2,
      title: "طراحی داشبورد",
      description: "طراحی ساختار اولیه داشبورد.",
      status: "IN_PROGRESS" as const,
      priority: "URGENT" as const,
      assignedToId: IDS.employee2,
      createdById: IDS.admin,
      deadline: new Date("2026-09-28T18:00:00Z"),
      completedAt: null,
    },
    {
      id: IDS.task6,
      projectId: IDS.project2,
      title: "طراحی نمودارها",
      description: "طراحی Chartهای مدیریتی.",
      status: "TODO" as const,
      priority: "HIGH" as const,
      assignedToId: IDS.employee3,
      createdById: IDS.admin,
      deadline: new Date("2026-10-05T18:00:00Z"),
      completedAt: null,
    },
    {
      id: IDS.task7,
      projectId: IDS.project2,
      title: "بررسی API",
      description: "بررسی Endpointهای موردنیاز.",
      status: "COMPLETED" as const,
      priority: "HIGH" as const,
      assignedToId: IDS.employee3,
      createdById: IDS.admin,
      deadline: new Date("2026-09-20T18:00:00Z"),
      completedAt: new Date("2026-09-19T16:00:00Z"),
    },
    {
      id: IDS.task8,
      projectId: IDS.project2,
      title: "تست اولیه",
      description: "تست اولیه سیستم و ثبت مشکلات.",
      status: "TODO" as const,
      priority: "URGENT" as const,
      assignedToId: IDS.employee3,
      createdById: IDS.admin,
      deadline: new Date("2026-09-15T18:00:00Z"),
      completedAt: null,
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: task,
      create: task,
    });
  }

  console.log("Sepehrino development seed completed.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });