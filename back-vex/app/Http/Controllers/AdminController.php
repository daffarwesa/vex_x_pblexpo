<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/* 
    AUTH (LOGIN, LOGOUT, USER) 
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
                'message' => 'Success to login the account',
                'redirect' => '/admin/pameran',
                'token' => $token,
                'user' => [
                    'id' => $admin->id_admin,
                    'nama' => $admin->nama,
                    'email' => $admin->email,
                ],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Login error', [
                'email'   => $request->email,
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan pada server. Silakan coba lagi.',
            ], 500);
        }
    }

    // ===========
    // GET CURRENT USER / ME
    // ===========
    public function me(Request $request)
    {
        $admin = $request->user();

        if (!$admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated'
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'user' => [
                'id' => $admin->id_admin,
                'nama' => $admin->nama,
                'email' => $admin->email,
            ],
        ]);
    }

    // ===========
    // ADMIN LOGOUT
    // ===========
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->tokens()->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil'
        ]);
    }
}
