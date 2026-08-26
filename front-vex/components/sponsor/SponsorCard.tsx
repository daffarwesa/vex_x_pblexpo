"use client";

import Link from "next/link";
import { SponsorItem } from "@/types/sponsor";

interface Props {
  item: SponsorItem;
  href: string; // base path, misal "/admin/sponsor/"
}

export default function SponsorCard({ item, href }: Props) {
  return (
    <Link
      href={`${href}${item.id}`}
      className="group block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-all"
    >
      <div className="relative w-full aspect-[3/4] bg-gray-100">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
            Tidak ada poster
          </div>
        )}
        <span
          className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-1 rounded-full text-white ${
            item.type === "besar" ? "bg-main-blue" : "bg-gray-500"
          }`}
        >
          {item.type === "besar" ? "Sponsor Besar" : "Sponsor Kecil"}
        </span>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-main-blue">
          {item.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{item.year}</p>
      </div>
    </Link>
  );
}