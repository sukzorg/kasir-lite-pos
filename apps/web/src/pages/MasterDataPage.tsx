import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Database, Edit2, Package, Plus, Settings2, Tags, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useFallbackQuery } from "../api/useFallbackQuery";
import { Modal } from "../components/ui/Modal";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { fallbackCategories, fallbackProducts } from "../data/fallback";
import { confirmAction, showError, showSuccess } from "../lib/alerts";
import { currency } from "../lib/format";
import { useAuthStore } from "../store/auth";
import type { Category, LoyaltyRule, Product } from "../types";

type CategoryForm = {
  id?: number;
  name: string;
  color: string;
  status: "active" | "inactive";
  sortOrder: string;
};

type ProductForm = {
  id?: number;
  categoryId: string;
  sku: string;
  name: string;
  unit: string;
  purchasePrice: string;
  sellingPrice: string;
  stock: string;
  minimumStock: string;
  status: "active" | "inactive";
};

type LoyaltyForm = {
  minimumSpend: string;
  pointsAwarded: string;
  pointValue: string;
};

const inputClass =
  "min-h-11 w-full rounded-lg border border-outline-variant bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const fallbackLoyalty: LoyaltyRule = {
  id: 1,
  minimumSpend: 100000,
  pointsAwarded: 1000,
  pointValue: 1
};

function categoryForm(category?: Category): CategoryForm {
  return {
    id: category?.id,
    name: category?.name ?? "",
    color: category?.color ?? "#0f8f3d",
    status: category?.status ?? "active",
    sortOrder: String(category?.sortOrder ?? 0)
  };
}

function productForm(categoryId: number, product?: Product): ProductForm {
  return {
    id: product?.id,
    categoryId: String(product?.categoryId ?? categoryId),
    sku: product?.sku ?? "",
    name: product?.name ?? "",
    unit: product?.unit ?? "pcs",
    purchasePrice: String(product?.purchasePrice ?? 0),
    sellingPrice: String(product?.sellingPrice ?? 0),
    stock: String(product?.stock ?? 0),
    minimumStock: String(product?.minimumStock ?? 0),
    status: product?.status ?? "active"
  };
}

