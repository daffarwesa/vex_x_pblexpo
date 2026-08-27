import { NextRequest, NextResponse } from "next/server";
import url from "@/lib/axios";

/**
 * GET /api-internal/statistik/kunjungan
 * Proxy ke Laravel: GET /api/auth/statistik/kunjungan
 *
 * Query params (diteruskan ke Laravel):
 *   group_by      = "harian" | "jam"  (wajib)
 *   id_pameran    = number             (opsional)
 *   tanggal_mulai = YYYY-MM-DD         (opsional)
 *   tanggal_akhir = YYYY-MM-DD         (opsional)
 *
 * Response: { status, total_keseluruhan, group_by, data: [{periode, total_kunjungan}] }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = req.headers.get("authorization");

    const params: Record<string, string> = {};
    const groupBy = searchParams.get("group_by");
    if (groupBy) params.group_by = groupBy;

    const idPameran = searchParams.get("id_pameran");
    if (idPameran) params.id_pameran = idPameran;

    const tanggalMulai = searchParams.get("tanggal_mulai");
    if (tanggalMulai) params.tanggal_mulai = tanggalMulai;

    const tanggalAkhir = searchParams.get("tanggal_akhir");
    if (tanggalAkhir) params.tanggal_akhir = tanggalAkhir;

    const response = await url.get("/api/auth/statistik/kunjungan", {
      params,
      headers: token ? { Authorization: token } : {},
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("STATISTIK KUNJUNGAN ERROR:", error.response?.data ?? error.message);
    return NextResponse.json(
      { status: "error", message: error.response?.data?.message ?? error.message },
      { status: error.response?.status ?? 500 }
    );
  }
}
