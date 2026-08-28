"use client";

import { useEffect, useRef, useState } from "react";

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

const DEFAULT_PLACEHOLDER_LABELS = [
    "Innovation",
    "Design",
    "System",
];

/**
 * Background used when a category doesn't have a work yet.
 *
 * Because this is still rendered through the same PosterImage
 * component, the fallback has exactly the same poster dimensions
 * and overlay treatment as a real work.
 */
const FALLBACK_IMAGE = "/image/BGSection3.png";

/* ===================== */
/* BUILD CATEGORY SLOTS */
/* ===================== */

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
): BestOfCategoryItem[] {
    const byLabel = new Map(
        data.map((item) => [item.label, item]),
    );

    const slots = placeholderLabels.map((label) => {
        const existingItem = byLabel.get(label);

        if (existingItem) {
            return existingItem;
        }

        return {
            label,
            title: label,
            description:
                "No work has been selected for this category yet.",
            image: FALLBACK_IMAGE,
        };
    });

    /**
     * Preserve any custom categories that may be included
     * in the API data but aren't part of the default 3.
     */
    const extras = data.filter(
        (item) => !placeholderLabels.includes(item.label),
    );

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
function extractDriveFileId(
    url: string,
): string | null {
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
        typeof url === "string" &&
        /(^|:\/\/)(drive|docs)\.google\.com/.test(url)
    );
}

/**
 * Convert a Google Drive sharing URL to the preview URL
 * that can be displayed inside an iframe.
 */
function getGoogleDrivePreviewUrl(
    url: string,
): string | null {
    const fileId = extractDriveFileId(url);

    if (!fileId) return null;

    return `https://drive.google.com/file/d/${fileId}/preview`;
}

/* ===================== */
/* POSTER IMAGE */
/* ===================== */

function PosterImage({
    src,
    alt,
}: {
    src: string;
    alt: string;
}) {
    /**
     * If a Google Drive link is supplied,
     * render it using Google's preview iframe.
     */
    if (isGoogleDriveLink(src)) {
        const previewUrl =
            getGoogleDrivePreviewUrl(src);

        if (previewUrl) {
            return (
                <iframe
                    src={previewUrl}
                    title={alt}
                    loading="lazy"
                    allow="autoplay"
                    className="absolute inset-0 w-full h-full border-0"
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
    // eslint-disable-next-line @next/next/no-img-element
    return (
        <img
            src={src || FALLBACK_IMAGE}
            alt={alt}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
        />
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
    const [activeIndex, setActiveIndex] =
        useState(0);

    const [autoplayEnabled, setAutoplayEnabled] =
        useState(true);

    const timerRef =
        useRef<ReturnType<typeof setInterval> | null>(
            null,
        );

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
    const slots = buildSlots(
        data ?? [],
        placeholderLabels,
    );

    const length = slots.length;
    const hasMultipleItems = length > 1;

    /* ===================== */
    /* AUTOPLAY */
    /* ===================== */

    useEffect(() => {
        /**
         * Clear any previous timer first.
         */
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (
            !hasMultipleItems ||
            !autoplayEnabled ||
            autoplayDelay <= 0
        ) {
            return;
        }

        timerRef.current = setInterval(() => {
            setActiveIndex(
                (currentIndex) =>
                    (currentIndex + 1) % length,
            );
        }, autoplayDelay);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [
        hasMultipleItems,
        autoplayEnabled,
        autoplayDelay,
        length,
    ]);

    /* ===================== */
    /* INDEX SAFETY */
    /* ===================== */

    useEffect(() => {
        if (
            length > 0 &&
            activeIndex >= length
        ) {
            setActiveIndex(0);
        }
    }, [activeIndex, length]);

    /* ===================== */
    /* SELECT CATEGORY */
    /* ===================== */

    const handleSelect = (index: number) => {
        setActiveIndex(index);

        /**
         * Once the user manually changes category,
         * stop automatic rotation.
         */
        setAutoplayEnabled(false);
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

        if (diff > length / 2) {
            diff -= length;
        }

        if (diff < -length / 2) {
            diff += length;
        }

        return diff;
    };

    /* ===================== */
    /* RENDER */
    /* ===================== */

    return (
        <div
            className={`flex flex-col items-center gap-8 sm:gap-10 w-full ${className || ""
                }`}
        >
            {/* ===================== */}
            {/* CATEGORY TABS */}
            {/* ===================== */}

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {slots.map((category, index) => (
                    <button
                        key={`tab-${category.label}-${index}`}
                        type="button"
                        onClick={() =>
                            handleSelect(index)
                        }
                        aria-pressed={
                            activeIndex === index
                        }
                        className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-base font-bold transition-colors ${activeIndex === index
                                ? "bg-main-blue text-white"
                                : "bg-main-blue/10 text-main-blue hover:bg-main-blue/20"
                            }`}
                    >
                        {category.label}
                    </button>
                ))}
            </div>

            {/* ===================== */}
            {/* POSTER TRIO */}
            {/* ===================== */}

            <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-5 w-full max-w-4xl">
                {slots.map((category, index) => {
                    const offset =
                        circularOffset(index);

                    /**
                     * Only show:
                     *
                     * left
                     * center
                     * right
                     */
                    const isVisible =
                        Math.abs(offset) <= 1;

                    if (!isVisible) {
                        return null;
                    }

                    const isActive =
                        offset === 0;

                    return (
                        <button
                            key={`poster-${category.label}-${index}`}
                            type="button"
                            onClick={() =>
                                handleSelect(index)
                            }
                            aria-pressed={isActive}
                            style={{
                                order: offset,
                            }}
                            className={`relative rounded-2xl overflow-hidden shadow-lg transition-all duration-500 ease-out aspect-[2/3] ${isActive
                                    ? "w-[46%] sm:w-[40%] md:w-[34%] ring-2 ring-main-blue z-10 shadow-2xl"
                                    : "w-[27%] sm:w-[24%] md:w-[21%] opacity-70 hover:opacity-90"
                                }`}
                        >
                            {/* ===================== */}
                            {/* POSTER IMAGE */}
                            {/* ===================== */}

                            <PosterImage
                                src={category.image}
                                alt={category.title}
                            />

                            {/* ===================== */}
                            {/* GRADIENT OVERLAY */}
                            {/* ===================== */}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent flex flex-col justify-end p-2 sm:p-4 text-left">
                                {isActive ? (
                                    <>
                                        {/* TITLE */}
                                        <p className="text-white font-bold text-sm sm:text-xl leading-tight">
                                            {category.title}
                                        </p>

                                        {/* DESCRIPTION */}
                                        <p className="text-white/80 text-[11px] sm:text-sm mt-1 line-clamp-2 sm:line-clamp-3">
                                            {category.description}
                                        </p>
                                    </>
                                ) : (
                                    /**
                                     * Non-active cards only show the category name,
                                     * exactly like populated cards.
                                     */
                                    <p className="text-white font-bold text-[10px] sm:text-sm leading-tight line-clamp-2">
                                        {category.label}
                                    </p>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>  
        </div>
    );
}
