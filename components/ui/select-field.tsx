"use client";

import React, {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import {
  dropdownPositionToStyle,
  getDropdownPosition,
  subscribeDropdownReposition,
  type DropdownPosition,
} from "./dropdown-position";

interface ParsedOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps extends Omit<React.ComponentProps<"select">, "children"> {
  className?: string;
  children: React.ReactNode;
}

function parseSelectOptions(children: React.ReactNode): ParsedOption[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child) || child.type !== "option") {
      return [];
    }

    const props = child.props as {
      value?: string | number;
      disabled?: boolean;
      children?: React.ReactNode;
    };

    const label =
      typeof props.children === "string" || typeof props.children === "number"
        ? String(props.children)
        : React.Children.toArray(props.children).join("");

    return [
      {
        value: String(props.value ?? ""),
        label,
        disabled: props.disabled,
      },
    ];
  });
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    {
      className,
      children,
      value,
      defaultValue,
      disabled,
      id,
      name,
      onChange,
      onBlur,
      required,
      "aria-invalid": ariaInvalid,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const triggerId = id ?? generatedId;
    const listId = `${triggerId}-listbox`;
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement>(null);
    const isDesktopLayout = useMediaQuery("(min-width: 640px)");
    const useInlineList = !isDesktopLayout;

    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(
      null,
    );
    const [mounted, setMounted] = useState(false);
    const [uncontrolledValue, setUncontrolledValue] = useState(
      String(defaultValue ?? ""),
    );

    const options = useMemo(() => parseSelectOptions(children), [children]);
    const selectedValue = value !== undefined ? String(value) : uncontrolledValue;
    const selectedOption =
      options.find((option) => option.value === selectedValue) ?? options[0];

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      const hiddenSelect = hiddenSelectRef.current;

      if (!hiddenSelect) {
        return;
      }

      if (typeof ref === "function") {
        ref(hiddenSelect);
      } else if (ref) {
        ref.current = hiddenSelect;
      }
    }, [ref]);

    useLayoutEffect(() => {
      if (!open || useInlineList || !triggerRef.current) {
        setDropdownPosition(null);
        return;
      }

      function updatePosition() {
        if (!triggerRef.current) {
          return;
        }

        setDropdownPosition(getDropdownPosition(triggerRef.current));
      }

      updatePosition();
      return subscribeDropdownReposition(updatePosition);
    }, [open, useInlineList, options.length]);

    useEffect(() => {
      if (!open) {
        return;
      }

      function handlePointerDown(event: PointerEvent) {
        const target = event.target as Node;

        if (
          containerRef.current?.contains(target) ||
          listRef.current?.contains(target)
        ) {
          return;
        }

        setOpen(false);
      }

      document.addEventListener("pointerdown", handlePointerDown);

      return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [open]);

    function emitChange(nextValue: string) {
      if (value === undefined) {
        setUncontrolledValue(nextValue);
      }

      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = nextValue;
      }

      onChange?.({
        target: { value: nextValue, name: name ?? "" },
        currentTarget: { value: nextValue, name: name ?? "" },
      } as React.ChangeEvent<HTMLSelectElement>);
    }

    function selectOption(option: ParsedOption) {
      if (option.disabled) {
        return;
      }

      emitChange(option.value);
      setOpen(false);
      triggerRef.current?.focus();
      onBlur?.({
        target: { value: option.value, name: name ?? "" },
        currentTarget: { value: option.value, name: name ?? "" },
      } as React.FocusEvent<HTMLSelectElement>);
    }

    function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
      if (disabled) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    }

    function handleListKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((current) =>
          Math.min(current + 1, Math.max(options.length - 1, 0)),
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex((current) => Math.max(current - 1, 0));
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const option = options[highlightedIndex];

        if (option) {
          selectOption(option);
        }

        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    useEffect(() => {
      if (!open) {
        return;
      }

      const selectedIndex = options.findIndex((option) => option.value === selectedValue);
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }, [open, options, selectedValue]);

    const dropdownStyle = dropdownPosition
      ? dropdownPositionToStyle(dropdownPosition)
      : undefined;

    const optionItems = options.map((option, index) => (
      <li
        key={`${option.value}-${option.label}`}
        id={`${triggerId}-option-${index}`}
        role="option"
        aria-selected={selectedValue === option.value}
      >
        <button
          type="button"
          disabled={option.disabled}
          className={cn(
            "flex w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors touch-manipulation",
            index === highlightedIndex
              ? "bg-muted text-foreground"
              : "text-foreground hover:bg-muted/70",
            option.disabled && "cursor-not-allowed opacity-50",
          )}
          onMouseDown={(event) => event.preventDefault()}
          onMouseEnter={() => setHighlightedIndex(index)}
          onClick={() => selectOption(option)}
        >
          {option.label}
        </button>
      </li>
    ));

    const listClassName = useInlineList
      ? "mt-1.5 max-h-[min(40dvh,16rem)] overflow-y-auto overscroll-contain rounded-xl border border-border bg-background p-1 shadow-lg"
      : "overflow-y-auto overscroll-contain rounded-xl border border-border bg-background p-1 shadow-lg";

    const dropdownList =
      open && (useInlineList || dropdownStyle) ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          style={useInlineList ? undefined : dropdownStyle}
          onKeyDown={handleListKeyDown}
          className={listClassName}
        >
          {optionItems}
        </ul>
      ) : null;

    return (
      <div ref={containerRef} className={cn("relative", className)}>
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          role="combobox"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-activedescendant={
            open ? `${triggerId}-option-${highlightedIndex}` : undefined
          }
          onClick={() => {
            if (!disabled) {
              setOpen((current) => !current);
            }
          }}
          onKeyDown={handleTriggerKeyDown}
          onBlur={() => {
            if (!open) {
              onBlur?.({
                target: { value: selectedValue, name: name ?? "" },
                currentTarget: { value: selectedValue, name: name ?? "" },
              } as React.FocusEvent<HTMLSelectElement>);
            }
          }}
          className={cn(
            "relative flex h-11 w-full items-center rounded-xl border border-input/80 bg-surface-elevated px-3 py-2 pr-10 text-left text-base transition-all duration-200 focus-visible:border-transparent focus-visible:bg-muted/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:text-sm",
            "aria-invalid:border-destructive/50 aria-invalid:bg-destructive/5 aria-invalid:focus-visible:bg-destructive/10",
          )}
        >
          <span className="truncate">{selectedOption?.label}</span>
          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        <select
          ref={hiddenSelectRef}
          name={name}
          value={selectedValue}
          onChange={(event) => {
            const nextValue = event.target.value;

            if (value === undefined) {
              setUncontrolledValue(nextValue);
            }

            onChange?.(event);
          }}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          {...rest}
        >
          {children}
        </select>

        {useInlineList
          ? dropdownList
          : mounted && dropdownList
            ? createPortal(dropdownList, document.body)
            : null}
      </div>
    );
  },
);

SelectField.displayName = "SelectField";
