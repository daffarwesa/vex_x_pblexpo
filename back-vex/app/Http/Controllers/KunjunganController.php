<?php

namespace App\Http\Controllers;

use App\Models\Kunjungan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class KunjunganController extends Controller
{
    /**
     * Catat 1 kunjungan (public, tanpa auth).
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_pameran' => 'required|exists:pameran,id_pameran',
        ]);

        Kunjungan::create([
            'id_pameran' => $request->id_pameran,
        ]);

        return response()->json(['message' => 'Kunjungan dicatat'], 201);
    }

    /**
     * Statistik kunjungan berdasarkan Date Range (Admin).
     * Query params:
     *   start_date = YYYY-MM-DD
     *   end_date   = YYYY-MM-DD
     */
    public function statistikRange(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $start = Carbon::parse($request->start_date)->startOfDay();
        $end   = Carbon::parse($request->end_date)->endOfDay();

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

    private function groupByHours(Carbon $start, Carbon $end): array
    {
        $rows = Kunjungan::selectRaw('DATE_FORMAT(visited_at, "%Y-%m-%d %H:00") as hour_slot, COUNT(*) as pengunjung')
            ->whereBetween('visited_at', [$start, $end])
            ->groupByRaw('DATE_FORMAT(visited_at, "%Y-%m-%d %H:00")')
            ->pluck('pengunjung', 'hour_slot');

        $data = [];
        $cursor = $start->copy()->startOfHour();
        while ($cursor->lte($end)) {
            $slotKey = $cursor->format('Y-m-d H:00');
            $data[] = [
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

        $data = [];
        $cursor = $start->copy()->startOfDay();
        while ($cursor->lte($end)) {
            $dateKey = $cursor->format('Y-m-d');
            $data[] = [
                'label'      => $cursor->format('d M'),
                'pengunjung' => $rows[$dateKey] ?? 0,
            ];
            $cursor->addDay();
        }

        return $data;
    }

    private function groupByWeeks(Carbon $start, Carbon $end): array
    {
        $data = [];
        $cursor = $start->copy()->startOfDay();
        $weekIndex = 1;

        while ($cursor->lte($end)) {
            $wStart = $cursor->copy();
            $wEnd = $cursor->copy()->addDays(6)->endOfDay();
            if ($wEnd->gt($end)) {
                $wEnd = $end->copy();
            }

            $count = Kunjungan::whereBetween('visited_at', [$wStart, $wEnd])->count();

            $data[] = [
                'label'      => $wStart->format('d M') . ' - ' . $wEnd->format('d M'),
                'pengunjung' => $count,
            ];

            $cursor->addDays(7);
            $weekIndex++;
        }

        return $data;
    }

    private function groupByMonths(Carbon $start, Carbon $end): array
    {
        $rows = Kunjungan::selectRaw('DATE_FORMAT(visited_at, "%Y-%m") as month_slot, COUNT(*) as pengunjung')
            ->whereBetween('visited_at', [$start, $end])
            ->groupByRaw('DATE_FORMAT(visited_at, "%Y-%m")')
            ->pluck('pengunjung', 'month_slot');

        $data = [];
        $cursor = $start->copy()->startOfMonth();
        $endMonth = $end->copy()->endOfMonth();

        while ($cursor->lte($endMonth)) {
            $slotKey = $cursor->format('Y-m');
            $data[] = [
                'label'      => $cursor->format('M Y'),
                'pengunjung' => $rows[$slotKey] ?? 0,
            ];
            $cursor->addMonth();
        }

        return $data;
    }
}
