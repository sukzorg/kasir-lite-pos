import type {
  Category,
  Customer,
  DashboardSummary,
  Product,
  Sale,
  SalesReport,
  StoreSetting
} from "../types";

export const productImages = {
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

export const mockCategories: Category[] = [
  { id: 1, name: "Makanan & Minuman", color: "#005bbf", status: "active", sortOrder: 1 },
  { id: 2, name: "Kebutuhan Harian", color: "#c55500", status: "active", sortOrder: 2 },
  { id: 3, name: "Peralatan Rumah", color: "#5c5f60", status: "active", sortOrder: 3 },
  { id: 4, name: "Alat Tulis", color: "#16a34a", status: "active", sortOrder: 4 }
];

export const mockProducts: Product[] = [
  {
    id: 1,
    categoryId: 1,
    category: mockCategories[0],
    sku: "AM-001",
    barcode: "8991000000011",
    name: "Air Mineral 600ml",
    unit: "botol",
    purchasePrice: 3000,
    sellingPrice: 5000,
    stock: 42,
    minimumStock: 10,
    image: productImages.water,
    status: "active"
  },
  {
    id: 2,
    categoryId: 2,
    category: mockCategories[1],
    sku: "GP-002",
    barcode: "8991000000028",
    name: "Gula Pasir 1kg",
    unit: "pack",
    purchasePrice: 13000,
    sellingPrice: 16500,
    stock: 5,
    minimumStock: 12,
    image: productImages.sugar,
    status: "active"
  },
  {
    id: 3,
    categoryId: 2,
    category: mockCategories[1],
    sku: "MG-003",
    barcode: "8991000000035",
    name: "Minyak Goreng 2L",
    unit: "pcs",
    purchasePrice: 29500,
    sellingPrice: 34000,
    stock: 8,
    minimumStock: 10,
    image: productImages.oil,
    status: "active"
  },
  {
    id: 4,
    categoryId: 3,
    category: mockCategories[2],
    sku: "SM-004",
    barcode: "8991000000042",
    name: "Sabun Mandi Cair 450ml",
    unit: "botol",
    purchasePrice: 17000,
    sellingPrice: 22500,
    stock: 56,
    minimumStock: 15,
    image: productImages.soap,
    status: "active"
  },
  {
    id: 5,
    categoryId: 1,
    category: mockCategories[0],
    sku: "KA-005",
    barcode: "8991000000059",
    name: "Kopi Arabika 250g",
    unit: "pack",
    purchasePrice: 32000,
    sellingPrice: 45000,
    stock: 24,
    minimumStock: 8,
    image: productImages.coffee,
    status: "active"
  },
  {
    id: 6,
    categoryId: 4,
    category: mockCategories[3],
    sku: "NB-006",
    barcode: "8991000000066",
    name: "Notebook A5 Pastel",
    unit: "pcs",
    purchasePrice: 16000,
    sellingPrice: 25000,
    stock: 50,
    minimumStock: 10,
    image: productImages.notebook,
    status: "active"
  }
];

export const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Andi Wijaya",
    phone: "0812-3456-7890",
    email: "andi@example.test",
    status: "member",
    points: 2450,
    totalPurchase: 12450000,
    loyaltyPoints: 2450,
    createdAt: "2026-01-12T08:00:00.000Z"
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    phone: "0856-9876-5432",
    email: "siti@example.test",
    status: "member",
    points: 840,
    totalPurchase: 4200000,
    loyaltyPoints: 840,
    createdAt: "2026-02-05T08:00:00.000Z"
  },
  {
    id: 3,
    name: "Budi Santoso",
    phone: "0821-4455-6677",
    email: "budi@example.test",
    status: "member",
    points: 4560,
    totalPurchase: 22800000,
    loyaltyPoints: 4560,
    createdAt: "2025-12-28T08:00:00.000Z"
  },
  {
    id: 4,
    name: "Rina Marlina",
    phone: "0877-1122-3344",
    email: "rina@example.test",
    status: "regular",
    points: 170,
    totalPurchase: 850000,
    loyaltyPoints: 170,
    createdAt: "2026-03-15T08:00:00.000Z"
  }
];

