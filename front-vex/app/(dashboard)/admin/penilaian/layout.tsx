import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "V-EX+ | Penilaian Karya",
  description: "Penilaian Karya PBL Virtual Exhibition",
};

export default function PenilaianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
