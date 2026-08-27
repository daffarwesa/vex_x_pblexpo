<?php

namespace App\Http\Controllers;

use App\Models\Pameran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminPameranController extends Controller
{
    // ============================
    // CREATE PAMERAN
    // ============================
    public function store(Request $request)
    {
        $request->validate([
            'banner' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'tanggal_mulai_persiapan' => 'required|date',
            'tanggal_akhir_persiapan' => 'required|date|after_or_equal:tanggal_mulai_persiapan',
            'tanggal_buka' => 'required|date|after_or_equal:tanggal_akhir_persiapan',
        ]);

        $path = $request->file('banner')->store('pameran', 'public');

        $pameran = Pameran::create([
            'banner' => $path,
            'judul' => $request->judul,
            'slug' => $this->generateUniqueSlug($request->judul),
            'deskripsi' => $request->deskripsi,
            'tanggal_mulai_persiapan' => $request->tanggal_mulai_persiapan,
            'tanggal_akhir_persiapan' => $request->tanggal_akhir_persiapan,
            'tanggal_buka' => $request->tanggal_buka,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pameran berhasil dibuat',
            'data' => $pameran,
        ], 201);
    }

    // ============================
    // UPDATE PAMERAN
    // ============================
    public function update(Request $request, $id_pameran)
    {
        $pameran = Pameran::find($id_pameran);

        if (!$pameran) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pameran tidak ditemukan',
            ], 404);
        }

        $request->validate([
            'banner' => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:2048',
            'judul' => 'sometimes|required|string|max:255',
            'deskripsi' => 'sometimes|required|string',
            'tanggal_mulai_persiapan' => 'sometimes|required|date',
            'tanggal_akhir_persiapan' => 'sometimes|required|date|after_or_equal:tanggal_mulai_persiapan',
            'tanggal_buka' => 'sometimes|required|date|after_or_equal:tanggal_akhir_persiapan',
        ]);

        $data = $request->only([
            'judul',
            'deskripsi',
            'tanggal_mulai_persiapan',
            'tanggal_akhir_persiapan',
            'tanggal_buka',
        ]);

        // Jika judul berubah, regenerate slug baru
        if ($request->filled('judul') && $request->judul !== $pameran->judul) {
            $data['slug'] = $this->generateUniqueSlug($request->judul, $pameran->id_pameran);
        }

        if ($request->hasFile('banner')) {
            if ($pameran->banner) {
                Storage::disk('public')->delete($pameran->banner);
            }
            $data['banner'] = $request->file('banner')->store('pameran', 'public');
        }

        $pameran->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Pameran berhasil diperbarui',
            'data' => $pameran,
        ]);
    }

    // ============================
    // DELETE PAMERAN
    // ============================
    public function destroy($id_pameran)
    {
        $pameran = Pameran::find($id_pameran);

        if (!$pameran) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pameran tidak ditemukan',
            ], 404);
        }

        if ($pameran->banner) {
            Storage::disk('public')->delete($pameran->banner);
        }

        $pameran->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pameran berhasil dihapus',
        ]);
    }

    // ==================================================
    // HELPER: GENERATE SLUG UNIK DARI JUDUL
    // ==================================================
    private function generateUniqueSlug(string $judul, $excludeId = null): string
    {
        $base = Str::slug($judul);
        $slug = $base . '-' . Str::lower(Str::random(5));

        $query = DB::table('pameran')->where('slug', $slug);
        if ($excludeId) {
            $query->where('id_pameran', '!=', $excludeId);
        }

        while ($query->exists()) {
            $slug = $base . '-' . Str::lower(Str::random(5));
            $query = DB::table('pameran')->where('slug', $slug);
            if ($excludeId) {
                $query->where('id_pameran', '!=', $excludeId);
            }
        }

        return $slug;
    }
}