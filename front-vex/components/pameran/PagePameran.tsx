"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { GetPameran } from "./apiPameran";
import { useAuth } from "@/context/AuthContext";
import ProjectCard from "@/components/shared/ui/ProjectCard";
import { TahunType } from "@/components/shared/filter/SelectTahun";
import FilterSection from "@/components/pameran/FilterSection";

interface PameranProps {
  href?: string;
}

const ITEMS_PER_PAGE = 12; // 4 kolom x 3 baris

export default function PagePameran({ href = "/pameran/" }: PameranProps) {
  const { user } = useAuth();
  const isAdmin = Boolean(user);

  const [selectedTahun, setSelectedTahun] = useState<TahunType | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadPameran() {
      try {
        const res = await GetPameran();
        if (isMounted) {
          const list = res.pameran || res.data || [];
          setData(Array.isArray(list) ? list : []);
        }
      } catch (error) {
        console.error("Error loading pameran:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPameran();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const title = (item.title || item.judul || "").toLowerCase();
      const category = (item.category || "").toLowerCase();
      const s = search.toLowerCase();
      const matchSearch = title.includes(s) || category.includes(s);

      const itemDate = item.stats?.startDate || item.tanggal_buka || item.date;
      const matchTahun =
        !selectedTahun ||
        (itemDate && new Date(itemDate).getFullYear().toString() === selectedTahun.name);

      return matchSearch && matchTahun;
    });
  }, [data, search, selectedTahun]);

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Filter status pameran (Admin melihat semua pameran)
  const openData = filteredData.filter((item) => {
    if (isAdmin) return true;
    const startStr = item.stats?.startDate || item.tanggal_buka || item.date;
    if (!startStr) return true;
    const start = new Date(startStr);
    const endStr = item.stats?.endDate;
    if (!endStr) return today >= start;
    const end = new Date(endStr);
    end.setHours(23, 59, 59, 999);
    return today >= start && today <= end;
  });

  // Reset ke halaman 1 setiap kali filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTahun]);

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
            <FilterSection
              search={search}
              setSearch={setSearch}
              selectedTahun={selectedTahun}
              setSelectedTahun={setSelectedTahun}
            />
          </div>
        </section>

        {/* GRID SKELETON */}
        <main className="autoMid py-[40px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2.5 animate-pulse">
                <div className="aspect-video w-full rounded-md bg-gray-200" />
                <div className="h-4 w-3/4 bg-gray-200 rounded mt-1" />
                <div className="flex items-center gap-3 mt-1">
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-color font-poppins">
      {/* HERO / SEARCH BAR & FILTER SECTION */}
      <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] py-6">
        <div className="autoMid">
          <FilterSection
            search={search}
            setSearch={setSearch}
            selectedTahun={selectedTahun}
            setSelectedTahun={setSelectedTahun}
          />
        </div>
      </section>

      {/* GRID + PAGINATION */}
      <main className="autoMid py-[40px]">
        {openData.length === 0 ? (
          <p className="text-gray-400 text-xl font-bold text-center py-[200px]">
            {isAdmin ? "Belum Ada Pameran" : "Belum Ada Pameran yang Berlangsung"}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {paginatedData.map((project) => (
                <Link
                  key={project.id || project.id_pameran}
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
