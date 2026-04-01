import type { User, Product, ProductCategory, Supplier, Order } from '../../types';
import dayjs from 'dayjs';

// 用户数据
export const mockUser: User = {
  id: 1,
  username: 'chuchu',
  name: '管理员',
  email: 'chuchu@clothing.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chuchu',
  role: 'admin',
};

// 商品分类数据
export const mockCategories: ProductCategory[] = [
  { id: 1, name: '上衣', code: 'TOP', parentId: undefined },
  { id: 2, name: '外套', code: 'OUTER', parentId: undefined },
  { id: 3, name: '裤子', code: 'PANTS', parentId: undefined },
  { id: 4, name: '裙子', code: 'SKIRT', parentId: undefined },
  { id: 5, name: '内衣', code: 'UNDERWEAR', parentId: undefined },
  { id: 6, name: '配饰', code: 'ACCESSORIES', parentId: undefined },
  { id: 7, name: '连衣裙', code: 'DRESS', parentId: 1 },
  { id: 8, name: 'T恤', code: 'T_SHIRT', parentId: 1 },
  { id: 9, name: '衬衫', code: 'SHIRT', parentId: 1 },
  { id: 10, name: '牛仔裤', code: 'JEANS', parentId: 3 },
];

// 供应商数据
export const mockSuppliers: Supplier[] = [
  { id: 1, name: '华东成衣供应商' },
  { id: 2, name: '深圳针织供应商' },
  { id: 3, name: '广州牛仔供应商' },
  { id: 4, name: '上海基础款供应商' },
  { id: 5, name: '杭州女装供应商' },
  { id: 6, name: '佛山配饰供应商' },
];

// 商品数据
export const mockProducts: Product[] = [];

// 订单数据
export const mockOrders: Order[] = [];
