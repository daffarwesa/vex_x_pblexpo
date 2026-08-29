import { NextRequest, NextResponse } from "next/server";
import url from "@/lib/axios";

/**
 * GET /api-internal/statistik/range
 * Proxy ke Laravel: GET /api/auth/statistik/range
 *
 * Query params (diteruskan ke Laravel):
 *   start_date  = YYYY-MM-DD (wajib)
 *   end_date    = YYYY-MM-DD (wajib)
 *
 * Response auto-group berdasarkan rentang:
 *   ≤ 1 hari  → per jam
 *   ≤ 31 hari → per hari
 *   ≤ 90 hari → per minggu
 *   > 90 hari → per bulan
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = req.headers.get("authorization");

    const response = await url.get("/api/auth/statistik/range", {
      params: {
        start_date: searchParams.get("start_date"),
        end_date: searchParams.get("end_date"),
      },
      headers: token ? { Authorization: token } : {},
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("STATISTIK RANGE ERROR:", error.response?.data ?? error.message);
    return NextResponse.json(
      { status: "error", message: error.response?.data?.message ?? error.message },
      { status: error.response?.status ?? 500 }
    );
  }
}
