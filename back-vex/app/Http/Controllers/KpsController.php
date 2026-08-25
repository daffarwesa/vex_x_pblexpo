<?php

namespace App\Http\Controllers;

use App\Models\Karya;
use App\Models\Stan;
use App\Models\Pameran;
use Illuminate\Http\Request;

class KpsController extends Controller
{
    // =============================
    // LIHAT SEMUA KARYA PER KATEGORI
    // (Visitor hanya lihat karya dari kategorinya)
    // =============================
    public function daftarKarya(Request $request)
    {
        $visitor = $request->user();

        // Ambil karya berdasarkan kategori Visitor
        $karya = Karya::with(['stan.pameran', 'pengguna:id,nama'])
            ->withCount('suka')
            ->whereHas('stan.pameran', function ($query) use ($visitor) {
                $query->where('kategori', $visitor->program_studi);
            })
            ->get();

        return response()->json([
            'status' => 'success',
            'total'  => $karya->count(),
            'karya'  => $karya,
        ]);
    }

    // =============================
    // PILIH KARYA TERBAIK
    // =============================
    public function pilihTerbaik(Request $request, $id_karya)
    {
        $visitor = $request->user();
        $karya = Karya::with('stan.pameran')->find($id_karya);

        if (!$karya) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Karya tidak ditemukan.',
            ], 404);
        }

        // Pastikan karya dari kategori Visitor
        if ($karya->stan->pameran->kategori !== $visitor->program_studi) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Anda tidak berhak memilih karya dari kategori lain.',
            ], 403);
        }

        // Cek apakah sudah ada karya terbaik di kategori ini
        $karya_terbaik = Karya::whereHas('stan.pameran', function ($query) use ($visitor) {
            $query->where('kategori', $visitor->program_studi);
        })
            ->where('is_terbaik', true)
            ->first();

        if ($karya_terbaik) {
            return response()->json([
                'status'       => 'error',
                'message'      => 'Sudah ada karya terbaik untuk kategori ini.',
                'karya_terbaik' => $karya_terbaik,
            ], 422);
        }

        // Set karya terbaik
        $karya->update(['is_terbaik' => true]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Karya berhasil dipilih sebagai karya terbaik.',
            'karya'   => $karya,
        ]);
    }

    // =============================
    // BATALKAN KARYA TERBAIK
    // =============================
    public function batalkanTerbaik(Request $request, $id_karya)
    {
        $visitor = $request->user();
        $karya = Karya::with('stan.pameran')->find($id_karya);

        if (!$karya) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Karya tidak ditemukan.',
            ], 404);
        }

        // Pastikan karya dari kategori Visitor
        if ($karya->stan->pameran->kategori !== $visitor->program_studi) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Anda tidak berhak membatalkan karya dari kategori lain.',
            ], 403);
        }

        // Cek apakah karya ini memang terbaik
        if (!$karya->is_terbaik) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Karya ini bukan karya terbaik.',
            ], 422);
        }

        // Batalkan karya terbaik
        $karya->update(['is_terbaik' => false]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Karya terbaik berhasil dibatalkan.',
            'karya'   => $karya,
        ]);
    }

    // =============================
    // LIHAT KARYA TERBAIK PER KATEGORI
    // (untuk halaman utama)
    // =============================
    public function karyaTerbaik()
    {
        $karya = Karya::with(['stan.pameran.prodi', 'pengguna:id,nama'])
            ->withCount('suka')
            ->where('is_terbaik', true)
            ->get();

        return response()->json([
            'status' => 'success',
            'total'  => $karya->count(),
            'karya'  => $karya,
        ]);
    }
}