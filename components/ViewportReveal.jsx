"use client";

import { useEffect } from "react";

export default function ViewportReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const perfLite = document.documentElement?.dataset?.performance === "lite";
    if (reduceMotion || perfLite) return undefined;

    const sections = Array.from(document.querySelectorAll(".reveal-sections > section"));
    if (!sections.length) return undefined;

    sections.forEach((section, index) => {
      const delay = Math.min(index * 70, 320);
      section.style.setProperty("--reveal-delay", `${delay}ms`);
      section.classList.add("reveal-pending");
    });

    const revealNow = (el) => {
      el.classList.add("is-visible");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealNow(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.9) {
        revealNow(section);
        return;
      }
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
      sections.forEach((section) => {
        section.classList.remove("reveal-pending", "is-visible");
        section.style.removeProperty("--reveal-delay");
      });
    };
  }, []);

  return null;
}
