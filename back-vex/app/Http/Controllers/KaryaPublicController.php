<?php

namespace App\Http\Controllers;

use App\Models\Karya;
use Illuminate\Http\Request;

class KaryaPublicController extends Controller
{
    // ==========================================
    // DETAIL SATU KARYA (publik)
    // ==========================================
    public function show($id_karya)
    {
        $karya = Karya::with(['stan', 'pameran'])
            ->find($id_karya);

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

    // ==========================================
    // LIST KARYA BERDASARKAN PREDIKAT (publik)
    // predikat '1' = Juara 1 (Best Work)
    // predikat '2' = Juara 2 (Favorite Work)
    // ==========================================
    public function getByPredikat(Request $request, string $predikat)
    {
        if (!in_array($predikat, ['1', '2'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Predikat tidak valid',
            ], 422);
        }

        $karya = Karya::with(['kategori', 'pameran'])
            ->where('predikat', $predikat)
            ->when($request->filled('id_pameran'), function ($query) use ($request) {
                $query->where('id_pameran', $request->id_pameran);
            })
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $karya,
        ]);
    }
}