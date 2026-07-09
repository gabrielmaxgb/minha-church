"use client";

import { useEffect, useRef } from "react";

const VISIBLE_MS = 1000;

/** Marca como visto após o elemento ficar visível no viewport por ~1s. */
export function useMarkWhenVisible(
  enabled: boolean,
  onMark: () => void,
): React.RefObject<HTMLElement | null> {
  const ref = useRef<HTMLElement | null>(null);
  const onMarkRef = useRef(onMark);

  useEffect(() => {
    onMarkRef.current = onMark;
  }, [onMark]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const element = ref.current;

    if (!element) {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }

        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            onMarkRef.current();
          }, VISIBLE_MS);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.55 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [enabled]);

  return ref;
}
