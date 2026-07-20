"use client";

import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps, Variants } from "motion/react";

import { cn } from "@/lib/utils";

interface MotionSectionProps extends Omit<HTMLMotionProps<"section">, "variants"> {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}

export function MotionSection({
  children,
  className,
  variants,
  ...props
}: MotionSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      className={cn("overflow-visible", className)}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      {...props}
    >
      {children}
    </motion.section>
  );
}

interface MotionDivProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}

export function MotionDiv({
  children,
  className,
  variants,
  ...props
}: MotionDivProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("overflow-visible", className)}
      initial={shouldReduceMotion ? false : "hidden"}
      animate={shouldReduceMotion ? undefined : "visible"}
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  );
}
