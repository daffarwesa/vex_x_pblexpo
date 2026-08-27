export const KATEGORI_OPTIONS = [
  {
    kode: "IOT",
    nama: "Internet of Things (IoT)",
  },
  {
    kode: "WEB",
    nama: "Aplikasi Berbasis Web dan Mobile",
  },
  {
    kode: "ANV",
    nama: "Animasi dan Videografi",
  },
  {
    kode: "JCS",
    nama: "Jaringan dan Cybersecurity",
  },
  {
    kode: "OTO",
    nama: "Sistem Otomasi",
  },
  {
    kode: "RAI",
    nama: "Robotics and Artificial Intelligence",
  },
  {
    kode: "TTG",
    nama: "Teknologi Tepat Guna",
  },
  {
    kode: "PRF",
    nama: "Proses Fabrikasi / Manufacturing",
  },
  {
    kode: "PDF",
    nama: "Produk Fabrikasi / Manufacturing",
  },
  {
    kode: "KDS",
    nama: "Konsep Desain",
  },
  {
    kode: "LJU",
    nama: "Layanan dan Jasa Usaha",
  },
  {
    kode: "KTI",
    nama: "Karya Tulis Ilmiah",
  },
];

export const KELAS_OPTIONS = [
  {
    id_kelas: 1,
    nama_kelas: "A"
  },
  {
    id_kelas: 2,
    nama_kelas: "B"
  },
  {
    id_kelas: 3,
    nama_kelas: "C"
  },
  {
    id_kelas: 4,
    nama_kelas: "D"
  },
]

export type KategoriOption = (typeof KATEGORI_OPTIONS)[number];

export type PameranDescription = {
  title: string;
  content: string;
};

export type PameranStats = {
  likes: number;
  karya: number;
  prepareStartDate: string;
  prepareEndDate: string;
  startDate: string;
  endDate: string | null;
  studyLevel: string;
};

export type Pameran = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  date: string;
  bannerImage: string;
  // bannerLarge: string;
  // bannerMedium: string;
  // bannerSmall: string;
  likes: number;
  karya: number;
  description: PameranDescription[];
  stats: PameranStats;
  institution: string;
};

export interface PameranForm {
  // kategori: string; // kategori pameran (kode dari KATEGORI_OPTIONS)
  title: string;
  publishDate: string;
  prepareStart: string;
  prepareEnd: string;
  description: string;
  image: File | null;
};
