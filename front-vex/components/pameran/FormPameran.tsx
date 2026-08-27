import { FaCloudUploadAlt } from "react-icons/fa";
import { PameranForm as PameranFormType } from "@/types/pameran";
import { Button } from "@/components/shared/ui/Button";
import {
  InputField,
  TextareaField,
  Label,
} from "@/components/shared/ui/InputFields";

type Props = {
  form: PameranFormType;
  preview: string | null;
  loading: boolean;
  errors?: Partial<Record<keyof PameranFormType | "image", string>>;
  onChangeImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onSubmit: () => void;
};

export default function FormPameran({
  form,
  preview,
  loading,
  errors = {},
  onChangeImage,
  onChange,
  onSubmit,
}: Props) {
  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* LEFT - THUMBNAIL */}
      <div className="w-full lg:w-[62%]">
        <p className="text-xl font-semibold mt-10 mb-1.5">
          Thumbnail<span className="text-red-500">*</span>
        </p>

        <label
          htmlFor="file"
          className={`cursor-pointer h-[220px] md:h-[320px] w-full flex items-center justify-center bg-gray-50 border-2 border-dashed rounded-xl mt-2 overflow-hidden transition-all duration-200
            ${errors.image
              ? "border-red-400 bg-red-50 hover:border-red-500"
              : "border-gray-300 hover:border-main-blue hover:bg-blue-50"
            }`}
        >
          {preview ? (
            <img src={preview} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-gray-400">
              <FaCloudUploadAlt className="text-5xl mx-auto mb-2" />
              <p className="text-sm font-medium">Klik untuk upload</p>
              <p className="text-xs mt-1">PNG, JPG, JPEG</p>
            </div>
          )}
          <input
            id="file"
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/jpg"
            onChange={onChangeImage}
          />
        </label>

        <p className="text-xs text-gray-400 mt-2">
          Format: PNG, JPG, JPEG. Ukuran maks 2MB.
        </p>
        {errors.image && (
          <p className="mt-1 text-xs text-red-500">{errors.image}</p>
        )}
      </div>

      {/* RIGHT - FIELDS */}
      <div className="w-full lg:w-[60%] mt-10 flex flex-col gap-4">
        {/* TITLE */}
        <InputField
          type="text"
          name="title"
          label="Judul Pameran"
          required
          value={form.title}
          placeholder="Masukkan judul pameran"
          error={errors.title}
          onChange={onChange}
        />

        {/* TANGGAL BUKA PAMERAN */}
        <InputField
          type="date"
          name="publishDate"
          label="Tanggal Buka Pameran"
          required
          value={form.publishDate}
          error={errors.publishDate}
          onChange={onChange}
        />

        {/* TANGGAL PERSIAPAN */}
        <div>
          <Label text="Tanggal Persiapan" required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
            <div>
              <p className="text-xs text-gray-400 mb-1">Mulai</p>
              <InputField
                type="date"
                name="prepareStart"
                value={form.prepareStart}
                error={errors.prepareStart}
                onChange={onChange}
              />
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Berakhir</p>
              <InputField
                type="date"
                name="prepareEnd"
                value={form.prepareEnd}
                error={errors.prepareEnd}
                onChange={onChange}
              />
            </div>
          </div>
        </div>

        {/* DESKRIPSI */}
        <TextareaField
          name="description"
          label="Deskripsi"
          required
          value={form.description}
          placeholder="Masukkan deskripsi pameran..."
          error={errors.description}
          onChange={onChange}
          className="h-[140px]"
        />

        {/* BUTTON */}
        <div className="flex justify-end">
          <Button
            onClick={onSubmit}
            disabled={loading}
            className="px-8 py-2.5 text-white rounded-lg hover:opacity-80"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
