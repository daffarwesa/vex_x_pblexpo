import { useEffect, useMemo, useState } from "react";
import { StatusType } from "@/components/shared/filter/SelectStatus";
import { UserType } from "@/types/pengguna";
import {
  GetRole,
  CreateUser,
  UpdateUser,
} from "@/components/pengguna/apiPengguna";
import { useAuth } from "@/context/AuthContext";

/* 
 CRUD PENGGUNA BAGIAN ADMIN, FILTER ADMIN, PAGINASI USER, VALIDATE USER
 */

const ITEMS_PER_PAGE = 9;

export function useUsers() {
  const { user, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null);
  const [pageMhs, setPageMhs] = useState(1);
  const [pageKps, setPageKps] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const creatorRes = await GetRole("Creator");
      setUsers(creatorRes.data ?? []);
    } catch (error) {
      console.error(error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }
    loadUsers();
  }, [authLoading, user]);

  /* ---------- Filter ---------- */
  const filterData = (data: UserType[]) =>
    data.filter((item) => {
      const matchName = item.nama
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Map value 'active'/'inactive' ke 'Aktif'/'Tidak Aktif'
      const matchStatus = selectedStatus
        ? item.status ===
          (selectedStatus.value === "active" ? "Aktif" : "Tidak Aktif")
        : true;

      return matchName && matchStatus;
    });

  const filteredMhs = useMemo(
    () => filterData(users.filter((u) => u.role === "Creator")),
    [users, searchTerm, selectedStatus],
  );

  /* ---------- Pagination ---------- */
  useEffect(() => {
    setPageMhs(1);
  }, [searchTerm, selectedStatus]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMhs.length / ITEMS_PER_PAGE),
  );

  // const totalPagesKps = Math.ceil(filteredKps.length / ITEMS_PER_PAGE);

  const paginatedMhs = filteredMhs.slice(
    (pageMhs - 1) * ITEMS_PER_PAGE,
    pageMhs * ITEMS_PER_PAGE,
  );

  // const paginatedKps = filteredKps.slice((pageKps - 1) * ITEMS_PER_PAGE, pageKps * ITEMS_PER_PAGE);

  const nextPage = () => setPageMhs((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPageMhs((p) => Math.max(p - 1, 1));


  /* ---------- CRUD ---------- */
  const addUser = async (newUser: Omit<UserType, "id">) => {
    try {
      await CreateUser({
        nama: newUser.nama,
        email: newUser.email,
        role: newUser.role,

      });

      await loadUsers();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const updateUser = async (user: UserType) => {
    try {
      await UpdateUser(user);
      await loadUsers();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const toggleStatus = async (user: UserType) => {
    const updated = {
      ...user,
      status: user.status === "Aktif" ? "Tidak Aktif" : "Aktif",
    };
    const success = await updateUser(updated);
    return { updated, success };
  };

  return {
    users,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    pageMhs,
    totalPages,
    pageKps,
    paginatedMhs,
    nextPage,
    prevPage,
    addUser,
    updateUser,
    toggleStatus,
    isLoading,
  };
}
