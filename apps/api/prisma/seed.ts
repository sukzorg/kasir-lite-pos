import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ override: true });

const prisma = new PrismaClient();
const seedAdminEmail = process.env.SEED_ADMIN_EMAIL ?? "owner@kasirlite.local";
const seedAdminUsername = process.env.SEED_ADMIN_USERNAME ?? "owner";
const seedAdminPassword =
  process.env.SEED_ADMIN_PASSWORD ?? (process.env.NODE_ENV === "production" ? "" : "local-dev-only-password");

if (!seedAdminPassword || seedAdminPassword.length < 12) {
  throw new Error("SEED_ADMIN_PASSWORD wajib diisi minimal 12 karakter sebelum menjalankan seed.");
}

const productImages = {
  water:
    "https://images.unsplash.com/photo-1616118132534-381148898bb4?auto=format&fit=crop&w=500&q=80",
  sugar:
    "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=500&q=80",
  oil:
    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80",
  soap:
    "https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=500&q=80",
  coffee:
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=500&q=80",
  notebook:
    "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=500&q=80"
};

async function main() {
  const permissionData = [
    ["dashboard.read", "Lihat Dashboard", "dashboard"],
    ["products.manage", "Kelola Produk", "products"],
    ["inventory.manage", "Kelola Stok", "inventory"],
    ["sales.create", "Buat Transaksi", "sales"],
    ["reports.read", "Lihat Laporan", "reports"],
    ["settings.manage", "Kelola Pengaturan", "settings"],
    ["master-data.manage", "Kelola Master Data", "master-data"],
    ["users.manage", "Kelola User", "users"]
  ];

  const permissions = [];
  for (const [code, name, module] of permissionData) {
    permissions.push(
      await prisma.permission.upsert({
        where: { code },
        update: { name, module },
        create: { code, name, module }
      })
    );
  }

  const ownerRole = await prisma.role.upsert({
    where: { name: "Owner" },
    update: { description: "Akses penuh untuk pemilik toko." },
    create: { name: "Owner", description: "Akses penuh untuk pemilik toko." }
  });

  await prisma.role.upsert({
    where: { name: "Kasir" },
    update: { description: "Akses transaksi dan pelanggan terbatas." },
    create: { name: "Kasir", description: "Akses transaksi dan pelanggan terbatas." }
  });

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: ownerRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: ownerRole.id,
        permissionId: permission.id
      }
    });
  }

  const passwordHash = await bcrypt.hash(seedAdminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: seedAdminEmail },
    update: {
      name: "Admin Utama",
      username: seedAdminUsername,
      passwordHash,
      status: "active",
      roleId: ownerRole.id
    },
    create: {
      name: "Admin Utama",
      email: seedAdminEmail,
      username: seedAdminUsername,
      passwordHash,
      phone: "081234567890",
      status: "active",
      roleId: ownerRole.id
    }
  });

  await prisma.store.upsert({
    where: { id: 1 },
    update: {
      name: "Toko Sejahtera",
      address: "Jl. Sudirman No. 88, Jakarta",
      phone: "081234567890",
      email: "halo@tokosejahtera.test",
      currency: "IDR",
      taxRate: 11,
      receiptFooter: "Terima kasih sudah berbelanja."
    },
    create: {
      id: 1,
      name: "Toko Sejahtera",
      address: "Jl. Sudirman No. 88, Jakarta",
      phone: "081234567890",
      email: "halo@tokosejahtera.test",
      currency: "IDR",
      taxRate: 11,
      receiptFooter: "Terima kasih sudah berbelanja."
    }
  });

  const categories = await Promise.all(
    [
      ["Makanan & Minuman", "#005bbf", 1],
      ["Kebutuhan Harian", "#c55500", 2],
      ["Peralatan Rumah", "#5c5f60", 3],
      ["Alat Tulis", "#16a34a", 4]
    ].map(([name, color, sortOrder]) =>
      prisma.category.upsert({
        where: { name: String(name) },
        update: { color: String(color), sortOrder: Number(sortOrder), status: "active" },
        create: { name: String(name), color: String(color), sortOrder: Number(sortOrder) }
      })
    )
  );

  const categoryByName = Object.fromEntries(categories.map((category) => [category.name, category]));
  const products = [
    {
      categoryId: categoryByName["Makanan & Minuman"].id,
      sku: "AM-001",
      barcode: "8991000000011",
      name: "Air Mineral 600ml",
      unit: "botol",
      purchasePrice: 3000,
      sellingPrice: 5000,
      stock: 42,
      minimumStock: 10,
      image: productImages.water
    },
    {
      categoryId: categoryByName["Kebutuhan Harian"].id,
      sku: "GP-002",
      barcode: "8991000000028",
      name: "Gula Pasir 1kg",
      unit: "pack",
      purchasePrice: 13000,
      sellingPrice: 16500,
      stock: 5,
      minimumStock: 12,
      image: productImages.sugar
    },
    {
      categoryId: categoryByName["Kebutuhan Harian"].id,
      sku: "MG-003",
      barcode: "8991000000035",
      name: "Minyak Goreng 2L",
      unit: "pcs",
      purchasePrice: 29500,
      sellingPrice: 34000,
      stock: 8,
      minimumStock: 10,
      image: productImages.oil
    },
    {
      categoryId: categoryByName["Peralatan Rumah"].id,
      sku: "SM-004",
      barcode: "8991000000042",
      name: "Sabun Mandi Cair 450ml",
      unit: "botol",
      purchasePrice: 17000,
      sellingPrice: 22500,
      stock: 56,
      minimumStock: 15,
      image: productImages.soap
    },
    {
      categoryId: categoryByName["Makanan & Minuman"].id,
      sku: "KA-005",
      barcode: "8991000000059",
      name: "Kopi Arabika 250g",
      unit: "pack",
      purchasePrice: 32000,
      sellingPrice: 45000,
      stock: 24,
      minimumStock: 8,
      image: productImages.coffee
    },
    {
      categoryId: categoryByName["Alat Tulis"].id,
      sku: "NB-006",
      barcode: "8991000000066",
      name: "Notebook A5 Pastel",
      unit: "pcs",
      purchasePrice: 16000,
      sellingPrice: 25000,
      stock: 50,
      minimumStock: 10,
      image: productImages.notebook
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product
    });
  }

  const customers = [
    {
      name: "Andi Wijaya",
      phone: "081234567890",
      email: "andi@example.test",
      notes: "Pelanggan VIP sejak awal tahun.",
      points: 1245
    },
    {
      name: "Siti Nurhaliza",
      phone: "085698765432",
      email: "siti@example.test",
      notes: "Sering membeli kebutuhan harian.",
      points: 420
    },
    {
      name: "Budi Santoso",
      phone: "082144556677",
      email: "budi@example.test",
      notes: "Top spender bulan ini.",
      points: 2280
    }
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { phone: customer.phone },
      update: { ...customer, status: "member" },
      create: { ...customer, status: "member" }
    });
  }

  const suppliers = [
    {
      id: 1,
      name: "CV Sumber Sembako",
      phone: "02177881122",
      email: "sales@sumbersembako.test",
      warehouse: "Gudang Utama",
      address: "Jl. Pasar Induk No. 12, Jakarta",
      notes: "Pengiriman Senin dan Kamis."
    },
    {
      id: 2,
      name: "PT Harian Retailindo",
      phone: "081322004400",
      email: "order@retailindo.test",
      warehouse: "Gudang Blok B3",
      address: "Gudang Blok B3, Tangerang",
      notes: "Minimum order 5 karton."
    },
    {
      id: 3,
      name: "Toko ATK Makmur",
      phone: "087866552211",
      email: "atkmakmur@example.test",
      warehouse: "Gudang Bekasi",
      address: "Jl. Melati No. 7, Bekasi",
      notes: "Supplier alat tulis dan kemasan."
    }
  ];

  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { id: supplier.id },
      update: supplier,
      create: supplier
    });
  }

  await prisma.loyaltyRule.upsert({
    where: { id: 1 },
    update: {
      minimumSpend: 100000,
      pointsAwarded: 1000,
      pointValue: 1
    },
    create: {
      id: 1,
      minimumSpend: 100000,
      pointsAwarded: 1000,
      pointValue: 1
    }
  });

  await prisma.auditLog.create({
    data: {
      storeId: 1,
      userId: admin.id,
      action: "seed",
      module: "system",
      newData: { message: "Initial Kasir Lite POS seed data" }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
