<?php

namespace App\Http\Controllers;

use App\Models\Pameran;
use App\Models\Kunjungan;

class PameranPublicController extends Controller
{
    // ============================
    // LIST SEMUA PAMERAN (publik)
    // ============================
    public function index()
    {
        $pameran = Pameran::withCount('karya')
            ->orderBy('tanggal_buka', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $pameran,
            'pameran' => $pameran,
        ]);
    }

    // ============================
    // DETAIL PAMERAN VIA SLUG / ID (publik)
    // ============================
    public function show($slug)
    {
        $pameran = is_numeric($slug)
            ? Pameran::with(['karya', 'karya.stan', 'karya.kategori'])->withCount('karya')->find($slug)
            : Pameran::with(['karya', 'karya.stan', 'karya.kategori'])->withCount('karya')->where('slug', $slug)->first();

        if (!$pameran) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pameran tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $pameran,
            'pameran' => $pameran,
        ]);
    }

    // ==========================================
    // CATAT KUNJUNGAN (dipanggil pas klik "Play Exhibition")
    // ==========================================
    public function catatKunjungan($slug)
    {
        $pameran = is_numeric($slug)
            ? Pameran::find($slug)
            : Pameran::where('slug', $slug)->first();

        if (!$pameran) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pameran tidak ditemukan',
            ], 404);
        }

        Kunjungan::create([
            'id_pameran' => $pameran->id_pameran,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kunjungan dicatat',
        ]);
    }
}