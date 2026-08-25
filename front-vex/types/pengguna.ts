// types/pengguna.ts

export type KategoriType = {
  kode_kategori: string;
  nama_kategori?: string;
};

export type KelasType = {
  id_kelas: number | string;
  nama_kelas?: string;
};

export type UserType = {
  id: number;
  nama: string;
  role: string;
  status: string;
  email: string;
  kategori_kode: KategoriType | string;
  kelas: KelasType | string;
};

// Helper untuk ekstrak nilai kategori/kelas
export function getKategoriKode(kategori: KategoriType | string): string {
  return typeof kategori === 'string' ? kategori : kategori.kode_kategori;
}

export function getKelasId(kelas: KelasType | string): string {
  return typeof kelas === 'string' ? kelas : String(kelas.id_kelas);
}

export function getKelasNama(kelas: KelasType | string): string {
  return typeof kelas === 'string' ? kelas : (kelas.nama_kelas ?? '');
}
