import type { Metadata } from "next";
import "@/app/globals.css";


export const metadata: Metadata = {
  title: "V-EX+ | Exhibition",
  description: "Virtual Exhibition",
};

export default function IndexLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div>
      {children}
    </div>
  );
}
