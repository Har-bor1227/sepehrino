"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  AlertCircle,
  AtSign,
  KeyRound,
  Loader2,
  LogIn,
} from "lucide-react";

import { loginAction } from "@/lib/auth/actions";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("ایمیل واردشده معتبر نیست."),

  password: z
    .string()
    .min(1, "رمز عبور را وارد کنید."),
});

type LoginFormValues =
  z.infer<typeof loginSchema>;

export function LoginForm() {
  const router =
    useRouter();

  const [
    serverError,
    setServerError,
  ] =
    useState<string | null>(
      null,
    );

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<LoginFormValues>({
      resolver:
        zodResolver(
          loginSchema,
        ),
      defaultValues: {
        email: "",
        password: "",
      },
    });

  async function onSubmit(
    values: LoginFormValues,
  ) {
    setServerError(null);

    const formData =
      new FormData();

    formData.set(
      "email",
      values.email,
    );

    formData.set(
      "password",
      values.password,
    );

    const result =
      await loginAction(
        formData,
      );

    if (
      !result.success
    ) {
      setServerError(
        result.message,
      );

      return;
    }

    if (
      result.role ===
      "ADMIN"
    ) {
      router.replace(
        "/admin/dashboard",
      );

      return;
    }

    router.replace(
      "/employee/dashboard",
    );
  }

  return (
    <div className="glass-card rounded-[2rem] p-5 sm:p-6 lg:p-7">
      <div className="mb-7">
        <div className="hidden items-center gap-3 lg:flex">
          <div className="glass-icon flex size-11 items-center justify-center rounded-2xl bg-slate-900/7">
            <LogIn className="size-5 text-slate-600" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              ورود به حساب
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              اطلاعات حساب خود را وارد کنید.
            </p>
          </div>
        </div>

        <div className="lg:hidden">
          <h2 className="text-xl font-extrabold text-slate-900">
            ورود به حساب
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            اطلاعات حساب خود را وارد کنید.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(
          onSubmit,
        )}
        className="space-y-5"
        noValidate
      >
        {serverError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200/50 bg-red-50/55 p-4 text-sm text-red-700">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              <AlertCircle className="size-4" />
            </div>

            <span className="pt-1 leading-6">
              {serverError}
            </span>
          </div>
        ) : null}

        <div className="space-y-2.5">
          <label
            htmlFor="email"
            className="flex items-center gap-2 text-sm font-bold text-slate-700"
          >
            <AtSign className="size-4 text-slate-400" />
            ایمیل
          </label>

          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="example@email.com"
            dir="ltr"
            {...register(
              "email",
            )}
            className={`glass-field h-12 w-full rounded-2xl px-4 text-sm font-medium text-slate-800 outline-none ${
              errors.email
                ? "border-red-300/60 bg-red-50/20 focus:border-red-400"
                : ""
            }`}
          />

          {errors.email ? (
            <p className="px-1 text-xs font-medium text-red-600">
              {
                errors.email
                  .message
              }
            </p>
          ) : null}
        </div>

        <div className="space-y-2.5">
          <label
            htmlFor="password"
            className="flex items-center gap-2 text-sm font-bold text-slate-700"
          >
            <KeyRound className="size-4 text-slate-400" />
            رمز عبور
          </label>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="رمز عبور"
            dir="ltr"
            {...register(
              "password",
            )}
            className={`glass-field h-12 w-full rounded-2xl px-4 text-sm font-medium text-slate-800 outline-none ${
              errors.password
                ? "border-red-300/60 bg-red-50/20 focus:border-red-400"
                : ""
            }`}
          />

          {errors.password ? (
            <p className="px-1 text-xs font-medium text-red-600">
              {
                errors
                  .password
                  .message
              }
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={
            isSubmitting
          }
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(15,23,42,0.14)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              در حال ورود...
            </>
          ) : (
            <>
              <LogIn className="size-4" />
              ورود به حساب
            </>
          )}
        </button>
      </form>
    </div>
  );
}