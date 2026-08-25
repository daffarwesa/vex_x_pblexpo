"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DetailPoster from "@/components/karya/DetailPoster";
import DetailFormSponsor from "@/components/sponsor/DetailFormSponsor";
import DetailAction from "@/components/sponsor/DetailAction";
import { GetSponsor, UpdateSponsor, DeleteSponsor } from "@/components/sponsor/apiSponsor";
import { SponsorItem } from "@/types/sponsor";
import { showToast } from "@/components/shared/ui/ToastNotification";

interface Props {
  id: number;
}

function validate(form: SponsorItem, posterFile: File | null): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.title.trim()) errors.title = "Judul sponsor wajib diisi.";
  if (!form.type) errors.type = "Tipe sponsor wajib dipilih.";
  if (!form.year) errors.year = "Tahun wajib dipilih.";
  // Mode edit: poster tidak wajib jika belum diganti
  return errors;
}

export default function DetailSponsor({ id }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<SponsorItem | null>(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Load data ──
  useEffect(() => {
    const load = async () => {
      try {
        const storageBase =
          process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

        const res = await GetSponsor();
        const raw = res.sponsor ?? [];

        const list: SponsorItem[] = raw.map((item: any) => ({
          id: item.id_sponsor ?? item.id,
          title: item.judul ?? item.title ?? "",
          type: item.tipe ?? item.type ?? "kecil",
          year: String(item.tahun ?? item.year ?? ""),
          poster: item.gambar_poster
            ? `${storageBase}/${item.gambar_poster}`
            : item.poster ?? "",
        }));

        const found = list.find((item) => item.id === id);
        if (found) {
          setForm(found);
          setPosterPreview(found.posterLarge || found.poster);
        }
      } catch (err) {
        console.error("Gagal memuat sponsor:", err);
      }
    };

    load();
  }, [id]);

  // ── Handlers ──
  const handleChange = (field: keyof SponsorItem, value: string) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
    setErrors((prev) => {
      const e = { ...prev };
      delete e[field as string];
      return e;
    });
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterPreview(URL.createObjectURL(file));
    setPosterFile(file);
    setErrors((prev) => {
      const e = { ...prev };
      delete e.poster;
      return e;
    });
  };

  const handleSave = async () => {
    if (!form) return;

    const validationErrors = validate(form, posterFile);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("Lengkapi semua data terlebih dahulu.", "warning");
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      const formData = new FormData();
      formData.append("judul", form.title.trim());
      formData.append("tipe", form.type);
      formData.append("tahun", form.year);
      if (posterFile) formData.append("gambar_poster", posterFile);

      const result = await UpdateSponsor(form.id, formData);
      if (!result.success && result.status !== "success") {
        throw new Error(result.message || "Gagal memperbarui sponsor");
      }

      showToast("Sponsor berhasil diperbarui!", "success");
      router.push("/admin/sponsor");
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 422) {
        const laravelErrors = err.response.data.errors as Record<string, string[]>;
        setErrors({
          ...(laravelErrors.judul ? { title: laravelErrors.judul[0] } : {}),
          ...(laravelErrors.tipe ? { type: laravelErrors.tipe[0] } : {}),
          ...(laravelErrors.tahun ? { year: laravelErrors.tahun[0] } : {}),
          ...(laravelErrors.gambar_poster ? { poster: laravelErrors.gambar_poster[0] } : {}),
        });
        showToast("Periksa kembali data yang diisi.", "warning");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showToast(err.response?.data?.message || "Gagal terhubung ke server.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form) return;
    setIsDeleting(true);
    try {
      const result = await DeleteSponsor(form.id);
      if (!result.success && result.status !== "success") {
        throw new Error(result.message || "Gagal menghapus sponsor");
      }
      showToast("Sponsor berhasil dihapus.", "success");
      router.push("/admin/sponsor");
    } catch (err) {
      showToast("Gagal menghapus sponsor.", "error");
      console.error("Gagal menghapus sponsor:", err);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  // ── Loading skeleton ──
  if (!form) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-0 py-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="h-[420px] rounded-xl bg-gray-200 animate-pulse mt-10" />
            <div className="space-y-4 mt-10">
              <div className="h-10 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-10 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-10 rounded-lg bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
            <h2 className="text-base font-semibold text-gray-800 mb-2">Hapus Sponsor?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Tindakan ini tidak dapat dibatalkan. Sponsor akan dihapus secara permanen.
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start lg:items-stretch">
            <div>
              <DetailPoster
                preview={posterPreview}
                onUpload={handlePosterUpload}
                error={errors.poster}
              />
            </div>

            <div className="flex flex-col">
              <p className="text-xl font-semibold mt-10 mb-1.5">
                Detail<span className="text-red-500">*</span>
              </p>
              <DetailFormSponsor form={form} onChange={handleChange} errors={errors} />
            </div>
          </div>

          <DetailAction
            onDelete={() => setShowConfirm(true)}
            onSave={handleSave}
            loading={isLoading}
          />
        </div>
      </div>
    </>
  );
}