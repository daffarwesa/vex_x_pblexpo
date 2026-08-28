"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { BiSolidRightArrow, BiSolidLeftArrow } from "react-icons/bi";

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
  data: CarouselKaryaItem[]; // data dari API backend atau props
  className?: string;
}

/* ===================== */
/* COMPONENT */
/* ===================== */

export default function Carousel({ data, className }: CarouselProps) {
  const hasMultipleItems = Boolean(data && data.length > 1);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: hasMultipleItems },
    hasMultipleItems
      ? [
          Autoplay({
            delay: 6000,
            stopOnInteraction: false,
          }),
        ]
      : []
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
        className={`w-full h-full min-h-[300px] flex flex-col font-medium text-gray-400 text-base lg:text-lg items-center justify-center bg-gray-100 rounded-xl border border-dashed border-gray-300 p-6 text-center ${
          className || ""
        }`}
      >
        <span className="font-poppins text-gray-500 font-semibold">No Projects Yet</span>
        <span className="text-xs text-gray-400 mt-1">Belum ada karya yang dipilih</span>
      </div>
    );
  }

  return (
    <div className={`relative group w-full h-full ${className || ""}`}>
      {/* CAROUSEL */}
      <div
        className="w-full h-full overflow-hidden rounded-xl shadow-lg border border-gray-100 bg-gray-100"
        ref={emblaRef}
      >
        <div className="flex h-full w-full">
          {data.map((item, index) => {
            const imageSrc =
              item.poster ||
              item.posterMedium ||
              item.banner ||
              item.bannerLarge ||
              "/image/BGSection3.png";

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
                {/* POSTER / IMAGE */}
                <Image
                  src={imageSrc}
                  alt={item.title || "Karya"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 400px"
                  unoptimized={
                    typeof imageSrc === "string" &&
                    (imageSrc.startsWith("http://") || imageSrc.startsWith("https://"))
                  }
                />

                {/* GRADIENT OVERLAY & TITLE */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5 md:p-6">
                  <p className="text-white font-semibold text-lg md:text-xl line-clamp-2 drop-shadow-md">
                    {item.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PREV / NEXT BUTTONS */}
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
