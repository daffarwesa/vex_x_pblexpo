"use client";

import { useState, useEffect, useMemo } from "react";
import StatistikChart from "./StatistikChart";
import DateRangeFilter, {
  calculateDatesForPreset,
  type DateRangeValue,
  type PresetKey,
} from "./DateRangeFilter";
import { StatData, generateDummyByRange } from "./mockData";
import { GetDataKunjungan } from "./apiStatistik";

export default function PageStatistik() {
  const [useDummy, setUseDummy] = useState<boolean>(true); // Default true agar bisa langsung melihat visual
  const [range, setRange] = useState<DateRangeValue>(() => {
    const initial = calculateDatesForPreset("last_7_days");
    return {
      preset: "last_7_days",
      startDate: initial.startDate,
      endDate: initial.endDate,
      label: initial.label,
    };
  });

  const [data, setData] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (useDummy) {
      setLoading(true);
      const timer = setTimeout(() => {
        const dummy = generateDummyByRange(range.startDate, range.endDate);
        setData(dummy);
        setLoading(false);
      }, 150);
      return () => clearTimeout(timer);
    }

    async function fetchStatistik() {
      setLoading(true);
      try {
        const res = await GetDataKunjungan(range.startDate, range.endDate);
        setData(res || []);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStatistik();
  }, [range.startDate, range.endDate, useDummy]);

  const totalPengunjung = useMemo(
    () => data.reduce((s, d) => s + d.pengunjung, 0),
    [data],
  );

  const averagePengunjung = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.round(totalPengunjung / data.length);
  }, [data, totalPengunjung]);

  const peakPengunjung = useMemo(() => {
    if (data.length === 0) return { label: "-", pengunjung: 0 };
    return data.reduce((max, d) => (d.pengunjung > max.pengunjung ? d : max), data[0]);
  }, [data]);

  const handleQuickPreset = (preset: PresetKey) => {
    const calc = calculateDatesForPreset(preset);
    setRange({
      preset,
      startDate: calc.startDate,
      endDate: calc.endDate,
      label: calc.label,
    });
  };

  return (
    <div className="w-full min-h-screen px-4 md:px-8 pt-6 pb-32 max-w-7xl mx-auto">
      {/* HEADER & TOGGLE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">
              Statistik Pengunjung
            </h1>
            {useDummy && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                Mode Demo (Dummy Data)
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Visualisasi log kunjungan pengunjung pameran berdasarkan rentang waktu
          </p>
        </div>

        {/* CONTROLS: DUMMY TOGGLE & DATE RANGE FILTER */}
        <div className="flex flex-wrap items-center gap-3">
          {/* TOGGLE DUMMY BUTTON */}
          <button
            type="button"
            onClick={() => setUseDummy((prev) => !prev)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 ${
              useDummy
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                useDummy ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
            {useDummy ? "Gunakan Live API" : "Gunakan Dummy Data"}
          </button>

          {/* DATE RANGE FILTER DROPDOWN */}
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
      </div>

      {/* QUICK PRESET CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        <span className="text-xs font-medium text-gray-400 shrink-0">Tes Cepat:</span>
        {[
          { key: "latest" as PresetKey, label: "Hari Ini (Per Jam)" },
          { key: "last_7_days" as PresetKey, label: "7 Hari Terakhir" },
          { key: "last_1_month" as PresetKey, label: "1 Bulan (Per Hari)" },
          { key: "last_3_months" as PresetKey, label: "3 Bulan (Per Minggu)" },
          { key: "last_1_year" as PresetKey, label: "1 Tahun (Per Bulan)" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => handleQuickPreset(item.key)}
            className={`px-3 py-1 text-xs rounded-full border shrink-0 transition-colors ${
              range.preset === item.key
                ? "bg-main-blue text-white border-main-blue font-medium"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Total Pengunjung
          </p>
          <p className="text-2xl font-bold text-main-blue mt-1">
            {totalPengunjung.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-gray-400 mt-1">Akumulasi pada periode ini</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Rata-rata / Titik
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {averagePengunjung.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-gray-400 mt-1">Rata-rata pengunjung per slot</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Puncak Tertinggi
          </p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {peakPengunjung.pengunjung.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-gray-400 mt-1 truncate">
            Pada: {peakPengunjung.label}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Periode Aktif
          </p>
          <p className="text-base font-semibold text-gray-700 mt-1">
            {range.label}
          </p>
          <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
            {range.startDate === range.endDate
              ? range.startDate
              : `${range.startDate} s/d ${range.endDate}`}
          </p>
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">
            Grafik Kunjungan
          </h2>
          <span className="text-xs text-gray-400">
            {data.length} titik data
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[360px] text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-main-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Memuat data statistik...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[360px] text-gray-400">
            Belum ada log kunjungan pada rentang tanggal ini.
          </div>
        ) : (
          <StatistikChart data={data} />
        )}
      </div>
    </div>
  );
}

