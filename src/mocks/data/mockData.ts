import type { User, Product, ProductCategory, ProductBrand, Order } from '../../types';
import dayjs from 'dayjs';

// 用户数据
export const mockUser: User = {
  id: 1,
  username: 'admin',
  name: '管理员',
  email: 'admin@clothing.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
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

// 商品品牌数据
export const mockBrands: ProductBrand[] = [
  { id: 1, name: 'Nike', logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=nike' },
  { id: 2, name: 'Adidas', logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=adidas' },
  { id: 3, name: 'Zara', logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=zara' },
  { id: 4, name: 'H&M', logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=hm' },
  { id: 5, name: 'Uniqlo', logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=uniqlo' },
  { id: 6, name: 'Gucci', logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=gucci' },
];

// 商品数据
export const mockProducts: Product[] = [];

// 订单数据
export const mockOrders: Order[] = [];
