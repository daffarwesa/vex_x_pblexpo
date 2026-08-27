"use client";

import { useState, useEffect, useMemo } from "react";
import StatistikChart from "./StatistikChart";
import DateRangeFilter, {
  calculateDatesForPreset,
  type DateRangeValue,
  type PresetKey,
} from "./DateRangeFilter";
import { StatData, generateDummyByRange } from "./mockData";
import {
  GetStatistikRange,
  GetStatistikKunjungan,
} from "./apiStatistik";

// ─── Mode Tab ────────────────────────────────────────────────────────────────
type ModeTab = "range" | "kelompok";

export default function PageStatistik() {
  const [useDummy, setUseDummy]   = useState<boolean>(true);
  const [modeTab, setModeTab]     = useState<ModeTab>("range");
  const [groupBy, setGroupBy]     = useState<"harian" | "jam">("harian");

  const [range, setRange] = useState<DateRangeValue>(() => {
    const initial = calculateDatesForPreset("last_7_days");
    return { preset: "last_7_days", ...initial };
  });

  const [data, setData]       = useState<StatData[]>([]);
  const [total, setTotal]     = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (useDummy) {
      setLoading(true);
      setError(null);
      const t = setTimeout(() => {
        setData(generateDummyByRange(range.startDate, range.endDate));
        setTotal(0);
        setLoading(false);
      }, 150);
      return () => clearTimeout(t);
    }

    async function fetchLive() {
      setLoading(true);
      setError(null);
      try {
        if (modeTab === "range") {
          // ── Mode: Auto Range ──────────────────────────────────────────────
          const rows = await GetStatistikRange(range.startDate, range.endDate);
          setData(rows);
          setTotal(rows.reduce((s, r) => s + r.pengunjung, 0));
        } else {
          // ── Mode: Kelompok (harian / jam) ─────────────────────────────────
          const res = await GetStatistikKunjungan({
            group_by: groupBy,
            tanggal_mulai: range.startDate,
            tanggal_akhir: range.endDate,
          });
          // Normalisasi shape ke StatData (label + pengunjung)
          const rows: StatData[] = res.data.map((d) => ({
            label: d.periode,
            pengunjung: d.total_kunjungan,
          }));
          setData(rows);
          setTotal(res.total_keseluruhan);
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          "Gagal memuat data statistik.";
        setError(msg);
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }

    fetchLive();
  }, [range.startDate, range.endDate, useDummy, modeTab, groupBy]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalPengunjung = useMemo(
    () => (useDummy ? data.reduce((s, d) => s + d.pengunjung, 0) : total),
    [data, useDummy, total]
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
    setRange({ preset, ...calc });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen px-4 md:px-8 pt-6 pb-32 max-w-7xl mx-auto">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Visitor Statistics</h1>
            {useDummy && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                Demo Mode (Dummy Data)
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Visualization of exhibition visitor traffic logs based on date range
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* TOGGLE DUMMY */}
          <button
            type="button"
            onClick={() => setUseDummy((prev) => !prev)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 ${
              useDummy
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${useDummy ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
            {useDummy ? "Switch to Live API" : "Switch to Dummy Data"}
          </button>

          {/* DATE RANGE FILTER */}
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
      </div>

      {/* ── MODE TABS + GROUP BY ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Tab: Range vs Kelompok */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {([
            { key: "range",    label: "Auto Range" },
            { key: "kelompok", label: "Kelompok" },
          ] as { key: ModeTab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setModeTab(t.key)}
              disabled={useDummy}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                modeTab === t.key
                  ? "bg-white text-main-blue shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Group By (hanya tampil di mode Kelompok) */}
        {modeTab === "kelompok" && !useDummy && (
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {(["harian", "jam"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                  groupBy === g
                    ? "bg-white text-main-blue shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {g === "harian" ? "Per Hari" : "Per Jam"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── QUICK PRESETS ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        <span className="text-xs font-medium text-gray-400 shrink-0">Quick:</span>
        {[
          { key: "latest"       as PresetKey, label: "Today" },
          { key: "last_7_days"  as PresetKey, label: "7 Hari" },
          { key: "last_1_month" as PresetKey, label: "1 Bulan" },
          { key: "last_3_months"as PresetKey, label: "3 Bulan" },
          { key: "last_1_year"  as PresetKey, label: "1 Tahun" },
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

      {/* ── SUMMARY CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Visitors</p>
          <p className="text-2xl font-bold text-main-blue mt-1">
            {totalPengunjung.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-gray-400 mt-1">Terakumulasi dalam periode ini</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Rata-rata / Slot</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {averagePengunjung.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-gray-400 mt-1">Rata-rata pengunjung per titik waktu</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Puncak Kunjungan</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {peakPengunjung.pengunjung.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-gray-400 mt-1 truncate">Pada: {peakPengunjung.label}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Periode Aktif</p>
          <p className="text-base font-semibold text-gray-700 mt-1">{range.label}</p>
          <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
            {range.startDate === range.endDate
              ? range.startDate
              : `${range.startDate} → ${range.endDate}`}
          </p>
        </div>
      </div>

      {/* ── CHART ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Visitor Traffic Chart</h2>
            {!useDummy && (
              <p className="text-xs text-gray-400 mt-0.5">
                {modeTab === "range" ? "Auto-group berdasarkan rentang tanggal" : `Dikelompokkan per ${groupBy}`}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-400">{data.length} data points</span>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center justify-center h-[360px]">
            <div className="text-center">
              <p className="text-red-500 font-medium text-sm mb-1">Gagal memuat data</p>
              <p className="text-gray-400 text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center h-[360px] text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-main-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Memuat data statistik...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data.length === 0 && (
          <div className="flex items-center justify-center h-[360px] text-gray-400">
            Tidak ada data kunjungan untuk rentang tanggal ini.
          </div>
        )}

        {/* Chart */}
        {!loading && !error && data.length > 0 && (
          <StatistikChart data={data} />
        )}
      </div>
    </div>
  );
}
