"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { formatDisplayDate } from "@/lib/activities/datetime";
import {
  buildMonthGrid,
  getWeekdayLabels,
  isSameMonth,
  isToday,
  parseDateKey,
  toDateKey,
} from "@/lib/events/calendar";
import { cn } from "@/lib/utils";

import {
  clampDropdownHorizontal,
  dropdownPositionToStyle,
  getDropdownPosition,
  subscribeDropdownReposition,
  type DropdownPosition,
} from "./dropdown-position";

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, month) => ({
  value: month,
  label: new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(new Date(2020, month, 1))
    .replace(".", "")
    .replace(/^./, (char) => char.toUpperCase()),
  longLabel: new Intl.DateTimeFormat("pt-BR", { month: "long" })
    .format(new Date(2020, month, 1))
    .replace(/^./, (char) => char.toUpperCase()),
}));

type CaptionMode = "days" | "months" | "years";

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (dateKey: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  /** Inclusive lower bound for the year picker. Defaults to 100 years ago. */
  fromYear?: number;
  /** Inclusive upper bound for the year picker. Defaults to 10 years ahead. */
  toYear?: number;
}

export function DatePicker({
  id,
  value,
  onChange,
  disabled = false,
  required = false,
  className,
  fromYear,
  toYear,
}: DatePickerProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const panelId = `${triggerId}-panel`;
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const minYear = fromYear ?? now.getFullYear() - 100;
  const maxYear = toYear ?? now.getFullYear() + 10;
  const yearOptions = Array.from(
    { length: Math.max(0, maxYear - minYear) + 1 },
    (_, index) => maxYear - index,
  );

  const initial = value ? parseDateKey(value) : now;
  const [open, setOpen] = useState(false);
  const [captionMode, setCaptionMode] = useState<CaptionMode>("days");
  const [viewYear, setViewYear] = useState(() =>
    Math.min(maxYear, Math.max(minYear, initial.getFullYear())),
  );
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [dropdownPosition, setDropdownPosition] =
    useState<DropdownPosition | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!value) {
      return;
    }

    const selected = parseDateKey(value);
    setViewYear(
      Math.min(maxYear, Math.max(minYear, selected.getFullYear())),
    );
    setViewMonth(selected.getMonth());
  }, [value, minYear, maxYear]);

  useEffect(() => {
    if (!open) {
      setCaptionMode("days");
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setDropdownPosition(null);
      return;
    }

    function updatePosition() {
      if (!triggerRef.current) {
        return;
      }

      const position = getDropdownPosition(triggerRef.current, 360);
      const width = Math.max(position.width, 288);
      setDropdownPosition({
        ...position,
        width,
        left: clampDropdownHorizontal(position.left, width),
      });
    }

    updatePosition();
    return subscribeDropdownReposition(updatePosition);
  }, [open]);

  useLayoutEffect(() => {
    if (captionMode !== "years" || !yearListRef.current) {
      return;
    }

    const selected = yearListRef.current.querySelector<HTMLElement>(
      '[data-selected="true"]',
    );
    selected?.scrollIntoView({ block: "center" });
  }, [captionMode, viewYear]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        containerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (captionMode !== "days") {
          setCaptionMode("days");
          return;
        }

        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, captionMode]);

  function goToPreviousMonth() {
    if (viewMonth === 0) {
      if (viewYear <= minYear) {
        return;
      }
      setViewYear((year) => year - 1);
      setViewMonth(11);
      return;
    }

    setViewMonth((month) => month - 1);
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      if (viewYear >= maxYear) {
        return;
      }
      setViewYear((year) => year + 1);
      setViewMonth(0);
      return;
    }

    setViewMonth((month) => month + 1);
  }

  function selectDay(date: Date) {
    onChange(toDateKey(date));
    setOpen(false);
    triggerRef.current?.focus();
  }

  const canGoPrevious =
    viewYear > minYear || (viewYear === minYear && viewMonth > 0);
  const canGoNext =
    viewYear < maxYear || (viewYear === maxYear && viewMonth < 11);
  const monthLabel = MONTH_OPTIONS[viewMonth]?.longLabel ?? "";

  const grid = buildMonthGrid(viewYear, viewMonth);
  const dropdownStyle = dropdownPosition
    ? dropdownPositionToStyle(dropdownPosition)
    : undefined;

  const panel =
    open && dropdownStyle ? (
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-label="Selecionar data"
        style={dropdownStyle}
        className="overflow-hidden rounded-2xl border border-border bg-background p-3 shadow-lg"
      >
        <div className="mb-3 flex items-center gap-1">
          <button
            type="button"
            onClick={goToPreviousMonth}
            disabled={!canGoPrevious || captionMode !== "days"}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
            <button
              type="button"
              onClick={() =>
                setCaptionMode((mode) =>
                  mode === "months" ? "days" : "months",
                )
              }
              aria-expanded={captionMode === "months"}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold tracking-tight transition-colors",
                captionMode === "months"
                  ? "bg-muted text-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <span className="capitalize">{monthLabel}</span>
              <ChevronDown
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform",
                  captionMode === "months" && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            <button
              type="button"
              onClick={() =>
                setCaptionMode((mode) => (mode === "years" ? "days" : "years"))
              }
              aria-expanded={captionMode === "years"}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold tracking-tight transition-colors",
                captionMode === "years"
                  ? "bg-muted text-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {viewYear}
              <ChevronDown
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform",
                  captionMode === "years" && "rotate-180",
                )}
                aria-hidden
              />
            </button>
          </div>

          <button
            type="button"
            onClick={goToNextMonth}
            disabled={!canGoNext || captionMode !== "days"}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {captionMode === "months" ? (
          <div className="grid grid-cols-3 gap-1.5 py-1">
            {MONTH_OPTIONS.map((month) => {
              const selected = month.value === viewMonth;

              return (
                <button
                  key={month.value}
                  type="button"
                  onClick={() => {
                    setViewMonth(month.value);
                    setCaptionMode("days");
                  }}
                  className={cn(
                    "rounded-xl px-2 py-2.5 text-sm font-medium transition-colors",
                    selected
                      ? "bg-foreground text-background"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {month.label}
                </button>
              );
            })}
          </div>
        ) : null}

        {captionMode === "years" ? (
          <div
            ref={yearListRef}
            className="grid max-h-[16.5rem] grid-cols-3 gap-1.5 overflow-y-auto overscroll-contain py-1"
          >
            {yearOptions.map((year) => {
              const selected = year === viewYear;

              return (
                <button
                  key={year}
                  type="button"
                  data-selected={selected || undefined}
                  onClick={() => {
                    setViewYear(year);
                    setCaptionMode("days");
                  }}
                  className={cn(
                    "rounded-xl px-2 py-2.5 text-sm font-medium transition-colors",
                    selected
                      ? "bg-foreground text-background"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {year}
                </button>
              );
            })}
          </div>
        ) : null}

        {captionMode === "days" ? (
          <>
            <div className="mb-1 grid grid-cols-7 gap-1">
              {getWeekdayLabels().map((label) => (
                <div
                  key={label}
                  className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {grid.map((day) => {
                const dateKey = toDateKey(day);
                const selected = value === dateKey;
                const inMonth = isSameMonth(day, viewYear, viewMonth);
                const today = isToday(day);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg text-sm transition-colors",
                      !inMonth && "text-muted-foreground/50",
                      inMonth && !selected && "text-foreground hover:bg-muted",
                      today && !selected && "ring-1 ring-inset ring-border",
                      selected &&
                        "bg-foreground text-background hover:bg-foreground",
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div
              className={cn(
                "mt-3 flex items-center border-t border-border/60 pt-3",
                required ? "justify-end" : "justify-between",
              )}
            >
              {!required && (
                <button
                  type="button"
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  Limpar
                </button>
              )}
              <button
                type="button"
                className="text-xs font-medium text-foreground transition-colors hover:text-foreground/80"
                onClick={() => selectDay(new Date())}
              >
                Hoje
              </button>
            </div>
          </>
        ) : null}
      </div>
    ) : null;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        className={cn(
          "relative flex h-10 w-full items-center rounded-xl border border-input/80 bg-surface-elevated px-3 py-2 pr-10 text-left text-sm transition-all duration-200 focus-visible:border-transparent focus-visible:bg-muted/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground",
        )}
      >
        <span className="truncate capitalize">{formatDisplayDate(value)}</span>
        <CalendarDays
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
