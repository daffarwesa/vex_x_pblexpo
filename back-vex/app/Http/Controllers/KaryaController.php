<?php

namespace App\Http\Controllers;

use App\Models\Karya;
use App\Models\Pameran;
use App\Models\ModelPameran;
use App\Models\Stan;
use App\Models\Penilaian;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use App\Services\Steganography;

class KaryaController extends Controller
{
    private const STORAGE_BASE_URL = 'https://vex.terpalb25.web.id/storage/';

    // label => rasio scale dari original
    private const IMAGE_SIZES = [
        'original' => 1.0,
        'large'    => 0.75,
        'medium'   => 0.50,
        'small'    => 0.25,
    ];

    // =============================
    // HELPER: Cek status edit karya berdasarkan periode PERSIAPAN pameran
    // =============================
    private function getPameranEditStatus(?Pameran $pameran): array
    {
        if (!$pameran || !$pameran->tanggal_akhir_persiapan) {
            return ['can_edit' => true, 'message' => null];
        }

        $now = Carbon::now();
        $akhirPersiapan = Carbon::parse($pameran->tanggal_akhir_persiapan)->endOfDay();

        if ($now->lessThanOrEqualTo($akhirPersiapan)) {
            return ['can_edit' => true, 'message' => null];
        }

        return [
            'can_edit' => false,
            'message' => 'Karya tidak dapat diedit karena masa persiapan pameran sudah berakhir dan pameran telah dibuka untuk umum.',
        ];
    }

    // =============================
    // HELPER: Generate original + 3 ukuran, watermark LSB tiap versi.
    // Return array: ['original' => path, 'large' => path, 'medium' => path, 'small' => path]
    // =============================
    private function generateWatermarkedVersions(
        $file,
        string $folder,
        int $idKarya,
        int $idUser,
        string $type
    ): array {
        $manager = ImageManager::usingDriver(Driver::class);
        $steganography = new Steganography();

        $filename = uniqid() . '.png';
        $paths = [];

        foreach (self::IMAGE_SIZES as $label => $ratio) {
            $sizeFolder = "{$folder}/{$label}";
            Storage::disk('public')->makeDirectory($sizeFolder);

            $image = $manager->decodeSplFileInfo($file);

            if ($ratio < 1.0) {
                $targetWidth = (int) round($image->width() * $ratio);
                $image->scale(width: $targetWidth);
            }

            $relativePath = "{$sizeFolder}/{$filename}";
            $fullPath = Storage::disk('public')->path($relativePath);

            $image->save($fullPath);
            $steganography->embedWithUsername($fullPath, $fullPath, $idKarya, $idUser, $type);

            $paths[$label] = $relativePath;
        }

        return $paths;
    }

    // =============================
    // HELPER: Hapus semua versi file dari storage berdasarkan 4 kolom karya
    // $paths = ['original' => .., 'large' => .., 'medium' => .., 'small' => ..]
    // =============================
    private function deleteStoredVersions(array $paths): void
    {
        foreach ($paths as $path) {
            if ($path) {
                Storage::disk('public')->delete($path);
            }
        }
    }

    // =============================
    // HELPER: Bangun URL image dari 4 kolom asli (bukan derive/regex)
    // =============================
    private function buildKaryaImageUrls(Karya $item): array
    {
        $base = self::STORAGE_BASE_URL;

        return [
            'image' => $item->gambar_poster ? asset($base . $item->gambar_poster) : '',
            'imageLarge' => $item->gambar_poster_large ? asset($base . $item->gambar_poster_large) : '',
            'imageMedium' => $item->gambar_poster_medium ? asset($base . $item->gambar_poster_medium) : '',
            'imageSmall' => $item->gambar_poster_small ? asset($base . $item->gambar_poster_small) : '',
            'thumbnail' => $item->gambar_sampul ? asset($base . $item->gambar_sampul) : '',
            'thumbnailLarge' => $item->gambar_sampul_large ? asset($base . $item->gambar_sampul_large) : '',
            'thumbnailMedium' => $item->gambar_sampul_medium ? asset($base . $item->gambar_sampul_medium) : '',
            'thumbnailSmall' => $item->gambar_sampul_small ? asset($base . $item->gambar_sampul_small) : '',
        ];
    }

