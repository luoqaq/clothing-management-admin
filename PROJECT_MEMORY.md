# 服装管理后台前端 - 项目记忆

最近更新：2026-03-27

## 会话更新（2026-03-30）
- 已完成前端构建体积优化：
  - 移除了 `echarts-for-react`，改为按需引入 ECharts 核心模块
  - 创建了 `src/components/ECharts/index.tsx` 封装组件，仅注册项目需要的图表类型（LineChart, BarChart, PieChart）
  - 优化了 `vite.config.ts`，添加 `manualChunks` 配置实现精细化的代码分割：
    - `vendor-react`：React 核心库
    - `vendor-redux`：Redux 相关
    - `vendor-antd`：Ant Design 及其图标
    - `vendor-echarts`：ECharts 图表库（约 558KB）
    - `vendor-utils`：工具库（dayjs, axios, zod 等）
    - `module-statistics/products/orders`：业务模块独立打包
  - 更新了 `Dashboard.tsx` 和 `Statistics/index.tsx`，使用新的 ECharts 组件
- 优化效果：
  - 原 `useStatistics` chunk 1,131KB → 现 `module-statistics` 仅 12KB
  - ECharts 独立打包 558KB，业务页面体积大幅减少
  - 统计页面仅 5KB，工作台页面仅 5KB
- 构建警告仍存在（Ant Design 全量引入约 1.2MB），但已远低于优化前水平
- 本次验证已执行：
  - `npm run build` 通过

## 会话更新（2026-03-27）
- 商品主数据已从“品牌”切换为“供应商”。
- 前端已同步改造以下链路：
  - 商品类型、筛选参数、详情展示、表单提交字段改为 `supplierId` / `supplier`
  - 商品 API 从 `/products/brands` 切换为 `/products/suppliers`
  - 基础资料页已将“品牌管理”替换为“供应商管理”，表单仅维护 `name`
  - 商品列表与商品表单已改用供应商选择与展示
- mock 商品接口与 mock 商品主数据也已同步切换为供应商；统计 mock 仍保留原 `brand-sales` 接口名，但底层已改为按供应商数据生成，避免编译受阻。
- 本次验证已执行：
  - `npm run build` 通过
- ~~构建阶段仍有大体积 chunk warning，当前未处理，不阻塞本次提交。~~（已在 2026-03-30 优化）

## 会话更新（2026-03-23）
- 确认当前未提交改动主要包括三类：
  - 订单表单 `Select` 样式微调与页面文案/间距调整
  - `useOrders` 中移除 `shipOrder` 导出
  - 订单归一化增加 `address` 空值兜底
- 执行 `npm run build` 通过，可正常产出前端构建结果。
- 构建阶段仍有大体积 chunk warning，当前未处理，不阻塞本次提交。

## 会话更新（2026-03-20）
- 已将 `AGENTS.md` 与 `PROJECT_MEMORY.md` 统一为中文版本，保留命令与路径原文。
- 已新增仓库级 `AGENTS.md`，并要求固定流程：
  - 会话开始先读 `PROJECT_MEMORY.md`
  - 会话结束前更新 `PROJECT_MEMORY.md`
- 已在 `AGENTS.md` 增加前端专项规则：
  - 默认连接真实后端，除非用户明确要求否则不启用 mock
  - 固定运行/构建命令与验证要求
  - 变更边界、安全规则、Git 规则
  - 收尾回复格式与记忆更新模板

## 仓库信息
- 路径：`/Users/luo/Project/clothing-management-admin`
- 远程：`git@github.com:luoqaq/clothing-management-admin.git`
- 默认分支：`main`

## 启动手册
- 安装依赖：`npm install`
- 开发启动：`npm run dev -- --host 127.0.0.1 --port 5173`
- 构建：`npm run build`
- 本地地址：`http://127.0.0.1:5173/`

## API 集成
- `VITE_API_BASE_URL=/api`（位于 `.env.development`）
- Vite 代理：`/api -> http://localhost:3000`（见 `vite.config.ts`）
- 当前模式：直连后端（`src/main.tsx` 已移除 mock 启动逻辑）

## 本地测试账号
- 默认登录：`admin / admin123`

## 关键决策
- 前端 `.env` 文件允许提交（当前团队约定）。
- 已加入金额字段归一化，避免后端返回字符串时触发 `toFixed` 崩溃：
  - `src/utils/normalize.ts`
  - `src/api/products.ts`
  - `src/api/orders.ts`
  - `src/pages/Products/List.tsx` 也加入了页面级兜底格式化

## 已知问题与风险
- 若金额格式相关报错再次出现，先检查 API 字段类型（`string` 或 `number`），再扩展归一化处理。
- 若前端页面可访问但接口失败，优先确认后端是否监听 `3000` 端口。

## 快速验证
1. 先启动后端。
2. 再启动前端。
3. 打开商品列表，确认不再出现 `price.toFixed` 报错。
4. 使用 `admin / admin123` 登录，确认数据来自真实后端。
