import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/expo";

export function getPublicAssetUrl(path?: string | null): string {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith(BASE_PATH + '/') || trimmed === BASE_PATH) {
    return trimmed;
  }

  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${BASE_PATH}${withSlash}`;
}

export function getStorageUrl(path?: string | null): string {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Jika berupa path statis di public/ (misal /image/..., /icon/..., /model/..., /prodi/...)
  if (
    trimmed.startsWith('/image/') ||
    trimmed.startsWith('/icon/') ||
    trimmed.startsWith('/model/') ||
    trimmed.startsWith('/prodi/') ||
    trimmed.startsWith('image/') ||
    trimmed.startsWith('icon/') ||
    trimmed.startsWith('model/') ||
    trimmed.startsWith('prodi/')
  ) {
    return getPublicAssetUrl(trimmed);
  }

  if (trimmed.startsWith('/expo/')) {
    return trimmed;
  }

  const storageBase = (
    process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage'
  ).replace(/\/+$/, '');

  const cleanPath = trimmed.replace(/^\/?(storage\/)?/, '');
  return `${storageBase}/${cleanPath}`;
}