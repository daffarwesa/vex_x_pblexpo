import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "V-EX+ | Ratings",
  description: "Virtual Exhibition",
};

export default function PenilaianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
