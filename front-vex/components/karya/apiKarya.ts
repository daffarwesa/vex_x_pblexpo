import url from "@/lib/axios";
import { PredikatKarya, TerbaikRank } from "@/types/karya";

// =============================
// DAFTAR KARYA MILIK CREATOR
// =============================
export async function GetKarya() {
  const res = await url.get("/api/creator/karya");
  return res.data;
}

// =============================
// DAFTAR SEMUA KARYA (ADMIN)
// =============================
export async function GetKaryaAdmin() {
  const res = await url.get("/api/auth/karya");
  return res.data;
}

// =============================
// DETAIL SATU KARYA (ADMIN)
// =============================
export async function GetDetailKaryaAdmin(id: number) {
  const res = await url.get(`/api/auth/karya/${id}`);
  return res.data;
}

// =============================
// AMBIL KATEGORI LIST
// =============================
export async function GetKategoriList() {
  const res = await url.get("/api/kategori");
  return res.data;
}

// =============================
// TAMBAH KARYA ADMIN
// =============================
export async function PostKaryaAdmin(formData: FormData) {
  const res = await url.post("/api/auth/karya", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// =============================
// AMBIL MODEL STAN
// =============================
export async function GetModelStan() {
  const res = await url.get("/api/creator/model-stan");
  return res.data;
}

// =============================
// TAMBAH KARYA
// =============================
export async function PostKarya(formData: FormData) {
  const res = await url.post("/api/creator/karya", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// =============================
// UPDATE KARYA ADMIN
// =============================
export async function UpdateKaryaAdmin(id: number, formData: FormData) {
  const res = await url.post(`/api/auth/karya/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// =============================
// EDIT KARYA
// =============================
export async function UpdateKarya(id: number, formData: FormData) {
  const res = await url.post(`/api/creator/karya/${id}/update`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// =============================
// PAMERAN TERSEDIA
// =============================
export async function GetPameranTersedia() {
  try {
    const res = await url.get("/api/creator/pameran-tersedia");
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const res = await url.get("/api/creator/pameran");
      return res.data;
    }
    throw err;
  }
}

// =============================
// STAN TERSEDIA
// =============================
export async function GetStanTersedia(id_pameran: number) {
  const res = await url.get(`/api/creator/stan/${id_pameran}`);
  return res.data;
}

// =============================
// KARYA SEMUA (listing publik, dipakai juga untuk cek award di halaman detail)
// =============================
export async function GetKaryaSemua() {
  const res = await url.get("/api/creator/karya/semua");
  return res.data;
}

// =============================
// PENILAIAN KARYA TERBAIK (ADMIN ONLY)
// Peringkat: Terbaik 1-3, unik per pameran
// =============================
export async function SetTerbaikRank(id_karya: number, rank: TerbaikRank) {
  const res = await url.patch(`/api/admin/karya/${id_karya}/terbaik-rank`, {
    rank,
  });
  return res.data;
}

export async function BatalkanTerbaikRank(id_karya: number) {
  const res = await url.patch(
    `/api/admin/karya/${id_karya}/terbaik-rank/batal`,
  );
  return res.data;
}

// =============================
// PENILAIAN PREDIKAT KARYA (ADMIN ONLY)
// Best Visualization / Best Creativity & Innovation / Best Functionality, unik per pameran
// =============================
export async function SetPredikatKarya(
  id_karya: number,
  predikat: PredikatKarya,
) {
  const res = await url.patch(`/api/admin/karya/${id_karya}/predikat`, {
    predikat,
  });
  return res.data;
}

export async function BatalkanPredikatKarya(id_karya: number) {
  const res = await url.patch(`/api/admin/karya/${id_karya}/predikat/batal`);
  return res.data;
}

// =============================
// HAPUS KARYA (ADMIN ONLY)
// =============================
export async function DeleteKarya(id: number) {
  const res = await url.delete(`/api/auth/karya/${id}`);
  return res.data;
}
