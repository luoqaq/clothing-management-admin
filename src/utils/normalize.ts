import type { Order, OrderItem, Product } from '../types';

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

export function normalizeProduct(product: Product): Product {
  return {
    ...product,
    id: toNumber(product.id),
    categoryId: toNumber(product.categoryId),
    price: toNumber(product.price),
    costPrice: toNumber(product.costPrice),
    stock: toNumber(product.stock),
    images: Array.isArray(product.images) ? product.images : [],
  };
}

export function normalizeOrderItem(item: OrderItem): OrderItem {
  return {
    ...item,
    id: toNumber(item.id),
    productId: toNumber(item.productId),
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
    items: Array.isArray(order.items)
      ? order.items.map(normalizeOrderItem)
      : [],
  };
}
