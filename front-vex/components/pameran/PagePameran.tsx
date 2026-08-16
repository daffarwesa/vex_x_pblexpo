"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { GetPameran } from "./apiPameran";
import { useAuth } from "@/context/AuthContext";

import ProjectCard from "@/components/shared/ui/ProjectCard";
import { TahunType } from "@/components/shared/filter/SelectTahun";
import FilterSection from "@/components/pameran/FilterSection";

interface PameranProps {
  href?: string;
}

export default function PagePameran({ href = "/pameran/" }: PameranProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [selectedTahun, setSelectedTahun] = useState<TahunType | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadPameran() {
      try {
        const res = await GetPameran();
        setData(res.pameran || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadPameran();
  }, []);

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Filter admin: semua status, user biasa: hanya yang sedang buka/berlangsung
  const availableData = useMemo(() => {
    return data.filter((item) => {
      if (isAdmin) return true;
      const start = new Date(item.stats?.startDate);
      const end = new Date(item.stats?.endDate);
      end.setHours(23, 59, 59, 999);
      return today >= start && today <= end;
    });
  }, [data, isAdmin]);

  const filteredData = useMemo(() => {
    return availableData.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description &&
          typeof item.description === "string" &&
          item.description.toLowerCase().includes(search.toLowerCase()));
      const matchTahun =
        !selectedTahun ||
        new Date(item.date).getFullYear().toString() === selectedTahun.name;
      return matchSearch && matchTahun;
    });
  }, [availableData, search, selectedTahun]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-color font-poppins">
        {/* HERO SKELETON */}
        <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] py-6">
          <div className="autoMid">
            <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-[30px] pb-5">
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse flex-1" />
              <div className="h-[42px] rounded-xl bg-white/20 animate-pulse w-full sm:w-[180px]" />
            </div>
          </div>
        </section>

        {/* CARDS SKELETON */}
        <main className="autoMid py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[220px] rounded-xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-color font-poppins">
      {/* HERO WRAPPER */}
      <section className="bg-main-blue rounded-b-[25px] md:rounded-b-[40px] py-6">
        <div className="autoMid">
          <FilterSection
            search={search}
            setSearch={setSearch}
            selectedTahun={selectedTahun}
            setSelectedTahun={setSelectedTahun}
            onlyYear={true}
            searchPlaceholder="Cari pameran..."
          />
        </div>
      </section>

      {/* LIST PAMERAN (TANPA PENGELOMPOKAN PRODI) */}
      <main className="autoMid py-10">
        {filteredData.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-20">
            {isAdmin
              ? "Belum ada pameran."
              : "Tidak ada pameran yang sedang berlangsung."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((project) => (
              <Link
                key={project.id}
                href={`${href}${project.slug}`}
                className="group block"
              >
                <ProjectCard project={project} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
