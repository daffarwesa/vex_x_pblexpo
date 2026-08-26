import type { Metadata } from "next";
import "@/app/globals.css";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "V-EX | Admin - Statistik",
  description: "Virtual Exhibition",
};

export default function StatistikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <Footer />
    </div>
  );
}
