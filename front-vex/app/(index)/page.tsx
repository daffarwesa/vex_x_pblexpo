"use client";
import Image from "next/image";
// components
import { Card } from "@/components/shared/ui/Components";
import { Button } from "@/components/shared/ui/Button";
import Carousel, { CarouselKaryaItem } from "@/components/shared/ui/Carousel";
import BestOfSelector, {
  BestOfCategoryItem,
} from "@/components/shared/ui/BestOfSelector";
// icons
import {
  BiCube,
  BiGlobe,
  BiSolidLeftArrow,
  BiSolidRightArrow,
} from "react-icons/bi";
import { FaStar } from "react-icons/fa";
// best & favorite work
import { useEffect, useRef, useState } from "react";
import {
  GetKaryaTerbaikAktif,
  GetKaryaFavoritAktif,
  GetKaryaBestOfAktif,
  KaryaPredikatItem,
  KaryaBestOfItem,
} from "./api";
import { getStorageUrl } from "@/lib/utils";

const RELEASE_VIDEO_ID = "bLdFe6G7OC8";
const RELEASE_AUTOPLAY_DELAY = 5000;

type ReleaseMediaItem =
  | { type: "video"; videoId: string; thumbnail: string; title: string }
  | { type: "image"; src: string; title: string };

const releaseMedia: ReleaseMediaItem[] = [
  {
    type: "video",
    videoId: RELEASE_VIDEO_ID,
    thumbnail: `https://img.youtube.com/vi/${RELEASE_VIDEO_ID}/hqdefault.jpg`,
    title: "Release Trailer",
  },
  { type: "image", src: "/expo/image/BGPreview1.png", title: "Screenshot 1" },
  { type: "image", src: "/expo/image/BGPreview2.png", title: "Screenshot 2" },
  { type: "image", src: "/expo/image/BGPreview3.png", title: "Screenshot 3" },
  { type: "image", src: "/expo/image/BGPreview4.png", title: "Screenshot 4" },
  { type: "image", src: "/expo/image/BGPreview5.png", title: "Screenshot 5" },
];

// Logos shown in the "In Collaboration With" strip. Replace src with your real
// partner/collaborator logo paths.
const collaborators = [
  { src: "/expo/image/logo-collab-1.png", alt: "Collaborator 1" },
  { src: "/expo/image/logo-collab-2.png", alt: "Collaborator 2" },
  { src: "/expo/image/logo-collab-3.png", alt: "Collaborator 3" },
  { src: "/expo/image/logo-collab-4.png", alt: "Collaborator 4" },
];

const BEST_OF_IDS = [1, 2, 3, 4, 5, 6, 7] as const;

type BestOfId = (typeof BEST_OF_IDS)[number];

// is_best: 1-7 sesuai urutan kategori Best Of
const BEST_OF_LABELS: Record<BestOfId, string> = {
  1: "Innovation to Industry",
  2: "Partnership for Downstreaming",
  3: "Creativity",
  4: "Readiness for Market",
  5: "Business Potential",
  6: "Scalability",
  7: "Commercial Impact",
};

const BEST_OF_PLACEHOLDER_LABELS = Object.values(BEST_OF_LABELS);

// Ubah data karya dari API (KaryaPredikatItem) menjadi bentuk yang dipakai Carousel
function mapKaryaToCarouselItem(karya: KaryaPredikatItem): CarouselKaryaItem {
  const poster = karya.gambar_poster
    ? getStorageUrl(karya.gambar_poster)
    : "/expo/image/BGSection3.png";

  return {
    id: karya.id_karya,
    title: karya.judul,
    poster,
    banner: poster,
  };
}

// Ubah data karya (is_best) dari API menjadi bentuk yang dipakai BestOfSelector
function mapKaryaToBestOf(
  karya: KaryaBestOfItem,
  label: string,
): BestOfCategoryItem {
  const image = karya.gambar_poster
    ? getStorageUrl(karya.gambar_poster)
    : "/expo/image/BGSection3.png";

  return {
    label,
    title: karya.judul,
    description: karya.deskripsi,
    image,
  };
}

