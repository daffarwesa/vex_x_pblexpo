"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ===================== */
/* TYPE */
/* ===================== */

export interface BestOfCategoryItem {
  label: string;
  title: string;
  description: string;

  /**
   * Poster image.
   *
   * Supports:
   * - Normal image URL
   * - Google Drive share link
   */
  image: string;
}

interface BestOfSelectorProps {
  data: BestOfCategoryItem[];
  className?: string;

  /**
   * Auto-rotate delay in milliseconds.
   * Set to 0 to disable autoplay.
   * Default: 5000ms
   */
  autoplayDelay?: number;

  /**
   * Categories that should always be shown.
   *
   * Default:
   * Innovation
   * Design
   * System
   */
  placeholderLabels?: string[];
}

/* ===================== */
/* CONSTANTS */
/* ===================== */

const DEFAULT_PLACEHOLDER_LABELS = ["Innovation", "Design", "System"];

/**
 * Background used when a category doesn't have a work yet.
 *
 * Because this is still rendered through the same PosterImage
 * component, the fallback has exactly the same poster dimensions
 * and overlay treatment as a real work.
 */
const FALLBACK_IMAGE = "/image/BGSection3.png";

/**
 * How long after a manual tab/poster click before autoplay
 * quietly resumes. Stopping autoplay forever after one click
 * feels broken on a page someone is idly scrolling past.
 */
const AUTOPLAY_RESUME_DELAY = 7000;

/**
 * How far (as a % of the active card's own width) each
 * neighboring poster sits from center. Also doubles as the
 * spacing between adjacent cards.
 */
const NEIGHBOR_OFFSET_PERCENT = 74;

const EASING = "cubic-bezier(0.22, 1, 0.36, 1)"; // soft "ease-out-back"-ish settle

/* ===================== */
/* BUILD CATEGORY SLOTS */
/* ===================== */

interface Slot extends BestOfCategoryItem {
  /** True when this slot is filled by a fallback, not real API data. */
  isPlaceholder: boolean;
}

/**
 * Makes sure the required categories always exist.
 *
 * Example:
 *
 * data = []
 *
 * becomes:
 *
 * Innovation -> fallback
 * Design     -> fallback
 * System     -> fallback
 *
 * If the API provides one of them, that category replaces
 * the fallback automatically.
 */
function buildSlots(
  data: BestOfCategoryItem[],
  placeholderLabels: string[],
): Slot[] {
  const byLabel = new Map(data.map((item) => [item.label, item]));

  const slots = placeholderLabels.map((label) => {
    const existingItem = byLabel.get(label);

    if (existingItem) {
      return { ...existingItem, isPlaceholder: false };
    }

    return {
      label,
      title: label,
      description: "No work has been selected for this category yet.",
      image: FALLBACK_IMAGE,
      isPlaceholder: true,
    };
  });

  /**
   * Preserve any custom categories that may be included
   * in the API data but aren't part of the default 3.
   */
  const extras = data
    .filter((item) => !placeholderLabels.includes(item.label))
    .map((item) => ({ ...item, isPlaceholder: false }));

  return [...slots, ...extras];
}

/* ===================== */
/* GOOGLE DRIVE HELPERS */
/* ===================== */

/**
 * Extract a Google Drive file ID from common URL formats.
 *
 * Supported:
 *
 * https://drive.google.com/file/d/FILE_ID/view
 * https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * https://drive.google.com/open?id=FILE_ID
 * https://drive.google.com/uc?id=FILE_ID&export=view
 */
function extractDriveFileId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Detect whether a URL belongs to Google Drive.
 */
function isGoogleDriveLink(url: string): boolean {
  return (
    typeof url === "string" && /(^|:\/\/)(drive|docs)\.google\.com/.test(url)
  );
}

/**
 * Convert a Google Drive sharing URL to the preview URL
 * that can be displayed inside an iframe.
 */
