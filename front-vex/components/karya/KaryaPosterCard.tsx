"use client";

import Image from "next/image";
import { KaryaItem, PameranItem } from "../../types/karya";
import { PRODI_OPTIONS } from "@/types/pameran";

interface PosterCardProps {
  karya: KaryaItem;
  pameranList: PameranItem[];
}

export default function PosterCard({ karya, pameranList }: PosterCardProps) {
  const pameran = pameranList.find((item) => item.id === karya.pameranId);

  const prodi = PRODI_OPTIONS.find((p) => p.kode === karya.category);
  const categoryName = prodi?.nama || karya.category;
  return (
    <div className="mt-1 bg-white rounded-xl overflow-hidden hover:scale-102 shadow-md hover:shadow-xl/40 transition duration-300 group">
      <div className="relative aspect-[3/4] w-full">
        {karya.image ? (
          <Image
            src={karya.image}
            alt={karya.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* ✅ Badge Juara 1, 2, 3 atau Terbaik */}
        {karya.juara === 1 && (
          <div className="z-20 absolute top-2 right-2 bg-amber-400 text-slate-900 font-extrabold text-xs px-2.5 py-1 rounded-full shadow-lg border border-white flex items-center gap-1">
            🏆 Juara 1
          </div>
        )}
        {karya.juara === 2 && (
          <div className="z-20 absolute top-2 right-2 bg-slate-300 text-slate-900 font-extrabold text-xs px-2.5 py-1 rounded-full shadow-lg border border-white flex items-center gap-1">
            🥈 Juara 2
          </div>
        )}
        {karya.juara === 3 && (
          <div className="z-20 absolute top-2 right-2 bg-amber-700 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-lg border border-white flex items-center gap-1">
            🥉 Juara 3
          </div>
        )}
        {!karya.juara && (karya as any).isTerbaik && (
          <div className="z-20 absolute top-2 right-2">
            <img
              src="/icon/Medalion.svg"
              alt="Medali Terbaik"
              className="w-12 h-12 drop-shadow-md"
            />
          </div>
        )}
      </div>

      <div className="p-3 h-[100px] flex flex-col justify-between">
        <h3 className="font-medium text-sm line-clamp-2">{karya.title}</h3>
        <p className="text-xs text-gray-500">{categoryName}</p>

        {pameran && (
          <span className="mt-1 inline-flex w-fit items-center rounded-full bg-blue-300/40 px-3 py-1">
            <p className="font-poppins text-xs font-medium text-main-blue leading-none">
              {pameran.title}
            </p>
          </span>
        )}
      </div>
    </div>
  );
}
