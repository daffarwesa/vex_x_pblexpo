import Admin from '@/components/pengguna/AdminPage';
import { notFound } from 'next/navigation';

export default function AdminPage() {
  notFound()
  return <Admin />;
}