    // =============================
    // HELPER: Format satu item karya jadi array response
    // =============================
    private function formatKaryaResponse(Karya $item): array
    {
        $editStatus = $this->getPameranEditStatus($item->pameran);

        return [
            'id' => $item->id_karya,
            'title' => $item->judul,
            'category' => $item->kategori?->nama_kategori ?? '',
            ...$this->buildKaryaImageUrls($item),
            'link' => $item->tautan,
            'description' => $item->deskripsi,
            'booth' => $item->id_stan ? (string) $item->id_stan : '',
            'modelStan' => $item->stan?->model_stan ? (string) $item->stan->model_stan : '',
            'pameranId' => $item->id_pameran,
            'pameranTitle' => $item->pameran?->judul ?? '',
            'year' => $item->pameran?->tanggal_buka
                ? date('Y', strtotime($item->pameran->tanggal_buka))
                : '',
            'semester' => '',
            'isBest' => (bool) $item->is_best,
            'isJuara' => (bool) $item->is_juara,
            'canEdit' => $editStatus['can_edit'],
            'editMessage' => $editStatus['message'],
        ];
    }

    // =============================
    // HELPER: Format satu item karya untuk section "karya unggulan"
    // =============================
    private function formatKaryaHighlight(Karya $item): array
    {
        $base = self::STORAGE_BASE_URL;

        return [
            'id' => $item->id_karya,
            'title' => $item->judul,
            'banner' => $item->gambar_sampul ? asset($base . $item->gambar_sampul) : '',
            'bannerLarge' => $item->gambar_sampul_large ? asset($base . $item->gambar_sampul_large) : '',
            'poster' => $item->gambar_poster ? asset($base . $item->gambar_poster) : '',
            'posterMedium' => $item->gambar_poster_medium ? asset($base . $item->gambar_poster_medium) : '',
            'isBest' => (bool) $item->is_best,
            'isJuara' => (bool) $item->is_juara,
        ];
    }

    // =============================
    // DAFTAR KARYA MILIK PENCIPTA
    // =============================
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $karya = Karya::where('id_pengguna', $user->id)
            ->with(['stan.model3d', 'pameran', 'kategori'])
            ->get()
            ->map(fn(Karya $item) => $this->formatKaryaResponse($item));

