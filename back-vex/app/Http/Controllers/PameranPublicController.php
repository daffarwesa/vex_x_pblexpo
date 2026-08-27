<?php

namespace App\Http\Controllers;

use App\Models\Pameran;
use App\Models\KunjunganPameran;

class PameranPublicController extends Controller
{
    // ============================
    // LIST SEMUA PAMERAN (publik)
    // ============================
    public function index()
    {
        $pameran = Pameran::orderBy('tanggal_buka', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $pameran,
        ]);
    }

    // ============================
    // DETAIL PAMERAN VIA SLUG (publik)
    // ============================
    public function show($slug)
    {
        $pameran = Pameran::with('karya')->where('slug', $slug)->first();

        if (!$pameran) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pameran tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $pameran,
        ]);
    }

    // ==========================================
    // CATAT KUNJUNGAN (dipanggil pas klik "Play Exhibition")
    // ==========================================
    public function catatKunjungan($slug)
    {
        $pameran = Pameran::where('slug', $slug)->first();

        if (!$pameran) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pameran tidak ditemukan',
            ], 404);
        }

        KunjunganPameran::create([
            'id_pameran' => $pameran->id_pameran,
            'waktu_kunjungan' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kunjungan dicatat',
        ]);
    }
}