function getGoogleDrivePreviewUrl(url: string): string | null {
  const fileId = extractDriveFileId(url);

  if (!fileId) return null;

  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/* ===================== */
/* POSTER IMAGE */
/* ===================== */

function PosterImage({ src, alt }: { src: string; alt: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * If a Google Drive link is supplied,
   * render it using Google's preview iframe.
   */
  if (isGoogleDriveLink(src)) {
    const previewUrl = getGoogleDrivePreviewUrl(src);

    if (previewUrl) {
      return (
        <iframe
          src={previewUrl}
          title={alt}
          loading="lazy"
          allow="autoplay"
          className="absolute inset-0 h-full w-full border-0 bg-main-blue/5"
          style={{
            /**
             * Keep clicks going to the parent poster button
             * rather than the iframe itself.
             */
            pointerEvents: "none",
          }}
        />
      );
    }
  }

  /**
   * Normal image URL.
   *
   * This also handles the fallback image.
   */
  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-main-blue/10" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || FALLBACK_IMAGE}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

/* ===================== */
/* AUTOPLAY PROGRESS BAR */
/* ===================== */

/**
 * Thin bar under the active tab that fills over the autoplay
 * delay, so the rotation doesn't feel unpredictable. Remounts
 * (via `resetKey`) every time the active card or play state
 * changes, so it always restarts from empty.
 */
function AutoplayProgressBar({
  isPlaying,
  durationMs,
  resetKey,
}: {
  isPlaying: boolean;
  durationMs: number;
  resetKey: string | number;
}) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    setFilled(false);
    if (!isPlaying) return;

    const frame = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, isPlaying]);

  return (
    <span className="absolute inset-x-2 bottom-1 h-[3px] overflow-hidden rounded-full bg-white/40">
      <span
        className="block h-full origin-left rounded-full bg-white"
        style={{
          transform: `scaleX(${filled ? 1 : 0})`,
          transitionProperty: "transform",
          transitionDuration: filled ? `${durationMs}ms` : "0ms",
          transitionTimingFunction: "linear",
        }}
      />
    </span>
  );
}

/* ===================== */
/* COMPONENT */
/* ===================== */

