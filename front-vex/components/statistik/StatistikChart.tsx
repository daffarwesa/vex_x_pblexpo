'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { StatData } from './mockData';

interface Props {
  data: StatData[];
  barColor?: string;
}

export default function StatistikChart({ data, barColor = '#2563eb' }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    // Layout HP/Android: Batang memanjang ke kanan, berjejer rapi ke bawah
    const dynamicHeight = Math.max(360, data.length * 32);

    return (
      <div style={{ height: dynamicHeight, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis
              dataKey="label"
              type="category"
              tick={{ fontSize: 11 }}
              interval={0}
              width={65}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              labelStyle={{ fontWeight: 600 }}
              formatter={(v) => [`${v} visitors`, 'Total']}
            />
            <Bar dataKey="pengunjung" fill={barColor} radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Layout Desktop / Tablet: Batang tegak ke atas
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          interval={0}
          angle={data.length > 12 ? -45 : 0}
          textAnchor={data.length > 12 ? 'end' : 'middle'}
          height={data.length > 12 ? 60 : 30}
        />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, fontSize: 13 }}
          labelStyle={{ fontWeight: 600 }}
          formatter={(v) => [`${v} visitors`, 'Total']}
        />
        <Bar dataKey="pengunjung" fill={barColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
