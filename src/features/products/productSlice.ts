import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productsApi } from '../../api/products';
import type { RootState } from '../../store';
import type {
  ProductState,
  Product,
  ProductCategory,
  Supplier,
  ProductFilters,
} from '../../types';

// 初始状态
const initialState: ProductState = {
  items: [],
  currentProduct: null,
  categories: [],
  suppliers: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {},
};

// 获取商品列表
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: { page?: number; pageSize?: number; filters?: ProductFilters } | undefined, { rejectWithValue }) => {
    try {
      const response = await productsApi.getProducts(params);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '获取商品列表失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 获取商品详情
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await productsApi.getProduct(id);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '获取商品详情失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 创建商品
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await productsApi.createProduct(data);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '创建商品失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 更新商品
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (
    { id, data }: { id: number; data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>> },
    { rejectWithValue }
  ) => {
    try {
      const response = await productsApi.updateProduct(id, data);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '更新商品失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 删除商品
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await productsApi.deleteProduct(id);

      if (response.success) {
        return id;
      }

      return rejectWithValue(response.message || '删除商品失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 获取分类列表
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsApi.getCategories();

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '获取分类列表失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 获取品牌列表
export const fetchSuppliers = createAsyncThunk(
  'products/fetchSuppliers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsApi.getSuppliers();

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '获取供应商列表失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 更新库存
export const updateProductStock = createAsyncThunk(
  'products/updateStock',
  async ({ id, stock }: { id: number; stock: number }, { rejectWithValue }) => {
    try {
      const response = await productsApi.updateStock(id, stock);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '更新库存失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 创建分类
export const createCategory = createAsyncThunk(
  'products/createCategory',
  async (data: Omit<ProductCategory, 'id'>, { rejectWithValue }) => {
    try {
      const response = await productsApi.createCategory(data);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '创建分类失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 更新分类
export const updateCategory = createAsyncThunk(
  'products/updateCategory',
  async (
    { id, data }: { id: number; data: Partial<Omit<ProductCategory, 'id'>> },
    { rejectWithValue }
  ) => {
    try {
      const response = await productsApi.updateCategory(id, data);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '更新分类失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 删除分类
export const deleteCategory = createAsyncThunk(
  'products/deleteCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await productsApi.deleteCategory(id);

      if (response.success) {
        return id;
      }

      return rejectWithValue(response.message || '删除分类失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 创建品牌
export const createSupplier = createAsyncThunk(
  'products/createSupplier',
  async (data: Omit<Supplier, 'id'>, { rejectWithValue }) => {
    try {
      const response = await productsApi.createSupplier(data);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '创建供应商失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 更新品牌
export const updateSupplier = createAsyncThunk(
  'products/updateSupplier',
  async (
    { id, data }: { id: number; data: Partial<Omit<Supplier, 'id'>> },
    { rejectWithValue }
  ) => {
    try {
      const response = await productsApi.updateSupplier(id, data);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '更新供应商失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 删除品牌
export const deleteSupplier = createAsyncThunk(
  'products/deleteSupplier',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await productsApi.deleteSupplier(id);

      if (response.success) {
        return id;
      }

      return rejectWithValue(response.message || '删除供应商失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 商品状态切片
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // 设置错误信息
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 清除当前商品
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },

    // 设置搜索条件
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = action.payload;
    },

    // 重置搜索条件
    resetFilters: (state) => {
      state.filters = {};
    },

    // 设置分页信息
    setPagination: (
      state,
      action: PayloadAction<{ page: number; pageSize: number; total: number }>
    ) => {
      state.pagination = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 获取商品列表
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          total: action.payload.total,
        };
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取商品详情
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 创建商品
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新商品
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 删除商品
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.pagination.total -= 1;
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取分类列表
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取供应商列表
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
        state.error = null;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新库存
    builder
      .addCase(updateProductStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 创建分类
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新分类
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 删除分类
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter((item) => item.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 创建供应商
    builder
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers.push(action.payload);
        state.error = null;
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新供应商
    builder
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.suppliers.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 删除供应商
    builder
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = state.suppliers.filter((item) => item.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// 导出 actions
export const {
  setLoading,
  setError,
  clearCurrentProduct,
  setFilters,
  resetFilters,
  setPagination,
} = productSlice.actions;

// 选择器
export const selectProducts = (state: RootState) => state.products.items;
export const selectCurrentProduct = (state: RootState) => state.products.currentProduct;
export const selectCategories = (state: RootState) => state.products.categories;
export const selectSuppliers = (state: RootState) => state.products.suppliers;
export const selectProductLoading = (state: RootState) => state.products.loading;
export const selectProductError = (state: RootState) => state.products.error;
export const selectProductPagination = (state: RootState) => state.products.pagination;
export const selectProductFilters = (state: RootState) => state.products.filters;

export default productSlice.reducer;
