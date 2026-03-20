import { http, HttpResponse } from 'msw';
import type { Product, ProductCategory, ProductBrand } from '../../types';
import { mockProducts, mockCategories, mockBrands } from '../data/mockData';

export const productsHandlers = [
  // 获取商品列表
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search');
    const categoryId = url.searchParams.get('categoryId');
    const status = url.searchParams.get('status');
    const size = url.searchParams.get('size');

    let filteredProducts = [...mockProducts];

    // 搜索过滤
    if (search) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 分类过滤
    if (categoryId) {
      filteredProducts = filteredProducts.filter(
        (product) => product.categoryId === parseInt(categoryId)
      );
    }

    // 状态过滤
    if (status) {
      filteredProducts = filteredProducts.filter(
        (product) => product.status === status
      );
    }

    // 尺寸过滤
    if (size) {
      filteredProducts = filteredProducts.filter(
        (product) => product.size === size
      );
    }

    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        items: paginatedProducts,
        total: filteredProducts.length,
        page,
        pageSize,
      },
    });
  }),

  // 获取商品详情
  http.get('/api/products/:id', ({ params }) => {
    const product = mockProducts.find((p) => p.id === parseInt(params.id));

    if (!product) {
      return HttpResponse.json({
        success: false,
        message: '商品不存在',
      });
    }

    return HttpResponse.json({
      success: true,
      data: product,
    });
  }),

  // 创建商品
  http.post('/api/products', async ({ request }) => {
    const productData = await request.json();

    const newProduct: Product = {
      ...productData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: mockCategories.find((c) => c.id === productData.categoryId),
    };

    mockProducts.push(newProduct);

    return HttpResponse.json({
      success: true,
      data: newProduct,
    });
  }),

  // 更新商品
  http.put('/api/products/:id', async ({ request, params }) => {
    const id = parseInt(params.id);
    const productData = await request.json();

    const productIndex = mockProducts.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '商品不存在',
      });
    }

    const updatedProduct: Product = {
      ...mockProducts[productIndex],
      ...productData,
      updatedAt: new Date().toISOString(),
      category: mockCategories.find((c) => c.id === productData.categoryId),
    };

    mockProducts[productIndex] = updatedProduct;

    return HttpResponse.json({
      success: true,
      data: updatedProduct,
    });
  }),

  // 删除商品
  http.delete('/api/products/:id', ({ params }) => {
    const id = parseInt(params.id);

    const productIndex = mockProducts.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '商品不存在',
      });
    }

    mockProducts.splice(productIndex, 1);

    return HttpResponse.json({
      success: true,
      message: '商品删除成功',
    });
  }),

  // 获取分类列表
  http.get('/api/products/categories', () => {
    return HttpResponse.json({
      success: true,
      data: mockCategories,
    });
  }),

  // 创建分类
  http.post('/api/products/categories', async ({ request }) => {
    const categoryData = await request.json();

    const newCategory: ProductCategory = {
      ...categoryData,
      id: Date.now(),
    };

    mockCategories.push(newCategory);

    return HttpResponse.json({
      success: true,
      data: newCategory,
    });
  }),

  // 更新分类
  http.put('/api/products/categories/:id', async ({ request, params }) => {
    const id = parseInt(params.id);
    const categoryData = await request.json();

    const categoryIndex = mockCategories.findIndex((c) => c.id === id);

    if (categoryIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '分类不存在',
      });
    }

    const updatedCategory: ProductCategory = {
      ...mockCategories[categoryIndex],
      ...categoryData,
    };

    mockCategories[categoryIndex] = updatedCategory;

    return HttpResponse.json({
      success: true,
      data: updatedCategory,
    });
  }),

  // 删除分类
  http.delete('/api/products/categories/:id', ({ params }) => {
    const id = parseInt(params.id);

    const categoryIndex = mockCategories.findIndex((c) => c.id === id);

    if (categoryIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '分类不存在',
      });
    }

    mockCategories.splice(categoryIndex, 1);

    return HttpResponse.json({
      success: true,
      message: '分类删除成功',
    });
  }),

  // 获取品牌列表
  http.get('/api/products/brands', () => {
    return HttpResponse.json({
      success: true,
      data: mockBrands,
    });
  }),

  // 创建品牌
  http.post('/api/products/brands', async ({ request }) => {
    const brandData = await request.json();

    const newBrand: ProductBrand = {
      ...brandData,
      id: Date.now(),
    };

    mockBrands.push(newBrand);

    return HttpResponse.json({
      success: true,
      data: newBrand,
    });
  }),

  // 更新品牌
  http.put('/api/products/brands/:id', async ({ request, params }) => {
    const id = parseInt(params.id);
    const brandData = await request.json();

    const brandIndex = mockBrands.findIndex((b) => b.id === id);

    if (brandIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '品牌不存在',
      });
    }

    const updatedBrand: ProductBrand = {
      ...mockBrands[brandIndex],
      ...brandData,
    };

    mockBrands[brandIndex] = updatedBrand;

    return HttpResponse.json({
      success: true,
      data: updatedBrand,
    });
  }),

  // 删除品牌
  http.delete('/api/products/brands/:id', ({ params }) => {
    const id = parseInt(params.id);

    const brandIndex = mockBrands.findIndex((b) => b.id === id);

    if (brandIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '品牌不存在',
      });
    }

    mockBrands.splice(brandIndex, 1);

    return HttpResponse.json({
      success: true,
      message: '品牌删除成功',
    });
  }),

  // 更新库存
  http.patch('/api/products/:id/stock', async ({ request, params }) => {
    const id = parseInt(params.id);
    const data = await request.json();

    const productIndex = mockProducts.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '商品不存在',
      });
    }

    mockProducts[productIndex].stock = data.stock;
    mockProducts[productIndex].updatedAt = new Date().toISOString();

    // 根据库存更新状态
    if (data.stock > 0 && mockProducts[productIndex].status === 'out_of_stock') {
      mockProducts[productIndex].status = 'active';
    } else if (data.stock === 0 && mockProducts[productIndex].status === 'active') {
      mockProducts[productIndex].status = 'out_of_stock';
    }

    return HttpResponse.json({
      success: true,
      data: mockProducts[productIndex],
    });
  }),
];
