"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type PersianDatePickerProps = {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
};

type PersianParts = {
  year: number;
  month: number;
  day: number;
};

const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const WEEK_DAYS = [
  "ش",
  "ی",
  "د",
  "س",
  "چ",
  "پ",
  "ج",
];

const persianFormatter =
  new Intl.DateTimeFormat(
    "fa-IR-u-ca-persian-nu-latn",
    {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    },
  );

function toPersianDigits(value: string) {
  return value.replace(
    /\d/g,
    (digit) =>
      "۰۱۲۳۴۵۶۷۸۹"[
        Number(digit)
      ],
  );
}

function parseGregorianDate(
  value: string,
) {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value,
    );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      12,
    ),
  );

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function toGregorianString(
  date: Date,
) {
  return [
    date
      .getUTCFullYear()
      .toString()
      .padStart(4, "0"),
    (date.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0"),
    date
      .getUTCDate()
      .toString()
      .padStart(2, "0"),
  ].join("-");
}

function getPersianParts(
  date: Date,
): PersianParts {
  const parts =
    persianFormatter.formatToParts(
      date,
    );

  return {
    year: Number(
      parts.find(
        (part) => part.type === "year",
      )?.value ?? 0,
    ),
    month: Number(
      parts.find(
        (part) => part.type === "month",
      )?.value ?? 0,
    ),
    day: Number(
      parts.find(
        (part) => part.type === "day",
      )?.value ?? 0,
    ),
  };
}

function comparePersianParts(
  actual: PersianParts,
  target: PersianParts,
) {
  const actualValue =
    actual.year * 10000 +
    actual.month * 100 +
    actual.day;

  const targetValue =
    target.year * 10000 +
    target.month * 100 +
    target.day;

  return actualValue - targetValue;
}

function persianToGregorian(
  year: number,
  month: number,
  day: number,
) {
  const target = {
    year,
    month,
    day,
  };

  let low = Date.UTC(
    year + 621,
    0,
    1,
    12,
  );

  let high = Date.UTC(
    year + 623,
    0,
    1,
    12,
  );

  const oneDay =
    24 * 60 * 60 * 1000;

  while (low <= high) {
    const middle =
      low +
      Math.floor(
        (high - low) /
          2 /
          oneDay,
      ) *
        oneDay;

    const middleDate =
      new Date(middle);

    const comparison =
      comparePersianParts(
        getPersianParts(
          middleDate,
        ),
        target,
      );

    if (comparison === 0) {
      return middleDate;
    }

    if (comparison < 0) {
      low = middle + oneDay;
    } else {
      high = middle - oneDay;
    }
  }

  return null;
}

function getCurrentPersianDate() {
  const now = new Date();

  const utcDate = new Date(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      12,
    ),
  );

  return getPersianParts(
    utcDate,
  );
}

function getPersianMonthStart(
  year: number,
  month: number,
) {
  return persianToGregorian(
    year,
    month,
    1,
  );
}

function getDaysInPersianMonth(
  year: number,
  month: number,
) {
  const currentStart =
    getPersianMonthStart(
      year,
      month,
    );

  if (!currentStart) {
    return 30;
  }

  const nextMonth =
    month === 12
      ? {
          year: year + 1,
          month: 1,
        }
      : {
          year,
          month: month + 1,
        };

  const nextStart =
    getPersianMonthStart(
      nextMonth.year,
      nextMonth.month,
    );

  if (!nextStart) {
    return 30;
  }

  return Math.round(
    (nextStart.getTime() -
      currentStart.getTime()) /
      (24 * 60 * 60 * 1000),
  );
}

function getSaturdayBasedWeekday(
  date: Date,
) {
  return (
    (date.getUTCDay() + 1) % 7
  );
}

function formatPersianDate(
  value: string,
) {
  const date =
    parseGregorianDate(value);

  if (!date) {
    return "";
  }

  const parts =
    getPersianParts(date);

  return `${toPersianDigits(
    parts.year.toString(),
  )}/${toPersianDigits(
    parts.month
      .toString()
      .padStart(2, "0"),
  )}/${toPersianDigits(
    parts.day
      .toString()
      .padStart(2, "0"),
  )}`;
}