export const mockSales: Sale[] = [
  {
    id: 1,
    transactionNumber: "TRX-20260513-0001",
    customer: mockCustomers[0],
    cashier: { id: 1, name: "Admin Utama" },
    subtotal: 37500,
    discountAmount: 0,
    pointDiscountAmount: 0,
    redeemedPoints: 0,
    earnedPoints: 0,
    taxAmount: 4125,
    grandTotal: 41625,
    paidAmount: 50000,
    changeAmount: 8375,
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
        productId: 3,
        productName: "Minyak Goreng 2L",
        qty: 1,
        price: 34000,
        discountAmount: 6500,
        subtotal: 27500
      }
    ]
  },
  {
    id: 2,
    transactionNumber: "TRX-20260513-0002",
    customer: mockCustomers[1],
    cashier: { id: 1, name: "Admin Utama" },
    subtotal: 70000,
    discountAmount: 0,
    pointDiscountAmount: 0,
    redeemedPoints: 0,
    earnedPoints: 0,
    taxAmount: 7700,
    grandTotal: 77700,
    paidAmount: 80000,
    changeAmount: 2300,
    paymentMethod: "qris",
    status: "completed",
    createdAt: new Date().toISOString(),
    items: [
      {
        productId: 5,
        productName: "Kopi Arabika 250g",
        qty: 1,
        price: 45000,
        discountAmount: 0,
        subtotal: 45000
      },
      {
        productId: 6,
        productName: "Notebook A5 Pastel",
        qty: 1,
        price: 25000,
        discountAmount: 0,
        subtotal: 25000
      }
    ]
  },
  {
    id: 3,
    transactionNumber: "TRX-20260513-0003",
    customer: null,
    cashier: { id: 1, name: "Admin Utama" },
    subtotal: 49500,
    discountAmount: 0,
    pointDiscountAmount: 0,
    redeemedPoints: 0,
    earnedPoints: 0,
    taxAmount: 5445,
    grandTotal: 54945,
    paidAmount: 55000,
    changeAmount: 55,
    paymentMethod: "cash",
    status: "completed",
    createdAt: new Date().toISOString(),
    items: [
      {
        productId: 2,
        productName: "Gula Pasir 1kg",
        qty: 3,
        price: 16500,
        discountAmount: 0,
        subtotal: 49500
      }
    ]
  }
];

export const mockStore: StoreSetting = {
  name: "Toko Sejahtera",
  address: "Jl. Sudirman No. 88, Jakarta",
  phone: "081234567890",
  email: "halo@tokosejahtera.test",
  currency: "IDR",
  taxRate: 11,
  receiptFooter: "Terima kasih sudah berbelanja."
};

export const mockDashboard: DashboardSummary = {
  metrics: {
    todayRevenue: mockSales.reduce((total, sale) => total + sale.grandTotal, 0),
    todayTransactions: mockSales.length,
    productsCount: mockProducts.length,
    customersCount: mockCustomers.length
  },
  salesTrend: [
    { label: "Kam", total: 2800000 },
    { label: "Jum", total: 3200000 },
    { label: "Sab", total: 3900000 },
    { label: "Min", total: 2500000 },
    { label: "Sen", total: 4100000 },
    { label: "Sel", total: 3600000 },
    { label: "Rab", total: 4750000 }
  ],
  categories: [
    { name: "Makanan & Minuman", color: "#005bbf", total: 12400000 },
    { name: "Kebutuhan Harian", color: "#c55500", total: 8200000 },
    { name: "Alat Tulis", color: "#16a34a", total: 4200000 }
  ],
  topProducts: [
    { name: "Air Mineral 600ml", qty: 86, total: 430000 },
    { name: "Gula Pasir 1kg", qty: 52, total: 858000 },
    { name: "Kopi Arabika 250g", qty: 31, total: 1395000 }
  ],
  recentSales: mockSales,
  lowStock: mockProducts.filter((product) => product.stock <= product.minimumStock)
};

export const mockSalesReport: SalesReport = {
  totals: {
    revenue: 48250000,
    discount: 1725000,
    tax: 4770000,
    transactions: 1284
  },
  paymentMethods: [
    { method: "cash", total: 21500000 },
    { method: "qris", total: 16800000 },
    { method: "transfer", total: 6100000 },
    { method: "card", total: 3850000 }
  ],
  categories: mockDashboard.categories,
  topProducts: mockDashboard.topProducts,
  transactions: mockSales
};
