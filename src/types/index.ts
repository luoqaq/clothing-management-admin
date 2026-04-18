export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'sales' | 'manager' | 'staff';
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

export interface ProductCategory {
  id: number;
  name: string;
  code: string;
  parentId?: number | null;
}

export interface Supplier {
  id: number;
  name: string;
}

export interface CustomerAgeBucket {
  id: number;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  phone: string;
  name: string;
  email?: string | null;
  ageBucketId?: number | null;
  ageBucket?: CustomerAgeBucket | null;
  firstPaidOrderAt?: string | null;
  lastPaidOrderAt?: string | null;
  paidOrderCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = 'draft' | 'active' | 'inactive';
export type ProductSpecificationStatus = 'active' | 'inactive';

export interface ProductSpecification {
  id: number;
  productId: number;
  skuCode: string;
  barcode?: string | null;
  color: string;
  size: string;
  salePrice: number;
  costPrice?: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  cumulativeInboundQuantity?: number;
  cumulativeCostAmount?: number;
  image?: string | null;
  status: ProductSpecificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductLabelItem {
  skuId: number;
  productId: number;
  productCode: string;
  productName: string;
  barcode: string;
  skuCode: string;
  color: string;
  size: string;
  salePrice: number;
  image?: string | null;
}

export interface ScannedSkuProduct {
  skuId: number;
  productId: number;
  productCode: string;
  productName: string;
  barcode: string;
  skuCode: string;
  color: string;
  size: string;
  salePrice: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  status: ProductSpecificationStatus;
  productStatus: ProductStatus;
  image?: string | null;
}

export interface Product {
  id: number;
  productCode: string;
  name: string;
  description?: string | null;
  categoryId: number;
  supplierId?: number | null;
  category?: ProductCategory;
  supplier?: Supplier | null;
  mainImages: string[];
  detailImages: string[];
  tags: string[];
  status: ProductStatus;
  specifications: ProductSpecification[];
  specCount: number;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  minPrice: number;
  maxPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface SalesUser {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'sales';
  createdAt: string;
}

export type ImportSourceType = 'excel' | 'image';
export type ImportIssueLevel = 'error' | 'warning';

export interface ImportDraftSpecification {
  rowKey: string;
  barcode?: string | null;
  color: string;
  size: string;
  salePrice: number;
  costPrice: number;
  stock: number;
  status: ProductSpecificationStatus;
}

export interface ImportDraftProduct {
  rowKey: string;
  source: ImportSourceType;
  productCode: string;
  name: string;
  description?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  supplierId?: number | null;
  supplierName?: string | null;
  tags: string[];
  status: ProductStatus;
  specifications: ImportDraftSpecification[];
}

export interface ImportIssue {
  level: ImportIssueLevel;
  rowKey: string;
  field: string;
  message: string;
  specRowKey?: string;
}

export interface ImportParseResult {
  drafts: ImportDraftProduct[];
  issues: ImportIssue[];
}

export interface BulkImportResultItem {
  rowKey: string;
  productCode: string;
  status: 'success' | 'failed';
  message: string;
  productId?: number;
}

export interface BulkImportResult {
  successCount: number;
  failureCount: number;
  results: BulkImportResultItem[];
}

export interface ExcelImportPayload {
  fileName: string;
  headers: string[];
  rows: Array<Record<string, string | number | boolean | null>>;
}

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  supplierId?: number;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductState {
  items: Product[];
  currentProduct: Product | null;
  categories: ProductCategory[];
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  filters: ProductFilters;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  id: number;
  productId: number;
  skuId: number;
  productName: string;
  skuCode: string;
  image?: string | null;
  price: number;
  soldPrice?: number;
  costPriceSnapshot?: number;
  quantity: number;
  color?: string | null;
  size?: string | null;
}

export interface OrderAddress {
  name?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  detail?: string;
  postalCode?: string;
}

export interface Order {
  id: number;
  orderNo: string;
  customerId?: number | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  ageBucketId?: number | null;
  items: OrderItem[];
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  status: OrderStatus;
  address?: OrderAddress | null;
  note?: string;
  paymentMethod?: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  shippingCompany?: string | null;
  trackingNumber?: string | null;
  cancelReason?: string | null;
  refundReason?: string | null;
  paidAt?: string;
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
  sortBy?: 'createdAt';
  sortOrder?: 'asc' | 'desc';
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

export interface DailySalesData {
  date: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  orders: number;
  customers: number;
}

export interface ProductSalesRanking {
  productId: number;
  productCode: string;
  productName: string;
  image?: string | null;
  quantity: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  grossMargin: number;
}

export interface CostProductRankingItem {
  productId: number;
  skuId: number;
  productCode: string;
  skuCode: string;
  productName: string;
  color: string;
  size: string;
  image?: string | null;
  stock: number;
  costPrice: number;
  totalCost: number;
  cumulativeInboundQuantity?: number;
}

export interface CategorySalesData {
  categoryId: number;
  categoryName: string;
  revenue: number;
  cost: number;
  orders: number;
  quantity: number;
  grossProfit: number;
  grossMargin: number;
  revenuePercentage: number;
  costPercentage: number;
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
  cost: number;
  orders: number;
  revenuePercentage: number;
  costPercentage: number;
}

export interface SalesOverviewResponse {
  totalRevenue: number;
  totalCost: number;
  totalGrossProfit: number;
  totalOrders: number;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  avgOrderValue: number;
  avgCostPerOrder: number;
  revenueGrowth: number;
  costGrowth: number;
  grossProfitGrowth: number;
  ordersGrowth: number;
}

export interface CustomerAnalysisResponse {
  customerCount: number;
  newCustomers: number;
  returningCustomers: number;
  ageDistribution: Array<{
    ageBucketId?: number | null;
    ageBucketName: string;
    customerCount: number;
    percentage: number;
  }>;
}

export interface CostOverviewResponse {
  totalCost: number;
}

export interface StatisticsState {
  salesData: DailySalesData[];
  salesProductRanking: ProductSalesRanking[];
  grossProfitAnalysis: ProductSalesRanking[];
  salesCategoryAnalysis: CategorySalesData[];
  customerAnalysis: CustomerAnalysisResponse | null;
  costOverview: CostOverviewResponse | null;
  costCategoryAnalysis: CategorySalesData[];
  costProductRanking: CostProductRankingItem[];
  brandSales: BrandSalesData[];
  regionSales: RegionSalesData[];
  summary: SalesOverviewResponse | null;
  loading: boolean;
  error: string | null;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export type UploadAssetBiz = 'product' | 'brand' | 'avatar';
export type UploadAssetScene = 'main' | 'detail' | 'spec' | 'logo' | 'avatar';

export interface UploadPolicyRequest {
  biz: UploadAssetBiz;
  scene: UploadAssetScene;
  fileName: string;
  contentType: string;
  size: number;
}

export interface UploadPolicy {
  bucket: string;
  region: string;
  key: string;
  url: string;
  startTime: number;
  expiredTime: number;
  credentials: {
    tmpSecretId: string;
    tmpSecretKey: string;
    sessionToken: string;
  };
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}
