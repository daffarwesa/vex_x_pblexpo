// app/api/karya/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { KaryaItem } from "@/types/karya";

const jsonPath = path.join(process.cwd(), "public/data/Karya.json");
const uploadDir = path.join(process.cwd(), "public/uploads");

const ALLOWED_IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function validateImageFile(file: File | null): { valid: boolean; error?: string; ext?: string } {
  if (!file || file.size === 0) {
    return { valid: true };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "Ukuran file melebihi batas 5MB" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: "Tipe MIME file tidak diizinkan. Hanya JPG, PNG, dan WebP." };
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_IMAGE_EXTS.includes(rawExt)) {
    return { valid: false, error: "Ekstensi file tidak diizinkan." };
  }

  return { valid: true, ext: rawExt };
}

/* ===================== */
/* GET                   */
/* ===================== */
export async function GET() {
  try {
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json([]);
    }
    const file = fs.readFileSync(jsonPath, "utf-8");
    return NextResponse.json(JSON.parse(file));
  } catch (err) {
    return NextResponse.json({ success: false, message: "Gagal membaca data" }, { status: 500 });
  }
}

/* ===================== */
/* POST                  */
/* ===================== */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = (formData.get("title") as string)?.slice(0, 255) || "";
    const category = (formData.get("category") as string)?.slice(0, 100) || "";
    const year = (formData.get("year") as string)?.slice(0, 10) || "";
    const semester = (formData.get("semester") as string)?.slice(0, 20) || "";
    const description = (formData.get("description") as string) || "";
    const booth = (formData.get("booth") as string)?.slice(0, 50) || "";
    const link = (formData.get("link") as string)?.slice(0, 500) || "";
    const pameranId = Number(formData.get("pameranId")) || 0;
    const fileThumbnail = formData.get("thumbnail") as File | null;
    const filePoster = formData.get("image") as File | null;

    // Validasi file thumbnail
    const thumbVal = validateImageFile(fileThumbnail);
    if (!thumbVal.valid) {
      return NextResponse.json({ success: false, message: thumbVal.error }, { status: 400 });
    }

    // Validasi file poster
    const posterVal = validateImageFile(filePoster);
    if (!posterVal.valid) {
      return NextResponse.json({ success: false, message: posterVal.error }, { status: 400 });
    }

    let data: KaryaItem[] = [];
    if (fs.existsSync(jsonPath)) {
      const file = fs.readFileSync(jsonPath, "utf-8");
      data = JSON.parse(file);
    }
    const newId = data.length > 0 ? Number(data[data.length - 1].id) + 1 : 1;

    // Buat folder per karya dengan id integer aman
    const safeId = Math.abs(Math.floor(newId));
    const karyaFolder = path.join(uploadDir, String(safeId));
    if (!fs.existsSync(karyaFolder)) {
      fs.mkdirSync(karyaFolder, { recursive: true });
    }

    // Upload thumbnail
    let thumbnail = "";
    if (fileThumbnail && fileThumbnail.size > 0 && thumbVal.ext) {
      const bytes = await fileThumbnail.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `thumbnail.${thumbVal.ext}`;
      fs.writeFileSync(path.join(karyaFolder, fileName), buffer);
      thumbnail = `/uploads/${safeId}/${fileName}`;
    }

    // Upload poster
    let image = "";
    if (filePoster && filePoster.size > 0 && posterVal.ext) {
      const bytes = await filePoster.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `poster.${posterVal.ext}`;
      fs.writeFileSync(path.join(karyaFolder, fileName), buffer);
      image = `/uploads/${safeId}/${fileName}`;
    }

    const newItem: KaryaItem = {
      id: safeId,
      title,
      category,
      year,
      semester,
      description,
      booth,
      link,
      pameranId,
      thumbnail,
      image,
    };

    data.push(newItem);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    console.error("POST /api-internal/karya error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data" },
      { status: 500 },
    );
  }
}

/* ===================== */
/* PUT                   */
/* ===================== */
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const rawId = Number(formData.get("id"));

    if (!rawId || isNaN(rawId) || rawId <= 0) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const id = Math.floor(rawId);
    const title = (formData.get("title") as string)?.slice(0, 255) || "";
    const category = (formData.get("category") as string)?.slice(0, 100) || "";
    const year = (formData.get("year") as string)?.slice(0, 10) || "";
    const semester = (formData.get("semester") as string)?.slice(0, 20) || "";
    const description = (formData.get("description") as string) || "";
    const booth = (formData.get("booth") as string)?.slice(0, 50) || "";
    const link = (formData.get("link") as string)?.slice(0, 500) || "";
    const pameranId = Number(formData.get("pameranId")) || 0;
    const fileThumbnail = formData.get("thumbnail") as File | null;
    const filePoster = formData.get("image") as File | null;

    const thumbVal = validateImageFile(fileThumbnail);
    if (!thumbVal.valid) {
      return NextResponse.json({ success: false, message: thumbVal.error }, { status: 400 });
    }

    const posterVal = validateImageFile(filePoster);
    if (!posterVal.valid) {
      return NextResponse.json({ success: false, message: posterVal.error }, { status: 400 });
    }

    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    }

    const file = fs.readFileSync(jsonPath, "utf-8");
    const data: KaryaItem[] = JSON.parse(file);
    const index = data.findIndex((item) => item.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Data tidak ditemukan" },
        { status: 404 },
      );
    }

    const karyaFolder = path.join(uploadDir, String(id));
    if (!fs.existsSync(karyaFolder)) {
      fs.mkdirSync(karyaFolder, { recursive: true });
    }

    // Update thumbnail jika ada file baru
    let thumbnail = data[index].thumbnail;
    if (fileThumbnail && fileThumbnail.size > 0 && thumbVal.ext) {
      const bytes = await fileThumbnail.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `thumbnail.${thumbVal.ext}`;
      fs.writeFileSync(path.join(karyaFolder, fileName), buffer);
      thumbnail = `/uploads/${id}/${fileName}`;
    }

    // Update poster jika ada file baru
    let image = data[index].image;
    if (filePoster && filePoster.size > 0 && posterVal.ext) {
      const bytes = await filePoster.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `poster.${posterVal.ext}`;
      fs.writeFileSync(path.join(karyaFolder, fileName), buffer);
      image = `/uploads/${id}/${fileName}`;
    }

    data[index] = {
      ...data[index],
      title,
      category,
      year,
      semester,
      description,
      booth,
      link,
      pameranId,
      thumbnail,
      image,
    };

    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, data: data[index] });
  } catch (error) {
    console.error("PUT /api-internal/karya error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate data" },
      { status: 500 },
    );
  }
}

/* ===================== */
/* DELETE                */
/* ===================== */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const numId = Number(id);

    if (!numId || isNaN(numId) || numId <= 0) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const safeId = Math.floor(numId);
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    }

    const file = fs.readFileSync(jsonPath, "utf-8");
    const data: KaryaItem[] = JSON.parse(file);
    const index = data.findIndex((item) => item.id === safeId);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Data tidak ditemukan" },
        { status: 404 },
      );
    }

    // Hapus folder upload karya secara aman
    const karyaFolder = path.join(uploadDir, String(safeId));
    if (fs.existsSync(karyaFolder)) {
      fs.rmSync(karyaFolder, { recursive: true, force: true });
    }

    data.splice(index, 1);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api-internal/karya error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus data" },
      { status: 500 },
    );
  }
}