export default function BestOfSelector({
  data,
  className,
  autoplayDelay = 5000,
  placeholderLabels = DEFAULT_PLACEHOLDER_LABELS,
}: BestOfSelectorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Always create the required category slots.
   *
   * Even if `data` is []:
   *
   * Innovation
   * Design
   * System
   *
   * will still be rendered.
   */
  const slots = useMemo(
    () => buildSlots(data ?? [], placeholderLabels),
    [data, placeholderLabels],
  );

  const length = slots.length;
  const hasMultipleItems = length > 1;

  /* ===================== */
  /* REDUCED MOTION */
  /* ===================== */

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);

    const handleChange = () => setPrefersReducedMotion(query.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  const isPlaying =
    hasMultipleItems &&
    autoplayDelay > 0 &&
    !isPaused &&
    !isHovering &&
    !prefersReducedMotion;

  /* ===================== */
  /* AUTOPLAY */
  /* ===================== */

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % length);
    }, autoplayDelay);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, autoplayDelay, length]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  /* ===================== */
  /* INDEX SAFETY */
  /* ===================== */

  useEffect(() => {
    if (length > 0 && activeIndex >= length) {
      setActiveIndex(0);
    }
  }, [activeIndex, length]);

  /* ===================== */
  /* SELECT CATEGORY */
  /* ===================== */

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);

    /**
     * Pause autoplay briefly after a manual interaction, then
     * let it quietly resume — rather than killing it for the
     * rest of the page visit.
     */
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, AUTOPLAY_RESUME_DELAY);
  }, []);

  const goToOffset = useCallback(
    (delta: number) => {
      if (!length) return;
      handleSelect((((activeIndex + delta) % length) + length) % length);
    },
    [activeIndex, length, handleSelect],
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToOffset(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToOffset(1);
    }
  };

  /* ===================== */
  /* CIRCULAR POSITION */
  /* ===================== */

  /**
   * Returns:
   *
   * -1 = left
   *  0 = center / active
   *  1 = right
   *
   * This keeps the carousel circular.
   */
  const circularOffset = (index: number) => {
    let diff = index - activeIndex;

    if (diff > length / 2) diff -= length;
    if (diff < -length / 2) diff += length;

    return diff;
  };

  /* ===================== */
  /* RENDER */
  /* ===================== */

  return (
    <div
      className={`flex w-full flex-col items-center gap-8 sm:gap-10 ${
        className || ""
      }`}
    >
      {/* ===================== */}
      {/* ACTIVE CATEGORY LABEL */}
      {/* ===================== */}

      <p
        key={activeIndex}
        className="text-main-blue font-bold text-lg sm:text-2xl tracking-wide animate-[fadeIn_0.4s_ease]"
      >
        {slots[activeIndex]?.label}
      </p>

      {/* ===================== */}
      {/* POSTER TRIO */}
      {/* ===================== */}

      <div
        role="group"
        aria-label="Best of category posters"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onFocus={() => setIsHovering(true)}
        onBlur={() => setIsHovering(false)}
        className="relative flex w-full max-w-4xl justify-center outline-none"
      >
        {/* Invisible spacer: gives the row a height that matches the
                    active poster's aspect ratio, at every breakpoint, without
                    hardcoding pixel heights. */}
        <div
          aria-hidden="true"
          className="aspect-[2/3] w-[46%] sm:w-[40%] md:w-[34%]"
        />

        {slots.map((category, index) => {
          const offset = circularOffset(index);
          const isVisible = Math.abs(offset) <= 1;

          if (!isVisible) return null;

          const isActive = offset === 0;
          const scale = isActive ? 1 : 0.86;
          const translate = prefersReducedMotion
            ? "translateX(-50%)"
            : `translateX(-50%) translateX(${
                offset * NEIGHBOR_OFFSET_PERCENT
              }%) scale(${scale})`;

          return (
            <button
              key={`poster-${category.label}-${index}`}
              type="button"
              onClick={() => handleSelect(index)}
              aria-pressed={isActive}
              aria-label={`${category.label}: ${category.title}`}
              style={{
                transform: translate,
                zIndex: isActive ? 30 : 20 - Math.abs(offset),
                transitionProperty: "transform, box-shadow, filter",
                transitionDuration: prefersReducedMotion ? "0ms" : "600ms",
                transitionTimingFunction: EASING,
              }}
              className={`absolute left-1/2 top-0 aspect-[2/3] w-[46%] overflow-hidden rounded-3xl sm:w-[40%] md:w-[34%] ${
                isActive
                  ? "shadow-[0_25px_50px_-15px_rgba(15,30,60,0.45)] ring-[3px] ring-main-blue"
                  : "opacity-80 shadow-lg hover:opacity-100"
              }`}
            >
              {/* ===================== */}
              {/* POSTER IMAGE */}
              {/* ===================== */}

              <PosterImage src={category.image} alt={category.title} />

              {/* ===================== */}
              {/* PLACEHOLDER BADGE */}
              {/* ===================== */}

              {category.isPlaceholder && (
                <span className="absolute right-2 top-2 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-main-blue sm:text-[10px]">
                  Coming soon
                </span>
              )}

              {/* ===================== */}
              {/* GRADIENT OVERLAY */}
              {/* ===================== */}

              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/20 to-transparent p-2 text-left sm:p-4">
                {isActive ? (
                  <div
                    key={`text-${category.label}-${index}`}
                    className="animate-[best-of-rise_0.5s_ease-out]"
                  >
                    <p className="text-sm font-bold leading-tight text-white sm:text-xl">
                      {category.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-white/80 sm:line-clamp-3 sm:text-sm">
                      {category.description}
                    </p>
                  </div>
                ) : (
                  /**
                   * Non-active cards only show the category name,
                   * exactly like populated cards.
                   */
                  <p className="line-clamp-2 text-[10px] font-bold leading-tight text-white sm:text-sm">
                    {category.label}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes best-of-rise {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
