"use client";

import SponsorCard from "@/components/sponsor/SponsorCard";
import { SponsorItem } from "@/types/sponsor";

interface Props {
  year: string;
  data: SponsorItem[];
  currentPage: number;
  totalPages: number;
  href: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function SponsorGrid({
  year,
  data,
  currentPage,
  totalPages,
  href,
  onPrev,
  onNext,
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{year}</h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-full border border-gray-300 text-gray-500 disabled:opacity-30 hover:bg-gray-50"
            >
              ‹
            </button>
            <span className="text-xs text-gray-400">
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={onNext}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-full border border-gray-300 text-gray-500 disabled:opacity-30 hover:bg-gray-50"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">
          Belum ada sponsor untuk tahun ini.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {data.map((item) => (
            <SponsorCard key={item.id} item={item} href={href} />
          ))}
        </div>
      )}
    </div>
  );
}