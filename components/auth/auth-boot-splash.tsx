"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import { siteConfig } from "@/constants/navigation";
import {
  resetAsymptoticProgressSingleton,
  useAsymptoticProgress,
} from "@/hooks/use-asymptotic-progress";
import { stashBootSplashProgress } from "@/lib/auth/boot-splash-bridge";
import { cn } from "@/lib/utils";

interface AuthBootSplashProps {
  /** Sessão / login já resolvido — barra completa e some. */
  ready: boolean;
  label?: string;
  className?: string;
  /** Chamado depois do fade-out (fase `done`). */
  onFinished?: () => void;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AuthBootSplash({
  ready,
  label = "Preparando sua igreja…",
  className,
  onFinished,
}: AuthBootSplashProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLParagraphElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useRef(false);
  const onFinishedRef = useRef(onFinished);
  const finishingRef = useRef(false);
  const labelRef = useRef(label);
  const [visible, setVisible] = useState(true);
  const [displayLabel, setDisplayLabel] = useState(label);

  const { progress, done, getCurrentProgress } = useAsymptoticProgress(ready);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  // Persiste progresso pra hard nav (login → /app).
  useEffect(() => {
    stashBootSplashProgress(progress, displayLabel);
  }, [progress, displayLabel]);

  useEffect(() => {
    const persist = () => {
      stashBootSplashProgress(getCurrentProgress(), labelRef.current);
    };
    window.addEventListener("pagehide", persist);
    return () => window.removeEventListener("pagehide", persist);
  }, [getCurrentProgress]);

  // Só o texto “dá refresh” — arte / bloom / marca ficam intactos.
  useEffect(() => {
    if (label === labelRef.current) {
      return;
    }

    const next = label;
    const copy = copyRef.current;

    if (!copy || reduceMotion.current) {
      labelRef.current = next;
      setDisplayLabel(next);
      return;
    }

    const tween = gsap.to(copy, {
      opacity: 0,
      y: 6,
      duration: 0.18,
      ease: "power2.in",
      onComplete: () => {
        labelRef.current = next;
        setDisplayLabel(next);
        gsap.fromTo(
          copy,
          { opacity: 0, y: -6 },
          { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
        );
      },
    });

    return () => {
      tween.kill();
    };
  }, [label]);

  useLayoutEffect(() => {
    reduceMotion.current = prefersReducedMotion();
    const root = rootRef.current;
    if (!root) {
      return;
    }

    // Qualquer continuidade (seed > 0) — sem re-intro da arte (evita piscada).
    const skipIntro = progress > 0;

    if (reduceMotion.current || skipIntro) {
      gsap.set(
        [markRef.current, wordRef.current, copyRef.current, bloomRef.current],
        { opacity: 1, scale: 1, y: 0, clearProps: skipIntro ? "" : "transform" },
      );
      if (bloomRef.current && !reduceMotion.current) {
        gsap.to(bloomRef.current, {
          opacity: 0.55,
          duration: 2.4,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      }
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set([markRef.current, wordRef.current, copyRef.current], {
        opacity: 0,
        y: 14,
      });
      gsap.set(markRef.current, { scale: 0.88 });
      gsap.set(bloomRef.current, { opacity: 0.35, scale: 0.92 });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(bloomRef.current, { opacity: 0.85, scale: 1, duration: 0.9 }, 0)
        .to(
          markRef.current,
          { opacity: 1, y: 0, scale: 1, duration: 0.7 },
          0.12,
        )
        .to(wordRef.current, { opacity: 1, y: 0, duration: 0.55 }, 0.28)
        .to(copyRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.4);

      gsap.to(bloomRef.current, {
        opacity: 0.55,
        duration: 2.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 0.8,
      });
    }, root);

    return () => {
      ctx.revert();
    };
    // Só no mount — progress seed já foi lido no hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intro once
  }, []);

  useEffect(() => {
    const fill = barFillRef.current;
    if (!fill) {
      return;
    }

    if (reduceMotion.current) {
      fill.style.transform = `scaleX(${Math.max(progress, ready ? 1 : 0.15)})`;
      return;
    }

    gsap.to(fill, {
      scaleX: Math.max(progress, 0.04),
      duration: 0.18,
      ease: "power1.out",
      overwrite: true,
    });
  }, [progress, ready]);

  useEffect(() => {
    if (!done || finishingRef.current) {
      return;
    }
    finishingRef.current = true;

    const finish = () => {
      resetAsymptoticProgressSingleton();
      setVisible(false);
      onFinishedRef.current?.();
    };

    const root = rootRef.current;
    if (!root || reduceMotion.current) {
      finish();
      return;
    }

    const tween = gsap.to(root, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete: finish,
    });

    return () => {
      tween.kill();
    };
  }, [done]);

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-busy={!ready}
      className={cn(
        "fixed inset-0 z-[100] flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-white",
        className,
      )}
    >
      <div
        ref={bloomRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[32%] size-[min(72vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, #c4a574 28%, transparent) 0%, color-mix(in srgb, #5f6f5a 12%, transparent) 48%, transparent 72%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-xs flex-col items-center px-6">
        <div
          ref={markRef}
          className="overflow-hidden rounded-2xl shadow-[0_8px_28px_rgb(20_20_19_/0.1)] ring-1 ring-black/5"
        >
          <Image
            src="/marketing/logo-mark.png"
            alt=""
            width={72}
            height={72}
            priority
            className="size-[4.5rem] object-cover"
          />
        </div>

        <p
          ref={wordRef}
          className="mt-5 font-display text-2xl font-bold tracking-tight text-[#141413]"
        >
          {siteConfig.name}
        </p>

        <div
          className="mt-8 h-[2px] w-full max-w-[11rem] overflow-hidden rounded-full bg-[#141413]/10"
          aria-hidden
        >
          <div
            ref={barFillRef}
            className="h-full w-full origin-left rounded-full"
            style={{
              transform: `scaleX(${Math.max(progress, 0.04)})`,
              background: "#1a1a18",
            }}
          />
        </div>

        <p
          ref={copyRef}
          className="mt-4 text-center text-sm text-[#6f6f6a]"
        >
          {displayLabel}
        </p>
      </div>
    </div>
  );
}
