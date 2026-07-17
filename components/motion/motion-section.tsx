"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";

import { cn } from "@/lib/utils";

interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}

export function MotionSection({
  children,
  className,
  variants,
}: MotionSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      className={cn("overflow-visible", className)}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
    >
      {children}
    </motion.section>
  );
}

interface MotionDivProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}

export function MotionDiv({ children, className, variants }: MotionDivProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("overflow-visible", className)}
      initial={shouldReduceMotion ? false : "hidden"}
      animate={shouldReduceMotion ? undefined : "visible"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
