import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Building2, ClipboardList, Mail, MoreVertical, Plus, Search, Truck } from "lucide-react";
import { api } from "../api/client";
import { useFallbackQuery } from "../api/useFallbackQuery";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { fallbackSuppliers } from "../data/fallback";
import { confirmAction, showSuccess } from "../lib/alerts";
import { shortDateTime } from "../lib/format";
import type { Supplier } from "../types";

type SupplierForm = {
  id?: number;
  name: string;
  phone: string;
  email: string;
  warehouse: string;
  address: string;
  notes: string;
};

const inputClass =
  "min-h-11 w-full rounded-lg border border-outline-variant bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const emptySupplier: SupplierForm = {
  name: "",
  phone: "",
  email: "",
  warehouse: "",
  address: "",
  notes: ""
};

function toForm(supplier?: Supplier): SupplierForm {
  return supplier
    ? {
        id: supplier.id,
        name: supplier.name,
        phone: supplier.phone ?? "",
        email: supplier.email ?? "",
        warehouse: supplier.warehouse ?? "",
        address: supplier.address ?? "",
        notes: supplier.notes ?? ""
      }
    : emptySupplier;
}

export function SuppliersPage() {
  const suppliersQuery = useFallbackQuery<Supplier[]>(["suppliers"], "/suppliers", fallbackSuppliers);
  const fetchedSuppliers = suppliersQuery.data ?? fallbackSuppliers;
  const [suppliers, setSuppliers] = useState<Supplier[]>(fetchedSuppliers);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<SupplierForm | null>(null);

  useEffect(() => {
    setSuppliers(fetchedSuppliers);
  }, [fetchedSuppliers]);

  const filteredSuppliers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return suppliers.filter(
      (supplier) =>
        !keyword ||
        supplier.name.toLowerCase().includes(keyword) ||
        Boolean(supplier.phone?.toLowerCase().includes(keyword)) ||
        Boolean(supplier.email?.toLowerCase().includes(keyword))
    );
  }, [search, suppliers]);
  const warehouseCount = new Set(suppliers.map((supplier) => supplier.warehouse).filter(Boolean)).size;

  async function submitSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    const payload = {
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      warehouse: form.warehouse || null,
      address: form.address || null,
      notes: form.notes || null
    };

    try {
      if (form.id) {
        const response = await api.put<{ data: Supplier }>(`/suppliers/${form.id}`, payload);
        setSuppliers((current) =>
          current.map((supplier) => (supplier.id === form.id ? response.data.data : supplier))
        );
      } else {
        const response = await api.post<{ data: Supplier }>("/suppliers", payload);
        setSuppliers((current) => [response.data.data, ...current]);
      }
    } catch {
      const localSupplier: Supplier = {
        id: form.id ?? Date.now(),
        ...payload,
        createdAt: new Date().toISOString()
      };
      setSuppliers((current) =>
        form.id
          ? current.map((supplier) => (supplier.id === form.id ? localSupplier : supplier))
          : [localSupplier, ...current]
      );
    }

    setForm(null);
    await showSuccess(form.id ? "Supplier diperbarui" : "Supplier ditambahkan");
  }

  async function deleteSupplier(supplier: Supplier) {
    if (!(await confirmAction("Hapus supplier?", `${supplier.name} akan dihapus dari daftar supplier.`))) return;
    try {
      await api.delete(`/suppliers/${supplier.id}`);
    } catch {
      // Local fallback for demo mode.
    }
    setSuppliers((current) => current.filter((item) => item.id !== supplier.id));
    await showSuccess("Supplier dihapus", `${supplier.name} berhasil dihapus.`);
  }

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-on-surface-variant">Pemasok barang</p>
          <h1 className="text-3xl font-extrabold">Manajemen Supplier</h1>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-bold text-on-primary hover:bg-primary-container"
          onClick={() => setForm(toForm())}
        >
          <Plus className="h-5 w-5" />
          Tambah Supplier
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Supplier" value={String(suppliers.length)} subtitle="Kontak pemasok" icon={Truck} />
        <StatCard
          title="Dengan Email"
          value={String(suppliers.filter((supplier) => supplier.email).length)}
          subtitle="Siap order digital"
          icon={Mail}
          tone="green"
        />
        <StatCard
          title="Catatan Aktif"
          value={String(suppliers.filter((supplier) => supplier.notes).length)}
          subtitle="Preferensi pemasok"
          icon={ClipboardList}
          tone="orange"
        />
        <StatCard title="Area Gudang" value={String(warehouseCount)} subtitle="Gudang tercatat" icon={Building2} tone="gray" />
      </section>

      <section className="rounded-lg border border-outline-variant bg-white p-4 shadow-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
          <input
            className={`${inputClass} pl-10`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama supplier, telepon, atau email..."
          />
        </div>
      </section>

      {filteredSuppliers.length === 0 ? (
        <EmptyState icon={Truck} title="Supplier belum ada" description="Tambahkan supplier agar stok masuk bisa ditelusuri lebih rapi." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <article key={supplier.id} className="rounded-lg border border-outline-variant bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-lg font-extrabold">{supplier.name}</p>
                  <p className="text-sm text-on-surface-variant">{supplier.phone ?? "Tanpa nomor"}</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
                  aria-label={`Aksi ${supplier.name}`}
                  onClick={() => setForm(toForm(supplier))}
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-on-surface-variant">Email</span>
                  <span className="truncate font-semibold">{supplier.email ?? "-"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-on-surface-variant">Terdaftar</span>
                  <span className="font-semibold">{shortDateTime(supplier.createdAt)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-on-surface-variant">Gudang</span>
                  <span className="truncate font-semibold">{supplier.warehouse ?? "-"}</span>
                </div>
              </div>
              {supplier.address ? (
                <p className="mt-4 rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant">
                  {supplier.address}
                </p>
              ) : null}
              {supplier.notes ? <p className="mt-3 text-sm text-on-surface-variant">{supplier.notes}</p> : null}
              <div className="mt-4 flex items-center justify-between">
                <StatusBadge tone="blue">Aktif</StatusBadge>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold hover:bg-surface-container-low"
                    onClick={() => setForm(toForm(supplier))}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-error-container px-3 py-2 text-sm font-bold text-error hover:bg-error-container"
                    onClick={() => deleteSupplier(supplier)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {form ? (
        <Modal
          title={form.id ? "Edit Supplier" : "Tambah Supplier"}
          onClose={() => setForm(null)}
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" className="rounded-lg border border-outline-variant px-4 py-2 font-bold" onClick={() => setForm(null)}>
                Batal
              </button>
              <button form="supplier-form" type="submit" className="rounded-lg bg-primary px-5 py-2 font-bold text-on-primary">
                Simpan
              </button>
            </div>
          }
        >
          <form id="supplier-form" className="grid gap-4 sm:grid-cols-2" onSubmit={submitSupplier}>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Nama Supplier
              <input
                required
                className={inputClass}
                value={form.name}
                onChange={(event) => setForm((current) => (current ? { ...current, name: event.target.value } : current))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Telepon
              <input
                className={inputClass}
                value={form.phone}
                onChange={(event) => setForm((current) => (current ? { ...current, phone: event.target.value } : current))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <input
                className={inputClass}
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => (current ? { ...current, email: event.target.value } : current))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Gudang
              <input
                className={inputClass}
                value={form.warehouse}
                placeholder="Opsional, contoh: Gudang Utama"
                onChange={(event) => setForm((current) => (current ? { ...current, warehouse: event.target.value } : current))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Alamat
              <textarea
                className={`${inputClass} min-h-24 py-3`}
                value={form.address}
                onChange={(event) => setForm((current) => (current ? { ...current, address: event.target.value } : current))}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Catatan
              <textarea
                className={`${inputClass} min-h-24 py-3`}
                value={form.notes}
                onChange={(event) => setForm((current) => (current ? { ...current, notes: event.target.value } : current))}
              />
            </label>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
