import { AxiosError } from "axios";
import { Edit2, Search, Star, Trash2, UserPlus, Users } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useFallbackQuery } from "../api/useFallbackQuery";
import { Modal } from "../components/ui/Modal";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { fallbackCustomers } from "../data/fallback";
import { confirmAction, showError, showSuccess } from "../lib/alerts";
import { currency, initials, shortDateTime } from "../lib/format";
import type { Customer } from "../types";

type CustomerFormState = {
  id?: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  status: "regular" | "member" | "inactive";
  points: string;
};

const emptyCustomer: CustomerFormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  status: "regular",
  points: "0"
};

function customerErrorMessage(error: unknown) {
  if (error instanceof AxiosError) return error.response?.data?.message ?? "Data pelanggan gagal disimpan.";
  return "Data pelanggan gagal disimpan.";
}

function toForm(customer?: Customer): CustomerFormState {
  return customer
    ? {
        id: customer.id,
        name: customer.name,
        phone: customer.phone ?? "",
        email: customer.email ?? "",
        address: customer.address ?? "",
        notes: customer.notes ?? "",
        status: customer.status ?? "regular",
        points: String(customer.points ?? customer.loyaltyPoints ?? 0)
      }
    : emptyCustomer;
}

export function CustomersPage() {
  const queryClient = useQueryClient();
  const customersQuery = useFallbackQuery<Customer[]>(["customers"], "/customers", fallbackCustomers);
  const customers = customersQuery.data ?? fallbackCustomers;
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CustomerFormState | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredCustomers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return customers.filter(
      (customer) =>
        !normalized ||
        customer.name.toLowerCase().includes(normalized) ||
        Boolean(customer.phone?.toLowerCase().includes(normalized)) ||
        Boolean(customer.email?.toLowerCase().includes(normalized))
    );
  }, [customers, search]);

  const totalPurchase = customers.reduce((total, customer) => total + (customer.totalPurchase ?? 0), 0);
  const totalPoints = customers.reduce(
    (total, customer) => total + (customer.points ?? customer.loyaltyPoints ?? 0),
    0
  );
  const memberCustomers = customers.filter((customer) => customer.status === "member").length;

  function updateForm<K extends keyof Omit<CustomerFormState, "id">>(key: K, value: CustomerFormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setMessage("");

    const payload = {
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      notes: form.notes || null,
      status: form.status,
      points: Number(form.points)
    };

    try {
      if (form.id) {
        await api.put(`/customers/${form.id}`, payload);
      } else {
        await api.post("/customers", payload);
      }
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      setForm(null);
      await showSuccess(form.id ? "Pelanggan diperbarui" : "Pelanggan ditambahkan");
    } catch (error) {
      setMessage(customerErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function deleteCustomer(customer: Customer) {
    if (!(await confirmAction("Hapus pelanggan?", `${customer.name} akan dihapus atau dinonaktifkan bila sudah memiliki transaksi.`))) {
      return;
    }

    try {
      await api.delete(`/customers/${customer.id}`);
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await showSuccess("Pelanggan dihapus", `${customer.name} berhasil diproses.`);
    } catch (error) {
      await showError("Pelanggan gagal dihapus", customerErrorMessage(error));
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard title="Total Pelanggan" value={String(customers.length)} subtitle="Data customer" icon={Users} tone="blue" />
        <StatCard title="Total Belanja" value={currency(totalPurchase)} subtitle="Dari semua pelanggan" icon={Star} tone="green" />
        <StatCard title="Poin Loyalitas" value={String(totalPoints)} subtitle="Estimasi poin" icon={Star} tone="orange" />
        <StatCard title="Member Aktif" value={String(memberCustomers)} subtitle="Bisa tukar point" icon={Users} tone="gray" />
      </section>

      <section className="mt-6 rounded-lg border border-outline-variant bg-white p-4 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Cari pelanggan berdasarkan nama, telepon, atau email..."
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setForm(toForm());
              setMessage("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-on-primary hover:bg-primary-container"
          >
            <UserPlus className="h-5 w-5" />
            Tambah Pelanggan
          </button>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-outline-variant bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
              <tr>
                <th className="px-6 py-4 font-bold">Info Pelanggan</th>
                <th className="px-6 py-4 font-bold">Kontak</th>
                <th className="px-6 py-4 text-right font-bold">Total Belanja</th>
                <th className="px-6 py-4 text-center font-bold">Poin</th>
                <th className="px-6 py-4 text-center font-bold">Status</th>
                <th className="px-6 py-4 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredCustomers.map((customer) => {
                const total = customer.totalPurchase ?? 0;
                const pointBalance = customer.points ?? customer.loyaltyPoints ?? 0;
                const statusLabel =
                  customer.status === "member" ? "Member" : customer.status === "inactive" ? "Nonaktif" : "Reguler";
                const statusTone =
                  customer.status === "member" ? "green" : customer.status === "inactive" ? "red" : "blue";
                return (
                  <tr key={customer.id} className="hover:bg-surface-container-low">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed font-bold text-primary">
                          {initials(customer.name)}
                        </div>
                        <div>
                          <p className="font-bold">{customer.name}</p>
                          <p className="text-xs text-on-surface-variant">Terdaftar: {shortDateTime(customer.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p>{customer.phone ?? "-"}</p>
                      <p className="text-xs text-on-surface-variant">{customer.email ?? "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-bold">{currency(total)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-3 py-1 text-xs font-bold text-tertiary">
                        <Star className="h-3 w-3" />
                        {pointBalance}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setForm(toForm(customer));
                            setMessage("");
                          }}
                          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
                          aria-label={`Edit ${customer.name}`}
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-on-surface-variant hover:bg-error-container hover:text-error"
                          onClick={() => deleteCustomer(customer)}
                          aria-label={`Hapus ${customer.name}`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {form ? (
        <Modal
          title={form.id ? "Edit Pelanggan" : "Tambah Pelanggan"}
          onClose={() => setForm(null)}
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" className="rounded-lg border border-outline-variant px-4 py-2 font-semibold" onClick={() => setForm(null)}>
                Batal
              </button>
              <button form="customer-form" type="submit" disabled={saving} className="rounded-lg bg-primary px-5 py-2 font-bold text-on-primary disabled:opacity-70">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          }
        >
          <form id="customer-form" className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold">
              Nama Pelanggan
              <input required value={form.name} onChange={(event) => updateForm("name", event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2" />
            </label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold">
                Nomor WhatsApp
                <input value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2" />
              </label>
              <label className="block text-sm font-semibold">
                Email
                <input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2" />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold">
                Status
                <select
                  value={form.status}
                  onChange={(event) => updateForm("status", event.target.value as CustomerFormState["status"])}
                  className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2"
                >
                  <option value="regular">Reguler</option>
                  <option value="member">Member</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Point
                <input
                  inputMode="numeric"
                  value={form.points}
                  onChange={(event) => updateForm("points", event.target.value.replace(/\D/g, ""))}
                  className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2"
                  placeholder="0"
                />
              </label>
            </div>
            <label className="block text-sm font-semibold">
              Alamat
              <textarea value={form.address} onChange={(event) => updateForm("address", event.target.value)} className="mt-2 min-h-20 w-full rounded-lg border border-outline-variant px-3 py-2" />
            </label>
            <label className="block text-sm font-semibold">
              Catatan
              <textarea value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} className="mt-2 min-h-20 w-full rounded-lg border border-outline-variant px-3 py-2" />
            </label>
            {message ? <p className="rounded-lg bg-error-container px-4 py-3 text-sm font-semibold text-error">{message}</p> : null}
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
