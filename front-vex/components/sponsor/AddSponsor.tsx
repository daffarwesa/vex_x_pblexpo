"use client";

import { useState } from "react";
import DetailPoster from "@/components/sponsor/DetailPoster";
import DetailFormSponsor from "@/components/sponsor/DetailFormSponsor";
import DetailAction from "@/components/sponsor/DetailAction";
import { showToast } from "@/components/shared/ui/ToastNotification";
import { PostSponsor } from "@/components/sponsor/apiSponsor";
import { SponsorItem } from "@/types/sponsor";

interface Props {
  onSuccess?: () => void;
}

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];

const initialForm: SponsorItem = {
  id: 0,
  title: "",
  type: "kecil",
  year: "",
  poster: "",
};

function validate(
  form: SponsorItem,
  posterFile: File | null,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.title.trim()) errors.title = "Judul sponsor wajib diisi.";
  if (!form.type) errors.type = "Tipe sponsor wajib dipilih.";
  if (!form.year) errors.year = "Tahun wajib dipilih.";
  if (!posterFile) errors.poster = "Gambar poster wajib diunggah.";
  return errors;
}

export default function AddSponsor({ onSuccess }: Props) {
  const [form, setForm] = useState<SponsorItem>(initialForm);
  const [posterPreview, setPosterPreview] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearFieldError = (key: string) =>
    setErrors((prev) => {
      const e = { ...prev };
      delete e[key];
      return e;
    });

  const handleChange = (field: keyof SponsorItem, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field as string);
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        poster: "Gambar poster harus berformat PNG, JPG, atau JPEG.",
      }));
      showToast(
        "Gambar poster harus berformat PNG, JPG, atau JPEG.",
        "warning",
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        poster: `Gambar poster maksimal ${MAX_IMAGE_SIZE_MB}MB (file Anda ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
      }));
      showToast(
        `Gambar poster melebihi batas ${MAX_IMAGE_SIZE_MB}MB.`,
        "warning",
      );
      return;
    }

    setPosterPreview(URL.createObjectURL(file));
    setPosterFile(file);
    clearFieldError("poster");
  };

  const handleSave = async () => {
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
      formData.append("gambar_poster", posterFile!);

      const result = await PostSponsor(formData);
      if (!result.success && result.status !== "success") {
        throw new Error(result.message || "Gagal menambahkan sponsor");
      }

      showToast("Sponsor berhasil ditambahkan!", "success");
      onSuccess?.();
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 422) {
        const laravelErrors = error.response.data.errors as Record<
          string,
          string[]
        >;
        setErrors({
          ...(laravelErrors.judul ? { title: laravelErrors.judul[0] } : {}),
          ...(laravelErrors.tipe ? { type: laravelErrors.tipe[0] } : {}),
          ...(laravelErrors.tahun ? { year: laravelErrors.tahun[0] } : {}),
          ...(laravelErrors.gambar_poster
            ? { poster: laravelErrors.gambar_poster[0] }
            : {}),
        });
        showToast("Periksa kembali data yang diisi.", "warning");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (status === 500) {
        setErrors({
          poster: "Server gagal memproses gambar poster. Coba upload ulang.",
        });
        showToast(
          "Terjadi kesalahan di server (500). Coba simpan lagi.",
          "error",
        );
      } else {
        showToast(
          error.response?.data?.message || "Gagal terhubung ke server.",
          "error",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-0 py-6">
      <div className="autoMid">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start lg:items-stretch">
          <div>
            <DetailPoster
              preview={posterPreview}
              onUpload={handlePosterUpload}
              error={errors.poster}
              heightClass={"h-[420px] md:h-[720px]"}
            />
          </div>

          <div className="flex flex-col">
            <DetailFormSponsor
              form={form}
              onChange={handleChange}
              errors={errors}
            />
          </div>
        </div>

        <DetailAction onSave={handleSave} loading={isLoading} />
      </div>
    </div>
  );
}
