import type {
  Category,
  Customer,
  DashboardSummary,
  InventoryReport,
  Product,
  Sale,
  SalesReport,
  StockMovement,
  Supplier
} from "../types";

export const fallbackCategories: Category[] = [
  { id: 1, name: "Makanan & Minuman", color: "#005bbf", status: "active", sortOrder: 1 },
  { id: 2, name: "Kebutuhan Harian", color: "#c55500", status: "active", sortOrder: 2 },
  { id: 3, name: "Peralatan Rumah", color: "#5c5f60", status: "active", sortOrder: 3 },
  { id: 4, name: "Alat Tulis", color: "#16a34a", status: "active", sortOrder: 4 }
];

export const fallbackProducts: Product[] = [
  {
    id: 1,
    categoryId: 1,
    category: fallbackCategories[0],
    sku: "AM-001",
    barcode: "8991000000011",
    name: "Air Mineral 600ml",
    unit: "botol",
    purchasePrice: 3000,
    sellingPrice: 5000,
    stock: 42,
    minimumStock: 10,
    image: "https://images.unsplash.com/photo-1616118132534-381148898bb4?auto=format&fit=crop&w=500&q=80",
    status: "active"
  },
  {
    id: 2,
    categoryId: 2,
    category: fallbackCategories[1],
    sku: "GP-002",
    barcode: "8991000000028",
    name: "Gula Pasir 1kg",
    unit: "pack",
    purchasePrice: 13000,
    sellingPrice: 16500,
    stock: 5,
    minimumStock: 12,
    image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=500&q=80",
    status: "active"
  },
  {
    id: 3,
    categoryId: 2,
    category: fallbackCategories[1],
    sku: "MG-003",
    barcode: "8991000000035",
    name: "Minyak Goreng 2L",
    unit: "pcs",
    purchasePrice: 29500,
    sellingPrice: 34000,
    stock: 8,
    minimumStock: 10,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80",
    status: "active"
  },
  {
    id: 4,
    categoryId: 3,
    category: fallbackCategories[2],
    sku: "SM-004",
    barcode: "8991000000042",
    name: "Sabun Mandi Cair 450ml",
    unit: "botol",
    purchasePrice: 17000,
    sellingPrice: 22500,
    stock: 56,
    minimumStock: 15,
    image: "https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=500&q=80",
    status: "active"
  },
  {
    id: 5,
    categoryId: 1,
    category: fallbackCategories[0],
    sku: "KA-005",
    barcode: "8991000000059",
    name: "Kopi Arabika 250g",
    unit: "pack",
    purchasePrice: 32000,
    sellingPrice: 45000,
    stock: 24,
    minimumStock: 8,
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=500&q=80",
    status: "active"
  },
  {
    id: 6,
    categoryId: 4,
    category: fallbackCategories[3],
    sku: "NB-006",
    barcode: "8991000000066",
    name: "Notebook A5 Pastel",
    unit: "pcs",
    purchasePrice: 16000,
    sellingPrice: 25000,
    stock: 50,
    minimumStock: 10,
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=500&q=80",
    status: "active"
  }
];

export const fallbackCustomers: Customer[] = [
  {
    id: 1,
    name: "Andi Wijaya",
    phone: "081234567890",
    email: "andi@example.test",
    notes: "Pelanggan VIP sejak awal tahun.",
    status: "member",
    points: 1245,
    totalPurchase: 12450000,
    loyaltyPoints: 1245,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    phone: "085698765432",
    email: "siti@example.test",
    notes: "Sering membeli kebutuhan harian.",
    status: "member",
    points: 420,
    totalPurchase: 4200000,
    loyaltyPoints: 420,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Budi Santoso",
    phone: "082144556677",
    email: "budi@example.test",
    notes: "Top spender bulan ini.",
    status: "member",
    points: 2280,
    totalPurchase: 22800000,
    loyaltyPoints: 2280,
    createdAt: new Date().toISOString()
  }
];

export const fallbackSuppliers: Supplier[] = [
  {
    id: 1,
    name: "CV Sumber Sembako",
    phone: "02177881122",
    email: "sales@sumbersembako.test",
    warehouse: "Gudang Utama",
    address: "Jl. Pasar Induk No. 12, Jakarta",
    notes: "Pengiriman Senin dan Kamis.",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "PT Harian Retailindo",
    phone: "081322004400",
    email: "order@retailindo.test",
    warehouse: "Gudang Blok B3",
    address: "Gudang Blok B3, Tangerang",
    notes: "Minimum order 5 karton.",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Toko ATK Makmur",
    phone: "087866552211",
    email: "atkmakmur@example.test",
    warehouse: "Gudang Bekasi",
    address: "Jl. Melati No. 7, Bekasi",
    notes: "Supplier alat tulis dan kemasan.",
    createdAt: new Date().toISOString()
  }
];

