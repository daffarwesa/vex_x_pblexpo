import url from '@/lib/axios';

interface SendVerificationPayload {
    new_email: string;
    password: string;
}

interface VerifyPayload {
    otp: string;
}

// STEP 1 — POST mengirim email verifikasi OTP
export async function sendVerification(payload: SendVerificationPayload) {
    const res = await url.post('/api/auth/change-email/send', payload);
    return res.data;
}

// STEP 2 — POST verifikasi OTP
export async function verifyToken(payload: VerifyPayload) {
    const res = await url.post('/api/auth/change-email/verify', payload);
    return res.data;
}


