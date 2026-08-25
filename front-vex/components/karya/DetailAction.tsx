"use client";

import { Button, ButtonPutih } from "@/components/shared/ui/Button";
import { PREDIKAT_LIST, PredikatKarya, TerbaikRank } from "@/types/karya";

const RANKS: TerbaikRank[] = [1, 2, 3];

interface Props {
  onDelete?: () => void;
  onSave?: () => void;
  loading?: boolean;

  // Admin — penilaian
  isAdmin?: boolean;
  currentRank?: TerbaikRank | null;
  takenRanks?: TerbaikRank[];
  onSetRank?: (rank: TerbaikRank) => void;
  onCancelRank?: () => void;

  currentPredikat?: PredikatKarya | null;
  takenPredikat?: PredikatKarya[];
  onSetPredikat?: (predikat: PredikatKarya) => void;
  onCancelPredikat?: () => void;
}

function ChipButton({
  label,
  active,
  disabled,
  loading,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={disabled && !active ? "Sudah dipakai karya lain" : undefined}
      className={[
        "px-4 py-1.5 rounded-full text-xs font-medium border transition",
        active
          ? "bg-main-blue text-white border-main-blue hover:opacity-80"
          : disabled
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
        loading ? "opacity-60 cursor-wait" : "",
      ].join(" ")}
    >
      {active ? `${label} ✕` : label}
    </button>
  );
}

export default function DetailAction({
  onDelete,
  onSave,
  loading,
  isAdmin,
  currentRank,
  takenRanks = [],
  onSetRank,
  onCancelRank,
  currentPredikat,
  takenPredikat = [],
  onSetPredikat,
  onCancelPredikat,
}: Props) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      {/* Penilaian — hanya Admin */}
      {isAdmin && (onSetRank || onSetPredikat) && (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Peringkat Terbaik
            </p>
            <div className="flex flex-wrap gap-2">
              {RANKS.map((rank) => {
                const active = currentRank === rank;
                const taken = takenRanks.includes(rank);
                return (
                  <ChipButton
                    key={rank}
                    label={`Terbaik ${rank}`}
                    active={active}
                    disabled={taken && !active}
                    loading={loading}
                    onClick={() =>
                      active ? onCancelRank?.() : onSetRank?.(rank)
                    }
                  />
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Predikat
            </p>
            <div className="flex flex-wrap gap-2">
              {PREDIKAT_LIST.map((predikat) => {
                const active = currentPredikat === predikat;
                const taken = takenPredikat.includes(predikat);
                return (
                  <ChipButton
                    key={predikat}
                    label={predikat}
                    active={active}
                    disabled={taken && !active}
                    loading={loading}
                    onClick={() =>
                      active
                        ? onCancelPredikat?.()
                        : onSetPredikat?.(predikat)
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        {/* Hapus — hanya Admin */}
        {onDelete && (
          <ButtonPutih
            onClick={onDelete}
            className="px-8 py-2.5 rounded-lg hover:opacity-80"
          >
            Hapus
          </ButtonPutih>
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