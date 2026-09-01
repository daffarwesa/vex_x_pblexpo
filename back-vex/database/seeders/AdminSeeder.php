<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admins = [
            [
                'nama' => 'Super Admin',
                'email' => 'admin@pbl.com',
                'password' => Hash::make('password123'),
                'new_email' => null,
                'new_email_verification_token' => null,
                'new_email_expires_at' => null,
            ],
            [
                'nama' => 'Admin Fajri',
                'email' => 'fajrinurpras07@gmail.com',
                'password' => Hash::make('password090'),
                'new_email' => null,
                'new_email_verification_token' => null,
                'new_email_expires_at' => null,
            ],
        ];

        foreach ($admins as $admin) {
            DB::table('admin')->updateOrInsert(
                ['email' => $admin['email']],
                $admin
            );
        }
    }
}