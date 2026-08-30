<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

/**
 * Download semua poster (Google Drive) dan sampul (YouTube / Google Drive)
 * milik karya, resize+kompres, lalu simpan ke storage lokal. Setelah ini,
 * GameAssetController akan menyajikan gambar dari storage sendiri alih-alih
 * proxy live ke Google tiap kali hall dibuka — inilah yang bikin 161 booth
 * freeze saat load bareng-bareng.
 *
 * Jalankan sekali (atau tiap kali ada karya baru/berubah):
 *   php artisan karya:sync-assets
 *   php artisan karya:sync-assets --force   (paksa download ulang semua)
 */
class SyncKaryaAssets extends Command
{
    protected $signature = 'karya:sync-assets {--force : Download ulang meskipun sudah ada file lokal}';

    protected $description = 'Download poster & sampul karya dari Google Drive/YouTube, resize, simpan lokal';

    private const POSTER_MAX_WIDTH = 1000;
    private const SAMPUL_MAX_WIDTH = 640;
    private const JPEG_QUALITY = 75;

    public function handle(): int
    {
        $force = (bool) $this->option('force');
        $karyas = DB::table('karya')->get();

        $this->info("Memproses {$karyas->count()} karya...");
        $bar = $this->output->createProgressBar($karyas->count());
        $bar->start();

        foreach ($karyas as $karya) {
            $this->processPoster($karya, $force);
            $this->processSampul($karya, $force);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Selesai. Poster tersimpan di storage/app/public/posters/, sampul di storage/app/public/sampul/.');

        return self::SUCCESS;
    }

    private function processPoster(object $karya, bool $force): void
    {
        if (!$karya->gambar_poster) {
            return;
        }
        if (!empty($karya->poster_local) && !$force) {
            return;
        }

        $remoteUrl = str_contains($karya->gambar_poster, 'drive.google.com')
            ? $this->resolveDriveThumbnail($karya->gambar_poster)
            : $karya->gambar_poster; // sudah URL langsung / bukan Drive

        if (!$remoteUrl) {
            return;
        }

        $bytes = $this->download($remoteUrl);
        if (!$bytes) {
            $this->warn("  Gagal download poster karya #{$karya->id_karya}");
            return;
        }

        $relativePath = "posters/{$karya->id_karya}.jpg";
        $this->saveResized($bytes, $relativePath, self::POSTER_MAX_WIDTH);

        DB::table('karya')
            ->where('id_karya', $karya->id_karya)
            ->update(['poster_local' => "/storage/{$relativePath}"]);
    }

    private function processSampul(object $karya, bool $force): void
    {
        if (!$karya->tautan) {
            return;
        }
        if (!empty($karya->sampul_local) && !$force) {
            return;
        }

        $remoteUrl = str_contains($karya->tautan, 'drive.google.com')
            ? $this->resolveDriveThumbnail($karya->tautan)
            : $this->resolveYoutubeThumbnail($karya->tautan);

        if (!$remoteUrl) {
            return;
        }

        $bytes = $this->download($remoteUrl);
        if (!$bytes) {
            $this->warn("  Gagal download sampul karya #{$karya->id_karya}");
            return;
        }

        $relativePath = "sampul/{$karya->id_karya}.jpg";
        $this->saveResized($bytes, $relativePath, self::SAMPUL_MAX_WIDTH);

        DB::table('karya')
            ->where('id_karya', $karya->id_karya)
            ->update(['sampul_local' => "/storage/{$relativePath}"]);
    }

    private function download(string $url): ?string
    {
        try {
            $response = Http::timeout(15)->get($url);
            if (!$response->successful()) {
                return null;
            }
            $contentType = $response->header('Content-Type');
            if (!$contentType || !str_starts_with($contentType, 'image/')) {
                return null;
            }
            return $response->body();
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Resize (jika lebih lebar dari $maxWidth) dan simpan sebagai JPEG
     * terkompresi memakai GD (sudah bawaan PHP, tidak perlu composer
     * package tambahan). Kalau GD gagal decode formatnya, simpan mentah
     * sebagai fallback supaya tidak kehilangan gambar sama sekali.
     */
    private function saveResized(string $bytes, string $relativePath, int $maxWidth): void
    {
        $source = @imagecreatefromstring($bytes);
        if (!$source) {
            Storage::disk('public')->put($relativePath, $bytes);
            return;
        }

        $width = imagesx($source);
        $height = imagesy($source);

        if ($width > $maxWidth) {
            $newWidth = $maxWidth;
            $newHeight = (int) round($height * ($maxWidth / $width));
            $resized = imagecreatetruecolor($newWidth, $newHeight);
            imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($source);
            $source = $resized;
        }

        ob_start();
        imagejpeg($source, null, self::JPEG_QUALITY);
        $jpegBytes = ob_get_clean();
        imagedestroy($source);

        Storage::disk('public')->put($relativePath, $jpegBytes);
    }

    private function resolveDriveThumbnail(string $url): ?string
    {
        $fileId = null;

        if (preg_match('/\/file\/d\/([^\/]+)/', $url, $matches)) {
            $fileId = $matches[1];
        }

        if (!$fileId) {
            parse_str((string) parse_url($url, PHP_URL_QUERY), $query);
            if (isset($query['id'])) {
                $fileId = $query['id'];
            }
        }

        if (!$fileId) {
            return null;
        }

        return "https://drive.google.com/thumbnail?id={$fileId}&sz=w1000";
    }

    private function resolveYoutubeThumbnail(string $url): ?string
    {
        $videoId = null;
        parse_str((string) parse_url($url, PHP_URL_QUERY), $query);

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
}