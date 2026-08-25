"use client";

import { SponsorItem, TIPE_SPONSOR_OPTIONS, TipeSponsor } from "@/types/sponsor";

interface Props {
  form: SponsorItem;
  onChange: (field: keyof SponsorItem, value: string) => void;
  errors?: Record<string, string>;
  readOnly?: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => String(CURRENT_YEAR - i));

const inputClass =
  "w-full p-2.5 px-3 rounded-lg border mt-1.5 focus:outline-none focus:ring-1 transition-all text-sm";

const fieldClass = (error?: string) =>
  error
    ? `${inputClass} border-red-400 focus:border-red-400 focus:ring-red-200`
    : `${inputClass} border-gray-300 focus:border-main-blue focus:ring-main-blue`;

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <p className="text-sm font-semibold">
      {text} {required && <span className="text-red-500">*</span>}
    </p>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

export default function DetailFormSponsor({
  form,
  onChange,
  errors = {},
  readOnly,
}: Props) {
  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Judul — full width */}
      <div>
        <Label text="Judul Sponsor" required />
        <p className="text-xs text-gray-400 mt-1">Masukkan nama sponsor</p>
        {readOnly ? (
          <div className={`${inputClass} border-gray-200 bg-gray-50 text-gray-700`}>
            {form.title || "-"}
          </div>
        ) : (
          <input
            type="text"
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Masukkan judul sponsor"
            className={fieldClass(errors.title)}
          />
        )}
        <FieldError message={errors.title} />
      </div>

      {/* Tipe Sponsor & Tahun — sejajar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label text="Tipe Sponsor" required />
          <p className="text-xs text-gray-400 mt-1">Pilih tipe sponsor</p>
          {readOnly ? (
            <div className={`${inputClass} border-gray-200 bg-gray-50 text-gray-700`}>
              {TIPE_SPONSOR_OPTIONS.find((t) => t.kode === form.type)?.nama || "-"}
            </div>
          ) : (
            <select
              value={form.type ?? ""}
              onChange={(e) => onChange("type", e.target.value as TipeSponsor)}
              className={fieldClass(errors.type)}
            >
              <option value="" disabled>
                -- Pilih Tipe Sponsor --
              </option>
              {TIPE_SPONSOR_OPTIONS.map((t) => (
                <option key={t.kode} value={t.kode}>
                  {t.nama}
                </option>
              ))}
            </select>
          )}
          <FieldError message={errors.type} />
        </div>

        <div>
          <Label text="Tahun" required />
          <p className="text-xs text-gray-400 mt-1">Pilih tahun sponsor</p>
          {readOnly ? (
            <div className={`${inputClass} border-gray-200 bg-gray-50 text-gray-700`}>
              {form.year || "-"}
            </div>
          ) : (
            <select
              value={form.year ?? ""}
              onChange={(e) => onChange("year", e.target.value)}
              className={fieldClass(errors.year)}
            >
              <option value="" disabled>
                -- Pilih Tahun --
              </option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
          <FieldError message={errors.year} />
        </div>
      </div>
    </div>
  );
}