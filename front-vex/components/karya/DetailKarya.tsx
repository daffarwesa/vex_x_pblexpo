"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DetailThumbnail from "@/components/karya/DetailThumbnail";
import DetailPoster, { PosterMode, extractDriveDirectUrl } from "@/components/karya/DetailPoster";
import DetailPreview from "@/components/karya/DetailPreview";
import DetailForm from "@/components/karya/DetailForm";
import DetailAction from "@/components/karya/DetailAction";
import {
  GetKarya,
  GetKaryaAdmin,
  GetDetailKaryaAdmin,
  GetKaryaSemua,
  UpdateKarya,
  UpdateKaryaAdmin,
  DeleteKarya,
  SetTerbaikRank,
  BatalkanTerbaikRank,
  SetPredikatKarya,
  BatalkanPredikatKarya,
} from "@/components/karya/apiKarya";
import { KaryaItem, TerbaikRank, PredikatKarya } from "@/types/karya";
import { showToast } from "@/components/shared/ui/ToastNotification";
import { useAuth } from "@/context/AuthContext";
import { is } from "@react-three/fiber/dist/declarations/src/core/utils";

// =============================
// HELPERS
// =============================

/** Tambah https:// jika user lupa mengetiknya */
function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Validasi sesuai rule Laravel controller (store & update sama).
 * Mode edit: gambar tidak required jika belum diubah (file = null → pakai existing).
 */
function validate(
  form: KaryaItem,
  thumbnailFile: File | null,
  posterFile: File | null,
  isEdit = false,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.pameranId) errors.pameranId = "Pameran wajib dipilih.";
  if (!form.category) errors.category = "Kategori wajib dipilih.";
  if (!form.title.trim()) errors.title = "Judul wajib diisi.";
  if (!form.description?.trim()) errors.description = "Deskripsi wajib diisi.";

  const normalizedLink = normalizeUrl(form.link ?? "");
  if (!normalizedLink) {
    errors.link = "Link YouTube wajib diisi.";
  } else {
    try {
      new URL(normalizedLink);
    } catch {
      errors.link =
        "Link harus berupa URL yang valid (contoh: https://youtube.com/...).";
    }
  }

  // Mode edit: poster hanya wajib jika saat create awal
  if (!isEdit && !posterFile) {
    errors.poster = "Gambar poster wajib diunggah.";
  }

  return errors;
}

// =============================
// COMPONENT
// =============================

interface Props {
  id: number;
}

