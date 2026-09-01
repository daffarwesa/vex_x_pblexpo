import axios from "axios";
import { StatData } from "./mockData";

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");
// Gunakan axios langsung ke Next.js internal API (proxy ke Laravel)
const api = axios.create({ baseURL: BASE_PATH || undefined });

// Sertakan token dari localStorage secara otomatis
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =============================================================================
// GET STATISTIK — Auto Group by Date Range
// Endpoint: GET /api-internal/statistik/range
// Response: StatData[] → [{ label, pengunjung }]
// =============================================================================
export async function GetStatistikRange(
  startDate: string,
  endDate: string
): Promise<StatData[]> {
  const res = await api.get("/api-internal/statistik/range", {
    params: { start_date: startDate, end_date: endDate },
  });
  // Laravel mengembalikan array langsung [{ label, pengunjung }]
  return Array.isArray(res.data) ? res.data : [];
}

// =============================================================================
// GET STATISTIK — Group by Harian / Jam (dengan filter opsional)
// Endpoint: GET /api-internal/statistik/kunjungan
// Response: { status, total_keseluruhan, group_by, data: [{periode, total_kunjungan}] }
// =============================================================================
export interface StatistikKunjunganParams {
  group_by: "harian" | "jam";
  id_pameran?: number | string;
  tanggal_mulai?: string;
  tanggal_akhir?: string;
}

export interface StatistikKunjunganResponse {
  status: string;
  total_keseluruhan: number;
  group_by: string;
  data: { periode: string; total_kunjungan: number }[];
}

export async function GetStatistikKunjungan(
  params: StatistikKunjunganParams
): Promise<StatistikKunjunganResponse> {
  const query: Record<string, string> = { group_by: params.group_by };
  if (params.id_pameran) query.id_pameran = String(params.id_pameran);
  if (params.tanggal_mulai) query.tanggal_mulai = params.tanggal_mulai;
  if (params.tanggal_akhir) query.tanggal_akhir = params.tanggal_akhir;

  const res = await api.get("/api-internal/statistik/kunjungan", { params: query });
  return res.data;
}

// =============================================================================
// POST KUNJUNGAN — Catat kunjungan (public, tanpa auth)
// Endpoint: POST /api/kunjungan via PameranPublicController@catatKunjungan
// Dipanggil saat user klik "Play Exhibition"
// =============================================================================
export async function PostKunjungan(slugOrId: string | number): Promise<void> {
  if (typeof slugOrId === "string") {
    // Catat via slug: POST /api/pameran/{slug}/kunjungan
    await api.post(`/api/pameran/${slugOrId}/kunjungan`);
  } else {
    // Catat via id_pameran langsung
    await api.post("/api/kunjungan", { id_pameran: slugOrId });
  }
}