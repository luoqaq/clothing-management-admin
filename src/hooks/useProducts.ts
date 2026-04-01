import { useSelector, useDispatch } from 'react-redux';
import { message } from 'antd';
import type { RootState, AppDispatch } from '../store';
import { getErrorMessage } from '../utils/error';
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  fetchSuppliers,
  updateProductStock,
  parseExcelImport as parseExcelImportAction,
  parseImageImport as parseImageImportAction,
  bulkCreateProducts as bulkCreateProductsAction,
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
import type {
  Product,
  ProductFilters,
  ProductCategory,
  Supplier,
  ExcelImportPayload,
  ImportDraftProduct,
} from '../types';

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

  const handleActionError = (err: unknown, fallback: string) => {
    message.error(getErrorMessage(err, fallback));
    return null;
  };

  // 获取商品列表
  const getProducts = async (params?: { page?: number; pageSize?: number; filters?: ProductFilters }) => {
    try {
      const result = await dispatch(fetchProducts(params)).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '获取商品列表失败');
    }
  };

  // 获取商品详情
  const getProductById = async (id: number) => {
    try {
      const result = await dispatch(fetchProductById(id)).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '获取商品详情失败');
    }
  };

  // 创建商品
  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await dispatch(createProduct(product)).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '创建商品失败');
    }
  };

  // 更新商品
  const editProduct = async (id: number, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const result = await dispatch(updateProduct({ id, data: product })).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '更新商品失败');
    }
  };

  // 删除商品
  const removeProduct = async (id: number) => {
    try {
      const result = await dispatch(deleteProduct(id)).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '删除商品失败');
    }
  };

  // 获取分类列表
  const getCategories = async () => {
    try {
      const result = await dispatch(fetchCategories()).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '获取分类列表失败');
    }
  };

  const getSuppliers = async () => {
    try {
      const result = await dispatch(fetchSuppliers()).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '获取供应商列表失败');
    }
  };

  // 创建分类
  const addCategory = async (category: Omit<ProductCategory, 'id'>) => {
    try {
      const result = await dispatch(createCategory(category)).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '创建分类失败');
    }
  };

  // 更新分类
  const updateCategory = async (id: number, category: Partial<Omit<ProductCategory, 'id'>>) => {
    try {
      const result = await dispatch(updateCategoryAction({ id, data: category })).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '更新分类失败');
    }
  };

  // 删除分类
  const deleteCategory = async (id: number) => {
    try {
      const result = await dispatch(deleteCategoryAction(id)).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '删除分类失败');
    }
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    try {
      const result = await dispatch(createSupplier(supplier)).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '创建供应商失败');
    }
  };

  const updateSupplier = async (id: number, supplier: Partial<Omit<Supplier, 'id'>>) => {
    try {
      const result = await dispatch(updateSupplierAction({ id, data: supplier })).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '更新供应商失败');
    }
  };

  const deleteSupplier = async (id: number) => {
    try {
      const result = await dispatch(deleteSupplierAction(id)).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '删除供应商失败');
    }
  };

  // 更新库存
  const updateStock = async (id: number, stock: number) => {
    try {
      const result = await dispatch(updateProductStock({ id, stock })).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '更新库存失败');
    }
  };

  const parseExcelImport = async (payload: ExcelImportPayload) => {
    try {
      const result = await dispatch(parseExcelImportAction(payload)).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '解析 Excel 失败');
    }
  };

  const parseImageImport = async (file: File) => {
    try {
      const result = await dispatch(parseImageImportAction(file)).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '解析截图失败');
    }
  };

  const bulkCreateProducts = async (products: ImportDraftProduct[], createMissingSuppliers: boolean) => {
    try {
      const result = await dispatch(bulkCreateProductsAction({ products, createMissingSuppliers })).unwrap();
      return result;
    } catch (err) {
      return handleActionError(err, '批量导入失败');
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
    parseExcelImport,
    parseImageImport,
    bulkCreateProducts,
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
