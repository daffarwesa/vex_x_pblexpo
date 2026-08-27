"use client";

import "@/app/globals.css";
import Navbar from "@/components/layout/Navbar";
import NavAdmin from "@/components/shared/ui/NavAdmin";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-secondary-color flex items-center justify-center font-poppins">
  //       <div className="flex flex-col items-center gap-3">
  //         <div className="w-8 h-8 border-4 border-main-blue border-t-transparent rounded-full animate-spin" />
  //         <p className="text-sm text-gray-500 font-medium">Memverifikasi sesi admin...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return null;
  // }

  return (
    <div>
      <Navbar />
      <NavAdmin />
      {children}
    </div>
  );
}
