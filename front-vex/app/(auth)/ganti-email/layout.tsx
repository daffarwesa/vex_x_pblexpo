import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: 'V-EX+ | Change Email',
  description: 'Virtual Exhibition change email',
};

export default function ForgotPasswordLayout({
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
