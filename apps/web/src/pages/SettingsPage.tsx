import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Edit2, ReceiptText, Save, Settings, ShieldCheck, Store, UserPlus, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useFallbackQuery } from "../api/useFallbackQuery";
import { Modal } from "../components/ui/Modal";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { showSuccess } from "../lib/alerts";
import { defaultStore } from "../store/auth";
import type { Role, StoreSetting, UserAccount } from "../types";

type StoreForm = {
  name: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  taxRate: string;
  receiptFooter: string;
};

type UserForm = {
  id?: number;
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  roleId: string;
  status: "active" | "inactive";
};

type RoleForm = {
  id: number;
  name: string;
  description: string;
};

type RoleWithPermissions = Role & {
  rolePermissions?: Array<{ permission: { code: string; name: string } }>;
};

const inputClass =
  "min-h-11 w-full rounded-lg border border-outline-variant bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const fallbackRoles: RoleWithPermissions[] = [
  { id: 1, name: "Owner", description: "Akses penuh untuk pemilik toko." },
  { id: 2, name: "Kasir", description: "Akses transaksi dan pelanggan terbatas." }
];

const fallbackUsers: UserAccount[] = [
  {
    id: 1,
    name: "Admin Utama",
    email: "owner@kasirlite.local",
    username: "owner",
    phone: "081234567890",
    status: "active",
    role: fallbackRoles[0]
  }
];

function toStoreForm(store: StoreSetting): StoreForm {
  return {
    name: store.name,
    address: store.address ?? "",
    phone: store.phone ?? "",
    email: store.email ?? "",
    currency: store.currency,
    taxRate: String(store.taxRate),
    receiptFooter: store.receiptFooter ?? ""
  };
}

function initialUserForm(roleId = "1"): UserForm {
  return {
    name: "",
    email: "",
    username: "",
    password: "",
    phone: "",
    roleId,
    status: "active"
  };
}