export default function HomePage() {
  const [bestWork, setBestWork] = useState<CarouselKaryaItem[]>([]);
  const [favoriteWork, setFavoriteWork] = useState<CarouselKaryaItem[]>([]);
  const [bestOfCategories, setBestOfCategories] = useState<
    BestOfCategoryItem[]
  >([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const activeMedia = releaseMedia[activeMediaIndex];
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);

  // Autoplay untuk Release Announcement thumbnail strip
  const [releaseAutoplayEnabled, setReleaseAutoplayEnabled] = useState(true);
  const releaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // const tutorialLink = "/tutorial";

  const goToPrevMedia = () =>
    setActiveMediaIndex(
      (i) => (i - 1 + releaseMedia.length) % releaseMedia.length,
    );
  const goToNextMedia = () =>
    setActiveMediaIndex((i) => (i + 1) % releaseMedia.length);

  // Scrolls the thumbnail strip itself (used by the hover arrows), independent
  // from which media is currently active.
  const scrollThumbs = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Force the page to always land on Section 1 on load, regardless of URL hash
  // (e.g. #release, #karya) or the browser's scroll-restoration memory.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Kasih sedikit delay supaya browser selesai dulu proses hash-jump instannya,
    // baru kita smooth-scroll ke atas — biar animasinya keliatan jelas.
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Scroll the horizontal thumbnail strip so the active thumbnail is centered
  // — never touch the page's vertical scroll position. On first render it
  // centers instantly (no smooth animation) so mounting doesn't show a jump.
  useEffect(() => {
    const container = scrollContainerRef.current;
    const thumb = thumbRefs.current[activeMediaIndex];
    if (!container || !thumb) return;

    const thumbLeft = thumb.offsetLeft;
    const thumbWidth = thumb.offsetWidth;
    const containerWidth = container.clientWidth;
    const targetScrollLeft = thumbLeft - containerWidth / 2 + thumbWidth / 2;

    container.scrollTo({
      left: targetScrollLeft,
      behavior: isFirstRender.current ? "auto" : "smooth",
    });

    isFirstRender.current = false;
  }, [activeMediaIndex]);

  // Autoplay: geser preview besar secara otomatis tiap RELEASE_AUTOPLAY_DELAY,
  // berhenti begitu user memilih thumbnail secara manual.
  useEffect(() => {
    if (releaseTimerRef.current) {
      clearInterval(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }

    if (!releaseAutoplayEnabled || releaseMedia.length <= 1) {
      return;
    }

    releaseTimerRef.current = setInterval(() => {
      setActiveMediaIndex((i) => (i + 1) % releaseMedia.length);
    }, RELEASE_AUTOPLAY_DELAY);

    return () => {
      if (releaseTimerRef.current) {
        clearInterval(releaseTimerRef.current);
        releaseTimerRef.current = null;
      }
    };
  }, [releaseAutoplayEnabled]);

  // Fetch karya Juara 1 (Best Work) & Juara 2 (Favorite Work) untuk carousel landing page
  useEffect(() => {
    GetKaryaTerbaikAktif()
      .then((data) => {
        if (data.status === "success") {
          setBestWork(data.data.map(mapKaryaToCarouselItem));
        }
      })
      .catch((err) => console.error("Failed to fetch best work:", err));

    GetKaryaFavoritAktif()
      .then((data) => {
        if (data.status === "success") {
          setFavoriteWork(data.data.map(mapKaryaToCarouselItem));
        }
      })
      .catch((err) => console.error("Failed to fetch favorite work:", err));
  }, []);

  // Fetch karya "Best Of" untuk ke-7 kategori
  useEffect(() => {
    Promise.all(BEST_OF_IDS.map((id) => GetKaryaBestOfAktif(id)))
      .then((results) => {
        const items: BestOfCategoryItem[] = [];

        results.forEach((result, i) => {
          const id = BEST_OF_IDS[i];

          if (result.status === "success" && result.data[0]) {
            items.push(mapKaryaToBestOf(result.data[0], BEST_OF_LABELS[id]));
          }
        });

        setBestOfCategories(items);
      })
      .catch((err) =>
        console.error("Failed to fetch best of categories:", err),
      );
  }, []);

  return (
    <div className="flex flex-col w-full bg-secondary-color select-none">
      {/* SECTION 1 - Hero (full-image background, artwork already contains the wordmark) */}
      {/* Separate mobile artwork below sm: — the wide diagonal desktop crop doesn't survive a phone viewport.
          Swap /image/BGSection1-mobile.png for your real mobile crop, then re-check the button's left/bottom % against it. */}
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full aspect-[4/5] sm:aspect-video bg-[url(/expo/image/BGSection1-mobile.png)] sm:bg-[url(/expo/image/BGSection1.png)] bg-cover bg-center">
          {/* Explore button: hidden on phone, visible from sm: up */}
          <div className="hidden sm:block absolute sm:left-[3%] sm:bottom-[33%]">
            <Button
              link="/pameran"
              className="font-bold px-4 sm:px-8 lg:px-10 py-1.5 sm:py-2.5 lg:py-3 text-xs sm:text-base rounded-md transition-all duration-300 hover:scale-105"
            >
              Explore
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 1.5 - In Collaboration With (logo strip) */}
      <section className="bg-main-blue w-full">
        <div className="autoMid py-12 sm:py-16 lg:py-20 flex flex-col items-center">
          <div
            className="
        grid
        grid-cols-2
        sm:grid-cols-4
        gap-8
        sm:gap-8
        lg:gap-10
        xl:gap-16
        items-center
        justify-items-center
        w-full
        max-w-6xl
      "
          >
            {collaborators.map((logo, i) => (
              <div
                key={i}
                className="
            w-28 h-28
            sm:w-34 sm:h-34
            md:w-42 md:h-42
            lg:w-40 lg:h-40
            
            rounded-full
            bg-white
            flex items-center justify-center
            p-4
            sm:p-4
            lg:p-6
            shadow-lg
          "
              >
                <div className="relative w-full h-full">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 - Release Announcement (Steam-style: click a thumbnail to swap the main preview) */}
      <section id="release" className="bg-[#3612C7] w-full scroll-mt-24">
        <div className="autoMid py-[64px] px-4 sm:px-6 lg:px-0 flex flex-col gap-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
            <div className="order-2 lg:order-1 aspect-video rounded-md overflow-hidden shadow-[0px_0px_8px_2px_rgba(0,0,0,0.25)] bg-black">
              {activeMedia.type === "video" ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeMedia.videoId}?si=GZeAFFL7zB47tmud`}
                  className="w-full h-full"
                  title="Release Announcement"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={activeMedia.src}
                    alt={activeMedia.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="order-1 lg:order-2 flex flex-col gap-6 text-white items-center lg:items-end text-center lg:text-right">
              <div className="leading-none">
                <p className="font-poppins font-thin text-4xl sm:text-5xl lg:text-6xl leading-none">
                  RELEASE
                </p>
                <p className="font-tilt-wrap font-bold text-4xl sm:text-5xl lg:text-6xl leading-none">
                  ANNOUNCEMENT
                </p>
              </div>

              <Button
                link="https://www.youtube.com/watch?v=bLdFe6G7OC8"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 sm:px-14 py-2 lg:py-3 rounded-md hover:scale-105 transition !bg-[#F5811F] hover:!bg-[#DD6E10]"
              >
                Watch
              </Button>
            </div>
          </div>

          {/* Horizontal thumbnail strip — hover reveals scroll arrows on desktop;
              on phone the arrows are removed entirely and it's just swipe-scrollable. */}
          <div className="group relative">
            {/* Left arrow - desktop/hover only */}
            <button
              type="button"
              onClick={() => scrollThumbs("left")}
              aria-label="Scroll thumbnails left"
              className="hidden sm:flex absolute left-0 top-0 bottom-2 z-10 w-10 items-center justify-center
                bg-gradient-to-r from-main-blue via-main-blue/80 to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition">
                <BiSolidLeftArrow className="text-main-blue text-sm" />
              </span>
            </button>

            {/* Right arrow - desktop/hover only */}
            <button
              type="button"
              onClick={() => scrollThumbs("right")}
              aria-label="Scroll thumbnails right"
              className="hidden sm:flex absolute right-0 top-0 bottom-2 z-10 w-10 items-center justify-center
                bg-gradient-to-l from-main-blue via-main-blue/80 to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition">
                <BiSolidRightArrow className="text-main-blue text-sm" />
              </span>
            </button>

            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-2 scroll-smooth [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-track]:bg-white/5"
            >
              {releaseMedia.map((item, i) => (
                <button
                  key={i}
                  ref={(el) => {
                    thumbRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => {
                    setActiveMediaIndex(i);
                    setReleaseAutoplayEnabled(false);
                  }}
                  aria-label={item.title}
                  aria-pressed={i === activeMediaIndex}
                  className={`shrink-0 w-[220px] sm:w-[260px] aspect-video rounded-md overflow-hidden shadow-lg relative transition
                    ${i === activeMediaIndex ? "ring-2 ring-white" : "ring-1 ring-white/20 opacity-70 hover:opacity-100"}`}
                >
                  <Image
                    src={item.type === "video" ? item.thumbnail : item.src}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  {item.type === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                        <span className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-main-blue ml-0.5" />
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 - Show Your Projects (image background) */}
      {/* Separate mobile artwork below sm: — same pattern as Section 1.
          Swap /image/BGSection3-mobile.png for your real mobile crop. */}
      {/* Mobile order: title (centered) -> image -> description/button. Desktop: unchanged 2-column layout. */}
      <section
        id="karya"
        className="relative bg-main-blue sm:bg-[url(/expo/image/BGSection3.png)] bg-cover bg-center w-full scroll-mt-24"
      >
        <div className="autoMid py-[48px] px-4 sm:px-6 lg:px-0 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center min-h-[460px]">
          {/* Title - mobile only, centered, first */}
          <div className="order-1 lg:hidden text-white text-center leading-none">
            <p className="font-poppins font-thin text-4xl leading-none">
              SHOW YOUR
            </p>
            <p className="font-tilt-wrap font-bold text-4xl leading-none">
              PROJECTS
            </p>
          </div>

          {/* Image */}
          <div className="order-2 lg:order-2 relative w-full">
            <Card
              link="/expo/image/BG1.svg"
              title="lobby"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          {/* Desktop: title + description + button combined in one column (unchanged) */}
          <div className="hidden lg:flex lg:order-1 flex-col gap-8 justify-center">
            <div className="text-white leading-none">
              <p className="font-poppins font-thin text-5xl lg:text-6xl leading-none">
                SHOW YOUR
              </p>
              <p className="font-tilt-wrap font-bold text-5xl lg:text-6xl leading-none">
                PROJECTS
              </p>
            </div>

            <div className="flex flex-col gap-5 text-white max-w-[500px]">
              <div className="flex items-start gap-3">
                <BiCube className="text-lg shrink-0 mt-1" />
                <p className="text-lg font-poppins font-light">
                  Explore projects from every angle inside a virtual space.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <BiGlobe className="text-lg shrink-0 mt-1" />
                <p className="text-lg font-poppins font-light">
                  Be immersed in the exhibitions, just like in real life.
                </p>
              </div>
            </div>

            {/* <Button
              link={tutorialLink}
              className="w-[50%] px-10 lg:px-18 py-2 lg:py-3 rounded-md hover:scale-102 duration-500 !bg-[#F5811F] hover:!bg-[#DD6E10]"
            >
              Tutorial
            </Button> */}
          </div>

          {/* Mobile only: description + button, after the image */}
          <div className="order-3 lg:hidden flex flex-col gap-5 text-white max-w-[500px] w-full items-center">
            <div className="flex flex-col gap-5 w-full">
              <div className="flex items-start gap-3">
                <BiCube className="text-[22px] shrink-0 mt-1" />
                <p className="text-[16px] sm:text-[18px] font-poppins font-light">
                  Explore projects from every angle inside a virtual space.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <BiGlobe className="text-[22px] shrink-0 mt-1" />
                <p className="text-[16px] sm:text-[18px] font-poppins font-light">
                  Be immersed in the exhibitions, just like in real life.
                </p>
              </div>
            </div>
            {/* 
            <Button
              link={tutorialLink}
              className="w-[60%] px-10 py-2 rounded-md hover:scale-102 duration-500 !bg-[#F5811F] hover:!bg-[#DD6E10]"
            >
              Tutorial
            </Button> */}
          </div>
        </div>
      </section>

      {/* SECTION 4 - Get Rewarded */}
      <section className="bg-white w-full">
        <div className="autoMid min-h-[460px] py-[84px] px-4 sm:px-6 lg:px-0 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="order-1 lg:order-2 flex flex-col justify-center items-center lg:items-end text-main-blue text-center lg:text-right gap-1">
            <p className="font-poppins font-thin text-4xl sm:text-5xl lg:text-6xl leading-none">
              BE THE
            </p>
            <p className="font-tilt-wrap font-bold text-4xl sm:text-5xl lg:text-6xl leading-none">
              CHAMPION
            </p>
            <p className="font-poppins font-light text-[16px] sm:text-lg mt-2">
              Out of every category in the exhibition.
            </p>
          </div>

          {/* Badges: always side-by-side, even on phone */}
          <div className="order-2 lg:order-1 grid grid-cols-2 gap-4 sm:gap-6 items-stretch">
            <Card
              link="/expo/image/BestBadge.svg"
              title="best badge"
              className="w-full aspect-[4/3] object-cover rounded-xl h-full"
            />
            <Card
              link="/expo/image/SecondBestBadge.svg"
              title="favorite badge"
              className="w-full aspect-[4/3] object-cover rounded-xl h-full"
            />
          </div>
        </div>
      </section>

      {/* SECTION 5.5 - Best Of */}
      <section className="bg-white w-full">
        <div
          className="
      autoMid
      py-10
      sm:py-[68px]
      px-4
      sm:px-6
      lg:px-0
      flex
      flex-col
      items-center
      gap-8
      sm:gap-10
      sm:min-h-[850px]
      md:min-h-[930px]
    "
        >
          <div className="text-main-blue text-center">
            <p className="font-poppins font-bold text-4xl lg:text-5xl leading-none">
              BEST OF
            </p>
          </div>

          <BestOfSelector
            data={bestOfCategories}
            placeholderLabels={BEST_OF_PLACEHOLDER_LABELS}
          />
        </div>
      </section>

      {/* SECTION 5 - Best Work */}
      {/* Mobile order: title (centered) -> carousel -> description. Desktop: unchanged 8-col layout. */}
      <section className="bg-white w-full">
        <div className="autoMid pt-[68px] pb-[78px] min-h-[580px] flex flex-col items-center gap-10 px-4 sm:px-6 lg:px-0 lg:grid lg:grid-cols-8 lg:items-start">
          {/* Title - mobile only, centered, first */}
          <div className="order-1 lg:hidden text-main-blue text-center">
            <p className="font-poppins font-thin text-4xl leading-none">
              CHAMPIONS OF
            </p>
            <p className="font-tilt-wrap font-bold text-4xl leading-none">
              12 CATEGORY
            </p>
          </div>

          {/* Carousel */}
          <div className="order-2 lg:order-2 lg:col-span-3 relative w-full max-w-sm mx-auto lg:mx-0 shadow-xl rounded-xl overflow-hidden">
            {/* <BestTag className="absolute right-0 top-0 z-10 scale-75 sm:scale-90 lg:scale-100 origin-top-right" /> */}
            <div className="w-full aspect-[3/4]">
              <Carousel
                data={bestWork}
                className="w-full h-full rounded-xl overflow-hidden"
              />
            </div>
          </div>

          {/* Desktop: title + description combined (unchanged) */}
          <div className="hidden lg:flex lg:order-1 lg:col-span-5 flex-col gap-8">
            <div className="text-main-blue">
              <p className="font-poppins font-thin text-5xl lg:text-6xl leading-none">
                CHAMPIONS OF{" "}
              </p>
              <p className="font-tilt-wrap font-bold text-5xl lg:text-6xl leading-none">
                12 CATEGORY
              </p>
            </div>
            <div className="grid gap-5 max-w-[500px]">
              {[
                "Judged directly by department heads based on quality, creativity, innovation, and overall excellence.",
                "Each department selects one best work as its representative, featured on the landing page until the next exhibition.",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <FaStar className="text-lg shrink-0 mt-1" />
                  <p className="text-lg font-poppins font-light text-justify">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile only: description, after the carousel */}
          <div className="order-3 lg:hidden grid gap-5 max-w-[500px] text-main-blue">
            {[
              "Judged directly by department heads based on quality, creativity, innovation, and overall excellence.",
              "Each department selects one best work as its representative, featured on the landing page until the next exhibition.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <FaStar className="text-[22px] shrink-0 mt-1" />
                <p className="text-[16px] sm:text-[18px] font-poppins font-light text-justify">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 - Favorite Work */}
      {/* Mobile order: title (centered) -> carousel -> description. Desktop: unchanged 8-col layout. */}
      <section className="bg-white w-full">
        <div className="autoMid pt-[68px] pb-[78px] min-h-[580px] flex flex-col items-center gap-10 px-4 sm:px-6 lg:px-0 lg:grid lg:grid-cols-8 lg:items-start">
          {/* Title - mobile only, centered, first */}
          <div className="order-1 lg:hidden text-main-blue text-center">
            <p className="font-poppins font-thin text-4xl leading-none">
              SECOND CHAMPIONS
            </p>
            <p className="font-tilt-wrap font-bold text-4xl leading-none">
              OF 12 CATEGORY
            </p>
          </div>

          {/* Carousel */}
          <div className="order-2 lg:order-1 lg:col-span-3 relative rounded-xl shadow-xl overflow-hidden w-full max-w-sm mx-auto lg:mx-0">
            {/* <FavTag className="absolute left-0 top-0 z-10 scale-75 sm:scale-90 lg:scale-100 origin-top-left" /> */}
            <div className="w-full aspect-[3/4]">
              <Carousel
                data={favoriteWork}
                className="w-full h-full rounded-xl overflow-hidden"
              />
            </div>
          </div>

          {/* Desktop: title + description combined (unchanged) */}
          <div className="hidden lg:flex lg:order-2 lg:col-span-5 flex-col gap-8">
            <div className="text-main-blue flex flex-col items-end text-right">
              <p className="font-poppins font-thin text-5xl lg:text-6xl leading-none">
                SECOND CHAMPIONS
              </p>
              <p className="font-tilt-wrap font-bold text-5xl lg:text-6xl leading-none">
                OF 12 CATEGORY
              </p>
            </div>
            <div className="grid gap-5">
              {[
                "Determined by the highest number of likes from all visitors, making it the most favorited work across the entire exhibition.",
                "The work with the most likes becomes the most popular entry and earns the top favorite-work medal.",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <FaStar className="text-lg shrink-0 mt-1" />
                  <p className="text-lg font-poppins font-light text-justify">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile only: description, after the carousel */}
          <div className="order-3 lg:hidden grid gap-5 text-main-blue">
            {[
              "Determined by the highest number of likes from all visitors, making it the most favorited work across the entire exhibition.",
              "The work with the most likes becomes the most popular entry and earns the top favorite-work medal.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <FaStar className="text-[22px] shrink-0 mt-1" />
                <p className="text-[16px] sm:text-[18px] font-poppins font-light text-justify">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 - CTA */}
      <section id="akun" className="bg-white w-full scroll-mt-24">
        <div className="autoMid min-h-[460px] py-[48px] px-4 sm:px-6 lg:px-0 grid grid-cols-1 lg:grid-cols-10 gap-10 lg:gap-20 items-start">
          <div className="order-1 lg:order-2 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card
              link="/expo/image/ImgBest1.svg"
              className="w-full aspect-video object-cover rounded-xl shadow-xl"
              title="Best 1"
            />
            <Card
              link="/expo/image/ImgBest2.svg"
              className="w-full aspect-video object-cover rounded-xl shadow-xl"
              title="Best 2"
            />
          </div>

          <div className="order-2 lg:order-1 lg:col-span-4 flex flex-col gap-8 items-center text-center lg:items-start lg:text-left">
            <div className="text-main-blue">
              <p className="font-poppins font-thin text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-none">
                CURIOUS?
              </p>
              <div className="flex items-end justify-center lg:justify-start gap-3 whitespace-nowrap leading-none">
                <p className="font-tilt-wrap font-bold text-4xl sm:text-5xl lg:text-6xl">
                  TRY IT
                </p>
                <p className="font-poppins font-thin text-4xl sm:text-5xl lg:text-6xl">
                  NOW
                </p>
              </div>
            </div>

            <p className="font-poppins font-light text-[16px] sm:text-lg max-w-[520px]">
              Create, explore, and discover exciting projects with an
              interactive experience that's fun and immersive.
            </p>
          </div>

          <div className="order-3 lg:col-span-10 flex justify-center lg:justify-end w-full">
            {/* <Button
              link="/register"
              className="px-10 sm:px-14 lg:px-18 py-2 lg:py-3 rounded-md hover:scale-110 transition"
            >
              Register
            </Button> */}
          </div>
        </div>
      </section>
    </div>
  );
}
