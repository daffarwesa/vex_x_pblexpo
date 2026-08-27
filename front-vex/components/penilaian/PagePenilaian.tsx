"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { FaTrophy, FaMedal, FaStar, FaCheck, FaChevronRight, FaChevronLeft, FaSave, FaExclamationCircle, FaLayerGroup } from "react-icons/fa";
import { Button, ButtonPutih } from "@/components/shared/ui/Button";
import { showToast } from "@/components/shared/ui/ToastNotification";
import {
  GetKaryaList,
  GetKategoriList,
  BatchSavePenilaian,
  PenilaianItem,
  KategoriItem,
} from "./apiPenilaian";

interface PagePenilaianProps {
  onOpenAddForm?: () => void;
}

export default function PagePenilaian({ onOpenAddForm }: PagePenilaianProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  const [selectedKategoriTab, setSelectedKategoriTab] = useState<number | null>(null);

  // Pagination State (Grid 3x3 = 9 items per page)
  const ITEMS_PER_PAGE = 9;
  const [pagePerKategori, setPagePerKategori] = useState<Record<number, number>>({});
  const [pageBest, setPageBest] = useState<number>(1);

  const getCurrentPage = (id_kategori: number) => pagePerKategori[id_kategori] || 1;
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
        const initialKategoriWinners: Record<number, { juara1?: number | null; juara2?: number | null }> = {};
        const initialBestWinners: { best1?: number | null; best2?: number | null; best3?: number | null } = {};

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
            if (!initialBestWinners.best1) initialBestWinners.best1 = k.id_karya;
            else if (!initialBestWinners.best2) initialBestWinners.best2 = k.id_karya;
            else if (!initialBestWinners.best3) initialBestWinners.best3 = k.id_karya;
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
    const base = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";
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

  // Handler toggle Juara Kategori
  const handleSelectJuaraKategori = (id_kategori: number, id_karya: number, rank: "juara1" | "juara2") => {
    setKategoriWinners((prev) => {
      const current = prev[id_kategori] || {};
      const otherRank = rank === "juara1" ? "juara2" : "juara1";

      // Jika klik yang sudah terpilih -> batal
      if (current[rank] === id_karya) {
        return {
          ...prev,
          [id_kategori]: {
            ...current,
            [rank]: null,
          },
        };
      }

      // Jika karya ini sebelumnya terpilih sebagai rank lain di kategori yg sama -> switch
      const newOther = current[otherRank] === id_karya ? null : current[otherRank];

      return {
        ...prev,
        [id_kategori]: {
          ...current,
          [otherRank]: newOther,
          [rank]: id_karya,
        },
      };
    });
  };

  // Handler toggle Best Global
  const handleSelectBest = (id_karya: number, rank: "best1" | "best2" | "best3") => {
    setBestWinners((prev) => {
      // Jika klik yg sudah aktif -> batal
      if (prev[rank] === id_karya) {
        return { ...prev, [rank]: null };
      }

      // Jika karya ini ada di rank best lain -> bersihkan dr rank lain
      const cleaned: typeof prev = { ...prev };
      if (cleaned.best1 === id_karya) cleaned.best1 = null;
      if (cleaned.best2 === id_karya) cleaned.best2 = null;
      if (cleaned.best3 === id_karya) cleaned.best3 = null;

      return {
        ...cleaned,
        [rank]: id_karya,
      };
    });
  };

  // Simpan ke server
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await BatchSavePenilaian({
        kategoriWinners,
        bestWinners,
        allKaryaIds: karyaList.map((k) => k.id_karya),
      });

      showToast("Penilaian karya berhasil disimpan!", "success");
      setShowConfirmModal(false);
      setStep(1);
    } catch (err: any) {
      console.error("Gagal menyimpan penilaian:", err);
      showToast("Terjadi kesalahan saat menyimpan penilaian.", "error");
    } finally {
      setSaving(false);
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
        <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] py-10">
          <div className="max-w-[1200px] mx-auto px-4 text-center text-white">
            <h1 className="text-2xl md:text-3xl font-bold">Penilaian Karya</h1>
            <p className="text-white/80 text-sm mt-2">Memuat daftar karya dan kategori...</p>
          </div>
        </section>
        <div className="max-w-[1200px] mx-auto px-4 py-12 flex justify-center">
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
                <h1 className="text-2xl md:text-3xl font-bold">Penilaian Karya PBL</h1>
              </div>
              <p className="text-white/80 text-xs md:text-sm mt-1">
                Tentukan Juara 1 & 2 untuk setiap kategori serta 3 Karya Best Global.
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
              <button
                onClick={() => setStep(3)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  step === 3
                    ? "bg-white text-main-blue shadow"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <span>3.</span> Ringkasan
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
                        <FaLayerGroup className="text-main-blue shrink-0" size={14} />
                        {(() => {
                          const current = kategoriList.find((k) => k.id_kategori === selectedKategoriTab);
                          if (!current) return <span className="text-gray-400">Pilih Kategori</span>;
                          const winner = kategoriWinners[current.id_kategori];
                          const hasWinner = Boolean(winner?.juara1 || winner?.juara2);

                          return (
                            <span className="truncate flex items-center gap-2">
                              <span className="font-bold text-main-blue">{current.kode_kategori}</span>
                              <span className="text-gray-600">— {current.nama_kategori}</span>
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
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </ListboxButton>

                    <ListboxOptions
                      transition
                      className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-xl bg-white p-1 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none data-[closed]:opacity-0 data-[leave]:duration-100"
                    >
                      {kategoriList.map((kat) => {
                        const isSelected = selectedKategoriTab === kat.id_kategori;
                        const winner = kategoriWinners[kat.id_kategori];
                        const hasWinner = Boolean(winner?.juara1 || winner?.juara2);

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
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                isSelected ? "bg-main-blue text-white" : "bg-gray-100 text-gray-700"
                              }`}>
                                {kat.kode_kategori}
                              </span>
                              <span className="truncate">{kat.nama_kategori}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {hasWinner && (
                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
                                  ✓ Dinilai
                                </span>
                              )}
                              {isSelected && (
                                <CheckIcon className="h-4 w-4 text-main-blue" aria-hidden="true" />
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
                  <p className="text-xs font-bold text-gray-800">Progres Kategori</p>
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
                  const currentKat = kategoriList.find((k) => k.id_kategori === selectedKategoriTab);
                  const allKaryasInKat = karyaByKategori[selectedKategoriTab] || [];
                  const winner = kategoriWinners[selectedKategoriTab] || {};

                  // Paginasi 3x3 (9 items per page)
                  const currentPage = getCurrentPage(selectedKategoriTab);
                  const totalPages = Math.ceil(allKaryasInKat.length / ITEMS_PER_PAGE) || 1;
                  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                  const currentKaryas = allKaryasInKat.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                              <FaMedal className="text-yellow-500" />
                              <span>Juara 1: {winner.juara1 ? "Terpilih" : "Belum"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                              <FaMedal className="text-slate-400" />
                              <span>Juara 2: {winner.juara2 ? "Terpilih" : "Belum"}</span>
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
                                    onClick={() => router.push(`/admin/karya/${karya.id_karya}`)}
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
                                        {karya.deskripsi || "Tidak ada deskripsi"}
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
                                          "juara1"
                                        )
                                      }
                                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                                        isJuara1
                                          ? "bg-yellow-400 text-yellow-950 border-yellow-500 shadow-sm"
                                          : "bg-white text-gray-700 border-gray-300 hover:bg-yellow-50 hover:border-yellow-300"
                                      }`}
                                    >
                                      <FaTrophy className={isJuara1 ? "text-yellow-950" : "text-yellow-500"} />
                                      <span>{isJuara1 ? "Juara 1 ✓" : "Pilih Juara 1"}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSelectJuaraKategori(
                                          selectedKategoriTab,
                                          karya.id_karya,
                                          "juara2"
                                        )
                                      }
                                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                                        isJuara2
                                          ? "bg-slate-300 text-slate-900 border-slate-400 shadow-sm"
                                          : "bg-white text-gray-700 border-gray-300 hover:bg-slate-50 hover:border-slate-300"
                                      }`}
                                    >
                                      <FaMedal className={isJuara2 ? "text-slate-900" : "text-slate-400"} />
                                      <span>{isJuara2 ? "Juara 2 ✓" : "Pilih Juara 2"}</span>
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
                                Menampilkan {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, allKaryasInKat.length)} dari {allKaryasInKat.length} karya
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPageForKategori(selectedKategoriTab, Math.max(1, currentPage - 1))}
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
                                  onClick={() => setPageForKategori(selectedKategoriTab, Math.min(totalPages, currentPage + 1))}
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
                className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2"
              >
                <span>Lanjut ke Best Global</span>
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
                  <FaStar className="text-amber-500" /> Best 1: {bestWinners.best1 ? "✓" : "Belum"}
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                    bestWinners.best2
                      ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                      : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
                >
                  <FaStar className="text-amber-500" /> Best 2: {bestWinners.best2 ? "✓" : "Belum"}
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                    bestWinners.best3
                      ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                      : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
                >
                  <FaStar className="text-amber-500" /> Best 3: {bestWinners.best3 ? "✓" : "Belum"}
                </div>
              </div>
            </div>

            {/* Grid Semua Karya with Pagination 3x3 */}
            {(() => {
              const totalPagesBest = Math.ceil(karyaList.length / ITEMS_PER_PAGE) || 1;
              const startIndexBest = (pageBest - 1) * ITEMS_PER_PAGE;
              const currentBestKaryas = karyaList.slice(startIndexBest, startIndexBest + ITEMS_PER_PAGE);

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentBestKaryas.map((karya) => {
                      const isBest1 = bestWinners.best1 === karya.id_karya;
                      const isBest2 = bestWinners.best2 === karya.id_karya;
                      const isBest3 = bestWinners.best3 === karya.id_karya;
                      const isAnyBest = isBest1 || isBest2 || isBest3;

                      const kat = kategoriList.find((k) => k.id_kategori === karya.id_kategori);

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
                            onClick={() => router.push(`/admin/karya/${karya.id_karya}`)}
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
                              onClick={() => handleSelectBest(karya.id_karya, "best1")}
                              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                                isBest1
                                  ? "bg-amber-400 text-amber-950 border-amber-500 font-bold shadow-sm"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-amber-50"
                              }`}
                            >
                              <FaStar size={10} className={isBest1 ? "text-amber-950" : "text-amber-500"} />
                              <span>Best 1</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectBest(karya.id_karya, "best2")}
                              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                                isBest2
                                  ? "bg-amber-300 text-amber-950 border-amber-400 font-bold shadow-sm"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-amber-50"
                              }`}
                            >
                              <FaStar size={10} className={isBest2 ? "text-amber-950" : "text-amber-500"} />
                              <span>Best 2</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectBest(karya.id_karya, "best3")}
                              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                                isBest3
                                  ? "bg-amber-200 text-amber-950 border-amber-300 font-bold shadow-sm"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-amber-50"
                              }`}
                            >
                              <FaStar size={10} className={isBest3 ? "text-amber-950" : "text-amber-500"} />
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
                        Menampilkan {startIndexBest + 1} - {Math.min(startIndexBest + ITEMS_PER_PAGE, karyaList.length)} dari {karyaList.length} karya
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPageBest((prev) => Math.max(1, prev - 1))}
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
                          onClick={() => setPageBest((prev) => Math.min(totalPagesBest, prev + 1))}
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
            <div className="flex justify-between items-center pt-4">
              <ButtonPutih
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
              >
                <FaChevronLeft size={13} />
                <span>Kembali ke Juara Kategori</span>
              </ButtonPutih>

              <Button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2"
              >
                <span>Lihat Ringkasan & Konfirmasi</span>
                <FaChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: RINGKASAN & KONFIRMASI PENILAIAN                  */}
        {/* ========================================================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Ringkasan Hasil Penilaian
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Periksa kembali seluruh pemenang kategori dan best global sebelum disimpan.
                </p>
              </div>

              <Button
                onClick={() => setShowConfirmModal(true)}
                className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <FaSave size={14} />
                <span>Simpan Penilaian</span>
              </Button>
            </div>

            {/* REKAP BEST GLOBAL */}
            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FaStar className="text-amber-500 text-lg" />
                <h3 className="font-bold text-base text-gray-800">Best Global (Top 3)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { rank: "Best 1", id: bestWinners.best1, color: "bg-amber-400 text-amber-950 border-amber-500" },
                  { rank: "Best 2", id: bestWinners.best2, color: "bg-amber-300 text-amber-950 border-amber-400" },
                  { rank: "Best 3", id: bestWinners.best3, color: "bg-amber-200 text-amber-950 border-amber-300" },
                ].map((item, idx) => {
                  const karya = karyaList.find((k) => k.id_karya === item.id);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-200 bg-amber-50/30 flex items-start gap-3"
                    >
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${item.color}`}>
                        {item.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        {karya ? (
                          <>
                            <p className="text-sm font-bold text-gray-800 truncate">{karya.judul}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {kategoriList.find((k) => k.id_kategori === karya.id_kategori)?.nama_kategori}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Belum dipilih</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* REKAP JUARA 1 & 2 TIAP KATEGORI */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <FaTrophy className="text-yellow-500 text-lg" />
                <h3 className="font-bold text-base text-gray-800">
                  Juara 1 & 2 per Kategori ({kategoriList.length} Kategori)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kategoriList.map((kat) => {
                  const winner = kategoriWinners[kat.id_kategori] || {};
                  const k1 = karyaList.find((k) => k.id_karya === winner.juara1);
                  const k2 = karyaList.find((k) => k.id_karya === winner.juara2);

                  return (
                    <div
                      key={kat.id_kategori}
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <span className="text-xs font-bold text-main-blue">{kat.kode_kategori}</span>
                        <span className="text-xs font-medium text-gray-600 truncate max-w-[200px]">
                          {kat.nama_kategori}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="bg-yellow-400 text-yellow-950 font-bold px-2 py-0.5 rounded text-[10px]">
                            Juara 1
                          </span>
                          <span className="font-semibold text-gray-800 truncate flex-1">
                            {k1?.judul || <span className="text-gray-400 font-normal italic">Belum dipilih</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-300 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            Juara 2
                          </span>
                          <span className="font-semibold text-gray-800 truncate flex-1">
                            {k2?.judul || <span className="text-gray-400 font-normal italic">Belum dipilih</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="flex justify-between items-center pt-4">
              <ButtonPutih
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
              >
                <FaChevronLeft size={13} />
                <span>Kembali ke Best Global</span>
              </ButtonPutih>

              <Button
                onClick={() => setShowConfirmModal(true)}
                className="px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                <FaCheck size={14} />
                <span>Konfirmasi & Simpan</span>
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL KONFIRMASI SIMPAN                                   */}
      {/* ========================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center space-y-4">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto text-2xl">
              <FaTrophy />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800">Simpan Hasil Penilaian?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Data pemenang Juara 1, Juara 2 per kategori dan Best Global akan diperbarui ke database.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <ButtonPutih
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-semibold"
              >
                Batal
              </ButtonPutih>

              <Button
                onClick={handleSaveAll}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-bold bg-main-blue text-white"
              >
                {saving ? "Menyimpan..." : "Ya, Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
