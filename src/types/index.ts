// 用户相关类型
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// 商品相关类型
export interface ProductCategory {
  id: number;
  name: string;
  code: string;
  parentId?: number;
}

export interface ProductBrand {
  id: number;
  name: string;
  logo?: string;
}

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  category?: ProductCategory;
  price: number;
  costPrice: number;
  stock: number;
  images: string[];
  size: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  size?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductState {
  items: Product[];
  currentProduct: Product | null;
  categories: ProductCategory[];
  brands: ProductBrand[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  filters: ProductFilters;
}

// 订单相关类型
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  image?: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  postalCode?: string;
}

export interface Order {
  id: number;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  status: OrderStatus;
  address: OrderAddress;
  note?: string;
  paymentMethod?: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderState {
  items: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  filters: OrderFilters;
}

// 统计相关类型
export interface DailySalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface ProductSalesRanking {
  productId: number;
  productName: string;
  sku: string;
  image?: string;
  quantity: number;
  revenue: number;
}

export interface CategorySalesData {
  categoryId: number;
  categoryName: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface BrandSalesData {
  brandId: number;
  brandName: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface RegionSalesData {
  region: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface StatisticsState {
  salesData: DailySalesData[];
  productRankings: ProductSalesRanking[];
  categorySales: CategorySalesData[];
  brandSales: BrandSalesData[];
  regionSales: RegionSalesData[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    avgOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
  } | null;
  loading: boolean;
  error: string | null;
  dateRange: {
    start: string;
    end: string;
  };
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 通用状态类型
export interface LoadingState {
  loading: boolean;
  error: string | null;
}
