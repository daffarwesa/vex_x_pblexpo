<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Kode Verifikasi OTP</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px; color: #1f2937;">
    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Verifikasi Akun</h2>
        <p style="font-size: 15px; line-height: 1.5; color: #4b5563;">
            Berikut adalah kode verifikasi OTP Anda untuk Virtual Exhibition (V-EX):
        </p>
        <div style="background: #f3f4f6; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a;">
                {{ $otp }}
            </span>
        </div>
        <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
            Kode ini bersifat rahasia dan akan kedaluwarsa dalam <strong>10 menit</strong>. Jangan bagikan kode ini kepada siapapun.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
            © {{ date('Y') }} V-EX (Virtual Exhibition PBL). All rights reserved.
        </p>
    </div>
</body>

</html>