function toUserForm(user: UserAccount): UserForm {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    password: "",
    phone: user.phone ?? "",
    roleId: String(user.role.id ?? 1),
    status: user.status
  };
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const storeQuery = useFallbackQuery<StoreSetting>(["settings", "store"], "/settings/store", defaultStore);
  const usersQuery = useFallbackQuery<UserAccount[]>(["users"], "/users", fallbackUsers);
  const rolesQuery = useFallbackQuery<RoleWithPermissions[]>(["users", "roles"], "/users/roles", fallbackRoles);

  const store = storeQuery.data ?? defaultStore;
  const fetchedUsers = usersQuery.data ?? fallbackUsers;
  const roles = rolesQuery.data ?? fallbackRoles;

  const [storeForm, setStoreForm] = useState<StoreForm>(toStoreForm(store));
  const [users, setUsers] = useState<UserAccount[]>(fetchedUsers);
  const [userForm, setUserForm] = useState<UserForm | null>(null);
  const [roleForm, setRoleForm] = useState<RoleForm | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStoreForm(toStoreForm(store));
  }, [store]);

  useEffect(() => {
    setUsers(fetchedUsers);
  }, [fetchedUsers]);

  async function submitStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      name: storeForm.name,
      address: storeForm.address || null,
      phone: storeForm.phone || null,
      email: storeForm.email || null,
      currency: storeForm.currency || "IDR",
      taxRate: Number(storeForm.taxRate),
      receiptFooter: storeForm.receiptFooter || null
    };

    try {
      await api.put("/settings/store", payload);
      setMessage("Pengaturan toko tersimpan.");
      await showSuccess("Pengaturan toko tersimpan");
    } catch {
      setMessage("Mode demo: perubahan pengaturan tersimpan di tampilan saat ini.");
      await showSuccess("Pengaturan toko tersimpan", "Mode demo aktif.");
    }
  }

  async function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userForm) return;

    const role = roles.find((item) => item.id === Number(userForm.roleId)) ?? roles[0];
    const payload = {
      name: userForm.name,
      email: userForm.email,
      username: userForm.username,
      phone: userForm.phone || null,
      roleId: Number(userForm.roleId),
      status: userForm.status,
      ...(userForm.password ? { password: userForm.password } : {})
    };

    try {
      const response = userForm.id
        ? await api.put<{ data: UserAccount }>(`/users/${userForm.id}`, payload)
        : await api.post<{ data: UserAccount }>("/users", { ...payload, password: userForm.password });
      setUsers((current) =>
        userForm.id
          ? current.map((user) => (user.id === userForm.id ? response.data.data : user))
          : [response.data.data, ...current]
      );
    } catch {
      const localUser = {
        id: userForm.id ?? Date.now(),
        name: userForm.name,
        email: userForm.email,
        username: userForm.username,
        phone: userForm.phone || null,
        status: userForm.status,
        role
      };
      setUsers((current) => [
        ...(userForm.id ? current.map((user) => (user.id === userForm.id ? localUser : user)) : [localUser, ...current])
      ]);
    }

    setUserForm(null);
    await showSuccess(userForm.id ? "User diperbarui" : "User ditambahkan");
  }

  async function submitRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roleForm) return;

    try {
      await api.put(`/users/roles/${roleForm.id}`, {
        name: roleForm.name,
        description: roleForm.description || null
      });
      await queryClient.invalidateQueries({ queryKey: ["users", "roles"] });
      setRoleForm(null);
      await showSuccess("Role diperbarui");
    } catch {
      setRoleForm(null);
      await showSuccess("Role diperbarui", "Mode demo aktif.");
    }
  }

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-on-surface-variant">Konfigurasi aplikasi</p>
          <h1 className="text-3xl font-extrabold">Pengaturan Toko</h1>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-bold text-on-primary hover:bg-primary-container"
          onClick={() => setUserForm(initialUserForm(String(roles[0]?.id ?? 1)))}
        >
          <UserPlus className="h-5 w-5" />
          Tambah User
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Nama Toko" value={storeForm.name || "-"} subtitle="Profil struk" icon={Store} />
        <StatCard title="Pajak Default" value={`${storeForm.taxRate || 0}%`} subtitle="Digunakan POS" icon={ReceiptText} tone="orange" />
        <StatCard title="User Aktif" value={String(users.filter((user) => user.status === "active").length)} subtitle="Akses login" icon={Users} tone="green" />
        <StatCard title="Role" value={String(roles.length)} subtitle="Hak akses dasar" icon={ShieldCheck} tone="gray" />
      </section>

      {message ? (
        <p className="rounded-lg border border-primary-fixed bg-primary-fixed px-4 py-3 text-sm font-semibold text-on-primary-fixed-variant">
          {message}
        </p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-lg border border-outline-variant bg-white shadow-card">
          <div className="border-b border-outline-variant px-6 py-4">
            <h2 className="text-lg font-bold">Profil Toko</h2>
          </div>
          <form className="grid gap-4 p-6 sm:grid-cols-2" onSubmit={submitStore}>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Nama Toko
              <input
                required
                className={inputClass}
                value={storeForm.name}
                onChange={(event) => setStoreForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Nomor WhatsApp
              <input
                className={inputClass}
                value={storeForm.phone}
                onChange={(event) => setStoreForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <input
                className={inputClass}
                type="email"
                value={storeForm.email}
                onChange={(event) => setStoreForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Mata Uang
              <input
                className={inputClass}
                value={storeForm.currency}
                onChange={(event) => setStoreForm((current) => ({ ...current, currency: event.target.value }))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Pajak Default (%)
              <input
                className={inputClass}
                min={0}
                max={100}
                type="number"
                value={storeForm.taxRate}
                onChange={(event) => setStoreForm((current) => ({ ...current, taxRate: event.target.value }))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Alamat
              <textarea
                className={`${inputClass} min-h-24 py-3`}
                value={storeForm.address}
                onChange={(event) => setStoreForm((current) => ({ ...current, address: event.target.value }))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Footer Struk
              <textarea
                className={`${inputClass} min-h-20 py-3`}
                value={storeForm.receiptFooter}
                onChange={(event) => setStoreForm((current) => ({ ...current, receiptFooter: event.target.value }))}
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 font-bold text-on-primary hover:bg-primary-container"
              >
                <Save className="h-5 w-5" />
                Simpan Pengaturan
              </button>
            </div>
          </form>
        </article>

        <aside className="rounded-lg border border-outline-variant bg-white shadow-card">
          <div className="border-b border-outline-variant px-6 py-4">
            <h2 className="text-lg font-bold">Preview Struk</h2>
          </div>
          <div className="p-6">
            <div className="mx-auto max-w-sm rounded-lg border border-outline-variant p-5 text-sm">
              <div className="text-center">
                <p className="text-lg font-extrabold">{storeForm.name || "Nama Toko"}</p>
                <p className="text-xs text-on-surface-variant">{storeForm.address || "Alamat toko"}</p>
                <p className="text-xs text-on-surface-variant">{storeForm.phone || "Nomor WhatsApp"}</p>
              </div>
              <div className="my-4 border-y border-dashed border-outline-variant py-3">
                <div className="flex justify-between">
                  <span>No</span>
                  <span>TRX-20260513-0001</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir</span>
                  <span>Admin Utama</span>
                </div>
              </div>
              <div className="grid gap-1">
                <div className="flex justify-between">
                  <span>Air Mineral 600ml</span>
                  <span>Rp 10.000</span>
                </div>
                <p className="text-xs text-on-surface-variant">2 x Rp 5.000</p>
              </div>
              <div className="mt-4 border-t border-dashed border-outline-variant pt-3">
                <div className="flex justify-between font-extrabold">
                  <span>Total</span>
                  <span>Rp 10.000</span>
                </div>
              </div>
              <p className="mt-5 text-center text-xs">{storeForm.receiptFooter || "Terima kasih."}</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="overflow-hidden rounded-lg border border-outline-variant bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <div>
            <h2 className="text-lg font-bold">User dan Role</h2>
            <p className="text-sm text-on-surface-variant">Akses owner, admin, kasir, dan staff.</p>
          </div>
          <Settings className="h-5 w-5 text-on-surface-variant" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
              <tr>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container-low">
                  <td className="px-6 py-4 font-bold">{user.name}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{user.username}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.role.name}</td>
                  <td className="px-6 py-4">
                    <StatusBadge tone={user.status === "active" ? "green" : "red"}>
                      {user.status === "active" ? "Aktif" : "Nonaktif"}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
                        onClick={() => setUserForm(toUserForm(user))}
                        aria-label={`Edit ${user.name}`}
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-white shadow-card">
        <div className="border-b border-outline-variant px-6 py-4">
          <h2 className="text-lg font-bold">Daftar Role</h2>
          <p className="text-sm text-on-surface-variant">Owner dapat mengubah nama dan deskripsi role.</p>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <article key={role.id} className="rounded-lg border border-outline-variant p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold">{role.name}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{role.description ?? "-"}</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
                  onClick={() =>
                    setRoleForm({
                      id: role.id,
                      name: role.name,
                      description: role.description ?? ""
                    })
                  }
                  aria-label={`Edit role ${role.name}`}
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {userForm ? (
        <Modal
          title={userForm.id ? "Edit User" : "Tambah User"}
          onClose={() => setUserForm(null)}
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" className="rounded-lg border border-outline-variant px-4 py-2 font-bold" onClick={() => setUserForm(null)}>
                Batal
              </button>
              <button form="user-form" type="submit" className="rounded-lg bg-primary px-5 py-2 font-bold text-on-primary">
                Simpan User
              </button>
            </div>
          }
        >
          <form id="user-form" className="grid gap-4 sm:grid-cols-2" onSubmit={submitUser}>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Nama Lengkap
              <input
                required
                className={inputClass}
                value={userForm.name}
                onChange={(event) => setUserForm((current) => (current ? { ...current, name: event.target.value } : current))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <input
                required
                className={inputClass}
                type="email"
                value={userForm.email}
                onChange={(event) => setUserForm((current) => (current ? { ...current, email: event.target.value } : current))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Username
              <input
                required
                className={inputClass}
                value={userForm.username}
                onChange={(event) => setUserForm((current) => (current ? { ...current, username: event.target.value } : current))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Password
              <input
                required={!userForm.id}
                minLength={8}
                className={inputClass}
                type="password"
                value={userForm.password}
                onChange={(event) => setUserForm((current) => (current ? { ...current, password: event.target.value } : current))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Nomor WhatsApp
              <input
                className={inputClass}
                value={userForm.phone}
                onChange={(event) => setUserForm((current) => (current ? { ...current, phone: event.target.value } : current))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Role
              <select
                className={inputClass}
                value={userForm.roleId}
                onChange={(event) => setUserForm((current) => (current ? { ...current, roleId: event.target.value } : current))}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Status
              <select
                className={inputClass}
                value={userForm.status}
                onChange={(event) =>
                  setUserForm((current) =>
                    current ? { ...current, status: event.target.value as UserForm["status"] } : current
                  )
                }
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </label>
          </form>
        </Modal>
      ) : null}

      {roleForm ? (
        <Modal
          title="Edit Role"
          onClose={() => setRoleForm(null)}
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" className="rounded-lg border border-outline-variant px-4 py-2 font-bold" onClick={() => setRoleForm(null)}>
                Batal
              </button>
              <button form="role-form" type="submit" className="rounded-lg bg-primary px-5 py-2 font-bold text-on-primary">
                Simpan Role
              </button>
            </div>
          }
        >
          <form id="role-form" className="grid gap-4" onSubmit={submitRole}>
            <label className="grid gap-2 text-sm font-semibold">
              Nama Role
              <input
                required
                className={inputClass}
                value={roleForm.name}
                onChange={(event) => setRoleForm((current) => (current ? { ...current, name: event.target.value } : current))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Deskripsi
              <textarea
                className={`${inputClass} min-h-24 py-3`}
                value={roleForm.description}
                onChange={(event) => setRoleForm((current) => (current ? { ...current, description: event.target.value } : current))}
              />
            </label>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
