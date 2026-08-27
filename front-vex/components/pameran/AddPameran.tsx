"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PameranForm } from "@/types/pameran";
import FormPameran from "./FormPameran";
import { PostPameran } from "./apiPameran";
import { showToast } from "@/components/shared/ui/ToastNotification";

type FormErrors = Partial<Record<keyof PameranForm | "image", string>>;

export default function AddPameran() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<PameranForm>({
    title: "",
    publishDate: "",
    prepareStart: "",
    prepareEnd: "",
    description: "",
    image: null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
    if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.image) newErrors.image = "Thumbnail wajib diunggah";
    if (!form.title) newErrors.title = "Judul pameran wajib diisi";
    if (!form.publishDate) newErrors.publishDate = "Tanggal buka pameran wajib diisi";
    if (!form.prepareStart)
      newErrors.prepareStart = "Tanggal mulai persiapan wajib diisi";
    if (!form.prepareEnd)
      newErrors.prepareEnd = "Tanggal akhir persiapan wajib diisi";
    if (!form.description) newErrors.description = "Deskripsi wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast("Harap lengkapi semua kolom yang wajib diisi.", "warning");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("judul", form.title);
      formData.append("deskripsi", form.description);
      formData.append("tanggal_mulai_persiapan", form.prepareStart);
      formData.append("tanggal_akhir_persiapan", form.prepareEnd);
      formData.append("tanggal_buka", form.publishDate);
      if (form.image) {
        formData.append("banner", form.image);
      }

      const data = await PostPameran(formData);

      if (data.status === "success" || data.data || data.pameran) {
        showToast("Pameran berhasil ditambahkan!", "success");
        const newSlug = data.pameran?.slug ?? data.data?.slug;
        if (newSlug) {
          router.push(`/admin/pameran/detail/${newSlug}`);
        } else {
          router.push(`/admin/pameran`);
        }
      } else {
        showToast("Gagal membuat pameran.", "error");
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const resData = error.response.data;

        if (status === 422) {
          const laravelErrors = resData.errors as Record<string, string[]>;
          const fieldMap: Record<string, keyof FormErrors> = {
            judul: "title",
            title: "title",
            tanggal_mulai_persiapan: "prepareStart",
            prepare_start: "prepareStart",
            tanggal_akhir_persiapan: "prepareEnd",
            prepare_end: "prepareEnd",
            tanggal_buka: "publishDate",
            open_date: "publishDate",
            deskripsi: "description",
            description: "description",
            banner: "image",
          };

          const mappedErrors: FormErrors = {};
          if (laravelErrors) {
            Object.entries(laravelErrors).forEach(([key, messages]) => {
              const fieldKey = fieldMap[key];
              if (fieldKey) mappedErrors[fieldKey] = messages[0];
            });
          }

          setErrors(mappedErrors);
          showToast("Harap periksa kembali data yang dimasukkan.", "error");
        } else if (status === 404) {
          showToast(
            resData.message ?? "Data tidak ditemukan.",
            "error",
          );
        } else if (status === 500) {
          showToast(
            resData.message ?? "Terjadi kesalahan pada server.",
            "error",
          );
        } else {
          showToast(
            `Error ${status}: ${resData.message ?? "Terjadi kesalahan."}`,
            "error",
          );
        }
      } else {
        showToast(
          "Tidak dapat terhubung ke server. Silakan coba lagi.",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-color select-none pb-20 md:pb-30">
      <section className="autoMid">
        <FormPameran
          form={form}
          preview={preview}
          loading={loading}
          errors={errors}
          onChangeImage={handleImage}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </section>
    </div>
  );
}
