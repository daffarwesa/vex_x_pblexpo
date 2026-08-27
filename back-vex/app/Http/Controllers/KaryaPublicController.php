<?php

namespace App\Http\Controllers;

use App\Models\Karya;

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
}
