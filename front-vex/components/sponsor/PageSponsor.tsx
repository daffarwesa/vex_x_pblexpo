"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/shared/filter/SearchBar";
import SelectTahun, { TahunType } from "@/components/shared/filter/SelectTahun";
import SelectTipeSponsor, { TipeSponsorType } from "@/components/shared/filter/SelectTipeSponsor";
import SponsorGrid from "@/components/sponsor/SponsorGrid";
import { SponsorItem } from "@/types/sponsor";
import { GetSponsor } from "@/components/sponsor/apiSponsor";

interface Props {
  href: string;
}

const PER_PAGE = 5;

export default function PageSponsor({ href }: Props) {
  const [sponsorList, setSponsorList] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedTahun, setSelectedTahun] = useState<TahunType | null>(null);
  const [selectedTipe, setSelectedTipe] = useState<TipeSponsorType | null>(null);
  const [pages, setPages] = useState<Record<string, number>>({});

  // =============================
  // FETCH
  // =============================
  useEffect(() => {
    const fetchSponsor = async () => {
      try {
        const storageBase =
          process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

        const res = await GetSponsor();
        const raw = res.sponsor ?? [];

        const data: SponsorItem[] = raw.map((item: any) => ({
          id: item.id_sponsor ?? item.id,
          title: item.judul ?? item.title ?? "",
          type: item.tipe ?? item.type ?? "kecil",
          year: String(item.tahun ?? item.year ?? ""),
          poster: item.gambar_poster
            ? `${storageBase}/${item.gambar_poster}`
            : item.poster ?? "",
        }));

        setSponsorList(data);
      } catch (err) {
        console.error("Gagal memuat sponsor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsor();
  }, []);

  // =============================
  // PAGINATION HELPER
  // =============================
  const changePage = (key: string, type: "next" | "prev", totalPages: number) => {
    setPages((prev) => {
      const current = prev[key] || 1;
      const next =
        type === "next" ? Math.min(current + 1, totalPages) : Math.max(current - 1, 1);
      return { ...prev, [key]: next };
    });
  };

  // =============================
  // FILTER
  // =============================
  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase();
    return sponsorList.filter((item) => {
      const matchSearch = item.title.toLowerCase().includes(keyword);
      const matchTahun = !selectedTahun || item.year === selectedTahun.name;
      const matchTipe = !selectedTipe || item.type === selectedTipe.value;
      return matchSearch && matchTahun && matchTipe;
    });
  }, [sponsorList, search, selectedTahun, selectedTipe]);

  const years = useMemo(
    () =>
      Array.from(new Set(filteredData.map((i) => i.year))).sort(
        (a, b) => Number(b) - Number(a),
      ),
    [filteredData],
  );

  // =============================
  // LOADING
  // =============================
  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-color font-poppins">
        <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] py-6">
          <div className="autoMid">
            <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-[30px] pb-5">
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse flex-1" />
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse w-full sm:w-[140px]" />
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse w-full sm:w-[160px]" />
            </div>
          </div>
        </section>

        <main className="autoMid py-10 space-y-10">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx}>
              <div className="h-[22px] w-[100px] rounded-lg bg-gray-200 animate-pulse mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  // =============================
  // RENDER
  // =============================
  return (
    <div className="min-h-screen bg-secondary-color font-poppins">      
      <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] w-full pt-4 md:pt-[30px] pb-5">

 <div className="autoMid hidden md:flex flex-col pt-4 md:pt-[30px] pb-5 lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-center justify-between">
          {/* SEARCH */}
          <div className="w-full lg:w-[50%]">
           <SearchBar
                text="Cari sponsor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
          </div>

          {/* FILTERS */}
          <div
            className={`w-full lg:w-[40%] grid gap-3 lg:gap-[30px] grid-cols-1 sm:grid-cols-2`}
          >
          <SelectTahun selected={selectedTahun} onChange={setSelectedTahun} />
              <SelectTipeSponsor selected={selectedTipe} onChange={setSelectedTipe} />

            {/* <SelectSemester selected={selectedSemester} onChange={setSelectedSemester} /> */}
          </div>
        </div>

      </section>

      <main className="autoMid space-y-10 py-10">
        {years.length === 0 ? (
          <p className="py-20 text-center text-sm text-gray-400">
            Belum ada sponsor yang tersedia.
          </p>
        ) : (
          years.map((year) => {
            const data = filteredData.filter((item) => item.year === year);
            const totalPages = Math.ceil(data.length / PER_PAGE);
            const currentPage = pages[year] || 1;
            const start = (currentPage - 1) * PER_PAGE;
            const currentData = data.slice(start, start + PER_PAGE);

            return (
              <SponsorGrid
                key={year}
                year={year}
                data={currentData}
                currentPage={currentPage}
                totalPages={totalPages}
                href={href}
                onPrev={() => changePage(year, "prev", totalPages)}
                onNext={() => changePage(year, "next", totalPages)}
              />
            );
          })
        )}
      </main>
    </div>
  );
}