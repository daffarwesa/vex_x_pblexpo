<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminKaryaController;
use App\Http\Controllers\AdminPameranController;
use App\Http\Controllers\AdminStatistikController;
use App\Http\Controllers\ChangeEmailController;
use App\Http\Controllers\ChangePasswordController;
use App\Http\Controllers\GameAssetController;
use App\Http\Controllers\PameranPublicController;
use App\Http\Controllers\KaryaPublicController;

/* 
    ROUTE FALLBACK
*/
Route::get('/', function () {
    return view('error-api');
});

// =============================
// ROUTE PUBLIK
// =============================
Route::post('/pameran/{slug}/kunjungan', [PameranPublicController::class, 'catatKunjungan']);
Route::get('/pameran', [PameranPublicController::class, 'index']);
Route::get('/pameran/{slug}', [PameranPublicController::class, 'show']);

// Login admin
Route::post('/login', [AdminController::class, 'login']);

// =============================
// ROUTE ADMIN (butuh login sebagai admin)
// =============================
Route::prefix('auth')->group(function () {
    Route::post('/logout', [AdminController::class, 'logout']);

    // Ganti email
    Route::prefix('change-email')->group(function () {
        Route::post('/send', [ChangeEmailController::class, 'sendVerification']);
        Route::post('/verify', [ChangeEmailController::class, 'verify']);
    });

    // Ganti kata sandi
    Route::post('/change-password', [ChangePasswordController::class, 'changePassword']);

    // Pameran (admin-only)
    Route::post('/pameran', [AdminPameranController::class, 'store']);
    Route::match(['put', 'patch'], '/pameran/{id_pameran}', [AdminPameranController::class, 'update']);
    Route::delete('/pameran/{id_pameran}', [AdminPameranController::class, 'destroy']);

    // Karya (admin-only)
    Route::get('/karya/pameran/{id_pameran}', [AdminKaryaController::class, 'getByPameran']);
    Route::get('/karya/pameran/{id_pameran}/juara-best', [AdminKaryaController::class, 'getJuaraDanBest']);
    Route::patch('/karya/{id_karya}/predikat', [AdminKaryaController::class, 'setPredikat']);
    Route::patch('/karya/{id_karya}/best', [AdminKaryaController::class, 'setBest']);

    // Statistik kunjungan
    Route::get('/admin/statistik/kunjungan', [AdminStatistikController::class, 'kunjungan']);
});

// Route::prefix('auth')->group(function () {
//     Route::post('/register', [PenggunaController::class, 'register']);
//     Route::post('/verify-otp', [PenggunaController::class, 'verifyOtp']);
//     Route::post('/resend-otp', [PenggunaController::class, 'resendOtp']);
//     Route::post('/login', [PenggunaController::class, 'login']);
//     Route::post('/forgot-password', [ResetPasswordController::class, 'forgotPassword']);
//     Route::post('/resend-email', [ResetPasswordController::class, 'resendEmail']);
//     Route::post('/verify-reset-token', [ResetPasswordController::class, 'verifyResetToken']);
//     Route::post('/reset-password', [ResetPasswordController::class, 'resetPassword']);
// });

// Publik Akses Global
// Route::get('/pameran', [PameranController::class, 'index']);
// Route::get('/pameran/{identifier}', [PameranController::class, 'show']);
// Route::get('/karya/{id_karya}/komentar', [KomentarController::class, 'index']);
// Route::get('/public/karya/terbaik', [KaryaController::class, 'karyaTerbaikAktif']);
// Route::get('/public/karya/favorit', [KaryaController::class, 'karyaFavoritAktif']);

//-----------------------
// !! JANGAN DISENTUH !!
//-----------------------

Route::prefix('experience')->group(function () {
    Route::get('/game-assets', [GameAssetController::class, 'index']);
    Route::get('/3d-models/{id}', [GameAssetController::class, 'get3DModel']);
    Route::get('/hall-model/{modelId}', [GameAssetController::class, 'serveHallModel']);     // ← tambah
    Route::get('/booth-model/{filename}', [GameAssetController::class, 'serveBoothModel']); // ← tambah
    Route::get('/karya/pameran/{id_pameran}', [GameAssetController::class, 'karyaByPameran']);
});

// =============================
// PROTECTED ROUTES
// =============================
// Route::middleware('auth:sanctum')->group(function () {

//     Route::get('/user', function (Request $request) {
//         return response()->json([
//             'status' => 'success',
//             'user' => $request->user(),
//         ]);
//     })->name('auth.user');

//     Route::post('/logout', [PenggunaController::class, 'logout'])->name('auth.logout');

//     // =============================
//     // ADMIN
//     // =============================
//     Route::middleware('role:Admin')->prefix('admin')->group(function () {
//         Route::get('/dashboard', function () {
//             return response()->json(['status' => 'success', 'page' => 'Admin Dashboard']);
//         });

//         Route::post('/pengguna/register-through-admin', [PenggunaController::class, 'registerThroughAdmin']);
//         Route::get('/pengguna/role/{role}', [PenggunaController::class, 'getByRole']);
//         Route::put('/pengguna/{id}', [PenggunaController::class, 'updateThroughAdmin']);

//         // Manajemen Pameran
//         Route::get('/pameran', [PameranController::class, 'index']);
//         Route::post('/pameran/add', [PameranController::class, 'store']);
//         Route::get('/pameran/{identifier}', [PameranController::class, 'show']);
//         Route::put('/pameran/{identifier}', [PameranController::class, 'update']);
//         // Route::delete('/pameran/{identifier}', [PameranController::class, 'destroy']);
//         Route::post('/pameran/{identifier}/update', [PameranController::class, 'update']);

//         // Manajemen Karya (Admin)
//         Route::get('/karya', [KaryaController::class, 'indexAdmin']);
//         Route::delete('/karya/{id}', [KaryaController::class, 'destroy']);

//         Route::post('/karya/{id}/toggle-best', [KaryaController::class, 'toggleBest']);
//         Route::post('/karya/{id}/toggle-juara', [KaryaController::class, 'toggleJuara']);

//     });

//     // =============================
//     // CREATOR (formerly Visitor / Ketua PBL + KPS)
//     // =============================
//     Route::middleware('role:Creator')->prefix('creator')->group(function () {
//         Route::get('/dashboard', function () {
//             return response()->json(['status' => 'success', 'page' => 'Creator Dashboard']);
//         });

//         // Pameran tersedia untuk karya (tahap persiapan, sesuai kategori)
//         Route::get('/pameran-tersedia', [KaryaController::class, 'pameranTersedia']);
//         Route::get('/stan/{id_pameran}', [KaryaController::class, 'stanTersedia']);

//         // Manajemen Karya
//         Route::get('/karya', [KaryaController::class, 'index']);
//         Route::post('/karya', [KaryaController::class, 'store']);
//         Route::put('/karya/{id}', [KaryaController::class, 'update']);
//         Route::post('/karya/{id}/update', [KaryaController::class, 'update']);
//         Route::get('/model-stan', [KaryaController::class, 'getModelStan']);
//     });

//     // =============================
//     // GANTI EMAIL
//     // =============================
//     Route::prefix('change-email')->group(function () {
//         Route::post('/send', [App\Http\Controllers\ChangeEmailController::class, 'sendVerification']);
//         Route::post('/verify', [App\Http\Controllers\ChangeEmailController::class, 'verify']);
//     });

//     // =============================
//     // GANTI KATA SANDI
//     // =============================
//     Route::post('/change-password',