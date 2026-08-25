export type TerbaikRank = 1 | 2 | 3;

export const PREDIKAT_LIST = [
  "Best Visualization",
  "Best Creativity & Innovation",
  "Best Functionality",
] as const;

export type PredikatKarya = (typeof PREDIKAT_LIST)[number];

export interface KaryaItem {
  id: number;
  title: string;
  category: string;
  image: string;
  imageLarge?: string;
  imageSmall?: string;
  year: string;
  link?: string;
  semester?: string;
  description?: string;
  thumbnail?: string;
  thumbnailMedium?: string;
  booth?: string;
  modelStan?: string;
  pameranId?: number;
  pameranTitle?: string;
  /** @deprecated diganti oleh terbaikRank & predikat */
  isTerbaik?: boolean;
  terbaikRank?: TerbaikRank | null;
  predikat?: PredikatKarya | null;
  canEdit?: boolean;
  editMessage?: string | null;
}

export interface PameranItem {
  id: number;
  title: string;
}