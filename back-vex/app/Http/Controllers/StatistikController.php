<?php

namespace App\Http\Controllers;

use App\Models\Kunjungan;
use App\Models\Pameran;
use Illuminate\Http\Request;
use Carbon\Carbon;

/*
|--------------------------------------------------------------------------
| StatistikController
|--------------------------------------------------------------------------
| Menangani pencatatan kunjungan publik dan semua endpoint statistik admin.
| Gabungan dari KunjunganController + AdminStatistikController.
*/

class StatistikController extends Controller
{
    // ==========================================
    // CATAT KUNJUNGAN (public, tanpa auth)
    // ==========================================
    public function store(Request $request)
    {
        $idPameran = $request->id_pameran;
        $slug      = $request->slug ?? $request->identifier;

        // Resolve dari slug jika id_pameran tidak diberikan
        if (!$idPameran && $slug) {
            $pameran   = Pameran::where('slug', $slug)->orWhere('id_pameran', $slug)->first();
            $idPameran = $pameran?->id_pameran;
        } elseif ($idPameran && !is_numeric($idPameran)) {
            $pameran   = Pameran::where('slug', $idPameran)->orWhere('id_pameran', $idPameran)->first();
            $idPameran = $pameran?->id_pameran;
        }

        if (!$idPameran || !Pameran::where('id_pameran', $idPameran)->exists()) {
            return response()->json(['message' => 'Pameran tidak ditemukan'], 422);
        }

        Kunjungan::create(['id_pameran' => $idPameran]);

        return response()->json(['message' => 'Kunjungan dicatat'], 201);
    }

    // ==========================================
    // STATISTIK — AUTO GROUP BY RANGE (Admin)
    // ==========================================
    // Query params:
    //   start_date = YYYY-MM-DD
    //   end_date   = YYYY-MM-DD
    // Otomatis memilih granularitas:
    //   ≤ 1 hari  → per jam
    //   ≤ 31 hari → per hari
    //   ≤ 90 hari → per minggu
    //   > 90 hari → per bulan
    // ==========================================
    public function statistikRange(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $start    = Carbon::parse($request->start_date)->startOfDay();
        $end      = Carbon::parse($request->end_date)->endOfDay();
        $diffDays = $start->diffInDays($end);

        if ($diffDays <= 1) {
            return response()->json($this->groupByHours($start, $end));
        } elseif ($diffDays <= 31) {
            return response()->json($this->groupByDays($start, $end));
        } elseif ($diffDays <= 90) {
            return response()->json($this->groupByWeeks($start, $end));
        } else {
            return response()->json($this->groupByMonths($start, $end));
        }
    }

    // ==========================================
    // STATISTIK — GROUP BY HARIAN / JAM (Admin)
    // ==========================================
    // Query params:
    //   group_by        = harian | jam   (wajib)
    //   id_pameran      = int             (opsional)
    //   tanggal_mulai   = YYYY-MM-DD      (opsional)
    //   tanggal_akhir   = YYYY-MM-DD      (opsional)
    // ==========================================
    public function statistikKunjungan(Request $request)
    {
        $request->validate([
            'id_pameran'    => 'nullable|exists:pameran,id_pameran',
            'group_by'      => 'required|in:harian,jam',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_akhir' => 'nullable|date|after_or_equal:tanggal_mulai',
        ]);

        $query = Kunjungan::query();

        if ($request->id_pameran) {
            $query->where('id_pameran', $request->id_pameran);
        }

        if ($request->tanggal_mulai) {
            $query->whereDate('visited_at', '>=', $request->tanggal_mulai);
        }

        if ($request->tanggal_akhir) {
            $query->whereDate('visited_at', '<=', $request->tanggal_akhir);
        }

        $totalKeseluruhan = (clone $query)->count();

        $format = $request->group_by === 'jam' ? '%Y-%m-%d %H:00' : '%Y-%m-%d';

        $data = (clone $query)
            ->selectRaw("DATE_FORMAT(visited_at, '{$format}') as periode, COUNT(*) as total_kunjungan")
            ->groupBy('periode')
            ->orderBy('periode')
            ->get();

        return response()->json([
            'status'            => 'success',
            'total_keseluruhan' => $totalKeseluruhan,
            'group_by'          => $request->group_by,
            'data'              => $data,
        ]);
    }

    // ==========================================
    // PRIVATE HELPERS — GROUP BY PERIOD
    // ==========================================

    private function groupByHours(Carbon $start, Carbon $end): array
    {
        $rows = Kunjungan::selectRaw('DATE_FORMAT(visited_at, "%Y-%m-%d %H:00") as hour_slot, COUNT(*) as pengunjung')
            ->whereBetween('visited_at', [$start, $end])
            ->groupByRaw('DATE_FORMAT(visited_at, "%Y-%m-%d %H:00")')
            ->pluck('pengunjung', 'hour_slot');

        $data   = [];
        $cursor = $start->copy()->startOfHour();

        while ($cursor->lte($end)) {
            $slotKey = $cursor->format('Y-m-d H:00');
            $data[]  = [
                'label'      => $cursor->format('H:00'),
                'pengunjung' => $rows[$slotKey] ?? 0,
            ];
            $cursor->addHour();
        }

        return $data;
    }

    private function groupByDays(Carbon $start, Carbon $end): array
    {
        $rows = Kunjungan::selectRaw('DATE(visited_at) as visit_date, COUNT(*) as pengunjung')
            ->whereBetween('visited_at', [$start, $end])
            ->groupByRaw('DATE(visited_at)')
            ->pluck('pengunjung', 'visit_date');

        $data   = [];
        $cursor = $start->copy()->startOfDay();

        while ($cursor->lte($end)) {
            $dateKey = $cursor->format('Y-m-d');
            $data[]  = [
                'label'      => $cursor->format('d M'),
                'pengunjung' => $rows[$dateKey] ?? 0,
            ];
            $cursor->addDay();
        }

        return $data;
    }

    private function groupByWeeks(Carbon $start, Carbon $end): array
    {
        $data   = [];
        $cursor = $start->copy()->startOfDay();

        while ($cursor->lte($end)) {
            $wStart = $cursor->copy();
            $wEnd   = $cursor->copy()->addDays(6)->endOfDay();

            if ($wEnd->gt($end)) {
                $wEnd = $end->copy();
            }

            $count  = Kunjungan::whereBetween('visited_at', [$wStart, $wEnd])->count();
            $data[] = [
                'label'      => $wStart->format('d M') . ' – ' . $wEnd->format('d M'),
                'pengunjung' => $count,
            ];

            $cursor->addDays(7);
        }

        return $data;
    }

    private function groupByMonths(Carbon $start, Carbon $end): array
    {
        $rows = Kunjungan::selectRaw('DATE_FORMAT(visited_at, "%Y-%m") as month_slot, COUNT(*) as pengunjung')
            ->whereBetween('visited_at', [$start, $end])
            ->groupByRaw('DATE_FORMAT(visited_at, "%Y-%m")')
            ->pluck('pengunjung', 'month_slot');

        $data     = [];
        $cursor   = $start->copy()->startOfMonth();
        $endMonth = $end->copy()->endOfMonth();

        while ($cursor->lte($endMonth)) {
            $slotKey = $cursor->format('Y-m');
            $data[]  = [
                'label'      => $cursor->format('M Y'),
                'pengunjung' => $rows[$slotKey] ?? 0,
            ];
            $cursor->addMonth();
        }

        return $data;
    }
}
