<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\PameranController;
use App\Http\Controllers\GameAssetController;
use App\Http\Controllers\KaryaController;
use App\Http\Controllers\KomentarController;
use App\Http\Controllers\SukaController;

// =============================
// PUBLIC ROUTES
// =============================
Route::get('/', function () {
    return view('error-api');
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [PenggunaController::class, 'register']);
    Route::post('/verify-otp', [PenggunaController::class, 'verifyOtp']);
    Route::post('/resend-otp', [PenggunaController::class, 'resendOtp']);
    Route::post('/login', [PenggunaController::class, 'login']);
    Route::post('/forgot-password', [ResetPasswordController::class, 'forgotPassword']);
    Route::post('/resend-email', [ResetPasswordController::class, 'resendEmail']);
    Route::post('/verify-reset-token', [ResetPasswordController::class, 'verifyResetToken']);
    Route::post('/reset-password', [ResetPasswordController::class, 'resetPassword']);
});

Route::get('/pameran', [PameranPublicController::class, 'index']);
Route::get('/pameran/{slug}', [PameranPublicController::class, 'show']);

// Rate limit kunjungan: 20/menit per IP — cegah abuse statistik
Route::post('/pameran/{slug}/kunjungan', [PameranPublicController::class, 'catatKunjungan'])
    ->middleware('throttle:20,1');
Route::post('/kunjungan', [StatistikController::class, 'store'])
    ->middleware('throttle:20,1');

Route::get('/karya/{id_karya}', [KaryaPublicController::class, 'show']);
Route::get('/karya/predikat/{predikat}', [KaryaPublicController::class, 'getByPredikat']);

// Login: 5 percobaan per menit per IP — cegah brute force
Route::post('/login', [AdminController::class, 'login'])
    ->middleware('throttle:5,1');

// =============================================================================
// ROUTE ADMIN (WAJIB LOGIN DENGAN TOKEN BEARER / SANCTUM)
// Hanya admin yang sudah login yang bisa menambahkan, mengubah, atau menghapus data
// =============================================================================
Route::middleware('auth:sanctum')->group(function () {
    // Current user & Logout
    Route::get('/user', [AdminController::class, 'me']);
    Route::post('/logout', [AdminController::class, 'logout']);

    Route::prefix('auth')->group(function () {
        // Ganti email — OTP: 3 kirim/15 menit per IP
        Route::prefix('change-email')->group(function () {
            Route::post('/send', [ChangeEmailController::class, 'sendVerification'])
                ->middleware('throttle:3,15');
            // Verify OTP: 10 percobaan/menit — attempt counter ada di controller
            Route::post('/verify', [ChangeEmailController::class, 'verify'])
                ->middleware('throttle:10,1');
        });

        // Ganti kata sandi: 5 percobaan/menit
        Route::post('/change-password', [ChangePasswordController::class, 'changePassword'])
            ->middleware('throttle:5,1');

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

// Experience routes: 60 req/menit per IP — cegah abuse asset endpoint
Route::prefix('experience')->middleware('throttle:60,1')->group(function () {
    Route::get('/player-model', [GameAssetController::class, 'servePlayerModel']);
    Route::get('/game-assets', [GameAssetController::class, 'index']);
    Route::get('/3d-models/{id}', [GameAssetController::class, 'get3DModel']);
    Route::get('/hall-model/{modelId}', [GameAssetController::class, 'serveHallModel']);     // ← tambah
    Route::get('/booth-model/{filename}', [GameAssetController::class, 'serveBoothModel']); // ← tambah
    Route::get('/karya/pameran/{id_pameran}', [GameAssetController::class, 'karyaByPameran']);
    // Proxy image: lebih ketat — 30 req/menit per IP
    Route::get('/proxy-image', [GameAssetController::class, 'proxyImage'])
        ->middleware('throttle:30,1');
});

// =============================
// PROTECTED ROUTES
// =============================
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'user' => $request->user(),
        ]);
    })->name('auth.user');

    Route::post('/logout', [PenggunaController::class, 'logout'])->name('auth.logout');

    // =============================
    // ADMIN
    // =============================
    Route::middleware('role:Admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['status' => 'success', 'page' => 'Admin Dashboard']);
        });

        Route::post('/pengguna/register-through-admin', [PenggunaController::class, 'registerThroughAdmin']);
        Route::get('/pengguna/role/{role}', [PenggunaController::class, 'getByRole']);
        Route::put('/pengguna/{id}', [PenggunaController::class, 'updateThroughAdmin']);

        // Manajemen Pameran
        Route::get('/pameran', [PameranController::class, 'index']);
        Route::post('/pameran/add', [PameranController::class, 'store']);
        Route::get('/pameran/{identifier}', [PameranController::class, 'show']);
        Route::put('/pameran/{identifier}', [PameranController::class, 'update']);
        // Route::delete('/pameran/{identifier}', [PameranController::class, 'destroy']);
        Route::post('/pameran/{identifier}/update', [PameranController::class, 'update']);

        // Manajemen Karya (Admin)
        Route::get('/karya', [KaryaController::class, 'indexAdmin']);
        Route::delete('/karya/{id}', [KaryaController::class, 'destroy']);

        Route::post('/karya/{id}/toggle-best', [KaryaController::class, 'toggleBest']);
        Route::post('/karya/{id}/toggle-juara', [KaryaController::class, 'toggleJuara']);
    
    });

    // =============================
    // CREATOR (formerly Visitor / Ketua PBL + KPS)
    // =============================
    Route::middleware('role:Creator')->prefix('creator')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['status' => 'success', 'page' => 'Creator Dashboard']);
        });

        // Pameran tersedia untuk karya (tahap persiapan, sesuai kategori)
        Route::get('/pameran-tersedia', [KaryaController::class, 'pameranTersedia']);
        Route::get('/stan/{id_pameran}', [KaryaController::class, 'stanTersedia']);

        // Manajemen Karya
        Route::get('/karya', [KaryaController::class, 'index']);
        Route::post('/karya', [KaryaController::class, 'store']);
        Route::put('/karya/{id}', [KaryaController::class, 'update']);
        Route::post('/karya/{id}/update', [KaryaController::class, 'update']);
        Route::get('/model-stan', [KaryaController::class, 'getModelStan']);
    });

    // =============================
    // GANTI EMAIL
    // =============================
    Route::prefix('change-email')->group(function () {
        Route::post('/send', [App\Http\Controllers\ChangeEmailController::class, 'sendVerification']);
        Route::post('/verify', [App\Http\Controllers\ChangeEmailController::class, 'verify']);
    });

    // =============================
    // GANTI KATA SANDI
    // =============================
    Route::post('/change-password', [App\Http\Controllers\ChangePasswordController::class, 'changePassword']);

    // =============================
    // KOMENTAR DAN SUKA
    // =============================
    Route::prefix('karya')->group(function () {
        Route::post('/{id_karya}/komentar', [KomentarController::class, 'store']);
        Route::post('/{id_karya}/suka', [SukaController::class, 'toggle']);
        Route::get('/{id_karya}/suka', [SukaController::class, 'status']);
    });
});