<?php

namespace App\Http\Controllers;

use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/* 
    CHANGE EMAIL CONTROLLER, OTP, VALIDATE
*/

class ChangeEmailController extends Controller
{
    public function __construct(
        private OtpService $otpService
    ) {}

    // =======================
    // KIRIM OTP KE EMAIL BARU
    // ======================= 
    public function sendVerification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'new_email' => 'required|email|unique:admin,email',
            'password' => 'required|string'
        ], [
            'new_email.required' => 'Email baru wajib diisi',
            'new_email.email' => 'Format email baru tidak valid',
            'new_email.unique' => 'Email ini sudah digunakan oleh akun lain',
            'password.required' => 'Password saat ini wajib diisi',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated'
            ], 401);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kata sandi yang Anda masukkan salah'
            ], 401);
        }

        if (strtolower($request->new_email) === strtolower($user->email)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email baru tidak boleh sama dengan email saat ini'
            ], 422);
        }

        $userId = $user->id_admin ?? $user->getKey();
        $otp = $this->otpService->generateOtp();
        $expiresAt = $this->otpService->getExpiresAt();

        $cacheKey = 'change_email_' . $userId;

        $this->otpService->storeToCache(
            $cacheKey,
            [
                'user_id' => $userId,
                'new_email' => $request->new_email,
                'otp' => $otp,
            ],
            $expiresAt
        );

        try {
            $this->otpService->sendOtpEmail(
                $request->new_email,
                $otp
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Gagal mengirim email OTP', [
                'email' => $request->new_email,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim email verifikasi ke ' . $request->new_email . '. Silakan periksa koneksi atau coba beberapa saat lagi.'
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Kode OTP telah dikirim ke ' . $request->new_email,
            'data' => [
                'new_email' => $request->new_email,
                'expires_at' => $expiresAt->toDateTimeString()
            ]
        ], 200);
    }

    // =======================================
    // VERIFIKASI OTP DAN GANTI EMAIL KE MODEL
    // =======================================
    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'otp' => 'required'
        ], [
            'otp.required' => 'Kode OTP verifikasi wajib diisi'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode OTP wajib diisi',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated'
            ], 401);
        }

        $userId        = $user->id_admin ?? $user->getKey();
        $cacheKey      = 'change_email_' . $userId;
        $attemptKey    = 'change_email_attempts_' . $userId;
        $maxAttempts   = 5;

        // Cek jumlah percobaan — blok jika sudah melebihi batas
        $attempts = \Illuminate\Support\Facades\Cache::get($attemptKey, 0);
        if ($attempts >= $maxAttempts) {
            // Hapus OTP agar tidak bisa dicoba lagi setelah blocking
            $this->otpService->forgetCache($cacheKey);
            \Illuminate\Support\Facades\Cache::forget($attemptKey);

            return response()->json([
                'status'  => 'error',
                'message' => 'Terlalu banyak percobaan salah. OTP telah diinvalidasi, silakan minta OTP baru.',
            ], 429);
        }

        $cacheData = $this->otpService->getFromCache($cacheKey);

        if (!$cacheData) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kode OTP tidak ditemukan atau sudah kedaluwarsa. Silakan minta kode baru.',
            ], 400);
        }

        if ((string) trim($cacheData['otp']) !== (string) trim($request->otp)) {
            // Increment counter percobaan, expire dalam 15 menit
            \Illuminate\Support\Facades\Cache::put($attemptKey, $attempts + 1, now()->addMinutes(15));

            $remaining = $maxAttempts - ($attempts + 1);
            return response()->json([
                'status'    => 'error',
                'message'   => 'Kode OTP salah. Sisa percobaan: ' . max(0, $remaining),
                'remaining' => max(0, $remaining),
            ], 400);
        }

        // OTP valid — bersihkan counter percobaan & cache OTP
        \Illuminate\Support\Facades\Cache::forget($attemptKey);
        $this->otpService->forgetCache($cacheKey);

        $oldEmail = $user->email;
        $newEmail = $cacheData['new_email'];

        $user->email = $newEmail;
        $user->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Email berhasil diperbarui ke ' . $newEmail,
            'data'    => [
                'old_email' => $oldEmail,
                'new_email' => $newEmail,
            ],
        ], 200);
    }
}
