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
import { ChevronDown, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  dropdownPositionToStyle,
  getDropdownPosition,
  type DropdownPosition,
} from "./dropdown-position";
import type { TypeaheadOption } from "./typeahead-select";

interface TypeaheadMultiSelectProps {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: TypeaheadOption[];
  placeholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  listClassName?: string;
  "aria-invalid"?: boolean;
}

export function TypeaheadMultiSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Buscar...",
  emptyMessage = "Nenhum resultado encontrado.",
  loading = false,
  disabled = false,
  className,
  listClassName,
  "aria-invalid": ariaInvalid,
}: TypeaheadMultiSelectProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const comboboxRef = useRef<HTMLDivElement>(null);
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

  const selectedSet = useMemo(() => new Set(value), [value]);

  const selectedOptions = useMemo(
    () =>
      value
        .map((selectedValue) => options.find((option) => option.value === selectedValue))
        .filter((option): option is TypeaheadOption => Boolean(option)),
    [options, value],
  );

  const availableOptions = useMemo(
    () => options.filter((option) => !selectedSet.has(option.value)),
    [options, selectedSet],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return availableOptions;
    }

    return availableOptions.filter((option) => {
      const haystack = [option.label, option.description, option.searchText]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [availableOptions, query]);

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
    if (!open || !comboboxRef.current) {
      setDropdownPosition(null);
      return;
    }

    function updatePosition() {
      if (!comboboxRef.current) {
        return;
      }

      setDropdownPosition(getDropdownPosition(comboboxRef.current));
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, filteredOptions.length, selectedOptions.length]);

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

  function addOption(option: TypeaheadOption) {
    if (selectedSet.has(option.value)) {
      return;
    }

    onChange([...value, option.value]);
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  }

  function removeOption(optionValue: string) {
    onChange(value.filter((current) => current !== optionValue));
    inputRef.current?.focus();
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setOpen(true);
  }

  function handleContainerClick() {
    if (disabled || loading) {
      return;
    }

    inputRef.current?.focus();
  }

  function handleInputFocus() {
    if (disabled || loading) {
      return;
    }

    setOpen(true);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled || loading) {
      return;
    }

    if (event.key === "Backspace" && !query && value.length > 0) {
      event.preventDefault();
      onChange(value.slice(0, -1));
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
        addOption(option);
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
          aria-selected={false}
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
            onClick={() => addOption(option)}
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
      <div
        ref={comboboxRef}
        className={cn(
          "relative flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-xl border border-input/80 bg-surface-elevated px-2 py-1.5 pr-9 transition-all duration-200",
          "focus-within:border-transparent focus-within:bg-muted/60",
          disabled && "cursor-not-allowed opacity-50",
          ariaInvalid &&
            "border-destructive/50 bg-destructive/5 focus-within:bg-destructive/10",
        )}
        onClick={handleContainerClick}
      >
        {selectedOptions.map((option) => (
          <span
            key={option.value}
            className="inline-flex max-w-full items-center gap-1 rounded-lg border border-border/70 bg-background px-2 py-1 text-xs font-medium"
          >
            <span className="truncate">{option.label}</span>
            <button
              type="button"
              className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              disabled={disabled || loading}
              aria-label={`Remover ${option.label}`}
              onClick={(event) => {
                event.stopPropagation();
                removeOption(option.value);
              }}
            >
              <X className="size-3" aria-hidden />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={
            loading
              ? "Carregando..."
              : selectedOptions.length > 0
                ? "Adicionar outro..."
                : placeholder
          }
          disabled={disabled || loading}
          autoComplete="off"
          aria-invalid={ariaInvalid}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList ? `${inputId}-option-${highlightedIndex}` : undefined
          }
          className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
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
