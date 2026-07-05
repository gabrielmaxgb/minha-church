"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { formatDisplayDate } from "@/lib/activities/datetime";
import {
  buildMonthGrid,
  formatMonthTitle,
  getWeekdayLabels,
  isSameMonth,
  isToday,
  parseDateKey,
  toDateKey,
} from "@/lib/events/calendar";
import { cn } from "@/lib/utils";

import {
  dropdownPositionToStyle,
  getDropdownPosition,
  type DropdownPosition,
} from "./dropdown-position";

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (dateKey: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function DatePicker({
  id,
  value,
  onChange,
  disabled = false,
  required = false,
  className,
}: DatePickerProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const panelId = `${triggerId}-panel`;
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const initial = value ? parseDateKey(value) : new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
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
    setViewYear(selected.getFullYear());
    setViewMonth(selected.getMonth());
  }, [value]);

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
      setDropdownPosition({
        ...position,
        width: Math.max(position.width, 288),
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
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
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function goToPreviousMonth() {
    if (viewMonth === 0) {
      setViewYear((year) => year - 1);
      setViewMonth(11);
      return;
    }

    setViewMonth((month) => month - 1);
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
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
        className="rounded-2xl border border-border bg-background p-3 shadow-lg"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="text-sm font-semibold tracking-tight">
            {formatMonthTitle(viewYear, viewMonth)}
          </p>
          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

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
                  selected && "bg-foreground text-background hover:bg-foreground",
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
