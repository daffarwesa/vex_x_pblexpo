"use client";

import { useState } from "react";

import NavAdmin from "@/components/shared/ui/NavAdmin";
import PageSponsor from "@/components/sponsor/PageSponsor";
import AddSponsor from "@/components/sponsor/AddSponsor";

export default function AdminSponsorPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddClick = () => {
    setIsFormOpen((prev) => !prev);
  };

  return (
    <div className="w-full">
      {/* NAV ADMIN */}
      <NavAdmin isFormOpen={isFormOpen} onAddClick={handleAddClick} />

      {isFormOpen ? (
        <AddSponsor onSuccess={() => setIsFormOpen(false)} />
      ) : (
        <PageSponsor href="/admin/sponsor/" />
      )}
    </div>
  );
}