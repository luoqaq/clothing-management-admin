# 服装管理后台系统

## 项目介绍

服装管理后台系统是一个基于React和Node.js的全栈应用，用于管理服装商品、订单和统计分析。系统采用前后端分离架构，前端使用React、TypeScript、Ant Design和Redux Toolkit，后端使用Hono、Bun和Drizzle ORM。

## 技术栈

### 前端技术栈
- React 19
- TypeScript
- Ant Design 6
- Redux Toolkit
- React Router 7
- Axios
- React Hook Form
- ECharts

### 后端技术栈
- Hono (Node.js框架)
- Bun (运行时)
- Drizzle ORM
- MySQL
- JWT 认证

## 系统功能

### 1. 认证管理
- 用户登录
- 用户登出
- 获取当前用户信息

### 2. 商品管理
- 商品列表展示
- 商品搜索和筛选
- 商品创建和编辑
- 商品删除
- 商品库存管理

### 3. 订单管理
- 订单列表展示
- 订单搜索和筛选
- 订单创建
- 订单状态更新
- 订单发货
- 订单取消
- 订单退款

### 4. 统计分析
- 销售概览
- 每日销售数据
- 商品销售排名
- 分类销售统计
- 品牌销售统计

## 安装步骤

### 前端安装

1. 进入前端目录
```bash
cd clothing-management-admin
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

### 后端安装

1. 进入后端目录
```bash
cd clothing-management-server
```

2. 安装依赖
```bash
bun install
```

3. 启动开发服务器
```bash
bun run dev
```

## 环境配置

### 前端环境变量

在 `.env.development` 文件中配置：
```
# 开发环境变量
VITE_API_BASE_URL=/api
```

### 后端环境变量

在 `.env` 文件中配置：
```
# 服务器配置
PORT=3000

# 数据库配置
DATABASE_URL=mysql://username:password@localhost:3306/clothing_management

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## 使用说明

### 1. 登录系统

默认账户：
- 用户名：admin
- 密码：password

### 2. 商品管理

- **新增商品**：点击"新增商品"按钮，填写商品信息并保存
- **编辑商品**：点击商品列表中的"编辑"按钮，修改商品信息并保存
- **删除商品**：点击商品列表中的"删除"按钮，确认后删除商品
- **管理库存**：点击商品列表中的"库存"按钮，修改商品库存数量

### 3. 订单管理

- **创建订单**：点击"新建订单"按钮，填写订单信息并保存
- **查看订单**：点击订单列表中的"查看"按钮，查看订单详情
- **确认订单**：对于待处理状态的订单，点击"确认"按钮
- **发货订单**：对于已确认状态的订单，点击"发货"按钮
- **取消订单**：对于待处理或已确认状态的订单，点击"取消"按钮
- **退款订单**：对于已送达且已支付的订单，点击"退款"按钮

### 4. 统计分析

- **销售概览**：查看总销售额、总订单数、总客户数等概览数据
- **每日销售**：查看最近30天的销售数据趋势
- **商品排名**：查看销量和销售额排名靠前的商品
- **分类销售**：查看不同分类的销售数据
- **品牌销售**：查看不同品牌的销售数据

## 项目结构

### 前端结构
```
clothing-management-admin/
├── public/            # 静态资源
├── src/
│   ├── api/          # API 调用
│   ├── assets/       # 静态资源
│   ├── components/   # 组件
│   ├── features/     # Redux 切片
│   ├── hooks/        # 自定义 hooks
│   ├── mocks/        # 模拟数据
│   ├── pages/        # 页面
│   ├── store/        # Redux  store
│   ├── types/        # TypeScript 类型
│   ├── App.tsx       # 应用入口
│   ├── main.tsx      # 主入口
│   └── routes.tsx    # 路由配置
├── .env.development  # 开发环境变量
├── package.json      # 依赖配置
└── vite.config.ts    # Vite 配置
```

### 后端结构
```
clothing-management-server/
├── src/
│   ├── config/       # 配置
│   ├── db/           # 数据库
│   ├── middleware/   # 中间件
│   ├── modules/      # 模块
│   ├── types/        # TypeScript 类型
│   ├── utils/        # 工具函数
│   └── index.ts      # 应用入口
├── .env              # 环境变量
├── package.json      # 依赖配置
└── tsconfig.json     # TypeScript 配置
```

## API 接口

### 认证接口
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户信息

### 商品接口
- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情
- `POST /api/products` - 创建商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品
- `PATCH /api/products/:id/stock` - 更新库存
- `GET /api/products/categories` - 获取分类列表
- `GET /api/products/brands` - 获取品牌列表

### 订单接口
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders` - 创建订单
- `PATCH /api/orders/:id/status` - 更新订单状态
- `POST /api/orders/:id/ship` - 订单发货
- `POST /api/orders/:id/cancel` - 取消订单
- `POST /api/orders/:id/refund` - 订单退款

### 统计接口
- `GET /api/statistics/overview` - 销售概览
- `GET /api/statistics/daily-sales` - 每日销售数据
- `GET /api/statistics/product-rankings` - 商品销售排名
- `GET /api/statistics/category-sales` - 分类销售统计
- `GET /api/statistics/brand-sales` - 品牌销售统计

## 注意事项

1. 本系统使用模拟数据，实际部署时需要连接真实数据库
2. 系统支持响应式布局，适配不同屏幕尺寸
3. 系统已实现基本的权限控制，只有登录用户才能访问后台功能
4. 系统已实现路由懒加载，提高应用加载速度

## 未来规划

1. 增加用户管理功能
2. 增加权限管理功能
3. 增加更多统计分析图表
4. 优化系统性能
5. 增加更多商品属性和订单功能
