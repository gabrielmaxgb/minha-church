/** True when the user prefers reduced motion (SSR-safe: false until checked). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isFinePointer(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
