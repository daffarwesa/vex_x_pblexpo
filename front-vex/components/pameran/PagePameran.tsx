"use client";

import { useMemo, useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { GetPameran } from "./apiPameran";
import { useAuth } from "@/context/AuthContext";

import ProjectCard from "@/components/shared/ui/ProjectCard";
import { KategoriType } from "@/components/shared/filter/SelectKategori";
import { TahunType } from "@/components/shared/filter/SelectTahun";
import { SemesterType } from "@/components/shared/filter/SelectSemester";

import FilterSection from "@/components/pameran/FilterSection";
// import CarouselSection from "@/components/pameran/CarouselSection";

interface PameranProps {
  href?: string;
}

const ITEMS_PER_PAGE = 12; // 4 kolom x 3 baris

export default function PagePameran({ href = "/pameran/" }: PameranProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [emblaRef] = useEmblaCarousel({ align: "start" });
  const [selectedKategori, setSelectedKategori] = useState<KategoriType | null>(null);
  const [selectedTahun, setSelectedTahun] = useState<TahunType | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<SemesterType | null>(
    null,
  );
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadPameran() {
      try {
        const res = await GetPameran();
        setData(res.pameran || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadPameran();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchKategori = !selectedKategori || item.category === selectedKategori.name;
      const matchTahun =
        !selectedTahun ||
        new Date(item.date).getFullYear().toString() === selectedTahun.name;
      return matchSearch && matchKategori && matchTahun;
    });
  }, [data, search, selectedKategori, selectedTahun]);

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const oneWeekLater = new Date();
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);
  oneWeekLater.setHours(23, 59, 59, 999);

  // Carousel: admin → semua yang belum mulai, user → 1-7 hari ke depan
  const upcomingData = filteredData
    .filter((item) => {
      const start = new Date(item.stats?.startDate);
      if (isAdmin) return start > today;
      return start > today && start <= oneWeekLater;
    })
    .sort(
      (a, b) =>
        new Date(a.stats?.startDate).getTime() -
        new Date(b.stats?.startDate).getTime(),
    )
    .slice(0, 5);

  // Tidak ada lagi pemisahan per kategori — semua pameran yang relevan digabung jadi satu list
  const openData = filteredData.filter((item) => {
    if (isAdmin) return true;
    const start = new Date(item.stats?.startDate);
    const end = new Date(item.stats?.endDate);
    end.setHours(23, 59, 59, 999);
    return today >= start && today <= end;
  });

  // Reset ke halaman 1 setiap kali filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedKategori, selectedTahun]);

  const totalPages = Math.max(1, Math.ceil(openData.length / ITEMS_PER_PAGE));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return openData.slice(start, start + ITEMS_PER_PAGE);
  }, [openData, currentPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-color font-poppins">
        {/* HERO SKELETON */}
        <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] py-6">
          <div className="autoMid">
            {/* Filter bar skeleton */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse flex-1" />
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse w-full sm:w-[140px]" />
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse w-full sm:w-[140px]" />
            </div>

            {/* "Segera Hadir" title skeleton */}
            <div className="h-[28px] md:h-[36px] w-[180px] rounded-lg bg-white/20 animate-pulse mb-5 md:mb-6" />
          </div>
        </section>

        {/* GRID SKELETON */}
        <main className="autoMid py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div
                key={i}
                className="h-[80px] rounded-xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-color font-poppins">
      {/* HERO WRAPPER */}
      <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] py-6">
        <div className="autoMid">
          <FilterSection
            search={search}
            setSearch={setSearch}
            selectedKategori={selectedKategori}
            setSelectedKategori={setSelectedKategori}
            selectedTahun={selectedTahun}
            setSelectedTahun={setSelectedTahun}
            selectedSemester={selectedSemester}
            setSelectedSemester={setSelectedSemester}
          />
          {/* <div className="relative">
            <h2 className="mb-5 mt-3 md:mb-6 text-2xl sm:text-3xl md:text-[40px] text-white font-semibold border-b-2 md:border-b-3 pb-2">
              SEGERA HADIR
            </h2>

            {upcomingData.length === 0 ? (
              <p className="text-white/60 text-sm py-4">
                Tidak ada pameran dalam waktu dekat.
              </p>
            ) : (
              <CarouselSection
                className="w-full text-white"
                data={upcomingData}
                href={href}
                emblaRef={emblaRef}
              />
            )}
          </div> */}
        </div>
      </section>

      {/* GRID + PAGINATION */}
      <main className="autoMid py-10">
        {openData.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">
            {isAdmin
              ? "Belum ada pameran."
              : "Tidak ada pameran yang sedang berlangsung."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {paginatedData.map((project) => (
                <Link
                  key={project.id}
                  href={`${href}${project.slug}`}
                  className="group block"
                >
                  <ProjectCard project={project} />
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-gray-100 border"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium border ${
                        page === currentPage
                          ? "bg-main-blue text-white border-main-blue"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-gray-100 border"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}