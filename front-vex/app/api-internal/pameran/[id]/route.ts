import { NextResponse } from "next/server";
import url from "@/lib/axios";

/* ===================== */
/* GET /api/pameran/[id] */
/* ===================== */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const response = await url.get(`/api/pameran/${id}`);
    return NextResponse.json({ status: "success", pameran: response.data.pameran });
  } catch (error: any) {

    const status = error.response?.status ?? 500;
    const message = error.response?.data?.message ?? error.message;

    return NextResponse.json({ status: "error", message }, { status });
  }
}
