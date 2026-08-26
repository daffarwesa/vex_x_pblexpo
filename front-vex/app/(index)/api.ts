import url from "@/lib/axios";

// REVISI UNTUK KONSEP PENILAIAN TERBARU

export async function GetKaryaTerbaikAktif() {
  const res = await url.get("/api/public/karya/terbaik");
  return res.data;
}

export async function GetKaryaFavoritAktif() {
  const res = await url.get("/api/public/karya/favorit");
  return res.data;
}