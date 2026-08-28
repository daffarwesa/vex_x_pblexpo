<?php

namespace App\Http\Controllers;

use App\Models\Karya;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/* 
    ADMIN CRUD KARYA, PREDIKAT(1,2), IS_BEST(1,2,3)
*/

class AdminKaryaController extends Controller
{
    // ============================
    // LIST SEMUA KARYA
    // ============================
    public function index(Request $request)
    {
        $karya = Karya::with(['admin', 'stan', 'pameran', 'kategori'])
            ->when($request->filled('id_kategori'), function ($query) use ($request) {
                $query->where('id_kategori', $request->id_kategori);
            })
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $karya,
        ]);
    }

    // ============================
    // LIST KARYA PER PAMERAN
    // ============================
    public function getByPameran(Request $request, $id_pameran)
    {
        $karya = Karya::with(['stan', 'kategori'])
            ->where('id_pameran', $id_pameran)
            ->when($request->filled('id_kategori'), function ($query) use ($request) {
                $query->where('id_kategori', $request->id_kategori);
            })
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
        $adminId = auth('admin')->id() ?? $request->id_admin;

        $validated = $request->validate([
            'id_admin'      => 'nullable|exists:admin,id_admin',
            'id_stan'       => 'nullable|exists:stan,id_stan',
            'id_pameran'    => 'required|exists:pameran,id_pameran',
            'id_kategori'   => 'required|exists:kategori,id_kategori',
            'judul'         => 'required|string|max:255',
            'deskripsi'     => 'required|string',
            'tautan'        => 'required|string|max:255',
            'gambar_poster' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $finalAdminId = $adminId ?? \App\Models\Admin::first()?->id_admin;

        // Jika stan tidak dikirim, otomatis buatkan/ambil stan untuk pameran ini
        $stanId = $validated['id_stan'] ?? null;
        if (!$stanId) {
            $stan = \App\Models\Stan::firstOrCreate([
                'id_pameran' => $validated['id_pameran'],
            ]);
            $stanId = $stan->id_stan;
        }

        $path = $request->file('gambar_poster')->store('karya/poster', 'public');

        $karya = Karya::create([
            'id_admin'      => $finalAdminId,
            'id_stan'       => $stanId,
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
    // SET is_best PADA KARYA (rank 1,2,3 / batal)
    // ==================================
    public function setBest(Request $request, $id_karya)
    {
        $request->validate([
            'is_best' => 'nullable|in:1,2,3',
        ]);

        $karya = Karya::find($id_karya);

        if (!$karya) {
            return response()->json([
                'status' => 'error',
                'message' => 'Karya tidak ditemukan',
            ], 404);
        }

        $karya->update([
            'is_best' => $request->is_best, // null, '1', '2', atau '3'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $request->is_best
                ? "Karya ditandai sebagai Best peringkat {$request->is_best}"
                : "Status Best karya dibatalkan",
            'data' => $karya,
        ]);
    }

    // ==================================================
    // LIST KARYA YANG SUDAH PUNYA PREDIKAT (JUARA 1 / JUARA 2)
    // ==================================================
    public function getPredikat(Request $request, $id_pameran)
    {
        $karya = Karya::with(['stan', 'kategori'])
            ->where('id_pameran', $id_pameran)
            ->whereIn('predikat', ['1', '2'])
            ->when($request->filled('id_kategori'), function ($query) use ($request) {
                $query->where('id_kategori', $request->id_kategori);
            })
            ->orderByRaw("CASE WHEN predikat = '1' THEN 0 WHEN predikat = '2' THEN 1 ELSE 2 END")
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $karya,
        ]);
    }

    // ==================================================
    // LIST KARYA YANG SUDAH DAPAT PREDIKAT / BEST (SEMUA PERINGKAT)
    // ==================================================
    public function getPeringkat(Request $request, $id_pameran)
    {
        $karya = Karya::with(['stan', 'kategori'])
            ->where('id_pameran', $id_pameran)
            ->where(function ($query) {
                $query->whereNotNull('predikat')
                    ->orWhereNotNull('is_best');
            })
            ->when($request->filled('id_kategori'), function ($query) use ($request) {
                $query->where('id_kategori', $request->id_kategori);
            })
            ->orderByRaw("
                CASE WHEN predikat = '1' THEN 0
                     WHEN predikat = '2' THEN 1
                     WHEN is_best = '1' THEN 2
                     WHEN is_best = '2' THEN 3
                     WHEN is_best = '3' THEN 4
                     ELSE 5 END
            ")
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $karya,
        ]);
    }
}