import url from '@/lib/axios';
import { UserType } from '@/types/pengguna';

export async function GetRole(role: string) {
  const res = await url.get(`/api/admin/pengguna/role/${role}`);
  return res.data;
}

export async function CreateUser(data: {
  nama: string;
  email: string;
  role: string;
  kategori_kode?: string | null;
}) {
  const res = await url.post('/api/admin/pengguna/register-through-admin', data);
  return res.data;
}

export async function UpdateUser(user: UserType) {
  const payload = {
    nama: user.nama,
    email: user.email,
    role: user.role,
    status: user.status,
    kategori_kode:
      user.kategori_kode == null
        ? null
        : typeof user.kategori_kode === 'object'
        ? user.kategori_kode.kode_kategori
        : user.kategori_kode,
  };

  const res = await url.put(`/api/admin/pengguna/${user.id}`, payload);
  return res.data;
}
