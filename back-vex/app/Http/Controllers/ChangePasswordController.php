<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/* 
    CHANGE PASSWORD CONTROLLER
*/

class ChangePasswordController extends Controller
{

    // ===================================
    // GANTI PASSWORD (Harus sudah login)
    // ===================================
    public function changePassword(Request $request)
    {
        // Validasi input — HARUS dieksekusi sebelum logika lainnya
        $validator = Validator::make($request->all(), [
            'old_password'              => 'required|string',
            'new_password'              => 'required|string|min:8|confirmed',
            'new_password_confirmation' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();

        // Skenario: Password lama salah
        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kata sandi lama yang Anda masukkan salah',
            ], 401);
        }

        // Skenario: Password baru sama dengan lama
        if (Hash::check($request->new_password, $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kata sandi baru tidak boleh sama dengan kata sandi lama',
            ], 422);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Kata sandi berhasil diperbarui',
        ], 200);
    }
}
