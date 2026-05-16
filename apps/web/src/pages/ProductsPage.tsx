import { AxiosError } from "axios";
import { Download, Edit2, Filter, PackagePlus, Plus, Search, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useFallbackQuery } from "../api/useFallbackQuery";
import { Modal } from "../components/ui/Modal";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { fallbackCategories, fallbackProducts } from "../data/fallback";
import { confirmAction, showError, showSuccess } from "../lib/alerts";
import { currency } from "../lib/format";
import type { Category, Product } from "../types";

type ProductFormState = {
  id?: number;
  categoryId: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  unit: string;
  purchasePrice: string;
  sellingPrice: string;
  stock: string;
  minimumStock: string;
  image: string;
  status: "active" | "inactive";
};

function productForm(categoryId: number, product?: Product): ProductFormState {
  return {
    id: product?.id,
    categoryId: String(product?.categoryId ?? categoryId),
    sku: product?.sku ?? "",
    barcode: product?.barcode ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    unit: product?.unit ?? "pcs",
    purchasePrice: String(product?.purchasePrice ?? 0),
    sellingPrice: String(product?.sellingPrice ?? 0),
    stock: String(product?.stock ?? 0),
    minimumStock: String(product?.minimumStock ?? 0),
    image: product?.image ?? "",
    status: product?.status ?? "active"
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) return error.response?.data?.message ?? "Data gagal disimpan.";
  return "Data gagal disimpan.";
}

const allowedImageTypes = ["image/jpeg", "image/png"];
const maxImageSize = 2 * 1024 * 1024;

