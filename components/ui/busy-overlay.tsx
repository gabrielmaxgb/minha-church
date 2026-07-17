"use client";

import {
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export interface BusyOverlayProps {
  active: boolean;
  steps: readonly ReactNode[];
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  hint?: string | ReactNode;
  /** `contained` cobre o pai `relative`; `fullscreen` cobre a viewport. */
  variant?: "contained" | "fullscreen";
  stepIntervalMs?: number;
  className?: string;
}

export function BusyOverlay({
  active,
  steps,
  icon: Icon,
  hint = "Só um instante — estamos preparando tudo.",
  variant = "contained",
  stepIntervalMs = 800,
  className,
}: BusyOverlayProps) {
  const shouldReduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const safeSteps = steps.length > 0 ? steps : ["Processando..."];

  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      return;
    }

    if (safeSteps.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setStepIndex((current) => Math.min(current + 1, safeSteps.length - 1));
    }, stepIntervalMs);

    return () => window.clearInterval(interval);
  }, [active, safeSteps.length, stepIntervalMs]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className={cn(
            "z-20 flex flex-col items-center justify-center gap-5 bg-card/85 backdrop-blur-sm",
            variant === "contained" && "absolute inset-0 rounded-[inherit]",
            variant === "fullscreen" && "fixed inset-0 z-80 rounded-none",
            className,
          )}
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="relative flex size-16 items-center justify-center">
            <motion.span
              className="absolute inset-0 rounded-full bg-primary/15"
              animate={
                shouldReduceMotion
                  ? undefined
                  : { scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }
              }
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
            <div className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              {Icon ? (
                <Icon className="size-6" aria-hidden />
              ) : (
                <Loader2 className="size-6 animate-spin" aria-hidden />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 px-6 text-sm font-medium text-foreground">
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            <AnimatePresence mode="wait">
              <motion.span
                key={stepIndex}
                className="inline-flex items-center justify-center gap-1.5 text-center"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {safeSteps[stepIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          {hint ? (
            <p className="max-w-xs px-6 text-center text-xs text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
