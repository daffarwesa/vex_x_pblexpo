"use client";

import { useEffect, useState } from "react";
import { KaryaItem } from "../../types/karya";
import { GetKategoriList } from "@/components/karya/apiKarya";
import { GetPameran } from "@/components/pameran/apiPameran";

interface Props {
  form: KaryaItem;
  onChange: (field: keyof KaryaItem, value: string) => void;
  currentPameran?: { id: number; title: string } | null;
  errors?: Record<string, string>;
  readOnly?: boolean; // ← tambah ini
}

interface PameranOption {
  id: number;
  title: string;
  isClosedCurrent?: boolean;
}

interface KategoriOption {
  id_kategori: number;
  kode_kategori: string;
  nama_kategori: string;
}

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

export default function DetailForm({
  form,
  onChange,
  currentPameran,
  errors = {},
  readOnly,
}: Props) {
  const [pameranList, setPameranList] = useState<PameranOption[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriOption[]>([]);
  const [loadingPameran, setLoadingPameran] = useState(true);
  const [pameranError, setPameranError] = useState(false);

  useEffect(() => {
    // Fetch Kategori
    const fetchKategori = async () => {
      try {
        const res = await GetKategoriList();
        if (res.status === "success" && Array.isArray(res.data)) {
          setKategoriList(res.data);
        }
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
      }
    };
    fetchKategori();

    if (readOnly) {
      // KPS/Admin: tidak perlu fetch dropdown, pakai currentPameran langsung
      if (currentPameran) {
        setPameranList([{ ...currentPameran, isClosedCurrent: true }]);
      }
      setLoadingPameran(false);
      return;
    }

    const fetchPameran = async () => {
      setPameranError(false);
      try {
        const res = await GetPameran();
        const list: PameranOption[] = res.pameran ?? res.data ?? [];

        const normalizedList: PameranOption[] = list.map((item: any) => ({
          id: item.id ?? item.id_pameran,
          title: item.title ?? item.judul,
        }));

        if (currentPameran) {
          const sudahAda = normalizedList.some((p) => p.id === currentPameran.id);
          if (!sudahAda) {
            normalizedList.unshift({ ...currentPameran, isClosedCurrent: true });
          }
        }

        setPameranList(normalizedList);
      } catch (err) {
        console.error("Gagal memuat pameran:", err);
        if (currentPameran) {
          setPameranList([{ ...currentPameran, isClosedCurrent: true }]);
        }
        setPameranError(true);
      } finally {
        setLoadingPameran(false);
      }
    };

    fetchPameran();
  }, [currentPameran, readOnly]);

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Pameran */}
      <div>
        <Label text="Pameran" required />
        <p className="text-xs text-gray-400 mt-1">
          Pilih Pameran yang tersedia
        </p>

        {readOnly ? (
          <div
            className={`${inputClass} border-gray-200 bg-gray-50 text-gray-700`}
          >
            {currentPameran?.title ?? "-"}
          </div>
        ) : loadingPameran ? (
          <div className="mt-1.5 h-10 animate-pulse rounded-lg bg-gray-100" />
        ) : pameranError && pameranList.length === 0 ? (
          <p className="mt-1.5 text-xs text-red-500 italic">
            Gagal memuat daftar pameran. Periksa koneksi atau hubungi admin.
          </p>
        ) : (
          <select
            value={form.pameranId ?? ""}
            onChange={(e) => onChange("pameranId", e.target.value)}
            className={fieldClass(errors.pameranId)}
          >
            <option value="" disabled>
              -- Pilih Pameran --
            </option>
            {pameranList.map((p) => (
              <option
                key={p.id}
                value={String(p.id)}
                disabled={p.isClosedCurrent}
              >
                {p.title}
                {p.isClosedCurrent ? " (Sudah dibuka)" : ""}
              </option>
            ))}
          </select>
        )}
        <FieldError message={errors.pameranId} />
      </div>

      {/* Kategori */}
      <div>
        <Label text="Kategori" required />
        <p className="text-xs text-gray-400 mt-1">Pilih kategori karya PBL</p>
        <select
          value={form.category ?? ""}
          onChange={(e) => onChange("category", e.target.value)}
          className={fieldClass(errors.category)}
        >
          <option value="" disabled>
            -- Pilih Kategori --
          </option>
          {kategoriList.map((k) => (
            <option key={k.id_kategori} value={String(k.id_kategori)}>
              {k.kode_kategori} - {k.nama_kategori}
            </option>
          ))}
        </select>
        <FieldError message={errors.category} />
      </div>

      {/* Judul */}
      <div>
        <Label text="Judul" required />
        <p className="text-xs text-gray-400 mt-1">Masukkan judul PBL</p>
        <input
          type="text"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Masukkan judul karya"
          className={fieldClass(errors.title)}
        />
        <FieldError message={errors.title} />
      </div>

      {/* Link Video Demo */}
      <div>
        <Label text="Link Video" required />
        <p className="text-xs text-gray-400 mt-1">
          Link yang didukung: YouTube atau Google Drive
        </p>
        <input
          type="text"
          value={form.link}
          onChange={(e) => onChange("link", e.target.value)}
          placeholder="Masukkan link video YouTube atau Google Drive (contoh: https://youtube.com/... atau https://drive.google.com/...)"
          className={fieldClass(errors.link)}
        />
        <FieldError message={errors.link} />
      </div>

      {/* Deskripsi */}
      <div>
        <Label text="Deskripsi Karya" required />
        <div className="text-xs text-gray-400 mt-1">
          <p>Deskripsi harus berisi:</p>
          <ol className="list-decimal list-inside mt-1 space-y-0.5">
            <li>
              <span className="font-medium text-gray-400">Latar Belakang</span>{" "}
              — alasan/permasalahan yang mendasari karya ini.
            </li>
            <li>
              <span className="font-medium text-gray-400">Gagasan</span> — ide
              atau solusi yang ditawarkan.
            </li>
            <li>
              <span className="font-medium text-gray-400">Team PBL</span> — kode
              team, nama anggota team, dan nama manager proyek.
            </li>
          </ol>
        </div>
        {readOnly ? (
          <div
            className={`${inputClass} border-gray-200 bg-gray-50 text-gray-700 h-[420px] overflow-y-auto whitespace-pre-wrap`}
          >
            {form.description ?? "-"}
          </div>
        ) : (
          <textarea
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Masukkan deskripsi karya..."
            className={`${fieldClass(errors.description)} h-[420px] resize-none overflow-y-auto`}
          />
        )}
        <FieldError message={errors.description} />
      </div>
    </div>
  );
}
