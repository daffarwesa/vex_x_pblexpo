<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/* 
ADMIN LIKE PENGGUNA ONLY LOGIN & LOGOUT
*/

class AdminController extends Controller
{
    // ==========
    // ADMIN LOGIN
    // ==========
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        try {
            $admin = Admin::where('email', $request->email)->first();

            if (!$admin) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Akun tidak terdaftar'
                ], 401);
            }

            if (!Hash::check($request->password, $admin->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email atau password salah.'
                ], 401);
            }

            $admin->tokens()->delete();

            $token = $admin->createToken('token', ['admin'])->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Berhasil masuk ke akun',
                'redirect' => '/admin/pameran',
                'token' => $token,
                'user' => [
                    'id' => $admin->id,
                    'nama' => $admin->nama,
                    'email' => $admin->email,
                ],
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }

    // ===========
    // ADMIN LOGOUT
    // ===========
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil'
        ]);
    }
}