        return response()->json([
            'status' => 'success',
            'karya' => $karya,
        ]);
    }

    // =============================
    // AMBIL MODEL STAN
    // =============================
    public function getModelStan(): JsonResponse
    {
        $models = ModelPameran::where('jenis', 'Stan')->get(['id_model', 'nama_model', '3d_model']);

        return response()->json([
            'status' => 'success',
            'data' => $models,
        ]);
    }

    // =============================
    // TAMBAH KARYA
    // =============================
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'id_pameran' => 'required|exists:pameran,id_pameran',
            'id_kategori' => 'required|exists:kategori,id_kategori',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'tautan' => 'required|url',
            'gambar_poster' => 'required|image|mimes:png,jpg,jpeg|max:5000',
            'gambar_sampul' => 'required|image|mimes:png,jpg,jpeg|max:5000',
        ]);

        $idPameran = $request->id_pameran;

        $existingKarya = Karya::where('id_pengguna', $user->id)
            ->where('id_pameran', $idPameran)
            ->first();

        if ($existingKarya) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda sudah mengunggah karya pada pameran ini.',
                'karya_id' => $existingKarya->id_karya,
            ], 409);
        }

        $modelStan = ModelPameran::where('jenis', 'Stan')->first();

        if (!$modelStan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Model stan belum tersedia di sistem.',
            ], 500);
        }

        $karya = null;

        DB::transaction(function () use ($request, $user, $idPameran, $modelStan, &$karya) {
            $stan = Stan::create([
                'id_pameran' => $idPameran,
                'id_kategori' => $request->id_kategori,
                'model_stan' => $modelStan->id_model,
            ]);

            $karya = Karya::create([
                'id_pengguna' => $user->id,
                'id_kategori' => $request->id_kategori,
                'id_pameran' => $idPameran,
                'id_stan' => $stan->id_stan,
                'judul' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'tautan' => $request->tautan,
                'gambar_poster' => '/',
                'gambar_sampul' => '/',
                'lantai' => 1,
            ]);
        });

        $idKarya = $karya->id_karya;

        $posterFolder = "pameran/{$idPameran}/{$idKarya}/poster";
        $sampulFolder = "pameran/{$idPameran}/{$idKarya}/sampul";

        $posterPaths = $this->generateWatermarkedVersions(
            $request->file('gambar_poster'),
            $posterFolder,
            $idKarya,
            $user->id,
            'poster'
        );

        $sampulPaths = $this->generateWatermarkedVersions(
            $request->file('gambar_sampul'),
            $sampulFolder,
            $idKarya,
            $user->id,
            'sampul'
        );

        // Simpan ke 4 kolom terpisah masing-masing (poster & sampul)
        $karya->update([
            'gambar_poster' => $posterPaths['original'],
            'gambar_poster_large' => $posterPaths['large'],
            'gambar_poster_medium' => $posterPaths['medium'],
            'gambar_poster_small' => $posterPaths['small'],
            'gambar_sampul' => $sampulPaths['original'],
            'gambar_sampul_large' => $sampulPaths['large'],
            'gambar_sampul_medium' => $sampulPaths['medium'],
            'gambar_sampul_small' => $sampulPaths['small'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Karya PBL berhasil ditambahkan.',
            'karya' => $karya->fresh(),
        ], 201);
    }

    // =============================
    // EDIT KARYA PBL
    // =============================
    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $karya = Karya::with('pameran')->find($id);

        if (!$karya) {
            return response()->json([
                'status' => 'error',
                'message' => 'Karya PBL tidak ditemukan.',
            ], 404);
        }

        if ($karya->id_pengguna !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Anda hanya dapat mengedit karya milik Anda sendiri.',
            ], 403);
        }

        $editStatus = $this->getPameranEditStatus($karya->pameran);

        if (!$editStatus['can_edit']) {
            return response()->json([
                'status' => 'error',
                'message' => $editStatus['message'],
            ], 403);
        }

        $request->validate([
            'id_pameran' => 'sometimes|exists:pameran,id_pameran',
            'id_kategori' => 'sometimes|exists:kategori,id_kategori',
            'judul' => 'sometimes|string|max:255',
            'deskripsi' => 'sometimes|string',
            'tautan' => 'sometimes|url',
            'gambar_poster' => 'sometimes|image|mimes:png,jpg,jpeg|max:5000',
            'gambar_sampul' => 'sometimes|image|mimes:png,jpg,jpeg|max:5000',
        ]);

        $idPameran = $request->filled('id_pameran') ? $request->id_pameran : $karya->id_pameran;
        $idKarya = $karya->id_karya;

        if ($request->filled('id_kategori') && $karya->id_stan) {
            $stan = Stan::find($karya->id_stan);
            if ($stan) {
                $stan->id_kategori = $request->id_kategori;
                $stan->save();
            }
            $karya->id_kategori = $request->id_kategori;
        }

        if ($request->hasFile('gambar_poster')) {
            $posterFolder = "pameran/{$idPameran}/{$idKarya}/poster";

            $this->deleteStoredVersions([
                $karya->gambar_poster,
                $karya->gambar_poster_large,
                $karya->gambar_poster_medium,
                $karya->gambar_poster_small,
            ]);

            $posterPaths = $this->generateWatermarkedVersions(
                $request->file('gambar_poster'),
                $posterFolder,
                $idKarya,
                $user->id,
                'poster'
            );

            $karya->gambar_poster = $posterPaths['original'];
            $karya->gambar_poster_large = $posterPaths['large'];
            $karya->gambar_poster_medium = $posterPaths['medium'];
            $karya->gambar_poster_small = $posterPaths['small'];
        }

        if ($request->hasFile('gambar_sampul')) {
            $sampulFolder = "pameran/{$idPameran}/{$idKarya}/sampul";

            $this->deleteStoredVersions([
                $karya->gambar_sampul,
                $karya->gambar_sampul_large,
                $karya->gambar_sampul_medium,
                $karya->gambar_sampul_small,
            ]);

            $sampulPaths = $this->generateWatermarkedVersions(
                $request->file('gambar_sampul'),
                $sampulFolder,
                $idKarya,
                $user->id,
                'sampul'
            );

            $karya->gambar_sampul = $sampulPaths['original'];
            $karya->gambar_sampul_large = $sampulPaths['large'];
            $karya->gambar_sampul_medium = $sampulPaths['medium'];
            $karya->gambar_sampul_small = $sampulPaths['small'];
        }

        if ($request->filled('id_pameran')) {
            $karya->id_pameran = $request->id_pameran;
        }

        if ($request->filled('judul')) {
            $karya->judul = $request->judul;
        }

        if ($request->filled('deskripsi')) {
            $karya->deskripsi = $request->deskripsi;
        }

        if ($request->filled('tautan')) {
            $karya->tautan = $request->tautan;
        }

        $karya->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Karya PBL berhasil diperbarui.',
            'karya' => $karya->fresh(),
        ]);
    }

    // =============================
    // VERIFIKASI WATERMARK
    // =============================
    public function verifyWatermark(Request $request, $id): JsonResponse
    {
        $karya = Karya::find($id);

        if (!$karya || !$karya->gambar_poster) {
            return response()->json([
                'status' => 'error',
                'message' => 'Karya atau gambar tidak ditemukan.',
            ], 404);
        }

        $steganography = new Steganography();
        $fullPath = Storage::disk('public')->path($karya->gambar_poster);
        $extracted = $steganography->extract($fullPath);

        return response()->json([
            'status' => 'success',
            'watermark' => $extracted,
            'valid' => $extracted !== null,
        ]);
    }

    // =============================
    // PAMERAN TERSEDIA UNTUK KARYA
    // =============================
    public function pameranTersedia(Request $request): JsonResponse
    {
        $today = now()->toDateString();

        $pameran = Pameran::where('tanggal_mulai_persiapan', '<=', $today)
            ->where('tanggal_akhir_persiapan', '>=', $today)
            ->get()
            ->map(fn(Pameran $item) => [
                'id' => $item->id_pameran,
                'title' => $item->judul,
            ]);

        return response()->json([
            'status' => 'success',
            'pameran' => $pameran,
        ]);
    }

    // =============================
    // STAN TERSEDIA BERDASARKAN PAMERAN
    // =============================
    public function stanTersedia(Request $request, $id_pameran): JsonResponse
    {
        $stan = Stan::where('id_pameran', $id_pameran)
            ->with('model3d')
            ->orderBy('id_stan')
            ->get()
            ->values()
            ->map(fn(Stan $item, int $index) => [
                'id' => $item->id_stan,
                'nomor' => $index + 1,
                'model_stan' => $item->model3d?->nama_model ?? $item->model_stan,
            ]);

        return response()->json([
            'status' => 'success',
            'stan' => $stan,
        ]);
    }

    // =============================
    // DAFTAR SEMUA KARYA (ADMIN)
    // =============================
    public function indexAdmin(Request $request): JsonResponse
    {
        $karya = Karya::with(['stan.model3d', 'pameran', 'kategori'])
            ->get()
            ->map(fn(Karya $item) => $this->formatKaryaResponse($item));

        return response()->json([
            'status' => 'success',
            'karya' => $karya,
        ]);
    }

    // =============================
    // HAPUS KARYA
    // =============================
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $karya = Karya::find($id);

        if (!$karya) {
            return response()->json([
                'status' => 'error',
                'message' => 'Karya PBL tidak ditemukan.',
            ], 404);
        }

        if ($user->role !== 'Admin' && $karya->id_pengguna !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Anda tidak memiliki izin untuk menghapus karya ini.',
            ], 403);
        }

        $this->deleteStoredVersions([
            $karya->gambar_poster,
            $karya->gambar_poster_large,
            $karya->gambar_poster_medium,
            $karya->gambar_poster_small,
        ]);

        $this->deleteStoredVersions([
            $karya->gambar_sampul,
            $karya->gambar_sampul_large,
            $karya->gambar_sampul_medium,
            $karya->gambar_sampul_small,
        ]);

        $karya->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Karya PBL berhasil dihapus.',
        ]);
    }

    // =============================
    // KARYA TERBAIK (is_best = true)
    // =============================
    public function karyaTerbaikAktif(): JsonResponse
    {
        $today = now()->toDateString();

        $pameranAktifIds = Pameran::where('tanggal_buka', '<=', $today)->pluck('id_pameran');

        if ($pameranAktifIds->isEmpty()) {
            return response()->json([
                'status' => 'success',
                'karya' => [],
            ]);
        }

        $karya = Karya::whereIn('id_pameran', $pameranAktifIds)
            ->where('is_best', true)
            ->get()
            ->map(fn(Karya $item) => $this->formatKaryaHighlight($item));

        return response()->json([
            'status' => 'success',
            'karya' => $karya,
        ]);
    }

    // =============================
    // KARYA FAVORIT (paling banyak disuka)
    // =============================
    public function karyaFavoritAktif(): JsonResponse
    {
        $karya = Karya::withCount('suka')
            ->orderByDesc('suka_count')
            ->take(1)
            ->get()
            ->map(fn(Karya $item) => $this->formatKaryaHighlight($item));

        return response()->json([
            'status' => 'success',
            'karya' => $karya,
        ]);
    }

    // =============================
    // TOGGLE IS_BEST (ADMIN ONLY)
    // =============================
    public function toggleBest(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'Admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Hanya Admin yang dapat menandai karya terbaik.',
            ], 403);
        }

        $karya = Karya::find($id);

        if (!$karya) {
            return response()->json([
                'status' => 'error',
                'message' => 'Karya PBL tidak ditemukan.',
            ], 404);
        }

        $karya->is_best = !$karya->is_best;
        $karya->save();

        Penilaian::create([
            'id_pengguna' => $user->id,
            'id_karya' => $karya->id_karya,
            'waktu_penilaian' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $karya->is_best ? 'Karya ditandai sebagai terbaik.' : 'Tanda karya terbaik dicabut.',
            'is_best' => $karya->is_best,
        ]);
    }

    // =============================
    // TOGGLE IS_JUARA (ADMIN ONLY)
    // =============================
    public function toggleJuara(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'Admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Hanya Admin yang dapat menandai karya juara.',
            ], 403);
        }

        $karya = Karya::find($id);

        if (!$karya) {
            return response()->json([
                'status' => 'error',
                'message' => 'Karya PBL tidak ditemukan.',
            ], 404);
        }

        $karya->is_juara = !$karya->is_juara;
        $karya->save();

        Penilaian::create([
            'id_pengguna' => $user->id,
            'id_karya' => $karya->id_karya,
            'waktu_penilaian' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $karya->is_juara ? 'Karya ditandai sebagai juara.' : 'Tanda karya juara dicabut.',
            'is_juara' => $karya->is_juara,
        ]);
    }
}