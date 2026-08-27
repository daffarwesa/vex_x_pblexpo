<?php

namespace App\Http\Controllers;

use App\Models\KunjunganPameran;
use Illuminate\Http\Request;

class AdminStatistikController extends Controller
{
    // ==========================================
    // STATISTIK KUNJUNGAN PAMERAN (per jam / per hari)
    // ==========================================
    public function kunjungan(Request $request)
    {
        $request->validate([
            'id_pameran' => 'nullable|exists:pameran,id_pameran',
            'group_by' => 'required|in:harian,jam',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_akhir' => 'nullable|date|after_or_equal:tanggal_mulai',
        ]);

        $baseQuery = KunjunganPameran::query();

        if ($request->id_pameran) {
            $baseQuery->where('id_pameran', $request->id_pameran);
        }

        if ($request->tanggal_mulai) {
            $baseQuery->whereDate('waktu_kunjungan', '>=', $request->tanggal_mulai);
        }

        if ($request->tanggal_akhir) {
            $baseQuery->whereDate('waktu_kunjungan', '<=', $request->tanggal_akhir);
        }

        $totalKeseluruhan = (clone $baseQuery)->count();

        $format = $request->group_by === 'jam' ? '%Y-%m-%d %H:00' : '%Y-%m-%d';

        $data = (clone $baseQuery)
            ->selectRaw("DATE_FORMAT(waktu_kunjungan, '{$format}') as periode, COUNT(*) as total_kunjungan")
            ->groupBy('periode')
            ->orderBy('periode')
            ->get();

        return response()->json([
            'status' => 'success',
            'total_keseluruhan' => $totalKeseluruhan,
            'group_by' => $request->group_by,
            'data' => $data,
        ]);
    }
}