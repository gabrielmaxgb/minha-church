"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  dropdownPositionToStyle,
  getDropdownPosition,
  type DropdownPosition,
} from "./dropdown-position";

export interface TypeaheadOption {
  value: string;
  label: string;
  description?: string;
  searchText?: string;
}

interface TypeaheadSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: TypeaheadOption[];
  placeholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  listClassName?: string;
  "aria-invalid"?: boolean;
}

export function TypeaheadSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Buscar...",
  emptyMessage = "Nenhum resultado encontrado.",
  loading = false,
  disabled = false,
  required = false,
  className,
  listClassName,
  "aria-invalid": ariaInvalid,
}: TypeaheadSelectProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const emptyRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const haystack = [option.label, option.description, option.searchText]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [options, query]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setHighlightedIndex(0);
  }, [query, open]);

  useLayoutEffect(() => {
    if (!open || !inputRef.current) {
      setDropdownPosition(null);
      return;
    }

    function updatePosition() {
      if (!inputRef.current) {
        return;
      }

      setDropdownPosition(getDropdownPosition(inputRef.current));
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, filteredOptions.length]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (
        containerRef.current?.contains(target) ||
        listRef.current?.contains(target) ||
        emptyRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
      setQuery("");
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectOption(option: TypeaheadOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setOpen(true);

    if (value) {
      onChange("");
    }
  }

  function handleInputFocus() {
    if (disabled || loading) {
      return;
    }

    setOpen(true);

    if (selectedOption && !query) {
      setQuery("");
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled || loading) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlightedIndex((current) =>
        Math.min(current + 1, Math.max(filteredOptions.length - 1, 0)),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        return;
      }

      const option = filteredOptions[highlightedIndex];

      if (option) {
        selectOption(option);
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  }

  const displayValue = open ? query : (selectedOption?.label ?? "");

  const showEmptyState = open && !loading && filteredOptions.length === 0;
  const showList = open && !loading && filteredOptions.length > 0;

  const dropdownStyle: React.CSSProperties | undefined = dropdownPosition
    ? dropdownPositionToStyle(dropdownPosition)
    : undefined;

  const dropdownList = showList && dropdownStyle && (
    <ul
      ref={listRef}
      id={listId}
      role="listbox"
      style={dropdownStyle}
      className={cn(
        "overflow-y-auto rounded-xl border border-border bg-background p-1 shadow-lg",
        listClassName,
      )}
    >
      {filteredOptions.map((option, index) => (
        <li
          key={option.value}
          id={`${inputId}-option-${index}`}
          role="option"
          aria-selected={value === option.value}
        >
          <button
            type="button"
            className={cn(
              "flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm transition-colors",
              index === highlightedIndex
                ? "bg-muted text-foreground"
                : "text-foreground hover:bg-muted/70",
            )}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setHighlightedIndex(index)}
            onClick={() => selectOption(option)}
          >
            <span className="font-medium">{option.label}</span>
            {option.description && (
              <span className="mt-0.5 text-xs text-muted-foreground">
                {option.description}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );

  const dropdownEmpty = showEmptyState && dropdownStyle && (
    <div
      ref={emptyRef}
      style={dropdownStyle}
      className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground shadow-lg"
    >
      {emptyMessage}
    </div>
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={loading ? "Carregando..." : placeholder}
          disabled={disabled || loading}
          required={required}
          autoComplete="off"
          aria-invalid={ariaInvalid}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList ? `${inputId}-option-${highlightedIndex}` : undefined
          }
          className={cn(
            "flex h-10 w-full rounded-xl border border-input/80 bg-surface-elevated px-3 py-2 pr-9 text-sm transition-all duration-200 placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:bg-muted/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "aria-invalid:border-destructive/50 aria-invalid:bg-destructive/5 aria-invalid:focus-visible:bg-destructive/10",
          )}
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ChevronDown className="size-4" aria-hidden />
          )}
        </span>
      </div>

      {mounted && dropdownList ? createPortal(dropdownList, document.body) : null}
      {mounted && dropdownEmpty ? createPortal(dropdownEmpty, document.body) : null}
    </div>
  );
}