export default function DetailKarya({ id }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const isAdmin = !!user;
  const isCreator = false;

  // Admin diizinkan mengedit dan menghapus karya
  const isReadOnly = false;

  const [form, setForm] = useState<KaryaItem | null>(null);
  const [posterMode, setPosterMode] = useState<PosterMode>("file");
  const [posterPreview, setPosterPreview] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterDriveUrl, setPosterDriveUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Berlaku untuk Creator jika periode edit pameran sudah ditutup
  const isPameranLocked = isCreator && form?.canEdit === false;

  const [currentPameran, setCurrentPameran] = useState<{
    id: number;
    title: string;
  } | null>(null);

  // Slot rank/predikat yang sudah dipakai karya LAIN di pameran yang sama
  const [siblingAwards, setSiblingAwards] = useState<{
    takenRanks: TerbaikRank[];
    takenPredikat: PredikatKarya[];
  }>({ takenRanks: [], takenPredikat: [] });

  // ── Guard ──
  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin && !isCreator) {
      router.replace("/");
    }
  }, [authLoading, isAdmin, isCreator, router]);

  // ── Load data karya ──
  useEffect(() => {
    if (authLoading) return;

    const load = async () => {
      try {
        const storageBase = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://localhost:8000/storage';
        const res = await GetDetailKaryaAdmin(id);
        const item = res.data ?? res;

        if (item && item.id_karya) {
          const tanggalMulai = item.stan?.pameran?.tanggal_mulai ?? item.pameran?.tanggal_mulai ?? "";
          const bulan = tanggalMulai ? new Date(tanggalMulai).getMonth() + 1 : 0;
          const semester = bulan >= 8 || bulan <= 2 ? "Ganjil" : bulan >= 3 ? "Genap" : "";

          const rawPoster = item.gambar_poster ? String(item.gambar_poster).trim() : "";
          let posterUrl = "";

          if (rawPoster) {
            if (rawPoster.includes("drive.google.com")) {
              posterUrl = extractDriveDirectUrl(rawPoster);
            } else if (rawPoster.startsWith("http")) {
              posterUrl = rawPoster;
            } else {
              posterUrl = `${storageBase}/${rawPoster}`;
            }
          }

          const found: KaryaItem = {
            id: item.id_karya,
            title: item.judul,
            description: item.deskripsi,
            category: String(item.id_kategori ?? item.category ?? ""),
            image: posterUrl,
            thumbnail: posterUrl,
            link: item.tautan ?? item.link ?? "",
            year: tanggalMulai.slice(0, 4) || "",
            semester: semester || "",
            booth: String(item.id_stan ?? ""),
            modelStan: item.stan?.model_stan ? String(item.stan.model_stan) : "",
            pameranId: item.id_pameran,
            pameranTitle:
              item.stan?.pameran?.judul ??
              item.pameran?.judul ??
              `Pameran #${item.id_pameran}`,
            terbaikRank: item.terbaik_rank ?? null,
            predikat: item.predikat ?? null,
          };

          setForm(found);
          setPosterPreview(posterUrl);

          if (rawPoster.includes("drive.google.com") || rawPoster.startsWith("http")) {
            setPosterMode("drive");
            setPosterDriveUrl(rawPoster);
          } else if (rawPoster) {
            setPosterMode("file");
          }

          if (found.pameranId) {
            setCurrentPameran({
              id: found.pameranId,
              title: found.pameranTitle?.trim() || `Pameran #${found.pameranId}`,
            });
          }
        }
      } catch (err) {
        console.error("Gagal memuat karya:", err);
      }
    };

    load();
  }, [id, authLoading, isCreator, isAdmin]);

  // ── Handlers ──

  const handleChange = (field: keyof KaryaItem, value: string) => {
    if (!form || isReadOnly) return;
    setForm((prev) => (prev ? { ...prev, [field]: value } : null));
    if (errors[field as string]) {
      setErrors((prev) => {
        const e = { ...prev };
        delete e[field as string];
        return e;
      });
    }
  };

  const handleModeChange = (mode: PosterMode) => {
    setPosterMode(mode);
    setErrors((prev) => {
      const e = { ...prev };
      delete e.poster;
      return e;
    });
    if (mode === "file") {
      setPosterDriveUrl("");
      if (posterFile) {
        setPosterPreview(URL.createObjectURL(posterFile));
      } else {
        setPosterPreview(form?.image || "");
      }
    } else {
      setPosterFile(null);
      if (posterDriveUrl) {
        setPosterPreview(extractDriveDirectUrl(posterDriveUrl));
      } else {
        setPosterPreview("");
      }
    }
  };

  const handleDriveUrlChange = (url: string) => {
    setPosterDriveUrl(url);
    setErrors((prev) => {
      const e = { ...prev };
      delete e.poster;
      return e;
    });
    setPosterPreview(extractDriveDirectUrl(url));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPosterPreview(preview);
    setPosterFile(file);
    setErrors((prev) => {
      const e = { ...prev };
      delete e.poster;
      return e;
    });
  };

  const handleSave = async () => {
    if (!form) return;

    const validationErrors = validate(form, null, posterFile, true);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("Lengkapi semua data terlebih dahulu.", "warning");
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      const formData = new FormData();
      formData.append("id_pameran", String(form.pameranId));
      if (form.category) formData.append("id_kategori", form.category);
      formData.append("judul", form.title.trim());
      formData.append("deskripsi", form.description?.trim() ?? "");
      formData.append("tautan", normalizeUrl(form.link ?? ""));
      
      if (posterMode === "file" && posterFile) {
        formData.append("gambar_poster", posterFile);
      } else if (posterMode === "drive" && posterDriveUrl) {
        formData.append("gambar_poster", extractDriveDirectUrl(posterDriveUrl));
      }

      const result = await UpdateKaryaAdmin(form.id, formData);
      if (result.status !== "success") {
        throw new Error(result.message || "Gagal memperbarui karya");
      }

      showToast("Karya berhasil diperbarui!", "success");
      router.push("/admin/penilaian");
    } catch (err: any) {
      if (err.response?.status === 422) {
        const laravelErrors = err.response.data.errors as Record<string, string[]>;
        const mapped: Record<string, string> = {};
        if (laravelErrors.id_pameran)
          mapped.pameranId = laravelErrors.id_pameran[0];
        if (laravelErrors.id_kategori)
          mapped.category = laravelErrors.id_kategori[0];
        if (laravelErrors.judul) mapped.title = laravelErrors.judul[0];
        if (laravelErrors.deskripsi)
          mapped.description = laravelErrors.deskripsi[0];
        if (laravelErrors.tautan) mapped.link = laravelErrors.tautan[0];
        if (laravelErrors.gambar_poster)
          mapped.poster = laravelErrors.gambar_poster[0];
        setErrors(mapped);
        showToast("Periksa kembali data yang diisi.", "warning");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showToast(
          err.response?.data?.message || "Gagal terhubung ke server.",
          "error",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Hanya Admin
  const handleDelete = async () => {
    if (!form || !isAdmin) return;
    setIsDeleting(true);
    try {
      const result = await DeleteKarya(form.id);
      if (result.status !== "success") {
        throw new Error(result.message || "Gagal menghapus karya");
      }
      showToast("Karya berhasil dihapus.", "success");
      router.push("/admin/penilaian");
    } catch (err) {
      showToast("Gagal menghapus karya.", "error");
      console.error("Gagal menghapus karya:", err);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  // Admin — penilaian: set/batalkan peringkat terbaik (1-3)
  const handleSetRank = async (rank: TerbaikRank) => {
    if (!form || !isAdmin) return;
    setIsLoading(true);
    try {
      const result = await SetTerbaikRank(form.id, rank);
      if (result.status !== "success") {
        throw new Error(result.message || "Gagal menentukan peringkat terbaik");
      }
      setForm((prev) => (prev ? { ...prev, terbaikRank: rank } : prev));
      showToast(`Karya ditetapkan sebagai Terbaik ${rank}!`, "success");
    } catch (err) {
      showToast("Gagal menentukan peringkat terbaik.", "error");
      console.error("Gagal set peringkat terbaik:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRank = async () => {
    if (!form || !isAdmin) return;
    setIsLoading(true);
    try {
      const result = await BatalkanTerbaikRank(form.id);
      if (result.status !== "success") {
        throw new Error(result.message || "Gagal membatalkan peringkat terbaik");
      }
      setForm((prev) => (prev ? { ...prev, terbaikRank: null } : prev));
      showToast("Peringkat terbaik berhasil dibatalkan.", "info");
    } catch (err) {
      showToast("Gagal membatalkan peringkat terbaik.", "error");
      console.error("Gagal batalkan peringkat terbaik:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin — penilaian: set/batalkan predikat
  const handleSetPredikat = async (predikat: PredikatKarya) => {
    if (!form || !isAdmin) return;
    setIsLoading(true);
    try {
      const result = await SetPredikatKarya(form.id, predikat);
      if (result.status !== "success") {
        throw new Error(result.message || "Gagal menentukan predikat");
      }
      setForm((prev) => (prev ? { ...prev, predikat } : prev));
      showToast(`Karya diberi predikat "${predikat}"!`, "success");
    } catch (err) {
      showToast("Gagal menentukan predikat.", "error");
      console.error("Gagal set predikat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPredikat = async () => {
    if (!form || !isAdmin) return;
    setIsLoading(true);
    try {
      const result = await BatalkanPredikatKarya(form.id);
      if (result.status !== "success") {
        throw new Error(result.message || "Gagal membatalkan predikat");
      }
      setForm((prev) => (prev ? { ...prev, predikat: null } : prev));
      showToast("Predikat berhasil dibatalkan.", "info");
    } catch (err) {
      showToast("Gagal membatalkan predikat.", "error");
      console.error("Gagal batalkan predikat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Loading states ──

  if (authLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-5 border-main-blue border-t-transparent" />
          <p className="font-poppins text-sm text-gray-500">
            Memeriksa sesi...
          </p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-0 py-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Banner skeleton */}
          <div className="mb-6 h-10 w-full rounded-lg bg-gray-200 animate-pulse" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Kolom kiri — Thumbnail + Poster */}
            <div className="space-y-3">
              {/* Thumbnail */}
              <div>
                <div className="h-6 w-28 rounded bg-gray-200 animate-pulse mt-10 mb-3" />
                <div className="h-[200px] md:h-[320px] w-full rounded-xl bg-gray-200 animate-pulse" />
              </div>

              {/* Poster */}
              <div>
                <div className="h-6 w-20 rounded bg-gray-200 animate-pulse mt-10 mb-3" />
                <div className="h-[410px] md:h-[820px] w-full rounded-xl bg-gray-200 animate-pulse" />
              </div>
            </div>

            {/* Kolom kanan — Preview + Form */}
            <div>
              {/* DetailPreview — judul + gambar stan + select */}
              <div className="flex flex-col gap-4">
                <div className="h-7 w-20 rounded bg-gray-200 animate-pulse mt-10 mb-1.5" />
                <div className="h-[300px] w-full rounded-xl bg-gray-200 animate-pulse" />
                <div>
                  <div className="h-4 w-24 rounded bg-gray-200 animate-pulse mb-3" />
                  <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
                </div>
              </div>

              {/* DetailForm */}
              <div className="flex flex-col gap-4 mt-4">
                {/* Pameran */}
                <div>
                  <div className="h-4 w-20 rounded bg-gray-200 animate-pulse mb-3" />
                  <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
                </div>

                {/* Judul */}
                <div>
                  <div className="h-4 w-16 rounded bg-gray-200 animate-pulse mb-3" />
                  <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
                </div>

                {/* Link YouTube */}
                <div>
                  <div className="h-4 w-28 rounded bg-gray-200 animate-pulse mb-3" />
                  <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
                </div>

                {/* Deskripsi */}
                <div>
                  <div className="h-4 w-32 rounded bg-gray-200 animate-pulse mb-3" />
                  <div className="h-[420px] w-full rounded-lg bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Action button skeleton */}
          <div className="flex justify-end gap-3 pt-4">
            <div className="h-10 w-32 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal Konfirmasi Hapus — hanya Admin */}
      {isAdmin && showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
            <h2 className="text-base font-semibold text-gray-800 mb-2">
              Hapus Karya?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Tindakan ini tidak dapat dibatalkan. Karya akan dihapus secara
              permanen.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-5 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-lg bg-red-500 text-sm text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-0 py-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Banner read-only — Admin (hapus & menilai karya terbaik) */}
          {isReadOnly && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0 text-amber-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-amber-700">
                {" "}
                <span className="font-semibold">Admin</span> — hanya dapat
                menghapus karya dan menentukan peringkat/predikat terbaik. Data
                tidak dapat diubah.
              </p>
            </div>
          )}

          {isPameranLocked && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-red-700">
                {form.editMessage || "Karya tidak dapat diedit saat ini."}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Gambar */}
            <div className="lg:sticky lg:top-6">
              <DetailPoster
                mode={posterMode}
                onModeChange={handleModeChange}
                preview={posterPreview}
                onUploadFile={handleImageUpload}
                driveUrl={posterDriveUrl}
                onDriveUrlChange={handleDriveUrlChange}
                error={errors.poster}
              />
            </div>

            {/* Form */}
            <div>
              <DetailForm
                form={form}
                onChange={handleChange}
                currentPameran={currentPameran}
                errors={errors}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={() => router.push("/admin/penilaian")}
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="px-6 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm font-semibold"
            >
              Hapus Karya
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-main-blue text-white hover:opacity-90 disabled:opacity-50 text-sm font-bold shadow-sm"
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}