import type { Order, OrderItem, Product, ProductSpecification } from '../types';

export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

export function normalizeSpecification(specification: ProductSpecification): ProductSpecification {
  return {
    ...specification,
    id: toNumber(specification.id),
    productId: toNumber(specification.productId),
    salePrice: toNumber(specification.salePrice),
    costPrice: toNumber(specification.costPrice),
    stock: toNumber(specification.stock),
    reservedStock: toNumber(specification.reservedStock),
    availableStock: toNumber(specification.availableStock),
    cumulativeInboundQuantity: toNumber(specification.cumulativeInboundQuantity),
    cumulativeCostAmount: toNumber(specification.cumulativeCostAmount),
  };
}

export function normalizeProduct(product: Product): Product {
  return {
    ...product,
    id: toNumber(product.id),
    categoryId: toNumber(product.categoryId),
    supplierId: product.supplierId == null ? null : toNumber(product.supplierId),
    mainImages: Array.isArray(product.mainImages) ? product.mainImages : [],
    detailImages: Array.isArray(product.detailImages) ? product.detailImages : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
    specifications: Array.isArray(product.specifications)
      ? product.specifications.map(normalizeSpecification)
      : [],
    specCount: toNumber(product.specCount),
    totalStock: toNumber(product.totalStock),
    reservedStock: toNumber(product.reservedStock),
    availableStock: toNumber(product.availableStock),
    minPrice: toNumber(product.minPrice),
    maxPrice: toNumber(product.maxPrice),
  };
}

export function normalizeOrderItem(item: OrderItem): OrderItem {
  return {
    ...item,
    id: toNumber(item.id),
    productId: toNumber(item.productId),
    skuId: toNumber(item.skuId),
    price: toNumber(item.price),
    quantity: toNumber(item.quantity),
  };
}

export function normalizeOrder(order: Order): Order {
  return {
    ...order,
    id: toNumber(order.id),
    totalAmount: toNumber(order.totalAmount),
    discountAmount: toNumber(order.discountAmount),
    finalAmount: toNumber(order.finalAmount),
    address: order.address ?? {},
    items: Array.isArray(order.items) ? order.items.map(normalizeOrderItem) : [],
  };
}