function csvCell(value: string | number | null | undefined) {
  const raw = value === null || value === undefined || value === "" ? "-" : String(value);
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

function csvRow(values: Array<string | number | null | undefined>) {
  return values.map(csvCell).join(";");
}

function stockStatus(product: Product) {
  if (product.stock <= 0) return "Habis";
  if (product.stock <= product.minimumStock) return "Menipis";
  return "Aman";
}

function productImageInfo(image?: string | null) {
  if (!image) return "Tidak ada";
  return image.startsWith("data:") ? "Upload lokal" : image;
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const productsQuery = useFallbackQuery<Product[]>(["products"], "/products", fallbackProducts);
  const categoriesQuery = useFallbackQuery<Category[]>(["categories"], "/categories", fallbackCategories);
  const products = productsQuery.data ?? fallbackProducts;
  const categories = categoriesQuery.data ?? fallbackCategories;
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [status, setStatus] = useState("all");
  const [form, setForm] = useState<ProductFormState | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return products.filter((product) => {
      const searchMatch =
        !normalized ||
        product.name.toLowerCase().includes(normalized) ||
        product.sku.toLowerCase().includes(normalized) ||
        Boolean(product.barcode?.toLowerCase().includes(normalized));
      const categoryMatch = categoryId === "all" || product.categoryId === Number(categoryId);
      const statusMatch = status === "all" || product.status === status;
      return searchMatch && categoryMatch && statusMatch;
    });
  }, [categoryId, products, search, status]);

  const lowStock = products.filter((product) => product.stock <= product.minimumStock).length;
  const outOfStock = products.filter((product) => product.stock === 0).length;
  const activeProducts = products.filter((product) => product.status === "active").length;

  function openCreate() {
    setForm(productForm(categories[0]?.id ?? 1));
    setFormError("");
  }

  function openEdit(product: Product) {
    setForm(productForm(categories[0]?.id ?? 1, product));
    setFormError("");
  }

  function updateForm<K extends keyof Omit<ProductFormState, "id">>(key: K, value: ProductFormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  function handleImageUpload(file?: File) {
    if (!file) return;
    if (!allowedImageTypes.includes(file.type)) {
      setFormError("Gambar produk hanya boleh JPG, JPEG, atau PNG.");
      return;
    }
    if (file.size > maxImageSize) {
      setFormError("Ukuran gambar maksimal 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormError("");
      updateForm("image", String(reader.result));
    };
    reader.readAsDataURL(file);
  }

  function exportProducts() {
    const categoryLabel =
      categoryId === "all"
        ? "Semua Kategori"
        : categories.find((category) => category.id === Number(categoryId))?.name ?? "Kategori tidak ditemukan";
    const statusLabel = status === "all" ? "Semua Status" : status === "active" ? "Aktif" : "Nonaktif";
    const exportDate = new Date().toLocaleString("id-ID");
    const totalInventoryValue = filteredProducts.reduce(
      (total, product) => total + product.stock * product.purchasePrice,
      0
    );
    const totalSalesValue = filteredProducts.reduce(
      (total, product) => total + product.stock * product.sellingPrice,
      0
    );
    const header = [
      "No",
      "ID Produk",
      "SKU",
      "Barcode",
      "Nama Produk",
      "Kategori",
      "Deskripsi",
      "Satuan",
      "Harga Beli",
      "Harga Jual",
      "Margin",
      "Margin (%)",
      "Stok",
      "Stok Minimum",
      "Status Stok",
      "Status Produk",
      "Info Gambar"
    ];
    const rows = filteredProducts.map((product) => [
      filteredProducts.indexOf(product) + 1,
      product.id,
      product.sku,
      product.barcode ?? "-",
      product.name,
      product.category?.name ?? "-",
      product.description ?? "-",
      product.unit,
      product.purchasePrice,
      product.sellingPrice,
      product.sellingPrice - product.purchasePrice,
      product.purchasePrice > 0
        ? `${(((product.sellingPrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(2)}%`
        : "0%",
      product.stock,
      product.minimumStock,
      stockStatus(product),
      product.status === "active" ? "Aktif" : "Nonaktif",
      productImageInfo(product.image)
    ]);

    const csv = [
      csvRow(["Kasir Lite POS - Export Data Produk"]),
      csvRow(["Copyright", "tumbuhapp.com"]),
      csvRow(["Tanggal Export", exportDate]),
      csvRow(["Filter Pencarian", search || "Semua"]),
      csvRow(["Filter Kategori", categoryLabel]),
      csvRow(["Filter Status", statusLabel]),
      csvRow(["Jumlah Produk", filteredProducts.length]),
      csvRow(["Total Nilai Modal", totalInventoryValue]),
      csvRow(["Total Nilai Jual", totalSalesValue]),
      "",
      csvRow(["Ringkasan"]),
      csvRow(["Produk Aktif", filteredProducts.filter((product) => product.status === "active").length]),
      csvRow(["Produk Nonaktif", filteredProducts.filter((product) => product.status === "inactive").length]),
      csvRow(["Stok Aman", filteredProducts.filter((product) => stockStatus(product) === "Aman").length]),
      csvRow(["Stok Menipis", filteredProducts.filter((product) => stockStatus(product) === "Menipis").length]),
      csvRow(["Stok Habis", filteredProducts.filter((product) => stockStatus(product) === "Habis").length]),
      "",
      csvRow(header),
      ...rows.map(csvRow)
    ].join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `produk-kasir-lite-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    void showSuccess("Export produk berhasil", `${filteredProducts.length} produk diexport ke CSV.`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setFormError("");

    const payload = {
      categoryId: Number(form.categoryId),
      sku: form.sku,
      barcode: form.barcode || null,
      name: form.name,
      description: form.description || null,
      unit: form.unit || "pcs",
      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),
      stock: Number(form.stock),
      minimumStock: Number(form.minimumStock),
      image: form.image || null,
      status: form.status
    };

    try {
      if (form.id) {
        await api.put(`/products/${form.id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setForm(null);
      await showSuccess(form.id ? "Produk diperbarui" : "Produk ditambahkan");
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function deactivateProduct(product: Product) {
    if (!(await confirmAction("Hapus produk?", `${product.name} akan dinonaktifkan dari POS.`))) return;
    try {
      await api.delete(`/products/${product.id}`);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await showSuccess("Produk dihapus", `${product.name} berhasil dinonaktifkan.`);
    } catch (error) {
      await showError("Produk gagal dihapus", getErrorMessage(error));
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard title="Total Produk" value={String(products.length)} subtitle="Semua katalog" icon={PackagePlus} tone="blue" />
        <StatCard title="Produk Aktif" value={String(activeProducts)} subtitle="Muncul di POS" icon={PackagePlus} tone="green" />
        <StatCard title="Stok Menipis" value={String(lowStock)} subtitle="Butuh restock" icon={Filter} tone="orange" />
        <StatCard title="Produk Habis" value={String(outOfStock)} subtitle="Tidak dapat dijual" icon={Trash2} tone="red" />
      </section>

      <section className="mt-6 rounded-lg border border-outline-variant bg-white p-4 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Cari nama produk, SKU, atau barcode..."
            />
          </div>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="rounded-lg border border-outline-variant bg-white px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-outline-variant bg-white px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <button
            type="button"
            onClick={exportProducts}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-3 font-semibold hover:bg-surface-container-low"
          >
            <Download className="h-5 w-5" />
            Export
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-on-primary hover:bg-primary-container"
          >
            <Plus className="h-5 w-5" />
            Tambah Produk
          </button>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-outline-variant bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
              <tr>
                <th className="px-6 py-4 font-bold">Produk</th>
                <th className="px-6 py-4 font-bold">Kategori</th>
                <th className="px-6 py-4 font-bold">Harga Jual</th>
                <th className="px-6 py-4 text-center font-bold">Stok</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredProducts.map((product) => {
                const stockTone = product.stock === 0 ? "red" : product.stock <= product.minimumStock ? "orange" : "green";
                return (
                  <tr key={product.id} className="hover:bg-surface-container-low">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={product.image ?? ""} alt={product.name} className="h-12 w-12 rounded-lg bg-surface-container object-cover" />
                        <div>
                          <p className="font-bold text-on-surface">{product.name}</p>
                          <p className="text-xs text-on-surface-variant">
                            SKU: {product.sku} {product.barcode ? `| Barcode: ${product.barcode}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{product.category?.name ?? "-"}</td>
                    <td className="px-6 py-4 font-bold">{currency(product.sellingPrice)}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge tone={stockTone}>{`${product.stock} ${product.unit}`}</StatusBadge>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge tone={product.status === "active" ? "green" : "gray"}>
                        {product.status === "active" ? "Aktif" : "Nonaktif"}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deactivateProduct(product)}
                          className="rounded-lg p-2 text-on-surface-variant hover:bg-error-container hover:text-error"
                          aria-label={`Nonaktifkan ${product.name}`}
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
          title={form.id ? "Edit Produk" : "Tambah Produk"}
          onClose={() => setForm(null)}
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" className="rounded-lg border border-outline-variant px-4 py-2 font-semibold" onClick={() => setForm(null)}>
                Batal
              </button>
              <button form="product-form" type="submit" disabled={saving} className="rounded-lg bg-primary px-5 py-2 font-bold text-on-primary disabled:opacity-70">
                {saving ? "Menyimpan..." : "Simpan Produk"}
              </button>
            </div>
          }
        >
          <form id="product-form" className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="text-sm font-semibold">
              Nama Produk
              <input required value={form.name} onChange={(event) => updateForm("name", event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2" />
            </label>
            <label className="text-sm font-semibold">
              Kategori
              <select required value={form.categoryId} onChange={(event) => updateForm("categoryId", event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2">
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              SKU
              <input required value={form.sku} onChange={(event) => updateForm("sku", event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2" />
            </label>
            <label className="text-sm font-semibold">
              Barcode
              <input value={form.barcode} onChange={(event) => updateForm("barcode", event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2" placeholder="Scan atau input manual" />
            </label>
            <label className="text-sm font-semibold">
              Harga Beli
              <input type="number" min="0" value={form.purchasePrice} onChange={(event) => updateForm("purchasePrice", event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2" />
            </label>
            <label className="text-sm font-semibold">
              Harga Jual
              <input type="number" min="0" value={form.sellingPrice} onChange={(event) => updateForm("sellingPrice", event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2" />
            </label>
            <label className="text-sm font-semibold">
              Stok
              <input type="number" min="0" value={form.stock} onChange={(event) => updateForm("stock", event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2" />
            </label>
            <label className="text-sm font-semibold">
              Stok Minimum
              <input type="number" min="0" value={form.minimumStock} onChange={(event) => updateForm("minimumStock", event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2" />
            </label>
            <label className="text-sm font-semibold">
              Satuan
              <input value={form.unit} onChange={(event) => updateForm("unit", event.target.value)} className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2" />
            </label>
            <label className="text-sm font-semibold">
              Status
              <select
                value={form.status}
                onChange={(event) => updateForm("status", event.target.value as ProductFormState["status"])}
                className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Upload Gambar Produk
              <input
                accept="image/jpeg,image/png"
                type="file"
                onChange={(event) => handleImageUpload(event.target.files?.[0])}
                className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-fixed file:px-3 file:py-2 file:font-bold file:text-primary"
              />
              <span className="mt-1 block text-xs font-medium text-on-surface-variant">
                Format JPG, JPEG, atau PNG. Maksimal 2 MB.
              </span>
              {form.image ? (
                <img
                  alt="Preview produk"
                  src={form.image}
                  className="mt-3 h-24 w-24 rounded-lg border border-outline-variant object-cover"
                />
              ) : null}
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Deskripsi
              <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border border-outline-variant px-3 py-2" />
            </label>
            {formError ? <p className="rounded-lg bg-error-container px-4 py-3 text-sm font-semibold text-error md:col-span-2">{formError}</p> : null}
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
