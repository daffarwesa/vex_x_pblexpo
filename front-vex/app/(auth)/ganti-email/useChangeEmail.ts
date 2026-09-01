import { useState } from 'react';
import { sendVerification, verifyToken } from './apiGantiEmail';

export function useChangeEmail() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [success, setSuccess] = useState('');
  const [globalError, setGlobalError] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [tokenError, setTokenError] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  const reset = () => {
    setStep(1);

    setSuccess('');
    setGlobalError('');

    setEmailError('');
    setPasswordError('');
    setTokenError('');

    setToken('');
    setPassword('');
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccess('');
    setGlobalError('');

    setEmailError('');
    setPasswordError('');

    let hasError = false;

    if (!newEmail.trim()) {
      setEmailError('Email baru wajib diisi');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Kata sandi saat ini wajib diisi');
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsLoading(true);

      const res = await sendVerification({
        new_email: newEmail.trim(),
        password,
      });

      setSuccess(res.message || 'Kode OTP telah dikirim ke email baru');
      setStep(2);
    } catch (err: any) {
      const errorData = err?.response?.data;
      const message = errorData?.message || 'Gagal mengirim kode verifikasi';
      const errors = errorData?.errors;

      if (errors && typeof errors === 'object') {
        if (errors.new_email) {
          setEmailError(Array.isArray(errors.new_email) ? errors.new_email[0] : errors.new_email);
        }
        if (errors.password) {
          setPasswordError(Array.isArray(errors.password) ? errors.password[0] : errors.password);
        }
      }

      const msgLower = message.toLowerCase();

      if (err?.response?.status === 401 || msgLower.includes('password') || msgLower.includes('sandi')) {
        setPasswordError(message);
      } else if (msgLower.includes('email')) {
        setEmailError(message);
      } else {
        setGlobalError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setSuccess('');
    setGlobalError('');
    setTokenError('');

    if (!token.trim()) {
      setTokenError('Kode verifikasi OTP wajib diisi');
      return;
    }

    try {
      setIsLoading(true);

      const res = await verifyToken({
        otp: token.trim(),
      });

      setSuccess(res.message || 'Email berhasil diubah');
      setStep(3);
    } catch (err: any) {
      const errorData = err?.response?.data;
      const message = errorData?.message || 'Kode OTP salah atau sudah kedaluwarsa';
      const errors = errorData?.errors;

      if (errors?.otp) {
        setTokenError(Array.isArray(errors.otp) ? errors.otp[0] : errors.otp);
      } else if (errorData?.remaining !== undefined) {
        setTokenError(message);
      } else {
        setTokenError(message);
      }

      setGlobalError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    isLoading,

    success,
    globalError,

    emailError,
    passwordError,
    tokenError,

    newEmail,
    setNewEmail: (val: string) => {
      setNewEmail(val);
      setEmailError('');
      setGlobalError('');
    },

    password,
    setPassword: (val: string) => {
      setPassword(val);
      setPasswordError('');
      setGlobalError('');
    },

    token,
    setToken: (val: string) => {
      setToken(val);
      setTokenError('');
      setGlobalError('');
    },

    handleSendVerification,
    handleVerify,
    handleReset: reset,
  };
}
