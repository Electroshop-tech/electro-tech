"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Mounts a single IntersectionObserver that watches every [data-reveal] element.
 * When an element enters the viewport it receives the "in-view" class,
 * which transitions it from hidden → visible via CSS.
 *
 * Directions:
 *   data-reveal="up"    – fade + slide up (default)
 *   data-reveal="left"  – fade + slide from left
 *   data-reveal="right" – fade + slide from right
 *   data-reveal="scale" – fade + scale up
 *   data-reveal="fade"  – fade only (no movement)
 *
 * Optional stagger:
 *   data-reveal-delay="120"  – adds 120 ms CSS transition-delay
 */
export default function ScrollAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document;

    // Signal to CSS that the reveal JS is alive — cancels the CSS failsafe
    // animation so the IntersectionObserver fully controls the reveal timing.
    root.documentElement.classList.add("reveal-js");

    // Set CSS custom property for any element with a numeric reveal-delay
    const setDelays = () => {
      (root.querySelectorAll("[data-reveal-delay]") as NodeListOf<HTMLElement>).forEach((el) => {
        el.style.setProperty("--reveal-delay", `${el.dataset.revealDelay}ms`);
      });
    };
    // Reset any previously-revealed elements so they animate in again on the new page
    (root.querySelectorAll("[data-reveal].in-view") as NodeListOf<HTMLElement>).forEach((el) => {
      el.classList.remove("in-view");
    });

    setDelays();

    // Failsafe: if IntersectionObserver is unavailable, reveal everything now.
    if (typeof IntersectionObserver === "undefined") {
      (root.querySelectorAll("[data-reveal]") as NodeListOf<HTMLElement>).forEach((el) => {
        el.classList.add("in-view");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "100px 0px -20px 0px" }
    );

    // Small defer so the new page's DOM is fully painted before we observe
    const observeAll = () => {
      (root.querySelectorAll("[data-reveal]:not(.in-view)") as NodeListOf<HTMLElement>).forEach((el) => {
        observer.observe(el);
      });
    };

    // Immediately reveal elements already in or near the viewport (above the fold + buffer)
    const revealVisible = () => {
      const vh = window.innerHeight;
      (root.querySelectorAll("[data-reveal]:not(.in-view)") as NodeListOf<HTMLElement>).forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Include elements within 200px below the fold for instant reveal
        if (rect.top < vh + 200 && rect.bottom > 0) {
          el.classList.add("in-view");
        }
      });
    };

    const id = requestAnimationFrame(() => {
      observeAll();
      requestAnimationFrame(revealVisible);
    });

    return () => {
      cancelAnimationFrame(id);
      observer.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
