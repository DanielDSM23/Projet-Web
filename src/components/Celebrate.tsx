"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

const HIGHLIGHT_CLASSES = ["ring-2", "ring-emerald-200", "border-emerald-300"];

export default function Celebrate() {
  const searchParams = useSearchParams();
  const id = searchParams.get("celebrate");
  const lastElRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (lastElRef.current) {
      lastElRef.current.classList.remove(...HIGHLIGHT_CLASSES);
      lastElRef.current = null;
    }

    if (!id) return;

    const el = document.querySelector(
      `[data-goal-id="${id}"]`,
    ) as HTMLElement | null;

    if (!el) return;

    el.classList.add(...HIGHLIGHT_CLASSES);
    lastElRef.current = el;

    el.animate(
      [
        { transform: "scale(0.98)", opacity: 0.85 },
        { transform: "scale(1.02)", opacity: 1 },
        { transform: "scale(1)", opacity: 1 },
      ],
      { duration: 450, easing: "ease-out" },
    );

    timeoutRef.current = window.setTimeout(() => {
      el.classList.remove(...HIGHLIGHT_CLASSES);

      const url = new URL(window.location.href);
      url.searchParams.delete("celebrate");
      window.history.replaceState({}, "", url.toString());

      timeoutRef.current = null;
      if (lastElRef.current === el) lastElRef.current = null;
    }, 1200);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      el.classList.remove(...HIGHLIGHT_CLASSES);
      if (lastElRef.current === el) lastElRef.current = null;
    };
  }, [id]);

  return null;
}
