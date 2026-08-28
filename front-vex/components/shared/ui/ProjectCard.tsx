"use client";

import "@/app/globals.css";
import Image from "next/image";
import { useState } from "react";
import { FaHeart, FaCalendar, FaLock, FaUnlock } from "react-icons/fa";
import { BsStars } from "react-icons/bs";

export interface ProjectCard {
  id: number;
  bannerImage: string;
  bannerSmall?: string;
  title: string;
  category?: string;
  likes?: number;
  karya?: number;
  date?: string;
  year?: string | number;
  stats?: {
    startDate?: string;
    endDate?: string | null;
  };
}

interface ProjectData {
  project: ProjectCard;
  className?: string;
}

export default function ProjectCard({ project, className }: ProjectData) {
  const [hovered, setHovered] = useState(false);

  const today = new Date();
  const startDateStr = project.stats?.startDate || project.date;
  const startDate = startDateStr ? new Date(startDateStr) : new Date();

  // endDate null → tidak ada batas tutup, cukup cek sudah dibuka
  const isOpen = project.stats?.endDate
    ? (() => {
        const end = new Date(project.stats.endDate);
        end.setHours(23, 59, 59, 999);
        return today >= startDate && today <= end;
      })()
    : today >= startDate;

  // Resolusi tahun dengan fallback aman
  const displayYear =
    project.year ||
    (() => {
      const raw = project.date || project.stats?.startDate;
      if (!raw) return "";
      const match = String(raw).match(/\b(19\d\d|20\d\d)\b/);
      if (match) return match[1];
      const d = new Date(raw);
      return !isNaN(d.getTime()) ? String(d.getFullYear()) : "";
    })();

  return (
    <div
      className={`relative overflow-hidden cursor-pointer rounded-lg border border-gray-200 bg-white p-2 shadow-md hover:shadow-lg transition-shadow duration-300 ${className ?? ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-sm">
        <Image
          src={project.bannerSmall || project.bannerImage}
          alt={project.title}
          fill
          unoptimized
          className={`object-cover transition-transform duration-300 ${hovered ? "scale-105" : "scale-100"}`}
        />

        {/* OVERLAY */}
        <div
          className={`absolute inset-0 z-10 bg-gradient-to-t from-main-blue/90 via-white/30 to-transparent transition-opacity duration-300 flex flex-col justify-end p-3 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
              <FaCalendar className="text-sm" />
              <p className="text-[11px] font-medium">{project.date}</p>
            </div>

            {isOpen ? (
              <span className="flex items-center gap-1.5 bg-green-500 px-2.5 py-1 rounded-full shadow-md text-white text-[11px] font-semibold">
                <FaUnlock className="text-[11px]" />
                Buka
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-red-500 px-2.5 py-1 rounded-full shadow-md text-white text-[11px] font-semibold">
                <FaLock className="text-[11px]" />
                Tutup
              </span>
            )}
          </div>
        </div>
      </div>

      {/* DETAIL */}
      <div className="mt-2">
        <h3 className="text-md font-medium font-poppins line-clamp-2">
          {project.title}
        </h3>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <FaCalendar className="text-gray-400 text-[13px]" />
          <span className="text-gray-500 font-semibold text-[12px]">
            {displayYear}
          </span>
        </div>
      </div>
    </div>
  );
}
