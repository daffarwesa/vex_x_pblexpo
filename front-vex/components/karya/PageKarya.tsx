"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import FilterSection from "@/components/pameran/FilterSection";
import PosterCard from "@/components/karya/KaryaPosterCard";
import { KaryaItem, PameranItem } from "@/types/karya";
import { TahunType } from "@/components/shared/filter/SelectTahun";
import { KategoriType } from "@/components/shared/filter/SelectKategori";
import { useAuth } from "@/context/AuthContext";
import { GetKarya, GetKaryaAdmin, GetKaryaKps } from "./apiKarya";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

interface Props {
  href: string;
}

export default function PageKarya({ href }: Props) {
  const { user, loading: authLoading } = useAuth();

  const isAdmin = user?.role === "Admin";
  const isKps = user?.role === "KPS";

  const [karyaList, setKaryaList] = useState<KaryaItem[]>([]);
  const [pameranList, setPameranList] = useState<PameranItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters: Search, Tahun, Pameran, Kategori
  const [search, setSearch] = useState("");
  const [selectedTahun, setSelectedTahun] = useState<TahunType | null>(null);
  const [selectedPameran, setSelectedPameran] = useState<PameranItem | null>(null);
  const [selectedKategori, setSelectedKategori] = useState<KategoriType | null>(null);

  // Pagination 4x3 (12 items)
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 12;

  // =============================
  // FETCH
  // =============================
  useEffect(() => {
    if (authLoading) return;

    const fetchKarya = async () => {
      try {
        const res = isKps
          ? await GetKaryaKps()
          : isAdmin
            ? await GetKaryaAdmin()
            : await GetKarya();

        const raw = res.karya ?? [];
        const data: KaryaItem[] = raw.map((item: any) => {
          const tanggalMulai =
            item.stan?.pameran?.tanggal_mulai ?? item.pameran?.tanggal_mulai ?? "";
          const bulan = tanggalMulai ? new Date(tanggalMulai).getMonth() + 1 : 0;
          const semester =
            bulan >= 8 || bulan <= 2 ? "Ganjil" : bulan >= 3 ? "Genap" : "";

          return {
            id: item.id_karya ?? item.id,
            title: item.judul ?? item.title,
            description: item.deskripsi ?? item.description,
            category:
              item.stan?.pameran?.kategori ??
              item.pameran?.kategori ??
              item.kategori ??
              item.category ??
              "",
            image: item.gambar_poster
              ? `http://localhost:8000/storage/${item.gambar_poster}`
              : item.image ?? "",
            thumbnail: item.gambar_sampul
              ? `http://localhost:8000/storage/${item.gambar_sampul}`
              : item.thumbnail ?? "",
            link: item.tautan ?? item.link ?? "",
            year: tanggalMulai ? tanggalMulai.slice(0, 4) : item.year ?? "",
            semester,
            booth: String(item.id_stan ?? item.booth ?? ""),
            pameranId: item.id_pameran ?? item.pameranId,
            pameranTitle:
              item.stan?.pameran?.judul ??
              item.pameran?.judul ??
              item.pameranTitle ??
              `Pameran #${item.id_pameran ?? item.pameranId}`,
            isTerbaik: item.is_terbaik ?? item.isTerbaik ?? false,
            juara: item.juara ?? (item.is_terbaik ? 1 : null),
          };
        });

        setKaryaList(data);

        const pameranMap = new Map<number, PameranItem>();
        data.forEach((item) => {
          if (item.pameranId && !pameranMap.has(item.pameranId)) {
            pameranMap.set(item.pameranId, {
              id: item.pameranId,
              title: item.pameranTitle ?? `Pameran #${item.pameranId}`,
            });
          }
        });
        setPameranList(Array.from(pameranMap.values()));
      } catch (err) {
        console.error("Gagal memuat karya:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchKarya();
  }, [authLoading, isAdmin, isKps]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTahun, selectedPameran, selectedKategori]);

  // =============================
  // FILTER DATA (Flat tanpa grouping)
  // =============================
  const filteredData = useMemo(() => {
    return karyaList.filter((item) => {
      const keyword = search.toLowerCase();
      const matchSearch =
        (item.title ?? "").toLowerCase().includes(keyword) ||
        (item.category ?? "").toLowerCase().includes(keyword) ||
        (item.pameranTitle ?? "").toLowerCase().includes(keyword);

      const matchTahun = !selectedTahun || item.year === selectedTahun.name;
      const matchPameran =
        !selectedPameran || item.pameranId === selectedPameran.id;
      const matchKategori =
        !selectedKategori ||
        item.category.toLowerCase() === selectedKategori.name.toLowerCase();

      return matchSearch && matchTahun && matchPameran && matchKategori;
    });
  }, [karyaList, search, selectedTahun, selectedPameran, selectedKategori]);

  // =============================
  // PAGINATION 4x3 (12/halaman)
  // =============================
  const totalPages = Math.ceil(filteredData.length / PER_PAGE) || 1;
  const paginatedKarya = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return filteredData.slice(start, start + PER_PAGE);
  }, [filteredData, currentPage]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-secondary-color font-poppins">
        {/* HERO SKELETON */}
        <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] py-6">
          <div className="autoMid">
            <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-[30px] pb-5">
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse flex-1" />
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse w-full sm:w-[140px]" />
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse w-full sm:w-[140px]" />
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse w-full sm:w-[140px]" />
            </div>
          </div>
        </section>

        {/* CARDS SKELETON (4x3 = 12) */}
        <main className="autoMid py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[280px] rounded-xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-color font-poppins">
      {/* FILTER SECTION */}
      <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] py-6">
        <div className="autoMid">
          <FilterSection
            search={search}
            setSearch={setSearch}
            isKaryaFilter={true}
            selectedTahun={selectedTahun}
            setSelectedTahun={setSelectedTahun}
            pameranList={pameranList}
            selectedPameran={selectedPameran}
            setSelectedPameran={setSelectedPameran}
            selectedKategori={selectedKategori}
            setSelectedKategori={setSelectedKategori}
            searchPlaceholder="Cari judul, pameran, atau kategori..."
          />
        </div>
      </section>

      {/* LIST KARYA (FLAT 4x3 GRID) */}
      <main className="autoMid py-10">
        {filteredData.length === 0 ? (
          <p className="py-20 text-center text-sm text-gray-400">
            Belum ada karya yang sesuai dengan filter.
          </p>
        ) : (
          <>
            {/* Grid 4 Kolom x 3 Baris */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {paginatedKarya.map((karya) => (
                <Link key={karya.id} href={`${href}${karya.id}`}>
                  <PosterCard karya={karya} pameranList={pameranList} />
                </Link>
              ))}
            </div>

            {/* Kontrol Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 select-none">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
                >
                  <HiChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl font-semibold text-sm transition shadow-sm ${
                      currentPage === page
                        ? "bg-main-blue text-white"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
                >
                  <HiChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
