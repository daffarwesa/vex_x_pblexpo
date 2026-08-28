import url from "@/lib/axios";

// REVISI UNTUK KONSEP PENILAIAN TERBARU
// predikat '1' = Juara 1 (Best Work), predikat '2' = Juara 2 (Favorite Work)

export interface KaryaPredikatItem {
  id_karya: number;
  judul: string;
  deskripsi: string;
  tautan: string;
  gambar_poster: string;
  predikat: "1" | "2" | null;
  id_kategori: number;
  id_pameran: number;
  kategori?: {
    id_kategori: number;
    kode_kategori: string;
    nama_kategori: string;
  };
  pameran?: {
    id_pameran: number;
    judul: string;
    slug: string;
  };
}

interface KaryaPredikatResponse {
  status: string;
  data: KaryaPredikatItem[];
}

export async function GetKaryaTerbaikAktif(): Promise<KaryaPredikatResponse> {
  const res = await url.get("/api/karya/predikat/1");
  return res.data;
}

export async function GetKaryaFavoritAktif(): Promise<KaryaPredikatResponse> {
  const res = await url.get("/api/karya/predikat/2");
  return res.data;
}

// is_best: 1 = Innovation, 2 = Design, 3 = System
export interface KaryaBestOfItem extends Omit<KaryaPredikatItem, "predikat"> {
  is_best: 1 | 2 | 3 | null;
}

interface KaryaBestOfResponse {
  status: string;
  data: KaryaBestOfItem[];
}

export async function GetKaryaBestOfAktif(
  isBest: 1 | 2 | 3
): Promise<KaryaBestOfResponse> {
  // sesuaikan path ini dengan route backend kamu untuk kolom is_best
  const res = await url.get(`/api/karya/best/${isBest}`);
  return res.data;
}