import type { CSSProperties } from "react";

export const DROPDOWN_GAP = 4;
export const VIEWPORT_PADDING = 8;
export const PREFERRED_DROPDOWN_MAX_HEIGHT = 320;
export const POPOVER_Z_INDEX = 200;

export interface DropdownPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

export function clampDropdownHorizontal(left: number, width: number): number {
  const maxLeft = window.innerWidth - VIEWPORT_PADDING - width;

  return Math.min(Math.max(VIEWPORT_PADDING, left), Math.max(VIEWPORT_PADDING, maxLeft));
}

export function getDropdownPosition(
  anchor: HTMLElement,
  preferredMaxHeight = PREFERRED_DROPDOWN_MAX_HEIGHT,
): DropdownPosition {
  const rect = anchor.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
  const spaceAbove = rect.top - VIEWPORT_PADDING;
  const needed = preferredMaxHeight + DROPDOWN_GAP;
  const openUpward = spaceBelow < needed && spaceAbove > spaceBelow;
  const availableSpace = openUpward ? spaceAbove : spaceBelow;

  const maxHeight = Math.max(
    120,
    Math.min(preferredMaxHeight, availableSpace - DROPDOWN_GAP),
  );

  const width = rect.width;
  const left = clampDropdownHorizontal(rect.left, width);

  if (openUpward) {
    return {
      left,
      width,
      bottom: window.innerHeight - rect.top + DROPDOWN_GAP,
      maxHeight,
    };
  }

  return {
    left,
    width,
    top: rect.bottom + DROPDOWN_GAP,
    maxHeight,
  };
}

export function dropdownPositionToStyle(
  position: DropdownPosition,
): CSSProperties {
  return {
    position: "fixed",
    left: position.left,
    width: position.width,
    top: position.top,
    bottom: position.bottom,
    maxHeight: position.maxHeight,
    zIndex: POPOVER_Z_INDEX,
  };
}
