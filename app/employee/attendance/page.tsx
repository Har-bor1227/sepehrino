import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  RefreshCw,
  Timer,
} from "lucide-react";
import { AttendanceActions } from "@/components/employee/attendance-actions";
import { requireEmployee } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import {
  getHozorinoAttendance,
  type HozorinoAttendanceResult,
} from "@/lib/services/hozorino-integration.service";

export const dynamic = "force-dynamic";

const TIME_ZONE =
  process.env.APP_TIMEZONE || "Asia/Tehran";

function formatTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatWorkDate(value: string) {
  const parts = value.split("-").map(Number);

  if (
    parts.length !== 3 ||
    parts.some((part) => !Number.isInteger(part))
  ) {
    return value;
  }

  const [year, month, day] = parts;

  const date = new Date(
    Date.UTC(year, month - 1, day, 12),
  );

  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

function formatMinutes(totalMinutes: number) {
  const safeMinutes = Number.isFinite(totalMinutes)
    ? Math.abs(Math.floor(totalMinutes))
    : 0;

  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours === 0 && minutes === 0) {
    return "۰ دقیقه";
  }

  if (hours === 0) {
    return `${minutes.toLocaleString("fa-IR")} دقیقه`;
  }

  if (minutes === 0) {
    return `${hours.toLocaleString("fa-IR")} ساعت`;
  }

  return `${hours.toLocaleString("fa-IR")} ساعت و ${minutes.toLocaleString("fa-IR")} دقیقه`;
}

function formatBalance(totalMinutes: number) {
  if (totalMinutes === 0) {
    return "۰ دقیقه";
  }

  const sign = totalMinutes > 0 ? "+" : "−";

  return `${sign}${formatMinutes(totalMinutes)}`;
}

