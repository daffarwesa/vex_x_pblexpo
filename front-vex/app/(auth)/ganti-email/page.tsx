"use client";

import { useEffect, useState } from "react";
import { Button, ButtonPutih } from "@/components/shared/ui/Button";
import { useChangeEmail } from "./useChangeEmail";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { InputField, PasswordField } from "@/components/shared/ui/InputFields";

export default function GantiEmailPage() {
  const router = useRouter();
  const { user, loading, fetchUser } = useAuth();

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    step,
    isLoading,

    success,
    globalError,

    emailError,
    passwordError,
    tokenError,

    newEmail,
    setNewEmail,

    password,
    setPassword,

    token,
    setToken,

    handleSendVerification,
    handleVerify,
    handleReset,
  } = useChangeEmail();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleSelesai = async () => {
    setIsRedirecting(true);

    handleReset();
    await fetchUser();

    router.replace("/admin/pameran");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-main-blue px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        {isRedirecting ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">
              Memperbarui data dan mengalihkan ke dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Ganti Email</h1>

              <p className="text-sm text-gray-500 mt-2">
                {step === 1 && "Masukkan email baru dan kata sandi saat ini"}
                {step === 2 && "Masukkan kode OTP yang dikirim ke email baru"}
                {step === 3 && "Email berhasil diperbarui!"}
              </p>
            </div>

            {/* NOTIFIKASI */}
            {globalError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                {globalError}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <form onSubmit={handleSendVerification} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email Baru</label>
                  <InputField
                    type="email"
                    value={newEmail}
                    placeholder="contoh@domain.com"
                    error={emailError}
                    className="w-full px-4 py-3 border rounded-lg"
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Kata Sandi Saat Ini</label>
                  <PasswordField
                    value={password}
                    placeholder="Masukkan kata sandi saat ini"
                    showPassword={showPassword}
                    error={passwordError}
                    className="w-full px-4 py-3 border rounded-lg"
                    onChange={(e) => setPassword(e.target.value)}
                    onToggle={() => setShowPassword((p) => !p)}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isLoading ? "Mengirim..." : "Kirim Kode Verifikasi"}
                </Button>

                <ButtonPutih
                  type="button"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg"
                >
                  Kembali
                </ButtonPutih>
              </form>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <form onSubmit={handleVerify} className="space-y-4">
                <p className="text-sm text-gray-500">
                  Kode OTP 6-digit dikirim ke:{" "}
                  <span className="font-medium text-gray-800">{newEmail}</span>
                </p>

                <div>
                  <InputField
                    type="text"
                    value={token}
                    placeholder="Masukkan 6 digit kode OTP"
                    error={tokenError}
                    maxLength={6}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg font-mono font-bold"
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Memverifikasi..." : "Verifikasi & Ganti Email"}
                </Button>

                <ButtonPutih
                  type="button"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg"
                >
                  Kembali
                </ButtonPutih>
              </form>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                <p className="text-gray-700 text-sm">
                  Email akun Anda telah berhasil diperbarui ke <strong>{newEmail}</strong>.
                </p>
                <Button
                  type="button"
                  onClick={handleSelesai}
                  className="w-full py-3 rounded-lg cursor-pointer"
                >
                  Selesai
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
