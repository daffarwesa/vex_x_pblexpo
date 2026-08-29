'use client';

import { useState } from 'react';
import PageKarya from '@/components/karya/PageKarya';
import { notFound } from 'next/navigation';

export default function KaryaPage() {
  notFound()
  return (
    <div className="w-full">
      <PageKarya href="/kps/karya/" />
    </div>
  );
}