function getStatusStyle(state: string) {
  switch (state) {
    case "PRESENT":
      return {
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
        icon: CheckCircle2,
      };

    case "WORKING":
      return {
        badge: "border-blue-200 bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
        icon: Clock3,
      };

    case "ABSENT":
      return {
        badge: "border-rose-200 bg-rose-50 text-rose-700",
        dot: "bg-rose-500",
        icon: AlertCircle,
      };

    case "LEAVE":
      return {
        badge: "border-violet-200 bg-violet-50 text-violet-700",
        dot: "bg-violet-500",
        icon: CalendarDays,
      };

    case "HOLIDAY":
      return {
        badge: "border-violet-200 bg-violet-50 text-violet-700",
        dot: "bg-violet-500",
        icon: CalendarDays,
      };

    case "NON_WORKING":
      return {
        badge: "border-slate-200 bg-slate-100 text-slate-600",
        dot: "bg-slate-400",
        icon: CalendarDays,
      };

    case "FUTURE":
      return {
        badge: "border-amber-200 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
        icon: Clock3,
      };

    default:
      return {
        badge: "border-slate-200 bg-slate-100 text-slate-600",
        dot: "bg-slate-400",
        icon: Clock3,
      };
  }
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string;
  value: string;
  icon: typeof Clock3;
  description?: string;
}) {
  return (
    <div className="glass-card min-w-0 rounded-[1.5rem] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>

        <div className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Icon className="size-5 text-slate-600" />
        </div>
      </div>

      <p className="mt-4 break-words text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
        {value}
      </p>

      {description ? (
        <p className="mt-2 text-xs leading-5 text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function InformationPanel({
  title,
  description,
  icon: Icon,
  tone = "slate",
}: {
  title: string;
  description: string;
  icon: typeof AlertCircle;
  tone?: "slate" | "amber" | "red";
}) {
  const styles = {
    slate: {
      container: "border-slate-200 bg-slate-50/80",
      icon: "bg-white text-slate-600",
      title: "text-slate-900",
      description: "text-slate-500",
    },
    amber: {
      container: "border-amber-200 bg-amber-50/60",
      icon: "bg-white text-amber-700",
      title: "text-amber-900",
      description: "text-amber-800",
    },
    red: {
      container: "border-red-200 bg-red-50/60",
      icon: "bg-white text-red-600",
      title: "text-red-900",
      description: "text-red-800",
    },
  }[tone];

  return (
    <div
      role={tone === "red" ? "alert" : "status"}
      className={`rounded-2xl border p-5 sm:p-6 ${styles.container}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon className="size-5" />
        </div>

        <div className="min-w-0">
          <h2 className={`font-bold ${styles.title}`}>
            {title}
          </h2>

          <p className={`mt-2 text-sm leading-7 ${styles.description}`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function AttendanceContent({
  result,
}: {
  result: HozorinoAttendanceResult;
}) {
  const { attendance, employee } = result;
  const status = getStatusStyle(attendance.state);
  const StatusIcon = status.icon;

  const scheduledStart = (() => {
    const minutes = attendance.scheduledStartMinutes;
    const date = new Date(
      Date.UTC(2000, 0, 1, 0, minutes),
    );

    return new Intl.DateTimeFormat("fa-IR", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  })();

  const scheduledEnd = (() => {
    const minutes = attendance.scheduledEndMinutes;
    const date = new Date(
      Date.UTC(2000, 0, 1, 0, minutes),
    );

    return new Intl.DateTimeFormat("fa-IR", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  })();

  return (
    <>
      <section className="glass-strong overflow-hidden rounded-[2rem] p-5 sm:p-7 lg:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-400">
              {formatWorkDate(attendance.workDate)}
            </p>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              سلام، {employee.firstName}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
              وضعیت حضور امروز شما از اطلاعات رسمی حضورینو نمایش داده می‌شود.
            </p>
          </div>

          <div
            className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${status.badge}`}
          >
            <StatusIcon className="size-4" />
            {attendance.stateLabel}
          </div>
        </div>

        {attendance.isHoliday && attendance.holiday ? (
          <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
            <p className="font-bold text-violet-800">
              {attendance.holiday.title}
            </p>

            {attendance.holiday.description ? (
              <p className="mt-1 text-sm leading-6 text-violet-700">
                {attendance.holiday.description}
              </p>
            ) : null}
          </div>
        ) : null}

        {attendance.isLeave && attendance.leave ? (
          <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
            <p className="font-bold text-violet-800">
              مرخصی تأییدشده
            </p>

            <p className="mt-1 text-sm leading-6 text-violet-700">
              نوع مرخصی:{" "}
              {attendance.leave.type === "ANNUAL"
                ? "استحقاقی"
                : attendance.leave.type === "SICK"
                  ? "استعلاجی"
                  : attendance.leave.type === "UNPAID"
                    ? "بدون حقوق"
                    : "سایر"}
            </p>

            {attendance.leave.reason ? (
              <p className="mt-1 text-sm leading-6 text-violet-700">
                {attendance.leave.reason}
              </p>
            ) : null}
          </div>
        ) : null}

        {!attendance.isWorkingDay &&
        !attendance.isHoliday &&
        !attendance.isLeave ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/50 p-4">
            <p className="text-sm leading-7 text-slate-600">
              امروز طبق برنامه ثبت‌شده در حضورینو روز کاری شما نیست.
            </p>
          </div>
        ) : null}
      </section>
        <AttendanceActions attendance={attendance} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="زمان ورود"
          value={formatTime(attendance.checkIn)}
          icon={LogIn}
          description="زمان ثبت‌شده در حضورینو"
        />

        <SummaryCard
          label="زمان خروج"
          value={formatTime(attendance.checkOut)}
          icon={LogOut}
          description="خروج نهایی امروز"
        />

        <SummaryCard
          label="کارکرد امروز"
          value={formatMinutes(attendance.workedMinutes)}
          icon={Timer}
          description="پس از کسر خروج‌های موقت"
        />

        <SummaryCard
          label="ساعات موظفی"
          value={formatMinutes(attendance.scheduledMinutes)}
          icon={Clock3}
          description="بر اساس برنامه کاری معتبر"
        />
      </section>

      <section className="glass-card overflow-hidden rounded-[2rem]">
        <div className="border-b border-white/50 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="glass-icon flex size-10 items-center justify-center rounded-2xl">
              <CalendarDays className="size-5 text-slate-600" />
            </div>

            <div>
              <h2 className="font-extrabold text-slate-900">
                جزئیات روز کاری
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                اطلاعات محاسبه‌شده توسط حضورینو
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-200/60 sm:grid-cols-2 xl:grid-cols-3">
          <div className="bg-white/70 p-5">
            <p className="text-sm text-slate-400">
              شروع برنامه
            </p>
            <p className="mt-2 font-bold text-slate-900">
              {scheduledStart}
            </p>
          </div>

          <div className="bg-white/70 p-5">
            <p className="text-sm text-slate-400">
              پایان برنامه
            </p>
            <p className="mt-2 font-bold text-slate-900">
              {scheduledEnd}
            </p>
          </div>

          <div className="bg-white/70 p-5">
            <p className="text-sm text-slate-400">
              تأخیر ورود
            </p>
            <p className="mt-2 font-bold text-slate-900">
              {formatMinutes(attendance.lateMinutes)}
            </p>
          </div>

          <div className="bg-white/70 p-5">
            <p className="text-sm text-slate-400">
              تعجیل در خروج
            </p>
            <p className="mt-2 font-bold text-slate-900">
              {formatMinutes(attendance.earlyLeaveMinutes)}
            </p>
          </div>

          <div className="bg-white/70 p-5">
            <p className="text-sm text-slate-400">
              اضافه‌کاری
            </p>
            <p className="mt-2 font-bold text-slate-900">
              {formatMinutes(attendance.overtimeMinutes)}
            </p>
          </div>

          <div className="bg-white/70 p-5">
            <p className="text-sm text-slate-400">
              تراز ساعات
            </p>
            <p
              className={`mt-2 font-bold ${
                attendance.balanceMinutes > 0
                  ? "text-emerald-700"
                  : attendance.balanceMinutes < 0
                    ? "text-rose-700"
                    : "text-slate-900"
              }`}
            >
              {formatBalance(attendance.balanceMinutes)}
            </p>
          </div>
        </div>

        {attendance.note ? (
          <div className="border-t border-white/50 p-5 sm:p-6">
            <p className="text-sm font-bold text-slate-700">
              توضیحات ثبت‌شده
            </p>

            <p className="mt-2 text-sm leading-7 text-slate-500">
              {attendance.note}
            </p>
          </div>
        ) : null}
      </section>

      <section className="glass-card rounded-[1.5rem] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-xl">
            <RefreshCw className="size-5 text-slate-600" />
          </div>

          <div>
            <h2 className="font-bold text-slate-800">
              اطلاعات همگام‌شده از حضورینو
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-500">
              سوابق و محاسبات در حضورینو نگهداری می‌شوند. در این صفحه فقط اطلاعات حساب متصل‌شده نمایش داده شده است.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default async function EmployeeAttendancePage() {
  const session = await requireEmployee();

  const employee = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      role: "EMPLOYEE",
      isActive: true,
    },

    select: {
      id: true,
      hozorinoUserId: true,
    },
  });

  let attendanceResult:
    HozorinoAttendanceResult | null = null;

  let integrationFailed = false;

  if (employee?.hozorinoUserId) {
    try {
      attendanceResult =
        await getHozorinoAttendance(
          employee.hozorinoUserId,
        );
    } catch (error) {
      console.error(
        "Employee attendance page integration error:",
        error,
      );

      integrationFailed = true;
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen"
    >
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <CalendarDays className="size-4" />
              پنل کارمند
            </div>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              حضور و غیاب من
            </h1>

            <p className="mt-2 text-sm leading-7 text-slate-500">
              وضعیت حضور و ساعات کاری خود را مشاهده کنید.
            </p>
          </div>

          <Link
            href="/employee/dashboard"
            className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/45 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white/70"
          >
            <ArrowRight className="size-4" />
            بازگشت به داشبورد
          </Link>
        </section>

        {!employee?.hozorinoUserId ? (
          <InformationPanel
            title="حساب حضورینو هنوز متصل نشده است"
            description="برای مشاهده حضور و غیاب، از مدیر سامانه بخواهید حساب کاربری شما را در بخش مدیریت کارمندان به حضورینو متصل کند."
            icon={AlertCircle}
            tone="amber"
          />
        ) : integrationFailed ? (
          <InformationPanel
            title="دریافت اطلاعات حضور امکان‌پذیر نیست"
            description="ارتباط با حضورینو در حال حاضر برقرار نشد. لطفاً کمی بعد دوباره تلاش کنید یا موضوع را به مدیر سامانه اطلاع دهید."
            icon={AlertCircle}
            tone="red"
          />
        ) : attendanceResult ? (
          <AttendanceContent result={attendanceResult} />
        ) : (
          <InformationPanel
            title="اطلاعات حضور در دسترس نیست"
            description="در حال حاضر اطلاعاتی برای نمایش دریافت نشده است."
            icon={Clock3}
          />
        )}
      </div>
    </main>
  );
}