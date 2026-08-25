import url from "@/lib/axios";

// =============================
// DAFTAR KARYA MILIK VISITOR
// =============================
export async function GetKarya() {
  const res = await url.get("/api/visitor/karya");
  return res.data;
}

// =============================
// DAFTAR SEMUA KARYA (ADMIN)
// =============================
export async function GetKaryaAdmin() {
  const res = await url.get("/api/admin/karya");
  return res.data;
}

// =============================
// AMBIL MODEL STAN
// =============================
export async function GetModelStan() {
  const res = await url.get("/api/visitor/model-stan");
  return res.data;
}

// =============================
// TAMBAH KARYA
// =============================
export async function PostKarya(formData: FormData) {
  const res = await url.post("/api/visitor/karya", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// =============================
// EDIT KARYA
// =============================
export async function UpdateKarya(id: number, formData: FormData) {
  const res = await url.post(`/api/visitor/karya/${id}/update`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// =============================
// PAMERAN TERSEDIA
// =============================
export async function GetPameranTersedia() {
  try {
    const res = await url.get("/api/visitor/pameran-tersedia");
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const res = await url.get("/api/visitor/pameran");
      return res.data;
    }
    throw err;
  }
}

// =============================
// STAN TERSEDIA
// =============================
export async function GetStanTersedia(id_pameran: number) {
  const res = await url.get(`/api/visitor/stan/${id_pameran}`);
  return res.data;
}

// =============================
// KARYA SEMUA (untuk Visitor — pilih karya terbaik)
// =============================
export async function GetKaryaSemua() {
  const res = await url.get("/api/visitor/karya/semua");
  return res.data;
}

export async function PilihTerbaik(id_karya: number) {
  const res = await url.patch(`/api/visitor/karya/${id_karya}/terbaik`);
  return res.data;
}

export async function BatalkanTerbaik(id_karya: number) {
  const res = await url.patch(`/api/visitor/karya/${id_karya}/batalkan`);
  return res.data;
}

// =============================
// HAPUS KARYA (ADMIN ONLY)
// =============================
export async function DeleteKarya(id: number) {
  const res = await url.delete(`/api/admin/karya/${id}`);
  return res.data;
}
