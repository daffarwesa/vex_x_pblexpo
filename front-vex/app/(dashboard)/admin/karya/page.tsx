'use client';

import { useState } from 'react';
import NavAdmin from '@/components/shared/ui/NavAdmin';
import AddKarya from '@/components/karya/AddKarya';
import PageKarya from '@/components/karya/PageKarya';

export default function AdminKaryaPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddClick = () => {
    setIsFormOpen((prev) => !prev);
  };

  return (
    <div className="w-full">
      <NavAdmin isFormOpen={isFormOpen} onAddClick={handleAddClick} />
      {isFormOpen ? (
        <div className="min-h-screen bg-secondary-color select-none pb-20 md:pb-30">
          <AddKarya onCancel={() => setIsFormOpen(false)} />
        </div>
      ) : (
        <PageKarya href="/admin/karya/" />
      )}
    </div>
  );
}
