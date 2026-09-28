"use client";

import {
  useState,
} from "react";

import {
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { createCommentAction } from "@/lib/actions/comment.actions";

type CommentItem = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    role:
      | "ADMIN"
      | "EMPLOYEE";
  };
};

type TaskCommentsProps = {
  taskId: string;
  comments: CommentItem[];
};

function formatDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      calendar:
        "persian",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(date),
  );
}

export default function TaskComments({
  taskId,
  comments,
}: TaskCommentsProps) {
  const router =
    useRouter();

  const [content, setContent] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const handleSubmit =
    async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const trimmed =
        content.trim();

      if (
        !trimmed ||
        isSubmitting
      ) {
        return;
      }

      setIsSubmitting(true);

      const result =
        await createCommentAction(
          {
            taskId,
            content:
              trimmed,
          },
        );

      if (!result.success) {
        toast.error(
          result.message,
        );

        setIsSubmitting(
          false,
        );

        return;
      }

      setContent("");
      setIsSubmitting(false);

      toast.success(
        "کامنت با موفقیت ثبت شد.",
      );

      router.refresh();
    };

  return (
    <section className="glass-card rounded-[2rem] p-5 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="glass-icon flex size-11 shrink-0 items-center justify-center rounded-2xl">
          <MessageSquare className="size-5 text-slate-600" />
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            کامنت‌ها
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            گفتگو و پیگیری وضعیت Task
          </p>
        </div>
      </div>

      {comments.length ===
      0 ? (
        <div className="soft-grid mb-6 rounded-3xl border border-dashed border-slate-300/40 bg-white/20 p-8 text-center">
          <div className="glass-icon mx-auto flex size-12 items-center justify-center rounded-2xl">
            <MessageSquare className="size-5 text-slate-400" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-600">
            هنوز کامنتی برای این Task ثبت نشده است.
          </p>
        </div>
      ) : (
        <div className="mb-8 space-y-3">
          {comments.map(
            (comment) => {
              const isAdmin =
                comment.user.role ===
                "ADMIN";

              return (
                <article
                  key={
                    comment.id
                  }
                  className="rounded-3xl border border-white/50 bg-white/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="glass-icon flex size-10 shrink-0 items-center justify-center rounded-2xl text-xs font-extrabold text-slate-600">
                      {comment.user.name
                        .trim()
                        .slice(
                          0,
                          1,
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {
                            comment
                              .user
                              .name
                          }
                        </span>

                        <span className="glass-chip rounded-full px-2.5 py-1 text-[10px] font-bold text-slate-500">
                          {isAdmin
                            ? "مدیر"
                            : "کارمند"}
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-slate-600">
                        {
                          comment.content
                        }
                      </p>

                      <p className="mt-3 text-[11px] text-slate-400">
                        {formatDate(
                          comment.createdAt,
                        )}
                      </p>
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-3"
      >
        <label
          htmlFor={`comment-${taskId}`}
          className="text-sm font-semibold text-slate-700"
        >
          افزودن کامنت
        </label>

        <textarea
          id={`comment-${taskId}`}
          value={content}
          onChange={(event) =>
            setContent(
              event.target.value,
            )
          }
          rows={4}
          maxLength={5000}
          placeholder="کامنت خود را بنویسید..."
          disabled={
            isSubmitting
          }
          className="glass-field min-h-28 w-full resize-none rounded-2xl px-4 py-3 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-slate-400">
            {content.length.toLocaleString(
              "fa-IR",
            )}{" "}
            / ۵۰۰۰
          </span>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !content.trim()
            }
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,23,42,0.14)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}

            {isSubmitting
              ? "در حال ارسال..."
              : "ارسال کامنت"}
          </button>
        </div>
      </form>
    </section>
  );
}