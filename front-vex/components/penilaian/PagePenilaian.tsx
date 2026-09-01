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
  FaPlus,
  FaSearch,
} from "react-icons/fa";
import { Button, ButtonPutih } from "@/components/shared/ui/Button";
import { getStorageUrl, getPublicAssetUrl } from "@/lib/utils";
import { showToast } from "@/components/shared/ui/ToastNotification";
import {
  GetKaryaList,
  GetKategoriList,
  SetPredikatKarya,
  SetBestKarya,
  PenilaianItem,
  KategoriItem,
} from "./apiPenilaian";

const BEST_CATEGORIES = [
  { key: "best1", code: "1", name: "Best Innovation to Industry" },
  { key: "best2", code: "2", name: "Best Partnership for Downstreaming" },
  { key: "best3", code: "3", name: "Best Creativity" },
  { key: "best4", code: "4", name: "Best Readiness for Market" },
  { key: "best5", code: "5", name: "Best Business Potential" },
  { key: "best6", code: "6", name: "Best Scalability" },
  { key: "best7", code: "7", name: "Best Commercial Impact" },
] as const;

interface PagePenilaianProps {
  onOpenAddForm?: () => void;
}

export default function PagePenilaian({ onOpenAddForm }: PagePenilaianProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [karyaList, setKaryaList] = useState<PenilaianItem[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriItem[]>([]);

  const [selectedBestCategoryCode, setSelectedBestCategoryCode] = useState<string>("1");

  // State Pemenang Kategori: { [id_kategori]: { juara1?: id_karya, juara2?: id_karya } }
  const [kategoriWinners, setKategoriWinners] = useState<
    Record<number, { juara1?: number | null; juara2?: number | null }>
  >({});

  // State Best Global: { [bestKey]: id_karya | null }
  const [bestWinners, setBestWinners] = useState<Record<string, number | null>>({
    best1: null,
    best2: null,
    best3: null,
    best4: null,
    best5: null,
    best6: null,
    best7: null,
  });

  const [selectedKategoriTab, setSelectedKategoriTab] = useState<number | null>(
    null,
  );
  const [selectedBestPblFilter, setSelectedBestPblFilter] = useState<number | null>(
    null,
  );
  const [searchKategori, setSearchKategori] = useState("");
  const [searchBest, setSearchBest] = useState("");

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
        const initialBestWinners: Record<string, number | null> = {
          best1: null,
          best2: null,
          best3: null,
          best4: null,
          best5: null,
          best6: null,
          best7: null,
        };

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

          if (k.is_best) {
            const matchCat = BEST_CATEGORIES.find((bc) => bc.code === String(k.is_best));
            if (matchCat) {
              initialBestWinners[matchCat.key] = k.id_karya;
            }
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

  // Helper poster url (dukung file lokal storage & direct Google Drive image)
  const getPosterSrc = (karya: PenilaianItem) => {
    if (!karya.gambar_poster) return getPublicAssetUrl("/image/defaultposter.png");
    const raw = karya.gambar_poster.trim();

    // Jika link Google Drive, ekstrak file ID menjadi direct image URL
    if (raw.includes("drive.google.com")) {
      const match =
        raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
        raw.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }

    if (raw.startsWith("http")) return raw;

    const base =
      process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";
    return `${base}/${raw}`;
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
    bestKey: string,
    code: string,
  ) => {
    setIsSyncing(true);
    const isUnselect = bestWinners[bestKey] === id_karya;

    // Optimistic UI update
    setBestWinners((prev) => {
      if (isUnselect) {
        return { ...prev, [bestKey]: null };
      }
      const cleaned: typeof prev = { ...prev };
      // Bersihkan karya ini dari kategori Best lain jika sebelumnya dipasang di sana
      Object.keys(cleaned).forEach((k) => {
        if (cleaned[k] === id_karya) cleaned[k] = null;
      });
      return { ...cleaned, [bestKey]: id_karya };
    });

    try {
      if (isUnselect) {
        await SetBestKarya(id_karya, null);
        showToast(`Status Best dibatalkan`, "info");
      } else {
        // Jika karya lama ada di rank ini, batalkan
        if (bestWinners[bestKey] && bestWinners[bestKey] !== id_karya) {
          await SetBestKarya(bestWinners[bestKey]!, null);
        }
        await SetBestKarya(id_karya, code as any);
        const catObj = BEST_CATEGORIES.find((bc) => bc.key === bestKey);
        showToast(`Karya berhasil ditandai sebagai ${catObj?.name ?? 'Best'}!`, "success");
      }
    } catch (err) {
      console.error("Gagal update Best:", err);
      showToast("Gagal memperbarui status Best di server.", "error");
    } finally {
      setIsSyncing(false);
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

  // Hitung total Best Global terisi
  const totalBestTerisi = useMemo(() => {
    let count = 0;
    BEST_CATEGORIES.forEach((bc) => {
      if (bestWinners[bc.key]) count++;
    });
    return count;
  }, [bestWinners]);

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
              <h1 className="text-2xl md:text-3xl font-bold">
                Penilaian Karya PBL
              </h1>
            </div>

            {/* TAB NAVIGATION KANAN ATAS (Juara Kategori & Best Global) */}
            <div className="flex items-center bg-white/10 backdrop-blur-sm p-1.5 rounded-2xl border border-white/20">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  step === 1
                    ? "bg-white text-main-blue shadow-md"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <span>Juara Kategori</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  step === 2
                    ? "bg-white text-main-blue shadow-md"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <span>Best Global</span>
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
            {/* Kategori Dropdown Selector & Search Input */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:max-w-xl">
                {/* Dropdown Kategori */}
                <div>
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
                      <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-gray-50 hover:bg-gray-100/80 py-2.5 pl-3.5 pr-10 text-left text-xs font-medium text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue transition">
                        <div className="flex items-center gap-2 truncate">
                          <FaLayerGroup
                            className="text-main-blue shrink-0"
                            size={13}
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
                        className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-xl bg-white p-1 text-xs shadow-xl ring-1 ring-black/5 focus:outline-none data-[closed]:opacity-0 data-[leave]:duration-100"
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
                              className={`relative cursor-pointer select-none rounded-lg py-2.5 pl-3 pr-8 transition flex items-center justify-between ${
                                isSelected
                                  ? "bg-main-blue/10 text-main-blue font-bold"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-bold text-main-blue">
                                  {kat.kode_kategori}
                                </span>
                                <span className="truncate">
                                  — {kat.nama_kategori}
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

                {/* Input Cari Karya */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Cari Karya
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchKategori}
                      onChange={(e) => {
                        setSearchKategori(e.target.value);
                        if (selectedKategoriTab) setPageForKategori(selectedKategoriTab, 1);
                      }}
                      placeholder="Cari judul karya..."
                      className="w-full p-2.5 px-3.5 pl-9 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue text-xs transition"
                    />
                    <FaSearch className="absolute left-3 top-3.5 text-gray-400" size={12} />
                  </div>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200/80 self-start md:self-auto shrink-0">
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
                  const rawKaryasInKat =
                    karyaByKategori[selectedKategoriTab] || [];
                  const winner = kategoriWinners[selectedKategoriTab] || {};

                  // Filter berdasarkan kata kunci pencarian
                  const allKaryasInKat = rawKaryasInKat.filter((k) =>
                    !searchKategori.trim() ||
                    k.judul.toLowerCase().includes(searchKategori.toLowerCase()) ||
                    (k.deskripsi && k.deskripsi.toLowerCase().includes(searchKategori.toLowerCase()))
                  );

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
        {/* STEP 2: PENILAIAN BEST GLOBAL (7 KATEGORI VIA DROPDOWN)   */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Control Bar: Dropdown Best Global, Filter Kategori PBL, Search Karya, dan Progres Best */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:max-w-3xl">
                {/* 1. Dropdown Selector Kategori Best Global */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Kategori Best Global
                  </label>
                  <Listbox
                    value={selectedBestCategoryCode}
                    onChange={(val) => {
                      if (val) {
                        setSelectedBestCategoryCode(val);
                        setPageBest(1);
                      }
                    }}
                  >
                    <div className="relative">
                      <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-gray-50 hover:bg-gray-100/80 py-2.5 pl-3.5 pr-10 text-left text-xs font-medium text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition">
                        <div className="flex items-center gap-2 truncate">
                          <FaStar className="text-amber-500 shrink-0" size={13} />
                          {(() => {
                            const currentBestCat = BEST_CATEGORIES.find(
                              (bc) => bc.code === selectedBestCategoryCode,
                            );
                            if (!currentBestCat) return <span className="text-gray-400">Pilih Best Global</span>;
                            const karyaId = bestWinners[currentBestCat.key];
                            const hasWinner = Boolean(karyaId);

                            return (
                              <span className="truncate flex items-center gap-1.5">
                                <span className="font-bold text-amber-900 truncate">{currentBestCat.name}</span>
                                {hasWinner && (
                                  <span className="inline-flex items-center text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded shrink-0">
                                    ✓
                                  </span>
                                )}
                              </span>
                            );
                          })()}
                        </div>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </ListboxButton>

                      <ListboxOptions
                        transition
                        className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-xl bg-white p-1 text-xs shadow-xl ring-1 ring-black/5 focus:outline-none data-[closed]:opacity-0 data-[leave]:duration-100"
                      >
                        {BEST_CATEGORIES.map((cat) => {
                          const isSelected = selectedBestCategoryCode === cat.code;
                          const karyaId = bestWinners[cat.key];
                          const hasWinner = Boolean(karyaId);

                          return (
                            <ListboxOption
                              key={cat.key}
                              value={cat.code}
                              className={`relative cursor-pointer select-none rounded-lg py-2.5 pl-3 pr-8 transition flex items-center justify-between ${
                                isSelected
                                  ? "bg-amber-50 text-amber-950 font-bold"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FaStar className={isSelected ? "text-amber-500" : "text-gray-400"} size={11} />
                                <span className="truncate">{cat.name}</span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {hasWinner && (
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                                    ✓ Terpilih
                                  </span>
                                )}
                                {isSelected && (
                                  <CheckIcon className="h-4 w-4 text-amber-600" aria-hidden="true" />
                                )}
                              </div>
                            </ListboxOption>
                          );
                        })}
                      </ListboxOptions>
                    </div>
                  </Listbox>
                </div>

                {/* 2. Filter Kategori PBL */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Filter Kategori PBL
                  </label>
                  <Listbox
                    value={selectedBestPblFilter}
                    onChange={(val) => {
                      setSelectedBestPblFilter(val);
                      setPageBest(1);
                    }}
                  >
                    <div className="relative">
                      <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-gray-50 hover:bg-gray-100/80 py-2.5 pl-3.5 pr-10 text-left text-xs font-medium text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue transition">
                        <div className="flex items-center gap-2 truncate">
                          <FaLayerGroup className="text-main-blue shrink-0" size={13} />
                          <span className="truncate">
                            {selectedBestPblFilter === null
                              ? "Semua Kategori PBL"
                              : kategoriList.find((k) => k.id_kategori === selectedBestPblFilter)?.nama_kategori || "Semua Kategori"}
                          </span>
                        </div>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </ListboxButton>

                      <ListboxOptions
                        transition
                        className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-xl bg-white p-1 text-xs shadow-xl ring-1 ring-black/5 focus:outline-none data-[closed]:opacity-0 data-[leave]:duration-100"
                      >
                        <ListboxOption
                          value={null}
                          className={`relative cursor-pointer select-none rounded-lg py-2.5 pl-3 pr-8 transition flex items-center justify-between ${
                            selectedBestPblFilter === null
                              ? "bg-main-blue/10 text-main-blue font-bold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="truncate">Semua Kategori PBL</span>
                          {selectedBestPblFilter === null && (
                            <CheckIcon className="h-4 w-4 text-main-blue" aria-hidden="true" />
                          )}
                        </ListboxOption>

                        {kategoriList.map((kat) => {
                          const isSelected = selectedBestPblFilter === kat.id_kategori;
                          return (
                            <ListboxOption
                              key={kat.id_kategori}
                              value={kat.id_kategori}
                              className={`relative cursor-pointer select-none rounded-lg py-2.5 pl-3 pr-8 transition flex items-center justify-between ${
                                isSelected
                                  ? "bg-main-blue/10 text-main-blue font-bold"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-bold text-main-blue">{kat.kode_kategori}</span>
                                <span className="truncate">— {kat.nama_kategori}</span>
                              </div>
                              {isSelected && (
                                <CheckIcon className="h-4 w-4 text-main-blue" aria-hidden="true" />
                              )}
                            </ListboxOption>
                          );
                        })}
                      </ListboxOptions>
                    </div>
                  </Listbox>
                </div>

                {/* 3. Input Cari Karya di Best Global */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Cari Karya
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchBest}
                      onChange={(e) => {
                        setSearchBest(e.target.value);
                        setPageBest(1);
                      }}
                      placeholder="Cari judul karya..."
                      className="w-full p-2.5 px-3.5 pl-9 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue text-xs transition"
                    />
                    <FaSearch className="absolute left-3 top-3.5 text-gray-400" size={12} />
                  </div>
                </div>
              </div>

              {/* 4. Progres Kategori Best Global Card */}
              <div className="flex items-center gap-3 bg-amber-50/60 px-4 py-2.5 rounded-xl border border-amber-200/80 self-start xl:self-auto shrink-0">
                <div className="w-9 h-9 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-extrabold text-xs shadow-sm">
                  {totalBestTerisi}/{BEST_CATEGORIES.length}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Progres Best Global</p>
                  <p className="text-[11px] text-gray-500">
                    {totalBestTerisi === BEST_CATEGORIES.length
                      ? "Semua Best Global selesai dinilai"
                      : `${BEST_CATEGORIES.length - totalBestTerisi} kategori belum dinilai`}
                  </p>
                </div>
              </div>
            </div>

            {/* Grid Semua Karya with Pagination 3x3 */}
            {(() => {
              const activeCat = BEST_CATEGORIES.find(
                (bc) => bc.code === selectedBestCategoryCode,
              ) || BEST_CATEGORIES[0];

              // Filter karya berdasarkan Kategori PBL dan kata kunci pencarian
              const filteredKaryaList = karyaList.filter((k) => {
                const matchCategory =
                  selectedBestPblFilter === null || k.id_kategori === selectedBestPblFilter;
                const matchSearch =
                  !searchBest.trim() ||
                  k.judul.toLowerCase().includes(searchBest.toLowerCase()) ||
                  (k.deskripsi && k.deskripsi.toLowerCase().includes(searchBest.toLowerCase()));
                return matchCategory && matchSearch;
              });

              const totalPagesBest =
                Math.ceil(filteredKaryaList.length / ITEMS_PER_PAGE) || 1;
              const startIndexBest = (pageBest - 1) * ITEMS_PER_PAGE;
              const currentBestKaryas = filteredKaryaList.slice(
                startIndexBest,
                startIndexBest + ITEMS_PER_PAGE,
              );

              if (filteredKaryaList.length === 0) {
                return (
                  <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 space-y-2">
                    <FaExclamationCircle className="text-3xl text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500 font-medium">
                      Tidak ada karya yang ditemukan untuk filter/pencarian ini.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentBestKaryas.map((karya) => {
                      const isSelectedAsActiveBest =
                        bestWinners[activeCat.key] === karya.id_karya;

                      const kat = kategoriList.find(
                        (k) => k.id_kategori === karya.id_kategori,
                      );

                      return (
                        <div
                          key={karya.id_karya}
                          className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between group ${
                            isSelectedAsActiveBest
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
                                {isSelectedAsActiveBest && (
                                  <span className="bg-amber-400 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                                    <FaStar size={11} /> {activeCat.name}
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

                          {/* 1 Single Action Button per Karya */}
                          <div className="p-4 pt-0">
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectBest(
                                  karya.id_karya,
                                  activeCat.key,
                                  activeCat.code,
                                )
                              }
                              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                                isSelectedAsActiveBest
                                  ? "bg-amber-400 text-amber-950 border-amber-500 shadow-md ring-2 ring-amber-400/40"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-amber-50 hover:border-amber-300"
                              }`}
                            >
                              <FaStar
                                size={12}
                                className={
                                  isSelectedAsActiveBest
                                    ? "text-amber-950"
                                    : "text-amber-500"
                                }
                              />
                              <span>
                                {isSelectedAsActiveBest
                                  ? `Pemenang ${activeCat.name} ✓`
                                  : `Pilih sebagai ${activeCat.name}`}
                              </span>
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
                          filteredKaryaList.length,
                        )}{" "}
                        dari {filteredKaryaList.length} karya
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

            {/* Nav Step Back */}
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
