import url from "@/lib/axios";

export interface PenilaianItem {
  id_karya: number;
  judul: string;
  deskripsi: string;
  tautan: string;
  gambar_poster: string;
  predikat: "1" | "2" | null;
  is_best: boolean;
  best_rank?: 1 | 2 | 3 | null;
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

export interface KategoriItem {
  id_kategori: number;
  kode_kategori: string;
  nama_kategori: string;
}

// Ambil seluruh karya
export async function GetKaryaList(): Promise<PenilaianItem[]> {
  const res = await url.get("/api/auth/karya");
  return res.data?.data ?? [];
}

// Ambil kategori
export async function GetKategoriList(): Promise<KategoriItem[]> {
  const res = await url.get("/api/kategori");
  return res.data?.data ?? [];
}

// Update predikat karya
export async function SetPredikatKarya(id_karya: number, predikat: "1" | "2" | null) {
  const res = await url.patch(`/api/auth/karya/${id_karya}/predikat`, {
    predikat,
  });
  return res.data;
}

// Update Best karya
export async function SetBestKarya(id_karya: number, is_best: boolean) {
  const res = await url.patch(`/api/auth/karya/${id_karya}/best`, {
    is_best,
  });
  return res.data;
}

// Batch simpan semua hasil penilaian
export async function BatchSavePenilaian(payload: {
  kategoriWinners: Record<number, { juara1?: number | null; juara2?: number | null }>;
  bestWinners: { best1?: number | null; best2?: number | null; best3?: number | null };
  allKaryaIds: number[];
}) {
  const promises: Promise<any>[] = [];

  // Map karya to predikat & best
  const predikatMap: Record<number, "1" | "2" | null> = {};
  const bestSet = new Set<number>();

  Object.values(payload.kategoriWinners).forEach((winner) => {
    if (winner.juara1) predikatMap[winner.juara1] = "1";
    if (winner.juara2) predikatMap[winner.juara2] = "2";
  });

  if (payload.bestWinners.best1) bestSet.add(payload.bestWinners.best1);
  if (payload.bestWinners.best2) bestSet.add(payload.bestWinners.best2);
  if (payload.bestWinners.best3) bestSet.add(payload.bestWinners.best3);

  for (const id of payload.allKaryaIds) {
    const targetPredikat = predikatMap[id] ?? null;
    const targetBest = bestSet.has(id);

    promises.push(SetPredikatKarya(id, targetPredikat));
    promises.push(SetBestKarya(id, targetBest));
  }

  await Promise.all(promises);
  return { status: "success", message: "Penilaian berhasil disimpan" };
}
