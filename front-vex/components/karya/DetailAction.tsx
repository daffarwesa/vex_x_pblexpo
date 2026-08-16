"use client";

import { Button, ButtonPutih } from "@/components/shared/ui/Button";

interface Props {
  onDelete?: () => void;
  onSave?: () => void;
  onPilihTerbaik?: () => void;
  onBatalkanTerbaik?: () => void;
  onSetJuara?: (juara: number | null) => void;
  juara?: number | null;
  loading?: boolean;
  isTerbaik?: boolean;
}

export default function DetailAction({
  onDelete,
  onSave,
  onPilihTerbaik,
  onBatalkanTerbaik,
  onSetJuara,
  juara,
  loading,
  isTerbaik,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t mt-6">
      {/* Admin Selector Juara 1, 2, 3 */}
      {onSetJuara && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Tentukan Juara:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => onSetJuara(juara === 1 ? null : 1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                juara === 1
                  ? "bg-amber-400 text-slate-900 ring-2 ring-amber-500 shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-amber-100"
              }`}
            >
              🏆 Juara 1
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => onSetJuara(juara === 2 ? null : 2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                juara === 2
                  ? "bg-slate-300 text-slate-900 ring-2 ring-slate-400 shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-slate-200"
              }`}
            >
              🥈 Juara 2
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => onSetJuara(juara === 3 ? null : 3)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                juara === 3
                  ? "bg-amber-700 text-white ring-2 ring-amber-800 shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-amber-200"
              }`}
            >
              🥉 Juara 3
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 ml-auto">
        {/* Hapus — hanya Admin */}
        {onDelete && (
          <ButtonPutih
            onClick={onDelete}
            className="px-8 py-2.5 rounded-lg hover:opacity-80 text-red-600 border-red-200 hover:bg-red-50"
          >
            Hapus
          </ButtonPutih>
        )}

        {/* Batalkan Terbaik — hanya KPS, jika sudah terbaik */}
        {onBatalkanTerbaik && isTerbaik && (
          <ButtonPutih
            onClick={onBatalkanTerbaik}
            disabled={loading}
            className="px-8 py-2.5 rounded-lg hover:opacity-80"
          >
            {loading ? "Memproses..." : "Batalkan Terbaik"}
          </ButtonPutih>
        )}

        {/* Pilih Terbaik — hanya KPS, jika belum terbaik */}
        {onPilihTerbaik && !isTerbaik && (
          <Button
            onClick={onPilihTerbaik}
            disabled={loading}
            className="px-8 py-2.5 text-white rounded-lg hover:opacity-80"
          >
            {loading ? "Memproses..." : "Pilih Terbaik"}
          </Button>
        )}

        {/* Simpan — hanya Ketua PBL */}
        {onSave && (
          <Button
            onClick={onSave}
            disabled={loading}
            className="px-8 py-2.5 text-white rounded-lg hover:opacity-80"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        )}
      </div>
    </div>
  );
}
