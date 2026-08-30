<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use App\Models\Karya;
use App\Models\Pameran;

class GameAssetController extends Controller
{
    // =============================
    // HELPER: Resolve pameran dari slug ATAU id
    // =============================
    private function resolvePameran(string $identifier): ?Pameran
    {
        return is_numeric($identifier)
            ? Pameran::find($identifier)
            : Pameran::where('slug', $identifier)->first();
    }

    // ==============
    // GET AUDIO PATH
    // ==============
    public function index()
    {
        return response()->json([
            'bgm' => asset('storage/audio/bgm.mp3'),
            'footstep' => asset('storage/audio/footstep.mp3'),
            'jump' => asset('storage/audio/jump.mp3'),
            'player' => url('/api/experience/player-model'),
            'num_base' => url('/api/experience/num'), // ← new: base folder for 1.png .. 144.png
        ]);
    }

    // ====================
    // SERVE BOOTH GLB FILE
    // ====================
    public function serveBoothModel($filename)
    {
        $safeFilename = basename($filename); // proteksi path traversal
        $path = storage_path('app/public/models/' . $safeFilename);

        if (!file_exists($path)) {
            $path = public_path('storage/models/' . $safeFilename);
        }

        if (!file_exists($path)) {
            return response()->json(['error' => 'File tidak ditemukan'], 404);
        }

        return response()->file($path, [
            'Content-Type' => 'model/gltf-binary',
            'Access-Control-Allow-Origin' => config('app.frontend_url'),
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => '*',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    public function serveNumImage($filename)
    {
        $safeFilename = basename($filename); // proteksi path traversal
        $path = storage_path('app/public/num/' . $safeFilename);

        if (!file_exists($path)) {
            $path = public_path('storage/num/' . $safeFilename);
        }

        if (!file_exists($path)) {
            return response()->json(['error' => 'File tidak ditemukan'], 404);
        }

        return response()->file($path, [
            'Content-Type' => 'image/png',
            'Access-Control-Allow-Origin' => config('app.frontend_url'),
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => '*',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    // ====================
    // SERVE PLAYER GLB FILE
    // ====================
    public function servePlayerModel()
    {
        $path = storage_path('app/public/models/player.glb');

        if (!file_exists($path)) {
            $path = public_path('storage/models/player.glb');
        }

        if (!file_exists($path)) {
            return response()->json(['error' => 'File tidak ditemukan'], 404);
        }

        return response()->file($path, [
            'Content-Type' => 'model/gltf-binary',
            'Access-Control-Allow-Origin' => config('app.frontend_url'),
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => '*',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    // ===================
    // SERVE HALL GLB FILE
    // ===================
    public function serveHallModel($identifier)
    {
        $pameran = $this->resolvePameran($identifier);

        if (!$pameran) {
            return response()->json(['error' => 'Pameran tidak ditemukan'], 404);
        }

        // Hall model sekarang selalu diambil dari file statis hall-utama.glb
        // di storage, tidak lagi bergantung pada kolom/relasi di database.
        $path = storage_path('app/public/models/hall-utama.glb');

        if (!file_exists($path)) {
            $path = public_path('storage/models/hall-utama.glb');
        }

        if (!file_exists($path)) {
            return response()->json(['error' => 'File tidak ditemukan'], 404);
        }

        return response()->file($path, [
            'Content-Type' => 'model/gltf-binary',
            'Access-Control-Allow-Origin' => config('app.frontend_url'),
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => '*',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    // ==============
    // AMBIL 3D MODEL
    // ==============
    public function get3DModel($identifier)
    {
        $pameran = $this->resolvePameran($identifier);

        if (!$pameran) {
            return response()->json(['error' => 'Pameran tidak ditemukan'], 404);
        }

        return response()->json([
            // pakai identifier yang sama persis yang dikirim client (slug atau id),
            // supaya endpoint hall-model juga bisa resolve dengan cara yang sama
            'model_hall' => url("/api/experience/hall-model/{$identifier}"),
        ]);
    }

    // ==========================
    // AMBIL KARYA DI TABEL KARYA
    // ==========================
    public function karyaByPameran($identifier)
    {
        $pameran = $this->resolvePameran($identifier);

        if (!$pameran) {
            return response()->json(['error' => 'Pameran tidak ditemukan'], 404);
        }

        $idPameran = $pameran->id_pameran; // selalu pakai id numerik untuk query relasi

        $karyas = DB::table('karya')
            ->leftJoin('stan', 'karya.id_stan', '=', 'stan.id_stan')
            ->leftJoin('admin', 'karya.id_admin', '=', 'admin.id_admin')
            ->where('karya.id_pameran', $idPameran)
            ->select(
                'karya.id_karya',
                'karya.id_admin',
                'karya.id_stan',
                'karya.id_kategori',
                'karya.judul',
                'karya.deskripsi',
                'karya.tautan',
                'karya.gambar_poster',
                'karya.predikat',
                'karya.is_best',
                'admin.nama as nama_admin'
            )
            ->orderBy('karya.id_karya')
            ->get();

        $result = $karyas->map(function ($karya) {
            return [
                'id_karya' => $karya->id_karya,
                'id_kategori' => $karya->id_kategori,
                'id_stan' => 'Stan ' . $karya->id_stan,
                'nama_admin' => $karya->nama_admin ?? 'Anonim',
                'booth_name' => $karya->judul,
                'judul' => $karya->judul,
                'deskripsi' => $karya->deskripsi,
                'tautan' => $karya->tautan,
                'poster' => $this->getPosterUrl($karya->gambar_poster),
                'sampul' => $this->getSampulThumbnail($karya->tautan),
                // Booth model sekarang selalu diambil dari file statis booth.glb
                // di storage, tidak lagi bergantung pada relasi ke tabel model.
                'model_path' => url("/api/experience/booth-model/booth.glb"),
                'predikat' => $karya->predikat,
                'is_terbaik' => (bool) $karya->is_best,
            ];
        });

        return response()->json($result);
    }

    // ========================================
    // AMBIL URL POSTER: GOOGLE DRIVE ATAU FILE LOKAL
    // ========================================
    private function getPosterUrl($value)
    {
        if (!$value) {
            return null;
        }

        // Kalau isinya link Google Drive, ambil thumbnail-nya
        if (str_contains($value, 'drive.google.com')) {
            return $this->getGoogleDriveThumbnail($value);
        }

        // Kalau sudah berupa URL penuh lainnya (http/https), pakai apa adanya
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        // Selain itu anggap file yang diupload lokal ke storage
        return '/storage/' . $value;
    }

    // ========================================
    // AMBIL THUMBNAIL DARI YOUTUBE / GOOGLE DRIVE
    // ========================================
    private function getSampulThumbnail($url)
    {
        if (!$url) {
            return null;
        }

        // Deteksi Google Drive lebih dulu
        if (str_contains($url, 'drive.google.com')) {
            return $this->getGoogleDriveThumbnail($url);
        }

        // Selain itu anggap YouTube
        return $this->getYoutubeThumbnail($url);
    }

    // ========================
    // THUMBNAIL GDRIVE DARI LINK
    // ========================
    private function getGoogleDriveThumbnail($url)
    {
        $fileId = null;

        // Format umum 1: https://drive.google.com/file/d/{id}/view?usp=sharing
        if (preg_match('/\/file\/d\/([^\/]+)/', $url, $matches)) {
            $fileId = $matches[1];
        }

        // Format umum 2: https://drive.google.com/open?id={id}
        // atau: https://drive.google.com/uc?id={id}
        if (!$fileId) {
            parse_str(parse_url($url, PHP_URL_QUERY), $query);
            if (isset($query['id'])) {
                $fileId = $query['id'];
            }
        }

        if (!$fileId) {
            return null;
        }

        // Endpoint thumbnail tidak resmi Google Drive.
        // sz=w1000 mengatur lebar thumbnail (bisa disesuaikan, misal w500, w1000, dst).
        return "https://drive.google.com/thumbnail?id={$fileId}&sz=w1000";
    }

    // ========================
    // THUMBNAIL YT DARI LINK
    // ========================
    private function getYoutubeThumbnail($url)
    {
        if (!$url) {
            return null;
        }

        $videoId = null;
        parse_str(parse_url($url, PHP_URL_QUERY), $query);

        if (isset($query['v'])) {
            $videoId = $query['v'];
        }

        if (!$videoId && preg_match('/youtu\.be\/([^\?&]+)/', $url, $matches)) {
            $videoId = $matches[1];
        }

        if (!$videoId && preg_match('/youtube\.com\/shorts\/([^\?&]+)/', $url, $matches)) {
            $videoId = $matches[1];
        }

        if (!$videoId) {
            return null;
        }

        return "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg";
    }


    public function proxyImage(Request $request)
    {
        $url = $request->query('url');

        if (!$url) {
            abort(400, 'URL tidak valid');
        }

        // Cuma izinkan proxy untuk host Google yang memang dipakai untuk
        // thumbnail/gambar (drive.google.com & lh3.googleusercontent.com),
        // biar nggak disalahgunakan jadi open proxy untuk situs sembarangan.
        // Validasi berdasarkan host asli (bukan cuma prefix string) supaya
        // tidak bisa dikelabui pakai trik semacam
        // "https://drive.google.com.evil.com/...".
        $host = parse_url($url, PHP_URL_HOST);
        $scheme = parse_url($url, PHP_URL_SCHEME);

        $allowedHosts = [
            'drive.google.com',
            'lh3.googleusercontent.com',
        ];

        $isAllowed = $scheme === 'https'
            && $host !== null
            && in_array(strtolower($host), $allowedHosts, true);

        if (!$isAllowed) {
            abort(400, 'URL tidak valid');
        }

        $response = Http::timeout(10)->get($url);

        if (!$response->successful()) {
            abort(502, 'Gagal mengambil gambar');
        }

        $contentType = $response->header('Content-Type');

        if (!$contentType || !str_starts_with($contentType, 'image/')) {
            abort(415, 'File bukan gambar');
        }

        return response($response->body(), 200)
            ->header('Content-Type', $contentType)
            ->header('Access-Control-Allow-Origin', config('app.frontend_url'))
            ->header('Cache-Control', 'public, max-age=86400');
    }
}