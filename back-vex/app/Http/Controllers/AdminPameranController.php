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
        // Normalisasi input jika dikirim dengan format alternatif
        if (!$request->has('judul') && $request->has('title')) {
            $request->merge(['judul' => $request->input('title')]);
        }
        if (!$request->has('deskripsi') && $request->has('description')) {
            $request->merge(['deskripsi' => $request->input('description')]);
        }
        if (!$request->has('tanggal_mulai_persiapan') && $request->has('prepare_start')) {
            $request->merge(['tanggal_mulai_persiapan' => $request->input('prepare_start')]);
        } elseif (!$request->has('tanggal_mulai_persiapan') && $request->has('prepareStart')) {
            $request->merge(['tanggal_mulai_persiapan' => $request->input('prepareStart')]);
        }
        if (!$request->has('tanggal_akhir_persiapan') && $request->has('prepare_end')) {
            $request->merge(['tanggal_akhir_persiapan' => $request->input('prepare_end')]);
        } elseif (!$request->has('tanggal_akhir_persiapan') && $request->has('prepareEnd')) {
            $request->merge(['tanggal_akhir_persiapan' => $request->input('prepareEnd')]);
        }
        if (!$request->has('tanggal_buka') && $request->has('open_date')) {
            $request->merge(['tanggal_buka' => $request->input('open_date')]);
        } elseif (!$request->has('tanggal_buka') && $request->has('publishDate')) {
            $request->merge(['tanggal_buka' => $request->input('publishDate')]);
        }

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
            'pameran' => $pameran,
        ], 201);
    }

    // ============================
    // UPDATE PAMERAN
    // ============================
    public function update(Request $request, $id_pameran)
    {
        $pameran = is_numeric($id_pameran)
            ? Pameran::find($id_pameran)
            : Pameran::where('slug', $id_pameran)->first();

        if (!$pameran) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pameran tidak ditemukan',
            ], 404);
        }

        // Normalisasi input
        if (!$request->has('judul') && $request->has('title')) {
            $request->merge(['judul' => $request->input('title')]);
        }
        if (!$request->has('deskripsi') && $request->has('description')) {
            $request->merge(['deskripsi' => $request->input('description')]);
        }
        if (!$request->has('tanggal_mulai_persiapan') && $request->has('prepare_start')) {
            $request->merge(['tanggal_mulai_persiapan' => $request->input('prepare_start')]);
        } elseif (!$request->has('tanggal_mulai_persiapan') && $request->has('prepareStart')) {
            $request->merge(['tanggal_mulai_persiapan' => $request->input('prepareStart')]);
        }
        if (!$request->has('tanggal_akhir_persiapan') && $request->has('prepare_end')) {
            $request->merge(['tanggal_akhir_persiapan' => $request->input('prepare_end')]);
        } elseif (!$request->has('tanggal_akhir_persiapan') && $request->has('prepareEnd')) {
            $request->merge(['tanggal_akhir_persiapan' => $request->input('prepareEnd')]);
        }
        if (!$request->has('tanggal_buka') && $request->has('open_date')) {
            $request->merge(['tanggal_buka' => $request->input('open_date')]);
        } elseif (!$request->has('tanggal_buka') && $request->has('publishDate')) {
            $request->merge(['tanggal_buka' => $request->input('publishDate')]);
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
            'pameran' => $pameran,
        ]);
    }

    // ============================
    // DELETE PAMERAN
    // ============================
    public function destroy($id_pameran)
    {
        $pameran = is_numeric($id_pameran)
            ? Pameran::find($id_pameran)
            : Pameran::where('slug', $id_pameran)->first();

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