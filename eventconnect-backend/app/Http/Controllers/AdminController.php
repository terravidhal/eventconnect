<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Participation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    private function ensureAdmin(): ?JsonResponse
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }
        return null;
    }

    public function users(): JsonResponse
    {
        if ($resp = $this->ensureAdmin()) return $resp;

        $users = User::query()->select('id','name','email','role','created_at')->orderByDesc('created_at')->get();
        return response()->json(['users' => $users]);
    }

    public function stats(): JsonResponse
    {
        if ($resp = $this->ensureAdmin()) return $resp;

        $users = User::count();
        $events = Event::count();
        $participations = Participation::count();

        $confirmed = Participation::where('status','inscrit')->count();
        $capacity = Event::sum('capacity') ?: 0;
        $fillRate = $capacity > 0 ? round(($confirmed / $capacity) * 100) : 0;

        return response()->json([
            'users' => $users,
            'events' => $events,
            'participations' => $participations,
            'fill_rate' => $fillRate,
        ]);
    }

    public function statsTimeseries(): JsonResponse
    {
        if ($resp = $this->ensureAdmin()) return $resp;

        $start = Carbon::now()->startOfMonth()->subMonths(11);
        $end = Carbon::now()->endOfMonth();

        $usersPerMonth = User::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m-01') as month"),
                DB::raw('COUNT(*) as count')
            )
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month');

        $eventsPerMonth = Event::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m-01') as month"),
                DB::raw('COUNT(*) as count')
            )
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month');

        $cursor = $start->copy();
        $series = [];
        while ($cursor <= $end) {
            $key = $cursor->format('Y-m-01');
            $series[] = [
                'date' => $cursor->format('Y-m-d'),
                'users' => (int)($usersPerMonth[$key] ?? 0),
                'events' => (int)($eventsPerMonth[$key] ?? 0),
            ];
            $cursor->addMonth();
        }

        return response()->json(['series' => $series]);
    }
} 