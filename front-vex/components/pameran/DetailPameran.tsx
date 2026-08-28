"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaPlay,
  FaInstagram,
  FaYoutube,
  FaFacebookSquare,
  FaRegCalendarAlt,
  FaLock,
  FaLockOpen,
} from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../shared/ui/Button";
import { Pameran } from "@/types/pameran";
import { GetDetailPameran } from "./apiPameran";
import url from "@/lib/axios";

interface Status {
  isLogin?: boolean;
}

function DetailPameranSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 font-poppins text-gray-800 animate-pulse">
      <div className="hidden md:block w-full h-[60vh] bg-gray-200" />
      <div className="autoMid relative z-10 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-[55%] lg:w-[100%] h-[200px] md:h-[280px] lg:h-[340px] bg-gray-200 rounded-lg" />
          <div className="w-full flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="h-9 w-3/4 bg-gray-200 rounded-md" />
              <div className="h-4 w-1/2 bg-gray-200 rounded-md" />
              <div className="h-4 w-1/3 bg-gray-200 rounded-md" />
            </div>
            <div className="h-14 w-full bg-gray-200 rounded-md" />
          </div>
        </div>
        <div className="mt-10 space-y-3">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function PageDetailPameran({ isLogin = false }: Status) {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const [pameran, setPameran] = useState<Pameran | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function load() {
      try {
        const data = await GetDetailPameran(slug as string);
        const item = data.pameran ?? data.data;

        if (!item) {
          throw new Error("Pameran tidak ditemukan");
        }

        setPameran(item);
      } catch (err: any) {
        setError(err.message ?? "Gagal memuat data pameran");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  if (loading) {
    return <DetailPameranSkeleton />;
  }

  if (error || !pameran) {
    return (
      <div className="min-h-screen bg-secondary-color flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Pameran Tidak Ditemukan</h2>
          <p className="text-sm text-gray-500 mb-6">
            {error ?? "Data pameran yang Anda cari tidak tersedia."}
          </p>
          <button
            type="button"
            onClick={() => router.push("/pameran")}
            className="w-full py-2.5 bg-main-blue text-white rounded-lg font-medium hover:opacity-90 transition"
          >
            Kembali ke Daftar Pameran
          </button>
        </div>
      </div>
    );
  }

  const {
    title,
    subtitle,
    date,
    bannerImage,
    description,
    stats,
    institution,
  } = pameran;

  const today = new Date();
  const openDate = new Date(stats?.startDate || date);
  const isOpen = stats?.endDate
    ? today >= openDate &&
    today <=
    (() => {
      const d = new Date(stats.endDate);
      d.setHours(23, 59, 59, 999);
      return d;
    })()
    : today >= openDate;

  return (
    <div className="min-h-screen bg-gray-50 font-poppins text-gray-800 select-none">
      <main className="relative pb-16 bg-white">
        {/* BANNER */}
        <div className="hidden md:block relative w-full h-[60vh] overflow-hidden">
          <img
            src={bannerImage}
            alt="Banner"
            className="w-full h-full object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
        </div>

        {/* CONTENT */}
        <div className="autoMid relative z-10 py-6 md:py-8">
          <div className="flex flex-col md:flex-row gap-8 relative">
            {/* MOBILE TITLE + EDIT */}
            <div className="md:hidden relative pr-16">
              <div className="absolute right-0 top-0 flex items-center gap-2 z-20">
                {isLogin && (
                  <Link
                    href={`/admin/pameran/edit/${pameran.slug}`}
                    className="bg-white border rounded-full p-2 shadow-md"
                  >
                    <HiPencilAlt size={18} />
                  </Link>
                )}
              </div>
              <h1 className="text-4xl font-extrabold uppercase">
                {title} <StatusBadge isOpen={isOpen} />
              </h1>
              <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
              <div className="flex items-center gap-4 text-gray-600 mt-2 text-sm">
                <FaRegCalendarAlt className="text-main-blue" />
                <span>{date}</span>
              </div>
            </div>

            {/* POSTER */}
            <div className="w-full md:w-[55%] lg:w-[100%]">
              <img
                src={bannerImage}
                alt={title}
                className="w-full h-full max-h-[200px] md:max-h-[280px] lg:max-h-[340px] object-cover rounded-lg shadow-lg/40"
              />
            </div>

            {/* RIGHT */}
            <div className="w-full flex flex-col justify-between relative">
              {/* DESKTOP EDIT */}
              {isLogin && (
                <Link
                  href={`/admin/pameran/edit/${pameran.slug}`}
                  className="absolute right-0 top-0 hidden md:flex bg-white border-2 rounded-full p-2 shadow-lg/10 hover:scale-120 transition-all duration-300"
                >
                  <HiPencilAlt size={24} />
                </Link>
              )}

              {/* DESKTOP TITLE */}
              <div className="hidden md:block mb-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-4xl font-extrabold uppercase">{title}</h1>
                  <StatusBadge isOpen={isOpen} />
                </div>
                {/* <p className="text-gray-500 mt-2">{subtitle}</p> */}
                <div className="flex items-center gap-2 mt-3">
                  <FaRegCalendarAlt className="text-main-blue" />
                  <span>{date}</span>
                </div>
              </div>

              {/* BUTTON */}
              <div className="w-full mt-6">
                {isOpen ? (
                  <Button
                    link={`/exhibition/${pameran.slug}`}
                    className="w-full py-5 flex items-center justify-center rounded-md text-xl"
                  >
                    <FaPlay />
                  </Button>
                ) : (
                  <div className="w-full py-5 bg-gray-300 text-gray-500 rounded-md flex justify-center items-center text-xl cursor-not-allowed">
                    <FaPlay />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-10">
            <div className="space-y-6 text-gray-600 leading-relaxed">
              {description && Array.isArray(description) && description.map((section: any, index: number) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {section.title}
                  </h3>
                  {section.content && <p>{section.content}</p>}
                  {section.list && (
                    <ul className="list-disc pl-5 space-y-1">
                      {section.list.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SOCIAL */}
          <div className="mt-12 flex justify-end items-center gap-10">
            <p className="font-bold text-main-blue">{institution}</p>
            <div className="flex gap-4 text-main-blue text-2xl">
              <a href="#" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <FaYoutube />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <FaFacebookSquare />
              </a>
            </div>
          </div>

          {/* STATS */}
          <div className="mt-8 py-4 border-y">
            <div className="hidden md:flex justify-between divide-x">
              <Stat title="Total Project" value={stats?.karya ?? 0} />
              <Stat title="Opening Date" value={stats?.startDate || date} />
            </div>
            <div className="md:hidden space-y-3">
              <Row title="Total Project" value={stats?.karya ?? 0} />
              <Row title="Opening Date" value={stats?.startDate || date} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: any }) {
  return (
    <div className="flex-1 px-4 text-center">
      <p className="text-xs text-gray-400 uppercase">{title}</p>
      <p className="font-semibold mt-1">{value}</p>
    </div>
  );
}

function Row({ title, value }: { title: string; value: any }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-gray-500">{title}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function StatusBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 w-8 h-8 px-2.5 py-1 rounded-full text-white text-xs font-semibold ${isOpen ? "bg-green-500" : "bg-red-500"
        }`}
    >
      {isOpen ? <FaLockOpen size={12} /> : <FaLock size={12} />}
    </div>
  );
}
