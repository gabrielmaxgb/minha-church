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

interface ViewportMetrics {
  width: number;
  height: number;
  offsetTop: number;
  offsetLeft: number;
}

function getViewportMetrics(): ViewportMetrics {
  const vv = window.visualViewport;

  if (vv) {
    return {
      width: vv.width,
      height: vv.height,
      offsetTop: vv.offsetTop,
      offsetLeft: vv.offsetLeft,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    offsetTop: 0,
    offsetLeft: 0,
  };
}

export function clampDropdownHorizontal(left: number, width: number): number {
  const { width: viewportWidth, offsetLeft } = getViewportMetrics();
  const maxLeft = offsetLeft + viewportWidth - VIEWPORT_PADDING - width;

  return Math.min(
    Math.max(offsetLeft + VIEWPORT_PADDING, left),
    Math.max(offsetLeft + VIEWPORT_PADDING, maxLeft),
  );
}

export function getDropdownPosition(
  anchor: HTMLElement,
  preferredMaxHeight = PREFERRED_DROPDOWN_MAX_HEIGHT,
): DropdownPosition {
  const rect = anchor.getBoundingClientRect();
  const viewport = getViewportMetrics();

  // getBoundingClientRect is layout-viewport relative; convert to visual viewport
  // so space above/below accounts for the on-screen keyboard on iOS/Android.
  const topInVisual = rect.top - viewport.offsetTop;
  const bottomInVisual = rect.bottom - viewport.offsetTop;
  const spaceBelow = viewport.height - bottomInVisual - VIEWPORT_PADDING;
  const spaceAbove = topInVisual - VIEWPORT_PADDING;
  const needed = preferredMaxHeight + DROPDOWN_GAP;
  const openUpward = spaceBelow < needed && spaceAbove > spaceBelow;
  const availableSpace = openUpward ? spaceAbove : spaceBelow;

  const maxHeight = Math.max(
    96,
    Math.min(preferredMaxHeight, availableSpace - DROPDOWN_GAP),
  );

  const width = rect.width;
  const left = clampDropdownHorizontal(rect.left, width);

  if (openUpward) {
    return {
      left,
      width,
      // Keep `bottom` in layout-viewport coords for position:fixed.
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

/** Resize/scroll/visualViewport listeners for portaled dropdowns. */
export function subscribeDropdownReposition(update: () => void): () => void {
  window.addEventListener("resize", update);
  window.addEventListener("scroll", update, true);

  const vv = window.visualViewport;
  vv?.addEventListener("resize", update);
  vv?.addEventListener("scroll", update);

  return () => {
    window.removeEventListener("resize", update);
    window.removeEventListener("scroll", update, true);
    vv?.removeEventListener("resize", update);
    vv?.removeEventListener("scroll", update);
  };
}
