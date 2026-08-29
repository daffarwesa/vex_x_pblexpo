"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import {
  FaTrophy,
  FaMedal,
  FaStar,
  FaCheck,
  FaChevronRight,
  FaChevronLeft,
  FaSave,
  FaExclamationCircle,
  FaLayerGroup,
} from "react-icons/fa";
import { Button, ButtonPutih } from "@/components/shared/ui/Button";
import { showToast } from "@/components/shared/ui/ToastNotification";
import {
  GetKaryaList,
  GetKategoriList,
  SetPredikatKarya,
  SetBestKarya,
  PenilaianItem,
  KategoriItem,
} from "./apiPenilaian";

interface PagePenilaianProps {
  onOpenAddForm?: () => void;
}

export default function PagePenilaian({ onOpenAddForm }: PagePenilaianProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);

  const [karyaList, setKaryaList] = useState<PenilaianItem[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriItem[]>([]);

  // State Pemenang Kategori: { [id_kategori]: { juara1?: id_karya, juara2?: id_karya } }
  const [kategoriWinners, setKategoriWinners] = useState<
    Record<number, { juara1?: number | null; juara2?: number | null }>
  >({});

  // State Best Global: { best1?: id_karya, best2?: id_karya, best3?: id_karya }
  const [bestWinners, setBestWinners] = useState<{
    best1?: number | null;
    best2?: number | null;
    best3?: number | null;
  }>({});

  const [selectedKategoriTab, setSelectedKategoriTab] = useState<number | null>(
    null,
  );

  // Pagination State (Grid 3x3 = 9 items per page)
  const ITEMS_PER_PAGE = 9;
  const [pagePerKategori, setPagePerKategori] = useState<
    Record<number, number>
  >({});
  const [pageBest, setPageBest] = useState<number>(1);

  const getCurrentPage = (id_kategori: number) =>
    pagePerKategori[id_kategori] || 1;
  const setPageForKategori = (id_kategori: number, page: number) => {
    setPagePerKategori((prev) => ({ ...prev, [id_kategori]: page }));
  };

  // =============================
  // FETCH DATA AWAL
  // =============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [karyaRes, kategoriRes] = await Promise.all([
          GetKaryaList(),
          GetKategoriList(),
        ]);

        setKaryaList(karyaRes);
        setKategoriList(kategoriRes);

        if (kategoriRes.length > 0) {
          setSelectedKategoriTab(kategoriRes[0].id_kategori);
        }

        // Init winners dari data existing di DB
        const initialKategoriWinners: Record<
          number,
          { juara1?: number | null; juara2?: number | null }
        > = {};
        const initialBestWinners: {
          best1?: number | null;
          best2?: number | null;
          best3?: number | null;
        } = {};

        karyaRes.forEach((k) => {
          if (k.id_kategori) {
            if (!initialKategoriWinners[k.id_kategori]) {
              initialKategoriWinners[k.id_kategori] = {};
            }
            if (k.predikat === "1") {
              initialKategoriWinners[k.id_kategori].juara1 = k.id_karya;
            } else if (k.predikat === "2") {
              initialKategoriWinners[k.id_kategori].juara2 = k.id_karya;
            }
          }

          if (k.is_best === "1") {
            initialBestWinners.best1 = k.id_karya;
          } else if (k.is_best === "2") {
            initialBestWinners.best2 = k.id_karya;
          } else if (k.is_best === "3") {
            initialBestWinners.best3 = k.id_karya;
          }
        });

        setKategoriWinners(initialKategoriWinners);
        setBestWinners(initialBestWinners);
      } catch (err) {
        console.error("Gagal memuat data penilaian:", err);
        showToast("Gagal memuat data karya dan kategori.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper poster url
  const getPosterSrc = (karya: PenilaianItem) => {
    if (!karya.gambar_poster) return "/images/placeholder-karya.jpg";
    if (karya.gambar_poster.startsWith("http")) return karya.gambar_poster;
    const base =
      process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";
    return `${base}/${karya.gambar_poster}`;
  };

  // Group karya per kategori
  const karyaByKategori = useMemo(() => {
    const map: Record<number, PenilaianItem[]> = {};
    karyaList.forEach((k) => {
      if (!map[k.id_kategori]) map[k.id_kategori] = [];
      map[k.id_kategori].push(k);
    });
    return map;
  }, [karyaList]);

  // Handler toggle Juara Kategori (Auto Save)
  const handleSelectJuaraKategori = async (
    id_kategori: number,
    id_karya: number,
    rank: "juara1" | "juara2",
  ) => {
    const current = kategoriWinners[id_kategori] || {};
    const otherRank = rank === "juara1" ? "juara2" : "juara1";
    const predikatVal = rank === "juara1" ? "1" : "2";
    const isUnselect = current[rank] === id_karya;

    // Optimistic UI update
    setKategoriWinners((prev) => {
      const prevCurrent = prev[id_kategori] || {};
      if (isUnselect) {
        return {
          ...prev,
          [id_kategori]: { ...prevCurrent, [rank]: null },
        };
      }
      const newOther =
        prevCurrent[otherRank] === id_karya ? null : prevCurrent[otherRank];
      return {
        ...prev,
        [id_kategori]: {
          ...prevCurrent,
          [otherRank]: newOther,
          [rank]: id_karya,
        },
      };
    });

    try {
      if (isUnselect) {
        await SetPredikatKarya(id_karya, null);
        showToast(`Juara ${predikatVal} dibatalkan`, "info");
      } else {
        // Jika sebelumnya karya lain pegang rank ini, batalkan dulu di DB
        if (current[rank] && current[rank] !== id_karya) {
          await SetPredikatKarya(current[rank]!, null);
        }
        await SetPredikatKarya(id_karya, predikatVal);
        showToast(
          `Karya berhasil ditandai sebagai Juara ${predikatVal}!`,
          "success",
        );
      }
    } catch (err) {
      console.error("Gagal update predikat:", err);
      showToast("Gagal memperbarui status juara di server.", "error");
    }
  };

  // Handler toggle Best Global (Auto Save)
const handleSelectBest = async (
  id_karya: number,
  rank: "best1" | "best2" | "best3",
) => {
  const rankValue = rank === "best1" ? "1" : rank === "best2" ? "2" : "3";
  const isUnselect = bestWinners[rank] === id_karya;

  // Optimistic UI update
  setBestWinners((prev) => {
    if (isUnselect) {
      return { ...prev, [rank]: null };
    }
    const cleaned: typeof prev = { ...prev };
    if (cleaned.best1 === id_karya) cleaned.best1 = null;
    if (cleaned.best2 === id_karya) cleaned.best2 = null;
    if (cleaned.best3 === id_karya) cleaned.best3 = null;
    return { ...cleaned, [rank]: id_karya };
  });

  try {
    if (isUnselect) {
      await SetBestKarya(id_karya, null);
      showToast(`Status Best dibatalkan`, "info");
    } else {
      // Jika karya lama ada di rank ini, batalkan
      if (bestWinners[rank] && bestWinners[rank] !== id_karya) {
        await SetBestKarya(bestWinners[rank]!, null);
      }
      await SetBestKarya(id_karya, rankValue);
      const rankLabel =
        rank === "best1" ? "Best 1" : rank === "best2" ? "Best 2" : "Best 3";
      showToast(`Karya berhasil ditandai sebagai ${rankLabel}!`, "success");
    }
  } catch (err) {
    console.error("Gagal update Best:", err);
    showToast("Gagal memperbarui status Best di server.", "error");
  }
};

  // Hitung total kategori terisi
  const totalKategoriTerisi = useMemo(() => {
    let count = 0;
    kategoriList.forEach((kat) => {
      const w = kategoriWinners[kat.id_kategori];
      if (w?.juara1 || w?.juara2) count++;
    });
    return count;
  }, [kategoriList, kategoriWinners]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-color font-poppins pb-24">
        <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] py-16"></section>
        <div className="max-w-[1200px] mx-auto px-4 py-[300px] flex justify-center">
          <div className="w-10 h-10 border-4 border-main-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-color font-poppins pb-28 select-none">
      {/* HEADER HERO */}
      <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] py-8 text-white shadow-md">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Penilaian Karya PBL
                </h1>
              </div>
              <p className="text-white/80 text-xs md:text-sm mt-1">
                Tentukan Juara 1 & 2 untuk setiap kategori serta 3 Karya Best
                Global.
              </p>
            </div>

            {/* STEP PROGRESS INDICATOR */}
            <div className="flex items-center bg-white/10 backdrop-blur-sm p-1.5 rounded-2xl border border-white/20">
              <button
                onClick={() => setStep(1)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  step === 1
                    ? "bg-white text-main-blue shadow"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <span>1.</span> Juara Kategori
              </button>
              <button
                onClick={() => setStep(2)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  step === 2
                    ? "bg-white text-main-blue shadow"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <span>2.</span> Best Global
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT BODY */}
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        {/* ========================================================= */}
        {/* STEP 1: PENILAIAN PER KATEGORI                            */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Kategori Dropdown Selector */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="w-full sm:max-w-md">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Pilih Kategori PBL
                </label>
                <Listbox
                  value={selectedKategoriTab}
                  onChange={(val) => {
                    if (val !== null) {
                      setSelectedKategoriTab(val);
                      setPageForKategori(val, 1);
                    }
                  }}
                >
                  <div className="relative">
                    <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-gray-50 hover:bg-gray-100/80 py-2.5 pl-3.5 pr-10 text-left text-sm font-medium text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue transition">
                      <div className="flex items-center gap-2 truncate">
                        <FaLayerGroup
                          className="text-main-blue shrink-0"
                          size={14}
                        />
                        {(() => {
                          const current = kategoriList.find(
                            (k) => k.id_kategori === selectedKategoriTab,
                          );
                          if (!current)
                            return (
                              <span className="text-gray-400">
                                Pilih Kategori
                              </span>
                            );
                          const winner = kategoriWinners[current.id_kategori];
                          const hasWinner = Boolean(
                            winner?.juara1 || winner?.juara2,
                          );

                          return (
                            <span className="truncate flex items-center gap-2">
                              <span className="font-bold text-main-blue">
                                {current.kode_kategori}
                              </span>
                              <span className="text-gray-600">
                                — {current.nama_kategori}
                              </span>
                              {hasWinner && (
                                <span className="inline-flex items-center text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                                  ✓ Dinilai
                                </span>
                              )}
                            </span>
                          );
                        })()}
                      </div>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </ListboxButton>

                    <ListboxOptions
                      transition
                      className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-xl bg-white p-1 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none data-[closed]:opacity-0 data-[leave]:duration-100"
                    >
                      {kategoriList.map((kat) => {
                        const isSelected =
                          selectedKategoriTab === kat.id_kategori;
                        const winner = kategoriWinners[kat.id_kategori];
                        const hasWinner = Boolean(
                          winner?.juara1 || winner?.juara2,
                        );

                        return (
                          <ListboxOption
                            key={kat.id_kategori}
                            value={kat.id_kategori}
                            className={`relative cursor-pointer select-none rounded-lg py-2 pl-3 pr-8 transition flex items-center justify-between ${
                              isSelected
                                ? "bg-main-blue/10 text-main-blue font-semibold"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                  isSelected
                                    ? "bg-main-blue text-white"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {kat.kode_kategori}
                              </span>
                              <span className="truncate">
                                {kat.nama_kategori}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {hasWinner && (
                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
                                  ✓ Dinilai
                                </span>
                              )}
                              {isSelected && (
                                <CheckIcon
                                  className="h-4 w-4 text-main-blue"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          </ListboxOption>
                        );
                      })}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>

              {/* Progress Summary */}
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200/80 self-start sm:self-auto">
                <div className="w-9 h-9 rounded-lg bg-main-blue/10 text-main-blue flex items-center justify-center font-bold text-sm">
                  {totalKategoriTerisi}/{kategoriList.length}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Progres Kategori
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {totalKategoriTerisi === kategoriList.length
                      ? "Semua kategori selesai dinilai"
                      : `${kategoriList.length - totalKategoriTerisi} kategori belum selesai`}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Category Display */}
            {selectedKategoriTab && (
              <div>
                {(() => {
                  const currentKat = kategoriList.find(
                    (k) => k.id_kategori === selectedKategoriTab,
                  );
                  const allKaryasInKat =
                    karyaByKategori[selectedKategoriTab] || [];
                  const winner = kategoriWinners[selectedKategoriTab] || {};

                  // Paginasi 3x3 (9 items per page)
                  const currentPage = getCurrentPage(selectedKategoriTab);
                  const totalPages =
                    Math.ceil(allKaryasInKat.length / ITEMS_PER_PAGE) || 1;
                  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                  const currentKaryas = allKaryasInKat.slice(
                    startIndex,
                    startIndex + ITEMS_PER_PAGE,
                  );

                  return (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                        <div>
                          <span className="text-xs font-bold text-main-blue bg-blue-50 px-2.5 py-1 rounded-md">
                            {currentKat?.kode_kategori}
                          </span>
                          <h2 className="text-lg font-bold text-gray-800 mt-1">
                            {currentKat?.nama_kategori}
                          </h2>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2.5 text-xs">
                            {/* Juara 1 Status Badge */}
                            <div
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                                winner.juara1
                                  ? "bg-yellow-400 text-yellow-950 border-yellow-500 font-bold shadow-sm"
                                  : "bg-gray-100 text-gray-400 border-gray-200 border-dashed font-medium"
                              }`}
                            >
                              <FaTrophy
                                className={
                                  winner.juara1
                                    ? "text-yellow-950"
                                    : "text-gray-400"
                                }
                              />
                              <span>
                                Juara 1:{" "}
                                {winner.juara1 ? "✓ Terpilih" : "Belum"}
                              </span>
                            </div>

                            {/* Juara 2 Status Badge */}
                            <div
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                                winner.juara2
                                  ? "bg-slate-700 text-white border-slate-800 font-bold shadow-sm"
                                  : "bg-gray-100 text-gray-400 border-gray-200 border-dashed font-medium"
                              }`}
                            >
                              <FaMedal
                                className={
                                  winner.juara2 ? "text-white" : "text-gray-400"
                                }
                              />
                              <span>
                                Juara 2:{" "}
                                {winner.juara2 ? "✓ Terpilih" : "Belum"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Karya Grid Cards */}
                      {allKaryasInKat.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 space-y-3">
                          <FaExclamationCircle className="text-3xl text-gray-300 mx-auto" />
                          <p className="text-sm text-gray-500 font-medium">
                            Belum ada karya yang diunggah untuk kategori ini.
                          </p>
                          {onOpenAddForm && (
                            <Button
                              onClick={onOpenAddForm}
                              className="px-4 py-2 rounded-xl text-xs font-semibold"
                            >
                              + Tambah Karya Sekarang
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentKaryas.map((karya) => {
                              const isJuara1 = winner.juara1 === karya.id_karya;
                              const isJuara2 = winner.juara2 === karya.id_karya;

                              return (
                                <div
                                  key={karya.id_karya}
                                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between group ${
                                    isJuara1
                                      ? "border-yellow-400 shadow-md ring-2 ring-yellow-400/30"
                                      : isJuara2
                                        ? "border-slate-400 shadow-md ring-2 ring-slate-400/30"
                                        : "border-gray-200 hover:border-main-blue hover:shadow-md"
                                  }`}
                                >
                                  {/* Area Klik untuk Edit Karya */}
                                  <div
                                    onClick={() =>
                                      router.push(
                                        `/admin/karya/${karya.id_karya}`,
                                      )
                                    }
                                    className="cursor-pointer"
                                    title="Klik untuk melihat detail / edit karya"
                                  >
                                    {/* Poster Preview 3:4 */}
                                    <div className="w-full aspect-[3/4] bg-gray-100 relative overflow-hidden">
                                      <img
                                        src={getPosterSrc(karya)}
                                        alt={karya.judul}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                      {/* Badges */}
                                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                                        {isJuara1 && (
                                          <span className="bg-yellow-400 text-yellow-950 text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                                            <FaTrophy size={11} /> Juara 1
                                          </span>
                                        )}
                                        {isJuara2 && (
                                          <span className="bg-slate-300 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                                            <FaMedal size={11} /> Juara 2
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                      <h3 className="font-bold text-sm text-gray-800 line-clamp-2 group-hover:text-main-blue transition-colors">
                                        {karya.judul}
                                      </h3>
                                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                        {karya.deskripsi ||
                                          "Tidak ada deskripsi"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="p-4 pt-0 flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSelectJuaraKategori(
                                          selectedKategoriTab,
                                          karya.id_karya,
                                          "juara1",
                                        )
                                      }
                                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                                        isJuara1
                                          ? "bg-yellow-400 text-yellow-950 border-yellow-500 shadow-md ring-2 ring-yellow-400/40"
                                          : "bg-white text-gray-700 border-gray-300 hover:bg-yellow-50 hover:border-yellow-300"
                                      }`}
                                    >
                                      <FaTrophy
                                        className={
                                          isJuara1
                                            ? "text-yellow-950"
                                            : "text-yellow-500"
                                        }
                                      />
                                      <span>
                                        {isJuara1
                                          ? "Juara 1 ✓"
                                          : "Pilih Juara 1"}
                                      </span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSelectJuaraKategori(
                                          selectedKategoriTab,
                                          karya.id_karya,
                                          "juara2",
                                        )
                                      }
                                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                                        isJuara2
                                          ? "bg-slate-800 text-white border-slate-900 shadow-md ring-2 ring-slate-700/40"
                                          : "bg-white text-gray-700 border-gray-300 hover:bg-slate-100 hover:border-slate-400"
                                      }`}
                                    >
                                      <FaMedal
                                        className={
                                          isJuara2
                                            ? "text-white"
                                            : "text-slate-500"
                                        }
                                      />
                                      <span>
                                        {isJuara2
                                          ? "Juara 2 ✓"
                                          : "Pilih Juara 2"}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Pagination 3x3 Navigation */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-sm">
                              <p className="text-xs text-gray-500">
                                Menampilkan {startIndex + 1} -{" "}
                                {Math.min(
                                  startIndex + ITEMS_PER_PAGE,
                                  allKaryasInKat.length,
                                )}{" "}
                                dari {allKaryasInKat.length} karya
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPageForKategori(
                                      selectedKategoriTab,
                                      Math.max(1, currentPage - 1),
                                    )
                                  }
                                  disabled={currentPage === 1}
                                  className="p-2 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                  <FaChevronLeft size={12} />
                                </button>
                                <span className="text-xs font-bold text-gray-700 px-2">
                                  {currentPage} / {totalPages}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPageForKategori(
                                      selectedKategoriTab,
                                      Math.min(totalPages, currentPage + 1),
                                    )
                                  }
                                  disabled={currentPage === totalPages}
                                  className="p-2 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                  <FaChevronRight size={12} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Bottom Nav Next */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-main-blue text-white"
              >
                <span>Pindah ke Best Global</span>
                <FaChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: PENILAIAN BEST GLOBAL (BEST 1, 2, 3)              */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                  Global Award
                </span>
                <h2 className="text-lg font-bold text-gray-800 mt-1">
                  Pilih 3 Karya Terbaik (Best 1, Best 2, Best 3)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Dipilih dari seluruh karya yang ada di semua kategori.
                </p>
              </div>

              {/* Status Pilihan Best */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                    bestWinners.best1
                      ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                      : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
                >
                  <FaStar className="text-amber-500" /> Best 1:{" "}
                  {bestWinners.best1 ? "✓" : "Belum"}
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                    bestWinners.best2
                      ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                      : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
                >
                  <FaStar className="text-amber-500" /> Best 2:{" "}
                  {bestWinners.best2 ? "✓" : "Belum"}
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                    bestWinners.best3
                      ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                      : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
                >
                  <FaStar className="text-amber-500" /> Best 3:{" "}
                  {bestWinners.best3 ? "✓" : "Belum"}
                </div>
              </div>
            </div>

            {/* Grid Semua Karya with Pagination 3x3 */}
            {(() => {
              const totalPagesBest =
                Math.ceil(karyaList.length / ITEMS_PER_PAGE) || 1;
              const startIndexBest = (pageBest - 1) * ITEMS_PER_PAGE;
              const currentBestKaryas = karyaList.slice(
                startIndexBest,
                startIndexBest + ITEMS_PER_PAGE,
              );

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentBestKaryas.map((karya) => {
                      const isBest1 = bestWinners.best1 === karya.id_karya;
                      const isBest2 = bestWinners.best2 === karya.id_karya;
                      const isBest3 = bestWinners.best3 === karya.id_karya;
                      const isAnyBest = isBest1 || isBest2 || isBest3;

                      const kat = kategoriList.find(
                        (k) => k.id_kategori === karya.id_kategori,
                      );

                      return (
                        <div
                          key={karya.id_karya}
                          className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between group ${
                            isAnyBest
                              ? "border-amber-400 shadow-md ring-2 ring-amber-400/30"
                              : "border-gray-200 hover:border-main-blue hover:shadow-md"
                          }`}
                        >
                          {/* Area Klik untuk Edit Karya */}
                          <div
                            onClick={() =>
                              router.push(`/admin/karya/${karya.id_karya}`)
                            }
                            className="cursor-pointer"
                            title="Klik untuk melihat detail / edit karya"
                          >
                            {/* Poster 3:4 */}
                            <div className="w-full aspect-[3/4] bg-gray-100 relative overflow-hidden">
                              <img
                                src={getPosterSrc(karya)}
                                alt={karya.judul}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 left-2">
                                <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  {kat?.kode_kategori || "PBL"}
                                </span>
                              </div>
                              <div className="absolute top-2 right-2 flex flex-col gap-1">
                                {isBest1 && (
                                  <span className="bg-amber-400 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                                    <FaStar size={11} /> Best 1
                                  </span>
                                )}
                                {isBest2 && (
                                  <span className="bg-amber-300 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                                    <FaStar size={11} /> Best 2
                                  </span>
                                )}
                                {isBest3 && (
                                  <span className="bg-amber-200 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                                    <FaStar size={11} /> Best 3
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                              <h3 className="font-bold text-sm text-gray-800 line-clamp-2 group-hover:text-main-blue transition-colors">
                                {karya.judul}
                              </h3>
                              <p className="text-xs text-gray-400 mt-1">
                                {kat?.nama_kategori || "-"}
                              </p>
                            </div>
                          </div>

                          {/* Best 1, 2, 3 Selector */}
                          <div className="p-4 pt-0 grid grid-cols-3 gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectBest(karya.id_karya, "best1")
                              }
                              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                                isBest1
                                  ? "bg-amber-400 text-amber-950 border-amber-500 font-bold shadow-sm"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-amber-50"
                              }`}
                            >
                              <FaStar
                                size={10}
                                className={
                                  isBest1 ? "text-amber-950" : "text-amber-500"
                                }
                              />
                              <span>Best 1</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleSelectBest(karya.id_karya, "best2")
                              }
                              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                                isBest2
                                  ? "bg-amber-300 text-amber-950 border-amber-400 font-bold shadow-sm"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-amber-50"
                              }`}
                            >
                              <FaStar
                                size={10}
                                className={
                                  isBest2 ? "text-amber-950" : "text-amber-500"
                                }
                              />
                              <span>Best 2</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleSelectBest(karya.id_karya, "best3")
                              }
                              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                                isBest3
                                  ? "bg-amber-200 text-amber-950 border-amber-300 font-bold shadow-sm"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-amber-50"
                              }`}
                            >
                              <FaStar
                                size={10}
                                className={
                                  isBest3 ? "text-amber-950" : "text-amber-500"
                                }
                              />
                              <span>Best 3</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Best 3x3 */}
                  {totalPagesBest > 1 && (
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-sm">
                      <p className="text-xs text-gray-500">
                        Menampilkan {startIndexBest + 1} -{" "}
                        {Math.min(
                          startIndexBest + ITEMS_PER_PAGE,
                          karyaList.length,
                        )}{" "}
                        dari {karyaList.length} karya
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPageBest((prev) => Math.max(1, prev - 1))
                          }
                          disabled={pageBest === 1}
                          className="p-2 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <FaChevronLeft size={12} />
                        </button>
                        <span className="text-xs font-bold text-gray-700 px-2">
                          {pageBest} / {totalPagesBest}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPageBest((prev) =>
                              Math.min(totalPagesBest, prev + 1),
                            )
                          }
                          disabled={pageBest === totalPagesBest}
                          className="p-2 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <FaChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Nav Step */}
            <div className="flex justify-start items-center pt-4">
              <ButtonPutih
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
              >
                <FaChevronLeft size={13} />
                <span>Kembali ke Juara Kategori</span>
              </ButtonPutih>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
