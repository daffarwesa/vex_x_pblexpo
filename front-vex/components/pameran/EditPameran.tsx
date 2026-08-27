"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PameranForm } from "@/types/pameran";
import FormPameran from "./FormPameran";
import { GetDetailPameran, UpdatePameran, DeletePameran, clearPameranCache } from "./apiPameran";
import { showToast } from "@/components/shared/ui/ToastNotification";

type FormErrors = Partial<Record<keyof PameranForm | "image", string>>;

// ─── SKELETON COMPONENT UNTUK FORM EDIT PAMERAN ─────────────────────────────
function FormPameranSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-10 animate-pulse">
      {/* LEFT - THUMBNAIL SKELETON */}
      <div className="w-full lg:w-[62%]">
        <div className="h-6 w-32 bg-gray-200 rounded-md mt-10 mb-2" />
        <div className="h-[220px] md:h-[320px] w-full bg-gray-200 border-2 border-dashed border-gray-300 rounded-xl mt-2 flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gray-300" />
          <div className="h-4 w-28 bg-gray-300 rounded" />
        </div>
        <div className="h-3 w-48 bg-gray-200 rounded mt-2" />
      </div>

      {/* RIGHT - FIELDS SKELETON */}
      <div className="w-full lg:w-[60%] mt-10 flex flex-col gap-4">
        {/* Title skeleton */}
        <div>
          <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
          <div className="h-11 w-full bg-gray-200 rounded-lg" />
        </div>

        {/* Date skeleton */}
        <div>
          <div className="h-4 w-36 bg-gray-200 rounded mb-2" />
          <div className="h-11 w-full bg-gray-200 rounded-lg" />
        </div>

        {/* Prepare Dates skeleton */}
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
            <div>
              <div className="h-3 w-16 bg-gray-200 rounded mb-1" />
              <div className="h-11 w-full bg-gray-200 rounded-lg" />
            </div>
            <div>
              <div className="h-3 w-16 bg-gray-200 rounded mb-1" />
              <div className="h-11 w-full bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Description skeleton */}
        <div>
          <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-[140px] w-full bg-gray-200 rounded-lg" />
        </div>

        {/* Button skeleton */}
        <div className="flex justify-end pt-2">
          <div className="h-10 w-28 bg-gray-300 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function EditPameran() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<PameranForm>({
    title: "",
    publishDate: "",
    prepareStart: "",
    prepareEnd: "",
    description: "",
    image: null,
  });

  const toInputDate = (value?: string) => {
    if (!value) return "";

    if (value.includes("/")) {
      const [day, month, year] = value.split("/");
      return `${year}-${month}-${day}`;
    }

    return value.split("T")[0];
  };

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        setFetching(true);

        const res = await GetDetailPameran(slug);
        const p = res.pameran ?? res.data;

        if (!p) {
          setNotFound(true);
          return;
        }

        setForm({
          title: p.title || p.judul || "",
          publishDate: toInputDate(p.stats?.startDate || p.tanggal_buka),
          prepareStart: toInputDate(p.stats?.prepareStartDate || p.tanggal_mulai_persiapan),
          prepareEnd: toInputDate(p.stats?.prepareEndDate || p.tanggal_akhir_persiapan),
          description: p.description?.[0]?.content || p.deskripsi || "",
          image: null,
        });

        const rawBanner = p.bannerImage || p.banner || "";
        setPreview(rawBanner);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    setPreview(URL.createObjectURL(file));

    if (errors.image) {
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title) {
      newErrors.title = "Judul pameran wajib diisi";
    }

    if (!form.publishDate) {
      newErrors.publishDate = "Tanggal buka pameran wajib diisi";
    }

    if (!form.prepareStart) {
      newErrors.prepareStart = "Tanggal mulai persiapan wajib diisi";
    }

    if (!form.prepareEnd) {
      newErrors.prepareEnd = "Tanggal akhir persiapan wajib diisi";
    }

    if (!form.description) {
      newErrors.description = "Deskripsi wajib diisi";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!slug) {
      showToast("Slug pameran tidak ditemukan.", "error");
      return;
    }

    if (!validate()) {
      showToast("Harap lengkapi semua kolom yang wajib diisi.", "warning");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("judul", form.title);
      formData.append("tanggal_mulai_persiapan", form.prepareStart);
      formData.append("tanggal_akhir_persiapan", form.prepareEnd);
      formData.append("tanggal_buka", form.publishDate);
      formData.append("deskripsi", form.description);

      if (form.image) {
        formData.append("banner", form.image);
      }

      const data = await UpdatePameran(slug, formData);

      if (data.status === "success" || data.data || data.pameran) {
        showToast("Pameran berhasil diperbarui!", "success");
        const updatedSlug = data.pameran?.slug ?? data.data?.slug ?? slug;
        router.push(`/admin/pameran/detail/${updatedSlug}`);
      } else {
        showToast("Gagal memperbarui pameran.", "error");
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

              if (fieldKey) {
                mappedErrors[fieldKey] = messages[0];
              }
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
          showToast("Terjadi kesalahan pada server.", "error");
        } else {
          showToast(`Terjadi kesalahan (${status}).`, "error");
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

  const handleDeletePameran = async () => {
    if (!slug) return;
    try {
      setIsDeleting(true);
      const res = await DeletePameran(slug);
      if (res.status === "success" || res.message) {
        showToast("Pameran berhasil dihapus!", "success");
        clearPameranCache();
        setShowConfirmDelete(false);
        router.push("/admin/pameran");
      } else {
        showToast(res.message || "Gagal menghapus pameran.", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal menghapus pameran.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-color select-none pb-20 md:pb-30 font-poppins">
      {/* MODAL KONFIRMASI HAPUS */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              !
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800">Hapus Pameran Ini?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Tindakan ini tidak dapat dibatalkan. Seluruh data karya dan stan yang terhubung ke pameran ini juga akan dihapus permanen.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDeletePameran}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="autoMid">
        {fetching ? (
          <FormPameranSkeleton />
        ) : notFound ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                !
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Pameran Tidak Ditemukan</h2>
              <p className="text-sm text-gray-500 mb-6">
                Data pameran yang Anda cari tidak tersedia atau telah dihapus.
              </p>
              <button
                type="button"
                onClick={() => router.push("/admin/pameran")}
                className="w-full py-2.5 bg-main-blue text-white rounded-lg font-medium hover:opacity-90 transition"
              >
                Kembali ke Daftar Pameran
              </button>
            </div>
          </div>
        ) : (
          <FormPameran
            form={form}
            preview={preview}
            loading={loading}
            errors={errors}
            onChangeImage={handleImage}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onDelete={() => setShowConfirmDelete(true)}
            isDeleting={isDeleting}
          />
        )}
      </section>
    </div>
  );
}