export const fallbackSales: Sale[] = [
  {
    id: 1,
    transactionNumber: "TRX-20260513-0001",
    customer: fallbackCustomers[0],
    cashier: { id: 1, name: "Admin Utama" },
    subtotal: 102500,
    discountAmount: 0,
    pointDiscountAmount: 0,
    redeemedPoints: 0,
    earnedPoints: 1000,
    taxAmount: 11275,
    grandTotal: 113775,
    paidAmount: 120000,
    changeAmount: 6225,
    paymentMethod: "cash",
    status: "completed",
    createdAt: new Date().toISOString(),
    items: [
      {
        productId: 1,
        productName: "Air Mineral 600ml",
        qty: 2,
        price: 5000,
        discountAmount: 0,
        subtotal: 10000
      },
      {
        productId: 5,
        productName: "Kopi Arabika 250g",
        qty: 2,
        price: 45000,
        discountAmount: 0,
        subtotal: 90000
      }
    ]
  },
  {
    id: 2,
    transactionNumber: "TRX-20260513-0002",
    customer: fallbackCustomers[1],
    cashier: { id: 1, name: "Admin Utama" },
    subtotal: 56500,
    discountAmount: 2500,
    pointDiscountAmount: 0,
    redeemedPoints: 0,
    earnedPoints: 0,
    taxAmount: 5940,
    grandTotal: 59940,
    paidAmount: 60000,
    changeAmount: 60,
    paymentMethod: "qris",
    status: "completed",
    createdAt: new Date().toISOString(),
    items: [
      {
        productId: 2,
        productName: "Gula Pasir 1kg",
        qty: 1,
        price: 16500,
        discountAmount: 0,
        subtotal: 16500
      },
      {
        productId: 6,
        productName: "Notebook A5 Pastel",
        qty: 2,
        price: 25000,
        discountAmount: 2500,
        subtotal: 47500
      }
    ]
  }
];

export const fallbackDashboard: DashboardSummary = {
  metrics: {
    todayRevenue: fallbackSales.reduce((total, sale) => total + sale.grandTotal, 0),
    todayTransactions: fallbackSales.length,
    productsCount: fallbackProducts.length,
    customersCount: fallbackCustomers.length
  },
  salesTrend: [
    { label: "Kam", total: 520000 },
    { label: "Jum", total: 710000 },
    { label: "Sab", total: 920000 },
    { label: "Min", total: 650000 },
    { label: "Sen", total: 840000 },
    { label: "Sel", total: 760000 },
    { label: "Rab", total: 980000 }
  ],
  categories: [
    { name: "Makanan & Minuman", color: "#005bbf", total: 1560000 },
    { name: "Kebutuhan Harian", color: "#c55500", total: 980000 },
    { name: "Alat Tulis", color: "#16a34a", total: 620000 }
  ],
  topProducts: [
    { name: "Air Mineral 600ml", qty: 64, total: 320000 },
    { name: "Kopi Arabika 250g", qty: 28, total: 1260000 },
    { name: "Notebook A5 Pastel", qty: 24, total: 600000 },
    { name: "Gula Pasir 1kg", qty: 21, total: 346500 }
  ],
  recentSales: fallbackSales,
  lowStock: fallbackProducts.filter((product) => product.stock <= product.minimumStock)
};

export const fallbackInventoryReport: InventoryReport = {
  summary: {
    totalProducts: fallbackProducts.length,
    lowStock: fallbackProducts.filter((product) => product.stock <= product.minimumStock).length,
    outOfStock: fallbackProducts.filter((product) => product.stock === 0).length
  },
  products: fallbackProducts
};

export const fallbackSalesReport: SalesReport = {
  totals: {
    revenue: fallbackSales.reduce((total, sale) => total + sale.grandTotal, 0),
    discount: fallbackSales.reduce((total, sale) => total + sale.discountAmount, 0),
    tax: fallbackSales.reduce((total, sale) => total + sale.taxAmount, 0),
    transactions: fallbackSales.length
  },
  paymentMethods: [
    { method: "cash", total: 113775 },
    { method: "qris", total: 59940 }
  ],
  categories: fallbackDashboard.categories,
  topProducts: fallbackDashboard.topProducts,
  transactions: fallbackSales
};

export const fallbackMovements: StockMovement[] = fallbackProducts.slice(0, 4).map((product, index) => ({
  id: index + 1,
  productId: product.id,
  product: { id: product.id, name: product.name, sku: product.sku },
  type: index === 0 ? "OUT" : index === 1 ? "ADJUSTMENT" : "IN",
  qty: index === 1 ? -2 : 6 + index,
  beforeStock: product.stock + 5,
  afterStock: product.stock,
  referenceType: index === 0 ? "sales" : "manual",
  notes: index === 1 ? "Koreksi stok opname" : "Data contoh operasional",
  createdAt: new Date().toISOString(),
  user: { id: 1, name: "Admin Utama" }
}));