export function MasterDataPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const categoriesQuery = useFallbackQuery<Category[]>(["categories"], "/categories", fallbackCategories);
  const productsQuery = useFallbackQuery<Product[]>(["products", "master"], "/products", fallbackProducts);
  const loyaltyQuery = useFallbackQuery<LoyaltyRule>(["settings", "loyalty"], "/settings/loyalty", fallbackLoyalty);
  const categories = categoriesQuery.data ?? fallbackCategories;
  const products = productsQuery.data ?? fallbackProducts;
  const loyalty = loyaltyQuery.data ?? fallbackLoyalty;

  const [categoryModal, setCategoryModal] = useState<CategoryForm | null>(null);
  const [productModal, setProductModal] = useState<ProductForm | null>(null);
  const [loyaltyForm, setLoyaltyForm] = useState<LoyaltyForm>({
    minimumSpend: String(loyalty.minimumSpend),
    pointsAwarded: String(loyalty.pointsAwarded),
    pointValue: String(loyalty.pointValue)
  });

  useEffect(() => {
    setLoyaltyForm({
      minimumSpend: String(loyalty.minimumSpend),
      pointsAwarded: String(loyalty.pointsAwarded),
      pointValue: String(loyalty.pointValue)
    });
  }, [loyalty]);

  if (user?.role.name !== "Owner") {
    return (
      <div className="grid min-h-[calc(100vh-64px)] place-items-center p-6">
        <div className="max-w-md rounded-lg border border-outline-variant bg-white p-8 text-center shadow-card">
          <Database className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-2xl font-extrabold">Akses Owner Saja</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Master Data berisi kategori, produk, dan aturan point sehingga hanya dapat dibuka oleh Owner.
          </p>
        </div>
      </div>
    );
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryModal) return;
    const payload = {
      name: categoryModal.name,
      color: categoryModal.color,
      status: categoryModal.status,
      sortOrder: Number(categoryModal.sortOrder)
    };

    try {
      if (categoryModal.id) {
        await api.put(`/categories/${categoryModal.id}`, payload);
      } else {
        await api.post("/categories", payload);
      }
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryModal(null);
      await showSuccess(categoryModal.id ? "Kategori diperbarui" : "Kategori ditambahkan");
    } catch {
      await showError("Kategori gagal disimpan");
    }
  }

  async function deleteCategory(category: Category) {
    if (!(await confirmAction("Hapus kategori?", `${category.name} akan dihapus atau dinonaktifkan bila sudah dipakai produk.`))) return;
    try {
      await api.delete(`/categories/${category.id}`);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await showSuccess("Kategori dihapus", `${category.name} berhasil diproses.`);
    } catch {
      await showError("Kategori gagal dihapus");
    }
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productModal) return;
    const payload = {
      categoryId: Number(productModal.categoryId),
      sku: productModal.sku,
      barcode: null,
      name: productModal.name,
      description: null,
      unit: productModal.unit,
      purchasePrice: Number(productModal.purchasePrice),
      sellingPrice: Number(productModal.sellingPrice),
      stock: Number(productModal.stock),
      minimumStock: Number(productModal.minimumStock),
      image: null,
      status: productModal.status
    };

    try {
      if (productModal.id) {
        await api.put(`/products/${productModal.id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["products", "master"] });
      setProductModal(null);
      await showSuccess(productModal.id ? "Master produk diperbarui" : "Master produk ditambahkan");
    } catch {
      await showError("Master produk gagal disimpan");
    }
  }

  async function deleteProduct(product: Product) {
    if (!(await confirmAction("Hapus master produk?", `${product.name} akan dinonaktifkan dari daftar produk.`))) return;
    try {
      await api.delete(`/products/${product.id}`);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["products", "master"] });
      await showSuccess("Master produk dihapus", `${product.name} berhasil dinonaktifkan.`);
    } catch {
      await showError("Master produk gagal dihapus");
    }
  }

  async function submitLoyalty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api.put("/settings/loyalty", {
        minimumSpend: Number(loyaltyForm.minimumSpend),
        pointsAwarded: Number(loyaltyForm.pointsAwarded),
        pointValue: Number(loyaltyForm.pointValue)
      });
      await queryClient.invalidateQueries({ queryKey: ["settings", "loyalty"] });
      await showSuccess("Aturan point diperbarui");
    } catch {
      await showError("Aturan point gagal disimpan");
    }
  }

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <p className="text-sm font-semibold uppercase text-on-surface-variant">Owner control</p>
        <h1 className="text-3xl font-extrabold">Master Data</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Kategori" value={String(categories.length)} subtitle="Jenis kategori produk" icon={Tags} />
        <StatCard title="Master Produk" value={String(products.length)} subtitle="Daftar jenis produk" icon={Package} tone="green" />
        <StatCard title="Minimal Belanja" value={currency(loyalty.minimumSpend)} subtitle="Syarat dapat point" icon={Settings2} tone="orange" />
        <StatCard title="Nilai Point" value={`1 point = ${currency(loyalty.pointValue)}`} subtitle="Potongan transaksi" icon={Database} tone="gray" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-lg border border-outline-variant bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
            <h2 className="text-lg font-bold">Kategori Produk</h2>
            <button
              type="button"
              onClick={() => setCategoryModal(categoryForm())}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-on-primary"
            >
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </div>
          <div className="divide-y divide-outline-variant">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <p className="truncate font-bold">{category.name}</p>
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">{category._count?.products ?? 0} produk</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={category.status === "active" ? "green" : "gray"}>
                    {category.status === "active" ? "Aktif" : "Nonaktif"}
                  </StatusBadge>
                  <button type="button" className="rounded-lg p-2 hover:bg-surface-container" onClick={() => setCategoryModal(categoryForm(category))}>
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button type="button" className="rounded-lg p-2 text-error hover:bg-error-container" onClick={() => deleteCategory(category)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-lg border border-outline-variant bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
            <h2 className="text-lg font-bold">Master Produk</h2>
            <button
              type="button"
              onClick={() => setProductModal(productForm(categories[0]?.id ?? 1))}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-on-primary"
            >
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4 text-right">Harga</th>
                  <th className="px-6 py-4 text-center">Stok</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <p className="font-bold">{product.name}</p>
                      <p className="text-xs text-on-surface-variant">{product.sku}</p>
                    </td>
                    <td className="px-6 py-4">{product.category?.name ?? "-"}</td>
                    <td className="px-6 py-4 text-right font-bold">{currency(product.sellingPrice)}</td>
                    <td className="px-6 py-4 text-center">{product.stock}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" className="rounded-lg p-2 hover:bg-surface-container" onClick={() => setProductModal(productForm(categories[0]?.id ?? 1, product))}>
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button type="button" className="rounded-lg p-2 text-error hover:bg-error-container" onClick={() => deleteProduct(product)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-outline-variant bg-white shadow-card">
        <div className="border-b border-outline-variant px-6 py-4">
          <h2 className="text-lg font-bold">Perhitungan Point Member</h2>
          <p className="text-sm text-on-surface-variant">Contoh: belanja Rp100.000 mendapat 1000 point, 1 point bernilai Rp1.</p>
        </div>
        <form className="grid gap-4 p-6 md:grid-cols-3" onSubmit={submitLoyalty}>
          <label className="grid gap-2 text-sm font-semibold">
            Minimal Belanja
            <input className={inputClass} inputMode="numeric" value={loyaltyForm.minimumSpend} onChange={(event) => setLoyaltyForm((current) => ({ ...current, minimumSpend: event.target.value.replace(/\D/g, "") }))} />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Point Didapat
            <input className={inputClass} inputMode="numeric" value={loyaltyForm.pointsAwarded} onChange={(event) => setLoyaltyForm((current) => ({ ...current, pointsAwarded: event.target.value.replace(/\D/g, "") }))} />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Nilai 1 Point (Rp)
            <input className={inputClass} inputMode="numeric" value={loyaltyForm.pointValue} onChange={(event) => setLoyaltyForm((current) => ({ ...current, pointValue: event.target.value.replace(/\D/g, "") }))} />
          </label>
          <div className="md:col-span-3">
            <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 font-bold text-on-primary">
              <Settings2 className="h-5 w-5" />
              Simpan Aturan Point
            </button>
          </div>
        </form>
      </section>

      {categoryModal ? (
        <Modal
          title={categoryModal.id ? "Edit Kategori" : "Tambah Kategori"}
          onClose={() => setCategoryModal(null)}
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" className="rounded-lg border border-outline-variant px-4 py-2 font-bold" onClick={() => setCategoryModal(null)}>
                Batal
              </button>
              <button form="category-form" type="submit" className="rounded-lg bg-primary px-5 py-2 font-bold text-on-primary">
                Simpan
              </button>
            </div>
          }
        >
          <form id="category-form" className="grid gap-4 sm:grid-cols-2" onSubmit={submitCategory}>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Nama Kategori
              <input required className={inputClass} value={categoryModal.name} onChange={(event) => setCategoryModal((current) => (current ? { ...current, name: event.target.value } : current))} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Warna
              <input className={inputClass} type="color" value={categoryModal.color} onChange={(event) => setCategoryModal((current) => (current ? { ...current, color: event.target.value } : current))} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Urutan
              <input className={inputClass} inputMode="numeric" value={categoryModal.sortOrder} onChange={(event) => setCategoryModal((current) => (current ? { ...current, sortOrder: event.target.value.replace(/\D/g, "") } : current))} />
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Status
              <select className={inputClass} value={categoryModal.status} onChange={(event) => setCategoryModal((current) => (current ? { ...current, status: event.target.value as CategoryForm["status"] } : current))}>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </label>
          </form>
        </Modal>
      ) : null}

      {productModal ? (
        <Modal
          title={productModal.id ? "Edit Master Produk" : "Tambah Master Produk"}
          onClose={() => setProductModal(null)}
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" className="rounded-lg border border-outline-variant px-4 py-2 font-bold" onClick={() => setProductModal(null)}>
                Batal
              </button>
              <button form="master-product-form" type="submit" className="rounded-lg bg-primary px-5 py-2 font-bold text-on-primary">
                Simpan
              </button>
            </div>
          }
        >
          <form id="master-product-form" className="grid gap-4 sm:grid-cols-2" onSubmit={submitProduct}>
            <label className="grid gap-2 text-sm font-semibold">
              Nama Produk
              <input required className={inputClass} value={productModal.name} onChange={(event) => setProductModal((current) => (current ? { ...current, name: event.target.value } : current))} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              SKU
              <input required className={inputClass} value={productModal.sku} onChange={(event) => setProductModal((current) => (current ? { ...current, sku: event.target.value } : current))} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Kategori
              <select className={inputClass} value={productModal.categoryId} onChange={(event) => setProductModal((current) => (current ? { ...current, categoryId: event.target.value } : current))}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Satuan
              <input className={inputClass} value={productModal.unit} onChange={(event) => setProductModal((current) => (current ? { ...current, unit: event.target.value } : current))} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Harga Beli
              <input className={inputClass} inputMode="numeric" value={productModal.purchasePrice} onChange={(event) => setProductModal((current) => (current ? { ...current, purchasePrice: event.target.value.replace(/\D/g, "") } : current))} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Harga Jual
              <input className={inputClass} inputMode="numeric" value={productModal.sellingPrice} onChange={(event) => setProductModal((current) => (current ? { ...current, sellingPrice: event.target.value.replace(/\D/g, "") } : current))} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Stok
              <input className={inputClass} inputMode="numeric" value={productModal.stock} onChange={(event) => setProductModal((current) => (current ? { ...current, stock: event.target.value.replace(/\D/g, "") } : current))} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Stok Minimum
              <input className={inputClass} inputMode="numeric" value={productModal.minimumStock} onChange={(event) => setProductModal((current) => (current ? { ...current, minimumStock: event.target.value.replace(/\D/g, "") } : current))} />
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Status
              <select className={inputClass} value={productModal.status} onChange={(event) => setProductModal((current) => (current ? { ...current, status: event.target.value as ProductForm["status"] } : current))}>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </label>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
