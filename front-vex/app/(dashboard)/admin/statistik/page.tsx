"use client";

import NavAdmin from "@/components/shared/ui/NavAdmin";
import PageStatistik from "@/components/statistik/PageStatistik";

export default function AdminStatistikPage() {
  return (
    <div className="w-full">
      <NavAdmin />
      <PageStatistik />
    </div>
  );
}
