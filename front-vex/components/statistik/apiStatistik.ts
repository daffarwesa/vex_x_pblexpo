import url from '@/lib/axios';
import { StatData } from './mockData';

export async function GetDataKunjungan(startDate: string, endDate: string): Promise<StatData[]> {
  const res = await url.get('/api/admin/kunjungan/statistik', {
    params: {
      start_date: startDate,
      end_date: endDate,
    },
  });
  return res.data;
}

export async function PostKunjungan(idPameran: number | string) {
  const res = await url.post('/api/kunjungan', {
    id_pameran: idPameran,
  });
  return res.data;
}