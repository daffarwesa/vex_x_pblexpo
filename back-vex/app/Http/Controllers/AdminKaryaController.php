<?php

namespace App\Http\Controllers;

use App\Models\Karya;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/* 
    ADMIN CRUD KARYA, PREDIKAT(1,2), IS_BEST
 */

class AdminKaryaController extends Controller
{
    // ============================
    // LIST SEMUA KARYA
    // ============================
    public function index()
    {
        $karya = Karya::with(['admin', 'stan', 'pameran', 'kategori'])->get();

        return response()->json([
            'status' => 'success',
            'data' => $karya,
        ]);
    }

    // ============================
    // LIST KARYA PER PAMERAN
    // ============================
    public function getByPameran($id_pameran)
    {
        $karya = Karya::with(['stan', 'kategori'])
            ->where('id_pameran', $id_pameran)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $karya,
        ]);
    }

    // ============================
    // DETAIL KARYA
    // ============================
    public function show($id_karya)
    {
        $karya = Karya::with(['admin', 'stan', 'pameran', 'kategori'])->find($id_karya);

        if (!$karya) {
            return response()->json([
                'status' => 'error',
                'message' => 'Karya tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $karya,
        ]);
    }

    // ============================
    // TAMBAH KARYA
    // ============================
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_admin'      => 'required|exists:admin,id_admin',
            'id_stan'       => 'required|exists:stan,id_stan',
            'id_pameran'    => 'required|exists:pameran,id_pameran',
            'id_kategori'   => 'required|exists:kategori,id_kategori',
            'judul'         => 'required|string|max:255',
            'deskripsi'     => 'required|string',
            'tautan'        => 'required|string|max:255',
            'gambar_poster' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $path = $request->file('gambar_poster')->store('karya/poster', 'public');

        $karya = Karya::create([
            'id_admin'      => $validated['id_admin'],
            'id_stan'       => $validated['id_stan'],
            'id_pameran'    => $validated['id_pameran'],
            'id_kategori'   => $validated['id_kategori'],
            'judul'         => $validated['judul'],
            'deskripsi'     => $validated['deskripsi'],
            'tautan'        => $validated['tautan'],
            'gambar_poster' => $path,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Karya berhasil ditambahkan',
            'data' => $karya,
        ], 201);
    }

    // ============================
    // UPDATE KARYA
    // ============================
    public function update(Request $request, $id_karya)
    {
        $karya = Karya::find($id_karya);

        if (!$karya) {
            return response()->json([
                'status' => 'error',
                'message' => 'Karya tidak ditemukan',
            ], 404);
        }

        $validated = $request->validate([
            'id_stan'       => 'sometimes|exists:stan,id_stan',
            'id_pameran'    => 'sometimes|exists:pameran,id_pameran',
            'id_kategori'   => 'sometimes|exists:kategori,id_kategori',
            'judul'         => 'sometimes|string|max:255',
            'deskripsi'     => 'sometimes|string',
            'tautan'        => 'sometimes|string|max:255',
            'gambar_poster' => 'sometimes|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('gambar_poster')) {
            if ($karya->gambar_poster) {
                Storage::disk('public')->delete($karya->gambar_poster);
            }
            $validated['gambar_poster'] = $request->file('gambar_poster')->store('karya/poster', 'public');
        }

        $karya->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Karya berhasil diperbarui',
            'data' => $karya,
        ]);
    }

    // ============================
    // HAPUS KARYA
    // ============================
    public function destroy($id_karya)
    {
        $karya = Karya::find($id_karya);

        if (!$karya) {
            return response()->json([
                'status' => 'error',
                'message' => 'Karya tidak ditemukan',
            ], 404);
        }

        if ($karya->gambar_poster) {
            Storage::disk('public')->delete($karya->gambar_poster);
        }

        $karya->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Karya berhasil dihapus',
        ]);
    }

    // ==========================================
    // SET PREDIKAT (JUARA 1 / JUARA 2 / BATAL)
    // ==========================================
    public function setPredikat(Request $request, $id_karya)
    {
        $request->validate([
            'predikat' => 'nullable|in:1,2',
        ]);

        $karya = Karya::find($id_karya);

        if (!$karya) {
            return response()->json([
                'status' => 'error',
                'message' => 'Karya tidak ditemukan',
            ], 404);
        }

        $karya->update([
            'predikat' => $request->predikat,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $request->predikat
                ? "Karya ditandai sebagai Juara {$request->predikat}"
                : "Predikat juara karya dibatalkan",
            'data' => $karya,
        ]);
    }

    // ==================================
    // SET is_best PADA KARYA (toggle)
    // ==================================
    public function setBest(Request $request, $id_karya)
    {
        return $this->toggleStatus($request, $id_karya, 'is_best', 'best');
    }

    // ==================================================
    // LIST KARYA YANG SUDAH JUARA/BEST (untuk halaman utama)
    // ==================================================
    public function getJuaraDanBest($id_pameran)
    {
        $karya = Karya::with(['stan', 'kategori'])
            ->where('id_pameran', $id_pameran)
            ->where(function ($query) {
                $query->whereNotNull('predikat')
                      ->orWhere('is_best', true);
            })
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $karya,
        ]);
    }

    // ==================================================
    // HELPER: TOGGLE STATUS BOOLEAN PADA KARYA
    // ==================================================
    private function toggleStatus(Request $request, $id_karya, string $field, string $label)
    {
        $request->validate([
            $field => 'required|boolean',
        ]);

        $karya = Karya::find($id_karya);

        if (!$karya) {
            return response()->json([
                'status' => 'error',
                'message' => 'Karya tidak ditemukan',
            ], 404);
        }

        $karya->update([
            $field => $request->$field,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $request->$field
                ? "Karya ditandai sebagai {$label}"
                : "Status {$label} karya dibatalkan",
            'data' => $karya,
        ]);
    }
}