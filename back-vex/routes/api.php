<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminKaryaController;
use App\Http\Controllers\AdminPameranController;
use App\Http\Controllers\ChangeEmailController;
use App\Http\Controllers\ChangePasswordController;
use App\Http\Controllers\GameAssetController;
use App\Http\Controllers\PameranPublicController;
use App\Http\Controllers\KaryaPublicController;
use App\Http\Controllers\StatistikController;

/*
    ROUTE FALLBACK
*/

Route::get('/', function () {
    return view('error-api');
});

// =============================================================================
// ROUTE PUBLIK (Bisa diakses tanpa login)
// =============================================================================
Route::get('/kategori', function () {
    return response()->json([
        'status' => 'success',
        'data' => \App\Models\Kategori::all(),
    ]);
});
Route::get('/pameran', [PameranPublicController::class, 'index']);
Route::get('/pameran/{slug}', [PameranPublicController::class, 'show']);
Route::post('/pameran/{slug}/kunjungan', [PameranPublicController::class, 'catatKunjungan']);
Route::post('/kunjungan', [StatistikController::class, 'store']);
Route::get('/karya/{id_karya}', [KaryaPublicController::class, 'show']);
Route::get('/karya/predikat/{predikat}', [KaryaPublicController::class, 'getByPredikat']);

// Login admin
Route::post('/login', [AdminController::class, 'login']);

// =============================================================================
// ROUTE ADMIN (WAJIB LOGIN DENGAN TOKEN BEARER / SANCTUM)
// Hanya admin yang sudah login yang bisa menambahkan, mengubah, atau menghapus data
// =============================================================================
Route::middleware('auth:sanctum')->group(function () {
    // Current user & Logout
    Route::get('/user', [AdminController::class, 'me']);
    Route::post('/logout', [AdminController::class, 'logout']);

    Route::prefix('auth')->group(function () {
        Route::get('/user', [AdminController::class, 'me']);
        Route::post('/logout', [AdminController::class, 'logout']);

        // Ganti email
        Route::prefix('change-email')->group(function () {
            Route::post('/send', [ChangeEmailController::class, 'sendVerification']);
            Route::post('/verify', [ChangeEmailController::class, 'verify']);
        });

        // Ganti kata sandi
        Route::post('/change-password', [ChangePasswordController::class, 'changePassword']);

        // =============================
        // MANAJEMEN PAMERAN (Hanya Admin yang Login)
        // =============================
        Route::post('/pameran', [AdminPameranController::class, 'store']);
        Route::post('/pameran/add', [AdminPameranController::class, 'store']);
        Route::match(['put', 'patch', 'post'], '/pameran/{id_pameran}', [AdminPameranController::class, 'update']);
        Route::match(['put', 'patch', 'post'], '/pameran/{id_pameran}/update', [AdminPameranController::class, 'update']);
        Route::delete('/pameran/{id_pameran}', [AdminPameranController::class, 'destroy']);

        // =============================
        // MANAJEMEN KARYA (Hanya Admin yang Login)
        // =============================
        Route::get('/karya', [AdminKaryaController::class, 'index']);
        Route::get('/karya/{id_karya}', [AdminKaryaController::class, 'show']);
        Route::post('/karya', [AdminKaryaController::class, 'store']);
        Route::match(['put', 'patch', 'post'], '/karya/{id_karya}', [AdminKaryaController::class, 'update']);
        Route::delete('/karya/{id_karya}', [AdminKaryaController::class, 'destroy']);

        Route::get('/karya/pameran/{id_pameran}', [AdminKaryaController::class, 'getByPameran']);
        Route::get('/karya/pameran/{id_pameran}/peringkat', [AdminKaryaController::class, 'getPeringkat']);
        Route::patch('/karya/{id_karya}/predikat', [AdminKaryaController::class, 'setPredikat']);
        Route::patch('/karya/{id_karya}/best', [AdminKaryaController::class, 'setBest']);

        // =============================
        // STATISTIK KUNJUNGAN (Hanya Admin yang Login)
        // =============================
        Route::get('/statistik/range', [StatistikController::class, 'statistikRange']);
        Route::get('/statistik/kunjungan', [StatistikController::class, 'statistikKunjungan']);
    });
});

//-----------------------
// !! JANGAN DISENTUH !!
//-----------------------

Route::prefix('experience')->group(function () {
    Route::get('/player-model', [GameAssetController::class, 'servePlayerModel']);
    Route::get('/game-assets', [GameAssetController::class, 'index']);
    Route::get('/3d-models/{id}', [GameAssetController::class, 'get3DModel']);
    Route::get('/hall-model/{modelId}', [GameAssetController::class, 'serveHallModel']);
    Route::get('/booth-model/{filename}', [GameAssetController::class, 'serveBoothModel']);
    Route::get('/karya/pameran/{id_pameran}', [GameAssetController::class, 'karyaByPameran']);
    Route::get('/proxy-image', [GameAssetController::class, 'proxyImage']); // ← baru
});
