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

  const resetForm = () => {
    setForm({
      title: "",
      publishDate: "",
      prepareStart: "",
      prepareEnd: "",
      description: "",
      image: null,
    });
    setPreview(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.image) newErrors.image = "Thumbnail must be uploaded";
    if (!form.title) newErrors.title = "Exhibition title is required";
    if (!form.publishDate) newErrors.publishDate = "Opening date is required";
    if (!form.prepareStart)
      newErrors.prepareStart = "Preparation start date is required";
    if (!form.prepareEnd)
      newErrors.prepareEnd = "Preparation end date is required";
    if (!form.description) newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast("Fill all the field.", "warning");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("prepare_start", form.prepareStart);
      formData.append("prepare_end", form.prepareEnd);
      formData.append("open_date", form.publishDate);
      formData.append("description", form.description);
      if (form.image) formData.append("banner", form.image);

      const data = await PostPameran(formData);

      if (data.status === "success") {
        showToast("Exhibition has been added!", "success");
        const newSlug = data.pameran?.slug;
        router.push(`/admin/pameran/detail/${newSlug}`);
      } else {
        showToast("Failed make exhibition.", "error");
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 422) {
          const laravelErrors = data.errors as Record<string, string[]>;
          const fieldMap: Record<string, keyof FormErrors> = {
            title: "title",
            prepare_start: "prepareStart",
            prepare_end: "prepareEnd",
            open_date: "publishDate",
            description: "description",
            banner: "image",
          };

          const mappedErrors: FormErrors = {};
          Object.entries(laravelErrors).forEach(([key, messages]) => {
            const fieldKey = fieldMap[key];
            if (fieldKey) mappedErrors[fieldKey] = messages[0];
          });

          setErrors(mappedErrors);
          showToast("Please review the entered data.", "error");
        } else if (status === 404) {
          showToast(
            data.message ?? "The requested data was not found.",
            "error",
          );
        } else if (status === 500) {
          showToast(
            data.message ?? "An internal server error occurred.",
            "error",
          );
        } else {
          showToast(
            `Error ${status}: ${data.message ?? "An unexpected error occurred."}`,
            "error",
          );
        }
      } else {
        showToast(
          "Unable to connect to the server. Please try again later.",
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