export function PersianDatePicker({
  id,
  value = "",
  onChange,
  placeholder = "انتخاب تاریخ",
  disabled = false,
  error = false,
  className = "",
}: PersianDatePickerProps) {
  const rootRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const selectedDate =
    useMemo(
      () => parseGregorianDate(value),
      [value],
    );

  const selectedPersian =
    useMemo(
      () =>
        selectedDate
          ? getPersianParts(
              selectedDate,
            )
          : null,
      [selectedDate],
    );

  const [
    visibleYear,
    setVisibleYear,
  ] = useState(
    () =>
      selectedPersian?.year ??
      getCurrentPersianDate()
        .year,
  );

  const [
    visibleMonth,
    setVisibleMonth,
  ] = useState(
    () =>
      selectedPersian?.month ??
      getCurrentPersianDate()
        .month,
  );

  const [open, setOpen] =
    useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(
      event: MouseEvent,
    ) {
      if (
        rootRef.current &&
        !rootRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );
    };
  }, [open]);

  const daysInMonth =
    useMemo(
      () =>
        getDaysInPersianMonth(
          visibleYear,
          visibleMonth,
        ),
      [
        visibleYear,
        visibleMonth,
      ],
    );

  const firstDayDate =
    useMemo(
      () =>
        getPersianMonthStart(
          visibleYear,
          visibleMonth,
        ),
      [
        visibleYear,
        visibleMonth,
      ],
    );

  const leadingDays =
    firstDayDate
      ? getSaturdayBasedWeekday(
          firstDayDate,
        )
      : 0;

  const calendarDays =
    useMemo(() => {
      const cells: Array<
        number | null
      > = [];

      for (
        let index = 0;
        index < leadingDays;
        index += 1
      ) {
        cells.push(null);
      }

      for (
        let day = 1;
        day <= daysInMonth;
        day += 1
      ) {
        cells.push(day);
      }

      while (
        cells.length % 7 !==
        0
      ) {
        cells.push(null);
      }

      return cells;
    }, [
      daysInMonth,
      leadingDays,
    ]);

  const todayPersian =
    useMemo(
      () => getCurrentPersianDate(),
      [],
    );

  function openCalendar() {
    if (disabled) {
      return;
    }

    const initialDate =
      selectedPersian ??
      getCurrentPersianDate();

    setVisibleYear(
      initialDate.year,
    );

    setVisibleMonth(
      initialDate.month,
    );

    setOpen(true);
  }

  function setMonth(
    offset: number,
  ) {
    let nextYear =
      visibleYear;

    let nextMonth =
      visibleMonth + offset;

    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    setVisibleYear(
      nextYear,
    );

    setVisibleMonth(
      nextMonth,
    );
  }

  function selectDay(
    day: number,
  ) {
    const gregorianDate =
      persianToGregorian(
        visibleYear,
        visibleMonth,
        day,
      );

    if (!gregorianDate) {
      return;
    }

    onChange?.(
      toGregorianString(
        gregorianDate,
      ),
    );

    setOpen(false);
  }

  function selectToday() {
    const today =
      getCurrentPersianDate();

    setVisibleYear(
      today.year,
    );

    setVisibleMonth(
      today.month,
    );

    const todayDate =
      persianToGregorian(
        today.year,
        today.month,
        today.day,
      );

    if (todayDate) {
      onChange?.(
        toGregorianString(
          todayDate,
        ),
      );
    }

    setOpen(false);
  }

  const displayValue =
    value
      ? formatPersianDate(value)
      : "";

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={openCalendar}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`glass-field flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm text-slate-800 transition ${
          error
            ? "border-red-300/70 ring-4 ring-red-500/8"
            : ""
        } ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        }`}
      >
        <CalendarDays className="size-4.5 shrink-0 text-slate-400" />

        <span
          className={`min-w-0 flex-1 text-right ${
            displayValue
              ? "font-medium text-slate-700"
              : "text-slate-400"
          }`}
        >
          {displayValue ||
            placeholder}
        </span>

        <ChevronDown
          className={`size-4 shrink-0 text-slate-400 transition-transform ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.6rem)] z-[9999] w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-white/70 bg-white/82 p-3 shadow-[0_28px_75px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-2 px-1 pb-3">
            <button
              type="button"
              onClick={() =>
                setMonth(-1)
              }
              aria-label="ماه قبل"
              className="glass-icon flex size-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white/75"
            >
              <ChevronRight className="size-4.5" />
            </button>

            <div className="text-center">
              <p className="text-sm font-extrabold text-slate-800">
                {
                  PERSIAN_MONTHS[
                    visibleMonth -
                      1
                  ]
                }
              </p>

              <p className="mt-0.5 text-xs font-medium text-slate-400">
                {toPersianDigits(
                  visibleYear.toString(),
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMonth(1)
              }
              aria-label="ماه بعد"
              className="glass-icon flex size-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white/75"
            >
              <ChevronLeft className="size-4.5" />
            </button>
          </div>

          <div className="rounded-2xl border border-white/55 bg-white/35 p-2">
            <div className="mb-1 grid grid-cols-7">
              {WEEK_DAYS.map(
                (day) => (
                  <div
                    key={day}
                    className="flex h-8 items-center justify-center text-[11px] font-bold text-slate-400"
                  >
                    {day}
                  </div>
                ),
              )}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(
                (day, index) => {
                  if (
                    day === null
                  ) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="aspect-square"
                      />
                    );
                  }

                  const selected =
                    selectedPersian
                      ? selectedPersian.year ===
                          visibleYear &&
                        selectedPersian.month ===
                          visibleMonth &&
                        selectedPersian.day ===
                          day
                      : false;

                  const today =
                    todayPersian.year ===
                      visibleYear &&
                    todayPersian.month ===
                      visibleMonth &&
                    todayPersian.day ===
                      day;

                  return (
                    <button
                      key={`${visibleYear}-${visibleMonth}-${day}`}
                      type="button"
                      onClick={() =>
                        selectDay(
                          day,
                        )
                      }
                      className={`relative flex aspect-square items-center justify-center rounded-xl text-xs font-semibold transition ${
                        selected
                          ? "bg-slate-900 text-white shadow-[0_8px_18px_rgba(15,23,42,0.16)]"
                          : today
                            ? "border border-slate-300/70 bg-slate-100/80 text-slate-900"
                            : "text-slate-600 hover:bg-white/75 hover:text-slate-950"
                      }`}
                    >
                      {toPersianDigits(
                        day.toString(),
                      )}

                      {today &&
                      !selected ? (
                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-slate-500" />
                      ) : null}

                      {selected ? (
                        <Check className="absolute bottom-0.5 left-1/2 size-2.5 -translate-x-1/2 opacity-70" />
                      ) : null}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={selectToday}
            className="mt-3 flex h-9 w-full items-center justify-center rounded-xl border border-white/60 bg-white/45 text-xs font-bold text-slate-600 transition hover:bg-white/75 hover:text-slate-900"
          >
            امروز
          </button>
        </div>
      ) : null}
    </div>
  );
}