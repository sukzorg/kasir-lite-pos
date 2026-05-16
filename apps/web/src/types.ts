export type Category = {
  id: number;
  name: string;
  color: string;
  status: "active" | "inactive";
  sortOrder?: number;
  _count?: {
    products: number;
  };
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  username?: string;
  phone?: string | null;
  status?: "active" | "inactive";
  role: {
    id?: number;
    name: string;
    permissions: string[];
  };
};

export type Role = {
  id: number;
  name: string;
  description?: string | null;
};

export type UserAccount = {
  id: number;
  name: string;
  email: string;
  username: string;
  phone?: string | null;
  status: "active" | "inactive";
  role: Role;
};

export type Product = {
  id: number;
  categoryId: number;
  category?: Category;
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minimumStock: number;
  image?: string | null;
  status: "active" | "inactive";
};

export type Customer = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  status?: "regular" | "member" | "inactive";
  points?: number;
  totalPurchase?: number;
  loyaltyPoints?: number;
  createdAt?: string;
};

export type Supplier = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  warehouse?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt?: string;
};

export type SaleItem = {
  id?: number;
  productId: number;
  productName: string;
  qty: number;
  price: number;
  discountAmount: number;
  subtotal: number;
};

export type Sale = {
  id: number;
  storeId?: number;
  transactionNumber: string;
  customer?: Customer | null;
  cashier?: {
    id: number;
    name: string;
  };
  subtotal: number;
  discountAmount: number;
  pointDiscountAmount?: number;
  redeemedPoints?: number;
  earnedPoints?: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  status: "completed" | "cancelled" | "refunded";
  notes?: string | null;
  items: SaleItem[];
  createdAt: string;
};

export type StockMovement = {
  id: number;
  storeId?: number;
  productId: number;
  type: "IN" | "OUT" | "ADJUSTMENT" | "RETURN" | "DAMAGE";
  qty: number;
  beforeStock: number;
  afterStock: number;
  referenceType?: string | null;
  referenceId?: number | null;
  notes?: string | null;
  createdAt: string;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  user?: {
    id: number;
    name: string;
  } | null;
};

export type StoreSetting = {
  id?: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logo?: string | null;
  currency: string;
  taxRate: number;
  receiptFooter?: string | null;
};

export type LoyaltyRule = {
  id: number;
  minimumSpend: number;
  pointsAwarded: number;
  pointValue: number;
};

export type DashboardSummary = {
  metrics: {
    todayRevenue: number;
    todayTransactions: number;
    productsCount: number;
    customersCount: number;
  };
  salesTrend: Array<{ label: string; total: number }>;
  categories: Array<{ name: string; color: string; total: number }>;
  topProducts: Array<{ name: string; qty: number; total: number }>;
  recentSales: Sale[];
  lowStock: Product[];
};

export type SalesReport = {
  totals: {
    revenue: number;
    discount: number;
    tax: number;
    transactions: number;
  };
  paymentMethods: Array<{ method: string; total: number }>;
  categories: Array<{ name: string; color: string; total: number }>;
  topProducts: Array<{ name: string; qty: number; total: number }>;
  transactions: Sale[];
};

export type InventoryReport = {
  summary: {
    totalProducts: number;
    lowStock: number;
    outOfStock: number;
  };
  products: Product[];
};
