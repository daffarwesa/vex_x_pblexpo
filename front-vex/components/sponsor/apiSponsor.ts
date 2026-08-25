import url from "@/lib/axios"; 

// =============================
// LIST
// =============================
export async function GetSponsor() {
  const res = await url.get("/sponsor");
  return res.data;
}

// =============================
// CREATE
// =============================
export async function PostSponsor(formData: FormData) {
  const res = await url.post("/sponsor", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// =============================
// UPDATE
// =============================
export async function UpdateSponsor(id: number, formData: FormData) {
  // Laravel butuh _method override untuk multipart PUT
  formData.append("_method", "PUT");
  const res = await url.post(`/sponsor/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// =============================
// DELETE (opsional — bonus, hapus kalau tidak dibutuhkan)
// =============================
export async function DeleteSponsor(id: number) {
  const res = await url.delete(`/sponsor/${id}`);
  return res.data;
}