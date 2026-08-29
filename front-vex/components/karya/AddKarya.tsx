"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DetailPoster, { PosterMode, extractDriveDirectUrl } from "@/components/karya/DetailPoster";
import DetailForm from "@/components/karya/DetailForm";
import { Button, ButtonPutih } from "@/components/shared/ui/Button";
import { showToast } from "@/components/shared/ui/ToastNotification";
import { PostKaryaAdmin } from "@/components/karya/apiKarya";
import { KaryaItem } from "@/types/karya";

// =============================
// CONSTANTS
// =============================
const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];

// =============================
// HELPERS
// =============================
function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function validate(
  form: KaryaItem,
  posterMode: PosterMode,
  posterFile: File | null,
  posterDriveUrl: string,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.pameranId) errors.pameranId = "Pameran wajib dipilih.";
  if (!form.category) errors.category = "Kategori wajib dipilih.";
  if (!form.title.trim()) errors.title = "Judul wajib diisi.";
  if (!form.description?.trim()) errors.description = "Deskripsi wajib diisi.";

  const url = normalizeUrl(form.link ?? "");
  if (!url) {
    errors.link = "Link YouTube wajib diisi.";
  } else {
    try {
      new URL(url);
    } catch {
      errors.link = "Link harus URL valid (contoh: https://youtube.com/...).";
    }
  }

  // Validasi Opsi Poster (Mutual Exclusive)
  if (posterMode === "file") {
    if (!posterFile) errors.poster = "File poster wajib diunggah.";
  } else {
    if (!posterDriveUrl.trim()) {
      errors.poster = "Link Google Drive poster wajib diisi.";
    } else if (!posterDriveUrl.includes("drive.google.com") && !posterDriveUrl.startsWith("http")) {
      errors.poster = "Masukkan link Google Drive yang valid.";
    }
  }

  return errors;
}

function mapLaravelErrors(
  raw: Record<string, string[]>,
): Record<string, string> {
  return {
    ...(raw.id_pameran ? { pameranId: raw.id_pameran[0] } : {}),
    ...(raw.id_kategori ? { category: raw.id_kategori[0] } : {}),
    ...(raw.judul ? { title: raw.judul[0] } : {}),
    ...(raw.deskripsi ? { description: raw.deskripsi[0] } : {}),
    ...(raw.tautan ? { link: raw.tautan[0] } : {}),
    ...(raw.gambar_poster ? { poster: raw.gambar_poster[0] } : {}),
  };
}

// =============================
// INITIAL STATE
// =============================
const initialForm: KaryaItem = {
  id: 0,
  title: "",
  category: "",
  image: "",
  thumbnail: "",
  year: "",
  semester: "",
  description: "",
  booth: "",
  link: "",
  pameranId: undefined,
};

interface AddKaryaProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

// =============================
// COMPONENT
// =============================
export default function AddKaryaPage({ onCancel, onSuccess }: AddKaryaProps) {
  const router = useRouter();

  const [form, setForm] = useState<KaryaItem>(initialForm);
  const [posterMode, setPosterMode] = useState<PosterMode>("file");
  const [posterPreview, setPosterPreview] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterDriveUrl, setPosterDriveUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearFieldError = (key: string) =>
    setErrors((prev) => {
      const e = { ...prev };
      delete e[key];
      return e;
    });

  const handleChange = (field: keyof KaryaItem, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field as string);
  };

  const handleModeChange = (mode: PosterMode) => {
    setPosterMode(mode);
    clearFieldError("poster");
    if (mode === "file") {
      setPosterDriveUrl("");
      if (posterFile) {
        setPosterPreview(URL.createObjectURL(posterFile));
      } else {
        setPosterPreview("");
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
    clearFieldError("poster");
    const directUrl = extractDriveDirectUrl(url);
    setPosterPreview(directUrl);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const label = "Gambar poster";

    // Validasi tipe file
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        poster: `${label} harus berformat PNG, JPG, atau JPEG.`,
      }));
      showToast(`${label} harus berformat PNG, JPG, atau JPEG.`, "warning");
      return;
    }

    // Validasi ukuran file (maks 2MB)
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        poster: `${label} maksimal ${MAX_IMAGE_SIZE_MB}MB (file Anda ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
      }));
      showToast(`${label} melebihi batas ${MAX_IMAGE_SIZE_MB}MB.`, "warning");
      return;
    }

    // Lolos validasi
    const preview = URL.createObjectURL(file);
    setPosterPreview(preview);
    setPosterFile(file);
    clearFieldError("poster");
  };

  const handleSave = async () => {
    const validationErrors = validate(form, posterMode, posterFile, posterDriveUrl);
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
      formData.append("id_kategori", form.category);
      formData.append("judul", form.title.trim());
      formData.append("deskripsi", form.description?.trim() ?? "");
      formData.append("tautan", normalizeUrl(form.link ?? ""));

      if (posterMode === "file") {
        formData.append("gambar_poster", posterFile!);
      } else {
        formData.append("gambar_poster", extractDriveDirectUrl(posterDriveUrl));
      }

      const result = await PostKaryaAdmin(formData);

      if (!result.success && result.status !== "success") {
        throw new Error(result.message || "Gagal menambahkan karya");
      }

      showToast("Karya berhasil ditambahkan!", "success");
      if (onSuccess) {
        onSuccess();
      } else if (onCancel) {
        onCancel();
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 422) {
        const laravelErrors = error.response.data.errors as Record<
          string,
          string[]
        >;
        setErrors(mapLaravelErrors(laravelErrors));
        showToast("Periksa kembali data yang diisi.", "warning");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showToast(
          error.response?.data?.message || "Gagal menyimpan karya.",
          "error",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-0 py-6 font-poppins">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
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

          <div className="flex flex-col">
            <p className="text-xl font-semibold mt-10 mb-1.5">
              Detail Karya<span className="text-red-500">*</span>
            </p>
            
            <DetailForm form={form} onChange={handleChange} errors={errors} />
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              {onCancel && (
                <ButtonPutih
                  onClick={onCancel}
                  type="button"
                  className="px-6 py-2.5 rounded-xl font-medium"
                >
                  Batal
                </ButtonPutih>
              )}
              <Button
                onClick={handleSave}
                disabled={isLoading}
                type="button"
                className="px-6 py-2.5 rounded-xl font-bold bg-main-blue text-white"
              >
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
