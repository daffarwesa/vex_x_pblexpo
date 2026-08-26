export type TipeSponsor = "besar" | "kecil";

export interface SponsorItem {
  id: number;
  title: string;         // judul sponsor
  type: TipeSponsor;     // besar | kecil
  year: string;           // tahun
  poster: string;         // url poster (list/thumbnail)
  posterLarge?: string;   // url poster resolusi besar (untuk detail), opsional
  canEdit?: boolean;
  editMessage?: string | null;
}

export const TIPE_SPONSOR_OPTIONS: { kode: TipeSponsor; nama: string }[] = [
  { kode: "besar", nama: "Sponsor Besar" },
  { kode: "kecil", nama: "Sponsor Kecil" },
];