'use client';

import { useState } from 'react';

import PageKarya from '@/components/karya/PageKarya';
import AddKarya from '@/components/karya/AddKarya';
import NavKetuaPBL from '@/components/shared/ui/NavKetuaPBL';
import { notFound } from 'next/navigation';

export default function KaryaPage() {
  notFound()
  const [isFormOpen, setIsFormOpen] = useState(false);
  const handleAddClick = () => {
    setIsFormOpen((prev) => !prev);
  };
  return (
    <div className="w-full">
      <NavKetuaPBL isFormOpen={isFormOpen} onAddClick={handleAddClick} />

      {isFormOpen ? <AddKarya /> : <PageKarya href="/creator/karya/" />}
    </div>
  );
}
