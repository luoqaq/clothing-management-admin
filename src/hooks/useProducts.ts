import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  fetchSuppliers,
  updateProductStock,
  createCategory,
  updateCategory as updateCategoryAction,
  deleteCategory as deleteCategoryAction,
  createSupplier,
  updateSupplier as updateSupplierAction,
  deleteSupplier as deleteSupplierAction,
  clearCurrentProduct,
  setFilters,
  resetFilters,
  selectProducts,
  selectCurrentProduct,
  selectCategories,
  selectSuppliers,
  selectProductLoading,
  selectProductError,
  selectProductPagination,
  selectProductFilters,
} from '../features/products/productSlice';
import type { Product, ProductFilters, ProductCategory, Supplier } from '../types';

export const useProducts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector(selectProducts);
  const currentProduct = useSelector(selectCurrentProduct);
  const categories = useSelector(selectCategories);
  const suppliers = useSelector(selectSuppliers);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const pagination = useSelector(selectProductPagination);
  const filters = useSelector(selectProductFilters);

  // 获取商品列表
  const getProducts = async (params?: { page?: number; pageSize?: number; filters?: ProductFilters }) => {
    try {
      const result = await dispatch(fetchProducts(params)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 获取商品详情
  const getProductById = async (id: number) => {
    try {
      const result = await dispatch(fetchProductById(id)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 创建商品
  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await dispatch(createProduct(product)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 更新商品
  const editProduct = async (id: number, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const result = await dispatch(updateProduct({ id, data: product })).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 删除商品
  const removeProduct = async (id: number) => {
    try {
      const result = await dispatch(deleteProduct(id)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 获取分类列表
  const getCategories = async () => {
    try {
      const result = await dispatch(fetchCategories()).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  const getSuppliers = async () => {
    try {
      const result = await dispatch(fetchSuppliers()).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 创建分类
  const addCategory = async (category: Omit<ProductCategory, 'id'>) => {
    try {
      const result = await dispatch(createCategory(category)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 更新分类
  const updateCategory = async (id: number, category: Partial<Omit<ProductCategory, 'id'>>) => {
    try {
      const result = await dispatch(updateCategoryAction({ id, data: category })).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 删除分类
  const deleteCategory = async (id: number) => {
    try {
      const result = await dispatch(deleteCategoryAction(id)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    try {
      const result = await dispatch(createSupplier(supplier)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  const updateSupplier = async (id: number, supplier: Partial<Omit<Supplier, 'id'>>) => {
    try {
      const result = await dispatch(updateSupplierAction({ id, data: supplier })).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  const deleteSupplier = async (id: number) => {
    try {
      const result = await dispatch(deleteSupplierAction(id)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 更新库存
  const updateStock = async (id: number, stock: number) => {
    try {
      const result = await dispatch(updateProductStock({ id, stock })).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 清除当前商品
  const handleClearCurrentProduct = () => {
    dispatch(clearCurrentProduct());
  };

  // 设置搜索条件
  const handleSetFilters = (newFilters: ProductFilters) => {
    dispatch(setFilters(newFilters));
  };

  // 重置搜索条件
  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  return {
    products,
    currentProduct,
    categories,
    suppliers,
    loading,
    error,
    pagination,
    filters,
    getProducts,
    getProductById,
    addProduct,
    editProduct,
    removeProduct,
    getCategories,
    getSuppliers,
    updateStock,
    addCategory,
    updateCategory,
    deleteCategory,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    clearCurrentProduct: handleClearCurrentProduct,
    setFilters: handleSetFilters,
    resetFilters: handleResetFilters,
  };
};
