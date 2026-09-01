"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import {
  BiSolidRightArrow,
  BiSolidLeftArrow,
} from "react-icons/bi";
import { getStorageUrl, getPublicAssetUrl } from "@/lib/utils";

/* ===================== */
/* TYPE */
/* ===================== */

export interface CarouselKaryaItem {
  id: number | string;
  title: string;

  banner?: string;
  bannerLarge?: string;

  poster: string;

  posterMedium?: string;
}

interface CarouselProps {
  data: CarouselKaryaItem[];
  className?: string;
}

/* ===================== */
/* GOOGLE DRIVE HELPERS */
/* ===================== */

/**
 * Extract FILE_ID from common Google Drive URLs.
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

function isGoogleDriveLink(url: string): boolean {
  return (
    typeof url === "string" &&
    /(^|:\/\/)(drive|docs)\.google\.com/.test(url)
  );
}

/**
 * Converts a Google Drive sharing URL
 * into Google's embeddable preview URL.
 */
function getGoogleDrivePreviewUrl(url: string): string | null {
  const fileId = extractDriveFileId(url);

  if (!fileId) return null;

  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/* ===================== */
/* MEDIA */
/* ===================== */

function CarouselMedia({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const drivePreviewUrl = isGoogleDriveLink(src)
    ? getGoogleDrivePreviewUrl(src)
    : null;

  /**
   * GOOGLE DRIVE
   */
  if (drivePreviewUrl) {
    return (
      <iframe
        src={drivePreviewUrl}
        title={alt}
        loading={priority ? "eager" : "lazy"}
        allow="autoplay"
        className="absolute inset-0 w-full h-full border-0"
        style={{
          pointerEvents: "none",
        }}
      />
    );
  }

  /**
   * NORMAL IMAGE
   */
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover transition-transform duration-700 group-hover:scale-105"
      priority={priority}
      sizes="(max-width: 768px) 100vw, 400px"
      unoptimized={
        typeof src === "string" &&
        (src.startsWith("http://") ||
          src.startsWith("https://"))
      }
    />
  );
}

/* ===================== */
/* COMPONENT */
/* ===================== */

export default function Carousel({
  data,
  className,
}: CarouselProps) {
  const hasMultipleItems = Boolean(
    data && data.length > 1,
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: hasMultipleItems,
    },
    hasMultipleItems
      ? [
          Autoplay({
            delay: 6000,
            stopOnInteraction: false,
          }),
        ]
      : [],
  );

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  if (!data || data.length === 0) {
    return (
      <div
        className={`relative w-full h-full min-h-[300px] overflow-hidden rounded-xl border border-dashed border-gray-300 ${
          className || ""
        }`}
      >
        <Image
          src={getPublicAssetUrl("/image/BGlogopblexpo.webp")}
          alt="No Projects Yet"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-6">
          <span className="font-poppins text-white font-semibold">
            No Projects Yet
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative group w-full h-full ${
        className || ""
      }`}
    >
      {/* ===================== */}
      {/* CAROUSEL */}
      {/* ===================== */}

      <div
        className="w-full h-full overflow-hidden rounded-xl shadow-lg border border-gray-100 bg-gray-100"
        ref={emblaRef}
      >
        <div className="flex h-full w-full">
          {data.map((item, index) => {
            const rawSrc =
              item.poster ||
              item.posterMedium ||
              item.banner ||
              item.bannerLarge;
            const imageSrc = rawSrc ? getStorageUrl(rawSrc) : getPublicAssetUrl("/image/BGSection3.png");

            return (
              <div
                key={item.id ?? index}
                className="
                  flex-[0_0_100%]
                  min-w-0
                  w-full
                  h-full
                  relative
                  aspect-[3/4]
                "
              >
                {/* ===================== */}
                {/* POSTER / IMAGE / DRIVE */}
                {/* ===================== */}

                <CarouselMedia
                  src={imageSrc}
                  alt={item.title || "Karya"}
                  priority={index === 0}
                />

                {/* ===================== */}
                {/* GRADIENT OVERLAY */}
                {/* ===================== */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5 md:p-6 pointer-events-none">
                  <p className="text-white font-semibold text-lg md:text-xl line-clamp-2 drop-shadow-md">
                    {item.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================== */}
      {/* PREV / NEXT BUTTONS */}
      {/* ===================== */}

      {hasMultipleItems && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          >
            <BiSolidLeftArrow className="text-lg" />
          </button>

          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          >
            <BiSolidRightArrow className="text-lg" />
          </button>
        </>
      )}
    </div>
  );
}