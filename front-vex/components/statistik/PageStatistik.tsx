'use client';

import { useState, useEffect, useMemo } from 'react';
import StatistikChart from './StatistikChart';
import DateRangeFilter, { calculateDatesForPreset, type DateRangeValue } from './DateRangeFilter';
import type { StatData } from './mockData';
import url from '@/lib/axios';

export default function PageStatistik() {
  const [range, setRange] = useState<DateRangeValue>(() => {
    const initial = calculateDatesForPreset('latest');
    return {
      preset: 'latest',
      startDate: initial.startDate,
      endDate: initial.endDate,
      label: initial.label,
    };
  });

  const [data, setData] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStatistik() {
      setLoading(true);
      try {
        const res = await url.get('/api/admin/kunjungan/statistik', {
          params: {
            start_date: range.startDate,
            end_date: range.endDate,
          },
        });
        setData(res.data || []);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStatistik();
  }, [range.startDate, range.endDate]);

  const totalPengunjung = useMemo(
    () => data.reduce((s, d) => s + d.pengunjung, 0),
    [data]
  );

  return (
    <div className="w-full min-h-screen px-4 md:px-8 pt-6 pb-32 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-800">Statistik Pengunjung</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualisasi log kunjungan pengunjung pameran berdasarkan rentang waktu
          </p>
        </div>

        {/* DATE RANGE FILTER DROPDOWN / POPOVER */}
        <div className="w-full md:w-auto shrink-0">
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Pengunjung</p>
          <p className="text-2xl font-bold text-main-blue mt-1">
            {totalPengunjung.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:col-span-1 lg:col-span-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Periode Aktif</p>
          <p className="text-base sm:text-lg font-semibold text-gray-700 mt-1 flex flex-wrap items-center gap-2">
            <span>{range.label}</span>
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {range.startDate === range.endDate ? range.startDate : `${range.startDate} s/d ${range.endDate}`}
            </span>
          </p>
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-[360px] text-gray-400">
            Memuat data statistik...
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
