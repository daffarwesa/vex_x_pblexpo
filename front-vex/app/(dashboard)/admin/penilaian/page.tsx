'use client';

import { useState } from 'react';
import NavAdmin from '@/components/shared/ui/NavAdmin';
import AddKarya from '@/components/karya/AddKarya';
import PagePenilaian from '@/components/penilaian/PagePenilaian';

export default function AdminPenilaianPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddClick = () => {
    setIsFormOpen((prev) => !prev);
  };

  const handleSuccessAdd = () => {
    setIsFormOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="w-full">
      <NavAdmin isFormOpen={isFormOpen} onAddClick={handleAddClick} />
      {isFormOpen ? (
        <div className="min-h-screen bg-secondary-color select-none pb-20 md:pb-30">
          <AddKarya onCancel={() => setIsFormOpen(false)} onSuccess={handleSuccessAdd} />
        </div>
      ) : (
        <PagePenilaian key={refreshKey} onOpenAddForm={() => setIsFormOpen(true)} />
      )}
    </div>
  );
}
