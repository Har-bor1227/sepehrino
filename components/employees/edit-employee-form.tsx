"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  AlertCircle,
  CheckCircle2,
  Link2,
  Loader2,
  RefreshCw,
  Save,
  Unlink,
} from "lucide-react";

import {
  getHozorinoEmployeesAction,
  updateEmployeeAction,
  updateEmployeeHozorinoLinkAction,
} from "@/lib/actions/employee.actions";

import { updateEmployeeSchema } from "@/lib/validations/employee";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditEmployeeFormValues = z.input<
  typeof updateEmployeeSchema
>;

type HozorinoEmployee = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
};

type EditEmployeeFormProps = {
  employee: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    hozorinoUserId?: string | null;
  };
};

export function EditEmployeeForm({
  employee,
}: EditEmployeeFormProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [
    isLoadingHozorinoEmployees,
    startLoadingHozorinoEmployees,
  ] = useTransition();

  const [
    isSavingHozorinoLink,
    startSavingHozorinoLink,
  ] = useTransition();

  const [serverError, setServerError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [
    hozorinoEmployees,
    setHozorinoEmployees,
  ] = useState<HozorinoEmployee[] | null>(null);

  const [
    selectedHozorinoUserId,
    setSelectedHozorinoUserId,
  ] = useState(
    employee.hozorinoUserId ?? "",
  );

  const [
    hozorinoError,
    setHozorinoError,
  ] = useState<string | null>(null);

  const [
    hozorinoMessage,
    setHozorinoMessage,
  ] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(
      updateEmployeeSchema,
    ),
    defaultValues: {
      name: employee.name,
      email: employee.email,
      password: "",
    },
  });

  const currentHozorinoAccountInList =
    Boolean(
      employee.hozorinoUserId &&
        hozorinoEmployees?.some(
          (item) =>
            item.id ===
            employee.hozorinoUserId,
        ),
    );

  const showCurrentHozorinoFallback =
    Boolean(employee.hozorinoUserId) &&
    (
      hozorinoEmployees === null ||
      !currentHozorinoAccountInList
    );

  function onSubmit(
    values: EditEmployeeFormValues,
  ) {
    setServerError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result =
        await updateEmployeeAction(
          employee.id,
          {
            ...values,
            ...(values.password === ""
              ? {
                  password: undefined,
                }
              : {}),
          },
        );

      if (!result.success) {
        setServerError(result.message);

        if (result.fieldErrors) {
          for (const [
            field,
            messages,
          ] of Object.entries(
            result.fieldErrors,
          )) {
            const message = messages?.[0];

            if (!message) {
              continue;
            }

            if (
              field === "name" ||
              field === "email" ||
              field === "password"
            ) {
              setError(field, {
                type: "server",
                message,
              });
            }
          }
        }

        return;
      }

      setSuccessMessage(
        "اطلاعات کارمند با موفقیت ذخیره شد.",
      );

      router.refresh();
    });
  }

  function loadHozorinoEmployees() {
    setHozorinoError(null);
    setHozorinoMessage(null);

    startLoadingHozorinoEmployees(
      async () => {
        try {
          const result =
            await getHozorinoEmployeesAction();

          if (!result.success) {
            setHozorinoError(
              result.message,
            );
            return;
          }

          setHozorinoEmployees(
            result.employees,
          );

          setHozorinoMessage(
            `${result.employees.length.toLocaleString("fa-IR")} کارمند فعال از حضورینو دریافت شد.`,
          );

          if (employee.hozorinoUserId) {
            setSelectedHozorinoUserId(
              (current) =>
                current ||
                employee.hozorinoUserId ||
                "",
            );
          }
        } catch {
          setHozorinoError(
            "دریافت فهرست کارمندان حضورینو انجام نشد.",
          );
        }
      },
    );
  }

  function saveHozorinoLink() {
    if (!selectedHozorinoUserId) {
      setHozorinoError(
        "ابتدا یک حساب حضورینو انتخاب کنید.",
      );
      return;
    }

    setHozorinoError(null);
    setHozorinoMessage(null);

    startSavingHozorinoLink(
      async () => {
        try {
          const result =
            await updateEmployeeHozorinoLinkAction(
              employee.id,
              selectedHozorinoUserId,
            );

          if (!result.success) {
            setHozorinoError(
              result.message,
            );
            return;
          }

          setSelectedHozorinoUserId(
            result.employee.hozorinoUserId ??
              "",
          );

          setHozorinoEmployees(
            (current) => {
              if (!current) {
                return current;
              }

              return current;
            },
          );

          setHozorinoMessage(
            "حساب حضورینو با موفقیت به کارمند متصل شد.",
          );

          router.refresh();
        } catch {
          setHozorinoError(
            "ذخیره اتصال حساب حضورینو انجام نشد.",
          );
        }
      },
    );
  }

  function disconnectHozorinoAccount() {
    if (!employee.hozorinoUserId) {
      return;
    }

    const confirmed = window.confirm(
      "آیا از قطع اتصال حساب حضورینو از این کارمند مطمئن هستید؟ سوابق حضور و غیاب در حضورینو باقی می‌مانند.",
    );

    if (!confirmed) {
      return;
    }

    setHozorinoError(null);
    setHozorinoMessage(null);

    startSavingHozorinoLink(
      async () => {
        try {
          const result =
            await updateEmployeeHozorinoLinkAction(
              employee.id,
              null,
            );

          if (!result.success) {
            setHozorinoError(
              result.message,
            );
            return;
          }

          setSelectedHozorinoUserId("");

          setHozorinoMessage(
            "اتصال حساب حضورینو قطع شد. سوابق حضور و غیاب حذف نشده‌اند.",
          );

          router.refresh();
        } catch {
          setHozorinoError(
            "قطع اتصال حساب حضورینو انجام نشد.",
          );
        }
      },
    );
  }

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
            <Save className="size-5" />
          </div>

          <div className="min-w-0">
            <CardTitle>
              {employee.name}
            </CardTitle>

            <CardDescription className="mt-1">
              اطلاعات حساب، ایمیل، رمز عبور و اتصال حضور و غیاب کارمند را مدیریت کنید.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          {serverError ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200/60 bg-red-50/65 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />

              <span className="leading-6">
                {serverError}
              </span>
            </div>
          ) : null}

          {successMessage ? (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/65 p-4 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />

              <span className="leading-6">
                {successMessage}
              </span>
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-employee-name">
                نام و نام خانوادگی
              </Label>

              <Input
                id="edit-employee-name"
                autoComplete="name"
                {...register("name")}
              />

              {errors.name ? (
                <p className="text-xs font-medium text-destructive">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-employee-email">
                ایمیل
              </Label>

              <Input
                id="edit-employee-email"
                type="email"
                inputMode="email"
                dir="ltr"
                autoComplete="email"
                {...register("email")}
              />

              {errors.email ? (
                <p className="text-xs font-medium text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-white/55 bg-white/24 p-5">
            <div className="mb-4">
              <p className="text-sm font-bold text-slate-800">
                امنیت حساب
              </p>

              <p className="mt-1 text-xs leading-6 text-slate-400">
                فقط زمانی رمز عبور را وارد کنید که قصد تغییر آن را دارید.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-employee-password">
                رمز عبور جدید
              </Label>

              <Input
                id="edit-employee-password"
                type="password"
                dir="ltr"
                placeholder="برای تغییر وارد کنید"
                autoComplete="new-password"
                {...register("password")}
              />

              {errors.password ? (
                <p className="text-xs font-medium text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <p className="mt-3 text-xs leading-6 text-slate-400">
              خالی گذاشتن این فیلد، رمز عبور فعلی را حفظ می‌کند.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  ذخیره تغییرات
                </>
              )}
            </Button>
          </div>
        </form>

        <section
          dir="rtl"
          className="mt-7 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Link2 className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-slate-900">
                اتصال حساب حضورینو
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                حساب متناظر این کارمند را در حضورینو انتخاب کنید تا اطلاعات حضور و غیاب او از همان سامانه دریافت شود.
              </p>

              <div className="mt-3">
                {employee.hozorinoUserId ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="size-4" />
                    حساب حضورینو متصل است
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    حساب حضورینو متصل نیست
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="hozorino-employee">
              حساب کارمند در حضورینو
            </Label>

            <select
              id="hozorino-employee"
              value={selectedHozorinoUserId}
              onChange={(event) => {
                setSelectedHozorinoUserId(
                  event.target.value,
                );
                setHozorinoError(null);
                setHozorinoMessage(null);
              }}
              disabled={
                isLoadingHozorinoEmployees ||
                isSavingHozorinoLink ||
                hozorinoEmployees === null
              }
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                انتخاب حساب حضورینو
              </option>

              {showCurrentHozorinoFallback ? (
                <option
                  value={employee.hozorinoUserId ?? ""}
                >
                  {hozorinoEmployees === null
                    ? "حساب فعلی متصل؛ برای بررسی فهرست را دریافت کنید"
                    : "حساب فعلی در فهرست کارمندان فعال حضورینو نیست"}
                </option>
              ) : null}

              {hozorinoEmployees?.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.firstName} {item.lastName} — @{item.username}
                  </option>
                ),
              )}
            </select>

            <p className="text-xs leading-6 text-slate-500">
              فقط حساب‌های فعال با نقش کارمند در حضورینو نمایش داده می‌شوند.
            </p>
          </div>

          {hozorinoError ? (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              <AlertCircle className="mt-1 size-4 shrink-0" />
              <span>{hozorinoError}</span>
            </div>
          ) : null}

          {hozorinoMessage ? (
            <div
              role="status"
              className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
            >
              <CheckCircle2 className="mt-1 size-4 shrink-0" />
              <span>{hozorinoMessage}</span>
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              size="lg"
              variant="outline"
              disabled={
                isLoadingHozorinoEmployees ||
                isSavingHozorinoLink
              }
              onClick={loadHozorinoEmployees}
              className="w-full sm:w-auto"
            >
              {isLoadingHozorinoEmployees ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  در حال دریافت فهرست...
                </>
              ) : (
                <>
                  <RefreshCw className="size-4" />
                  {hozorinoEmployees === null
                    ? "دریافت فهرست کارمندان"
                    : "به‌روزرسانی فهرست"}
                </>
              )}
            </Button>

            <Button
              type="button"
              size="lg"
              disabled={
                isLoadingHozorinoEmployees ||
                isSavingHozorinoLink ||
                hozorinoEmployees === null ||
                !selectedHozorinoUserId ||
                selectedHozorinoUserId ===
                  (employee.hozorinoUserId ?? "")
              }
              onClick={saveHozorinoLink}
              className="w-full sm:w-auto"
            >
              {isSavingHozorinoLink ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  در حال ذخیره اتصال...
                </>
              ) : (
                <>
                  <Link2 className="size-4" />
                  اتصال حساب انتخاب‌شده
                </>
              )}
            </Button>

            {employee.hozorinoUserId ? (
              <Button
                type="button"
                size="lg"
                variant="outline"
                disabled={
                  isLoadingHozorinoEmployees ||
                  isSavingHozorinoLink
                }
                onClick={disconnectHozorinoAccount}
                className="w-full border-red-200 text-red-700 hover:bg-red-50 sm:w-auto"
              >
                <Unlink className="size-4" />
                قطع اتصال
              </Button>
            ) : null}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}