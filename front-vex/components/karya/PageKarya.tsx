"use client";

import { useEffect, useMemo, useState } from "react";
import FilterSection from "@/components/pameran/FilterSection";
import KaryaGrid from "@/components/karya/KaryaGrid";
import { KaryaItem, PameranItem } from "@/types/karya";
import { KATEGORI_OPTIONS } from "@/types/pameran";
import { KategoriType } from "@/components/shared/filter/SelectKategori";
import { TahunType } from "@/components/shared/filter/SelectTahun";
import { SemesterType } from "@/components/shared/filter/SelectSemester";
import { useAuth } from "@/context/AuthContext";
import { GetKarya, GetKaryaAdmin, GetKaryaSemua } from "./apiKarya";

interface Props {
  href: string;
}

export default function PageKarya({ href }: Props) {
  const { user, loading: authLoading } = useAuth();

  const isAdmin   = user?.role === "Admin";
  const isCreator = user?.role === "Creator";

  const [karyaList, setKaryaList] = useState<KaryaItem[]>([]);
  const [pameranList, setPameranList] = useState<PameranItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedKategori, setSelectedKategori] = useState<KategoriType | null>(null);
  const [selectedTahun, setSelectedTahun] = useState<TahunType | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<SemesterType | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [pages, setPages] = useState<Record<string, number>>({});

  const PER_PAGE = 4;

  // =============================
  // FETCH
  // =============================
  useEffect(() => {
    if (authLoading) return;

    const fetchKarya = async () => {
      try {
        const storageBase = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://localhost:8000/storage';

        const res = isCreator && !isAdmin
          ? await GetKaryaSemua()
          : isAdmin
            ? await GetKaryaAdmin()
            : await GetKarya();

        const raw = res.karya ?? [];

        const mapRawKarya = (item: any): KaryaItem => {
          const tanggalMulai = item.stan?.pameran?.tanggal_mulai ?? item.pameran?.tanggal_mulai ?? "";
          const bulan = tanggalMulai ? new Date(tanggalMulai).getMonth() + 1 : 0;
          const semester = bulan >= 8 || bulan <= 2 ? "Ganjil" : bulan >= 3 ? "Genap" : "";

          return {
            id: item.id_karya,
            title: item.judul,
            description: item.deskripsi,
            category: item.stan?.pameran?.kategori ?? item.pameran?.kategori ?? item.category ?? "",
            image: item.gambar_poster
              ? `${storageBase}/${item.gambar_poster}`
              : item.image ?? "",
            thumbnail: item.gambar_sampul
              ? `${storageBase}/${item.gambar_sampul}`
              : item.thumbnail ?? "",
            link: item.tautan ?? item.link ?? "",
            year: tanggalMulai.slice(0, 4) || item.year || "",
            semester: semester || item.semester || "",
            booth: String(item.id_stan ?? item.booth ?? ""),
            pameranId: item.id_pameran ?? item.pameranId,
            pameranTitle:
              item.stan?.pameran?.judul ??
              item.pameran?.judul ??
              item.pameranTitle ??
              `Pameran #${item.id_pameran}`,
            isTerbaik: item.is_terbaik ?? item.isTerbaik ?? false,
          };
        };

        const data: KaryaItem[] = raw.map(mapRawKarya);

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
  }, [authLoading, isAdmin, isCreator]);

  // =============================
  // PAGINATION HELPER
  // =============================
  const changePage = (
    key: string,
    type: "next" | "prev",
    totalPages: number,
  ) => {
    setPages((prev) => {
      const current = prev[key] || 1;
      const next =
        type === "next"
          ? Math.min(current + 1, totalPages)
          : Math.max(current - 1, 1);
      return { ...prev, [key]: next };
    });
  };

  // =============================
  // DATA KPS — group by pameran
  // =============================
  const karyaByPameran = useMemo(() => {
    if (!isCreator || isAdmin) return [];

    const keyword = search.toLowerCase();
    const filtered = karyaList.filter((item) => {
      const matchSearch =
        (item.title ?? "").toLowerCase().includes(keyword) ||
        (item.pameranTitle ?? "").toLowerCase().includes(keyword);
      const matchTahun = !selectedTahun || item.year === selectedTahun.name;
      const matchSemester =
        !selectedSemester || item.semester === selectedSemester.name;
      return matchSearch && matchTahun && matchSemester;
    });

    const map = new Map<number, { pameran: PameranItem; karya: KaryaItem[] }>();
    filtered.forEach((item) => {
      if (!item.pameranId) return;
      if (!map.has(item.pameranId)) {
        const found = pameranList.find((p) => p.id === item.pameranId);
        map.set(item.pameranId, {
          pameran: found ?? {
            id: item.pameranId,
            title: item.pameranTitle ?? `Pameran #${item.pameranId}`,
          },
          karya: [],
        });
      }
      map.get(item.pameranId)!.karya.push(item);
    });

    return Array.from(map.values());
  }, [isCreator, isAdmin, karyaList, pameranList, search, selectedTahun, selectedSemester]);

  // =============================
  // DATA NON-KPS — group by category
  // =============================
  const filteredData = useMemo(() => {
    if (isCreator && !isAdmin) return [];
    return karyaList.filter((item) => {
      const kategori = KATEGORI_OPTIONS.find((p) => p.kode === item.category);
      const categoryName = kategori?.nama || item.category;
      const keyword = search.toLowerCase();
      const matchSearch =
        item.title.toLowerCase().includes(keyword) ||
        categoryName.toLowerCase().includes(keyword);
      const matchKategori = !selectedKategori || categoryName === selectedKategori.name;
      const matchTahun = !selectedTahun || item.year === selectedTahun.name;
      const matchSemester =
        !selectedSemester || item.semester === selectedSemester.name;
      return matchSearch && matchKategori && matchTahun && matchSemester;
    });
  }, [
    isCreator,
    isAdmin,
    karyaList,
    search,
    selectedKategori,
    selectedTahun,
    selectedSemester,
  ]);

  const categories = [
    ...new Set(
      filteredData.map((i) => i.category).filter((c): c is string => !!c),
    ),
  ];

  // Nama kategori KPS tidak dipakai.

  // =============================
  // LOADING
  // =============================
  // Jadi ini:
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-secondary-color font-poppins">
        {/* HERO SKELETON */}
        <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] py-6">
          <div className="autoMid">
            {/* Filter bar skeleton */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-[30px] pb-5">
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse flex-1" />
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse w-full sm:w-[140px]" />
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse w-full sm:w-[140px]" />
            </div>
          </div>
        </section>

        {/* CATEGORY + CARDS SKELETON */}
        <main className="autoMid py-10 space-y-10">
          {Array.from({ length: 2 }).map((_, catIdx) => (
            <div key={catIdx}>
              {/* Category title skeleton */}
              <div className="h-[22px] w-[140px] rounded-lg bg-gray-200 animate-pulse mb-4" />

              {/* Cards skeleton — ikuti grid KaryaGrid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[80px] rounded-xl bg-gray-200 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  // =============================
  // RENDER KPS
  // =============================
  if (isCreator && !isAdmin) {
    return (
      <div className="min-h-screen bg-secondary-color font-poppins">
        <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] py-6">
          <div className="autoMid">
            <FilterSection
              search={search}
              setSearch={setSearch}
              selectedTahun={selectedTahun}
              setSelectedTahun={setSelectedTahun}
              selectedSemester={selectedSemester}
              setSelectedSemester={setSelectedSemester}
              hideKategori={true}
              searchPlaceholder="Cari karya atau pameran..."
            />
          </div>
        </section>

        <main className="autoMid space-y-10 py-10">
          {karyaByPameran.length === 0 ? (
            <p className="py-20 text-center text-sm text-gray-400">
              Belum ada karya yang tersedia.
            </p>
          ) : (
            karyaByPameran.map(({ pameran, karya }) => {
              const key = `pameran-${pameran.id}`;
              const totalPages = Math.ceil(karya.length / PER_PAGE);
              const currentPage = pages[key] || 1;
              const start = (currentPage - 1) * PER_PAGE;
              const currentData = karya.slice(start, start + PER_PAGE);

              return (
                <KaryaGrid
                  key={pameran.id}
                  category={pameran.title}
                  data={currentData}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  href={href}
                  pameranList={pameranList}
                  onPrev={() => changePage(key, "prev", totalPages)}
                  onNext={() => changePage(key, "next", totalPages)}
                />
              );
            })
          )}
        </main>
      </div>
    );
  }

  // =============================
  // RENDER DEFAULT (Admin / Creator)
  // =============================
  return (
  <div className="min-h-screen bg-secondary-color font-poppins">
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
        hideKategori={!isAdmin}
        />
      </div>
    </section>

      <main className="autoMid space-y-10 py-10">
        {categories.length === 0 ? (
          <p className="py-20 text-center text-sm text-gray-400">
            Belum ada karya yang tersedia.
          </p>
        ) : (
          categories.map((cat) => {
            const data = filteredData.filter((item) => item.category === cat);
            const totalPages = Math.ceil(data.length / PER_PAGE);
            const currentPage = pages[cat] || 1;
            const start = (currentPage - 1) * PER_PAGE;
            const currentData = data.slice(start, start + PER_PAGE);
            const kategori = KATEGORI_OPTIONS.find((p) => p.kode === cat);
            const categoryName = kategori?.nama || cat;

            return (
              <KaryaGrid
                key={cat}
                category={categoryName}
                data={currentData}
                currentPage={currentPage}
                totalPages={totalPages}
                href={href}
                pameranList={pameranList}
                onPrev={() => changePage(cat, "prev", totalPages)}
                onNext={() => changePage(cat, "next", totalPages)}
              />
            );
          })
        )}
      </main>
    </div>
  );
}
