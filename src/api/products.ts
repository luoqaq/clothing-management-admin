import { api } from './index';
import type {
  Product,
  ProductCategory,
  ProductBrand,
  PaginatedResponse,
  ProductFilters,
} from '../types';
import { normalizeProduct } from '../utils/normalize';

export const productsApi = {
  // 获取商品列表
  getProducts: async (params?: { page?: number; pageSize?: number; filters?: ProductFilters }) => {
    const query = {
      page: params?.page,
      pageSize: params?.pageSize,
      ...(params?.filters || {}),
    };
    const response = await api.get<PaginatedResponse<Product>>('/products', { params: query });

    if (response.success && response.data) {
      return {
        ...response,
        data: {
          ...response.data,
          items: response.data.items.map(normalizeProduct),
        },
      };
    }

    return response;
  },

  // 获取商品详情
  getProduct: async (id: number) => {
    const response = await api.get<Product>(`/products/${id}`);

    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeProduct(response.data),
      };
    }

    return response;
  },

  // 创建商品
  createProduct: async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<Product>('/products', data);

    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeProduct(response.data),
      };
    }

    return response;
  },

  // 更新商品
  updateProduct: async (id: number, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const response = await api.put<Product>(`/products/${id}`, data);

    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeProduct(response.data),
      };
    }

    return response;
  },

  // 删除商品
  deleteProduct: async (id: number) => {
    return api.delete(`/products/${id}`);
  },

  // 获取分类列表
  getCategories: async () => {
    return api.get<ProductCategory[]>('/products/categories');
  },

  // 创建分类
  createCategory: async (data: Omit<ProductCategory, 'id'>) => {
    return api.post<ProductCategory>('/products/categories', data);
  },

  // 更新分类
  updateCategory: async (id: number, data: Partial<Omit<ProductCategory, 'id'>>) => {
    return api.put<ProductCategory>(`/products/categories/${id}`, data);
  },

  // 删除分类
  deleteCategory: async (id: number) => {
    return api.delete(`/products/categories/${id}`);
  },

  // 获取品牌列表
  getBrands: async () => {
    return api.get<ProductBrand[]>('/products/brands');
  },

  // 创建品牌
  createBrand: async (data: Omit<ProductBrand, 'id'>) => {
    return api.post<ProductBrand>('/products/brands', data);
  },

  // 更新品牌
  updateBrand: async (id: number, data: Partial<Omit<ProductBrand, 'id'>>) => {
    return api.put<ProductBrand>(`/products/brands/${id}`, data);
  },

  // 删除品牌
  deleteBrand: async (id: number) => {
    return api.delete(`/products/brands/${id}`);
  },

  // 更新库存
  updateStock: async (id: number, stock: number) => {
    const response = await api.patch<Product>(`/products/specifications/${id}/stock`, { stock });

    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeProduct(response.data),
      };
    }

    return response;
  },
};
