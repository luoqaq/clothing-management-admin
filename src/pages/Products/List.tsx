import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Grid,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../hooks/useAuth';
import { isAdminUser } from '../../utils/role';
import { touchFriendlySelectProps } from '../../utils/touchSelect';
import ProductForm from './ProductForm';
import ProductLabelPrintModal from '../../components/ProductLabelPrintModal';
import type { Product, ProductFilters, ProductLabelItem, ProductStatus, ProductSpecification } from '../../types';

const { Title, Text } = Typography;

const ProductList: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = isAdminUser(user);
  const {
    products,
    categories,
    suppliers,
    loading,
    pagination,
    getProducts,
    getCategories,
    getSuppliers,
    removeProduct,
    updateStock,
    addProduct,
    editProduct,
    getProductLabels,
  } = useProducts();

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedSupplier, setSelectedSupplier] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | undefined>();
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSpecification, setSelectedSpecification] = useState<ProductSpecification | null>(null);
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const [labelLoading, setLabelLoading] = useState(false);
  const [productLabels, setProductLabels] = useState<ProductLabelItem[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [stockForm] = Form.useForm();
  const formModalWidth = screens.lg ? 1100 : screens.md ? 'calc(100vw - 32px)' : 'calc(100vw - 16px)';
  const detailModalWidth = screens.lg ? 960 : screens.md ? 'calc(100vw - 32px)' : 'calc(100vw - 16px)';

  useEffect(() => {
    void Promise.all([
      getProducts({ page: 1, pageSize: 10 }),
      getCategories(),
      isAdmin ? getSuppliers() : Promise.resolve([]),
    ]);
  }, []);

  const buildFilters = (overrides?: {
    searchText?: string;
    selectedCategory?: number | undefined;
    selectedSupplier?: number | undefined;
    selectedStatus?: ProductStatus | undefined;
  }): ProductFilters => ({
    search: (overrides?.searchText ?? searchText) || undefined,
    categoryId: overrides?.selectedCategory ?? selectedCategory,
    supplierId: isAdmin ? overrides?.selectedSupplier ?? selectedSupplier : undefined,
    status: overrides?.selectedStatus ?? selectedStatus,
  });

  const loadProducts = (params?: { page?: number; pageSize?: number; filters?: ProductFilters }) =>
    getProducts(params ?? { page: pagination.page, pageSize: pagination.pageSize, filters: buildFilters() });

  const handleFilterChange = (nextValues: {
    selectedCategory?: number | undefined;
    selectedSupplier?: number | undefined;
    selectedStatus?: ProductStatus | undefined;
  }) => {
    const nextFilters = buildFilters(nextValues);
    const nextPageSize = pagination.pageSize || 10;

    if (Object.prototype.hasOwnProperty.call(nextValues, 'selectedCategory')) {
      setSelectedCategory(nextValues.selectedCategory);
    }
    if (isAdmin && Object.prototype.hasOwnProperty.call(nextValues, 'selectedSupplier')) {
      setSelectedSupplier(nextValues.selectedSupplier);
    }
    if (Object.prototype.hasOwnProperty.call(nextValues, 'selectedStatus')) {
      setSelectedStatus(nextValues.selectedStatus);
    }

    void loadProducts({ page: 1, pageSize: nextPageSize, filters: nextFilters });
  };

  const handleSearch = () => {
    void loadProducts({ page: 1, pageSize: pagination.pageSize || 10, filters: buildFilters() });
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedCategory(undefined);
    setSelectedSupplier(undefined);
    setSelectedStatus(undefined);
    void loadProducts({ page: 1, pageSize: pagination.pageSize || 10, filters: {} });
  };

  const handleDelete = async (id: number) => {
    const result = await removeProduct(id);
    if (result) {
      message.success('商品删除成功');
      void loadProducts();
    }
  };

  const handleEditStock = (product: Product, specification: ProductSpecification) => {
    setSelectedProduct(product);
    setSelectedSpecification(specification);
    stockForm.setFieldsValue({ stock: specification.stock });
    setStockModalVisible(true);
  };

  const handleStockSubmit = async () => {
    const values = await stockForm.validateFields();
    if (!selectedSpecification) return;

    const result = await updateStock(selectedSpecification.id, values.stock);
    if (result) {
      message.success('规格库存更新成功');
      setStockModalVisible(false);
      setSelectedSpecification(null);
      void loadProducts();
    }
  };

  const handleAddSubmit = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setSaveLoading(true);
    try {
      const result = await addProduct(product);
      if (result) {
        message.success('商品创建成功');
        setAddModalVisible(false);
        void loadProducts();
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEditSubmit = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedProduct) return;
    setSaveLoading(true);
    try {
      const result = await editProduct(selectedProduct.id, product);
      if (result) {
        message.success('商品更新成功');
        setEditModalVisible(false);
        setSelectedProduct(null);
        void loadProducts();
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleOpenLabelModal = async (product: Product) => {
    setSelectedProduct(product);
    setLabelModalVisible(true);
    setLabelLoading(true);

    try {
      const labels = await getProductLabels(product.id);
      setProductLabels(labels ?? []);
    } finally {
      setLabelLoading(false);
    }
  };

  const columns = [
    {
      title: '主图',
      key: 'mainImage',
      width: 100,
      render: (_: unknown, record: Product) => {
        const imageUrl = record.mainImages[0];
        return imageUrl ? (
          <Image
            src={imageUrl}
            width={56}
            height={56}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            preview={{ src: imageUrl }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 8,
              background: '#f5f5f5',
              color: '#bfbfbf',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
            }}
          >
            无图
          </div>
        );
      },
    },
    {
      title: '款号',
      dataIndex: 'productCode',
      key: 'productCode',
      minWidth: 140,
    },
    {
      title: '商品',
      key: 'product',
      minWidth: 220,
      render: (_: unknown, record: Product) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.name}</div>
          {isAdmin ? <div style={{ color: '#8c8c8c' }}>{record.supplier?.name || '未设置供应商'}</div> : null}
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      minWidth: 120,
      render: (_: unknown, record: Product) => record.category?.name || '-',
    },
    {
      title: '规格',
      key: 'specifications',
      minWidth: 220,
      render: (_: unknown, record: Product) => {
        if (record.specifications.length === 0) {
          return <Text type="secondary">暂无规格</Text>;
        }

        return (
          <div>
            {record.specifications.map((item) => (
              <div key={item.id} style={{ lineHeight: 1.6 }}>
                {item.color} / {item.size} · 库存 {item.stock}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: '售价',
      key: 'prices',
      minWidth: 220,
      render: (_: unknown, record: Product) => {
        if (record.specifications.length === 0) {
          return <Text type="secondary">暂无售价</Text>;
        }

        const uniquePrices = Array.from(new Set(record.specifications.map((item) => item.salePrice)));

        if (uniquePrices.length === 1) {
          return `¥${uniquePrices[0].toFixed(2)}`;
        }

        const previewItems = record.specifications.slice(0, 2);

        return (
          <div>
            {previewItems.map((item) => (
              <div key={item.id} style={{ lineHeight: 1.6 }}>
                {item.color} / {item.size} · ¥{item.salePrice.toFixed(2)}
              </div>
            ))}
            {record.specifications.length > previewItems.length ? (
              <Text type="secondary">等 {record.specifications.length} 个规格价格</Text>
            ) : null}
          </div>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      minWidth: 110,
      render: (status: ProductStatus) => {
        const statusMap: Record<ProductStatus, { text: string; color: string }> = {
          draft: { text: '草稿', color: 'default' },
          active: { text: '上架中', color: 'green' },
          inactive: { text: '已下架', color: 'orange' },
        };
        const meta = statusMap[status];
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right' as const,
      width: 180,
      minWidth: 180,
      render: (_: unknown, record: Product) => (
        <div className="table-actions-grid">
          <Button type="text" icon={<EyeOutlined />} onClick={() => { setSelectedProduct(record); setViewModalVisible(true); }}>
            查看
          </Button>
          {isAdmin ? (
            <Button type="text" icon={<EditOutlined />} onClick={() => { setSelectedProduct(record); setEditModalVisible(true); }}>
              编辑
            </Button>
          ) : null}
          {isAdmin ? (
            <Button type="text" onClick={() => void handleOpenLabelModal(record)}>
              打印标签
            </Button>
          ) : null}
          {isAdmin ? (
            <Popconfirm title="确定删除这款商品吗？" onConfirm={() => handleDelete(record.id)}>
              <Button type="text" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="content-page">
      <Card className="content-panel">
        <div className="content-panel__header">
          <div>
            <Text className="content-panel__eyebrow">Catalog</Text>
            <Title level={4} className="content-panel__title">
              商品管理
            </Title>
          </div>
          <Space wrap>
            {isAdmin ? <Button onClick={() => navigate('/products/import')}>批量导入</Button> : null}
            {isAdmin ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
                新建商品
              </Button>
            ) : null}
          </Space>
        </div>

        <div className="filter-toolbar">
          <Input
            placeholder="搜索商品名称/款号"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            className="filter-toolbar__search"
          />
          <Select
            allowClear
            placeholder="分类"
            className="filter-toolbar__select"
            value={selectedCategory}
            options={categories.map((item) => ({ label: item.name, value: item.id }))}
            onChange={(value) => handleFilterChange({ selectedCategory: value })}
            {...touchFriendlySelectProps}
          />
          {isAdmin ? (
            <Select
              allowClear
              placeholder="供应商"
              className="filter-toolbar__select"
              value={selectedSupplier}
              options={suppliers.map((item) => ({ label: item.name, value: item.id }))}
              onChange={(value) => handleFilterChange({ selectedSupplier: value })}
              {...touchFriendlySelectProps}
            />
          ) : null}
          <Select
            allowClear
            placeholder="状态"
            className="filter-toolbar__select"
            value={selectedStatus}
            options={[
              { label: '草稿', value: 'draft' },
              { label: '上架中', value: 'active' },
              { label: '已下架', value: 'inactive' },
            ]}
            onChange={(value) => handleFilterChange({ selectedStatus: value })}
            {...touchFriendlySelectProps}
          />
          <Button onClick={handleSearch}>筛选</Button>
          <Button onClick={handleReset}>重置</Button>
        </div>

        <Table
          className="content-table"
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={products}
          scroll={{ x: 1120 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => void loadProducts({ page, pageSize, filters: buildFilters() }),
          }}
        />
      </Card>

      <Modal open={viewModalVisible} title="商品详情" footer={null} onCancel={() => setViewModalVisible(false)} width={detailModalWidth}>
        {selectedProduct && (
          <div className="detail-sheet">
            <div className="detail-sheet__hero">
              <div className="detail-sheet__section detail-sheet__section--sticky">
                <Text className="detail-sheet__section-title">主图</Text>
                <div className="detail-sheet__image-grid detail-sheet__image-grid--primary">
                  {selectedProduct.mainImages[0] ? (
                    <Image
                      src={selectedProduct.mainImages[0]}
                      width={132}
                      height={132}
                      style={{ objectFit: 'cover', borderRadius: 10 }}
                      preview={{ src: selectedProduct.mainImages[0] }}
                    />
                  ) : (
                    <Text className="detail-sheet__empty-text">暂无主图</Text>
                  )}
                </div>
              </div>

              <Descriptions bordered column={2} className="detail-sheet__descriptions">
                <Descriptions.Item label="商品名称">{selectedProduct.name}</Descriptions.Item>
                <Descriptions.Item label="款号">{selectedProduct.productCode}</Descriptions.Item>
                <Descriptions.Item label="商品状态">
                  {selectedProduct.status === 'active' ? '上架中' : selectedProduct.status === 'inactive' ? '已下架' : '草稿'}
                </Descriptions.Item>
                <Descriptions.Item label="分类">{selectedProduct.category?.name || '-'}</Descriptions.Item>
                {isAdmin ? <Descriptions.Item label="供应商">{selectedProduct.supplier?.name || '-'}</Descriptions.Item> : null}
                <Descriptions.Item label="规格数">{selectedProduct.specCount}</Descriptions.Item>
                <Descriptions.Item label="可售库存">{selectedProduct.availableStock}</Descriptions.Item>
                <Descriptions.Item label="实际库存">{selectedProduct.totalStock}</Descriptions.Item>
                <Descriptions.Item label="占用库存">{selectedProduct.reservedStock}</Descriptions.Item>
                <Descriptions.Item label="售价范围">{`¥${selectedProduct.minPrice.toFixed(2)} - ¥${selectedProduct.maxPrice.toFixed(2)}`}</Descriptions.Item>
                <Descriptions.Item label="标签">{selectedProduct.tags.join('，') || '-'}</Descriptions.Item>
                <Descriptions.Item label="描述" span={2}>{selectedProduct.description || '-'}</Descriptions.Item>
              </Descriptions>
            </div>
            <Table
              className="content-table"
              rowKey="id"
              pagination={false}
              scroll={{ x: 960 }}
              title={() => '规格明细'}
              dataSource={selectedProduct.specifications}
              columns={[
                { title: '规格', key: 'specification', minWidth: 140, render: (_, item: ProductSpecification) => `${item.color} / ${item.size}` },
                { title: '规格编码', dataIndex: 'skuCode', key: 'skuCode', minWidth: 150 },
                { title: '售价', dataIndex: 'salePrice', key: 'salePrice', minWidth: 100, render: (value: number) => `¥${value.toFixed(2)}` },
                ...(isAdmin ? [{ title: '成本价', dataIndex: 'costPrice', key: 'costPrice', minWidth: 100, render: (value?: number) => `¥${Number(value || 0).toFixed(2)}` }] : []),
                { title: '可售', dataIndex: 'availableStock', key: 'availableStock', minWidth: 90 },
                { title: '占用', dataIndex: 'reservedStock', key: 'reservedStock', minWidth: 90 },
                { title: '实际库存', dataIndex: 'stock', key: 'stock', minWidth: 90 },
                {
                  title: '操作',
                  key: 'actions',
                  minWidth: 120,
                  render: (_, specification: ProductSpecification) => (
                    isAdmin ? (
                      <Button type="link" onClick={() => handleEditStock(selectedProduct, specification)}>
                        调整库存
                      </Button>
                    ) : null
                  ),
                },
              ]}
            />
            <div className="detail-sheet__section">
              {isAdmin ? (
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" onClick={() => void handleOpenLabelModal(selectedProduct)}>
                    打印当前商品标签
                  </Button>
                </div>
              ) : null}
              <Text className="detail-sheet__section-title">详情图</Text>
              <div className="detail-sheet__image-grid">
                {selectedProduct.detailImages.length > 0 ? (
                  selectedProduct.detailImages.map((url, index) => (
                    <Image
                      key={`${url}-${index}`}
                      src={url}
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                      preview={{ src: url }}
                    />
                  ))
                ) : (
                  <Text className="detail-sheet__empty-text">暂无详情图</Text>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={isAdmin && addModalVisible} title="新建商品" footer={null} onCancel={() => setAddModalVisible(false)} width={formModalWidth} destroyOnHidden>
        <ProductForm categories={categories} suppliers={suppliers} onSubmit={handleAddSubmit} onCancel={() => setAddModalVisible(false)} loading={saveLoading} />
      </Modal>

      <Modal open={isAdmin && editModalVisible} title="编辑商品" footer={null} onCancel={() => setEditModalVisible(false)} width={formModalWidth} destroyOnHidden>
        {selectedProduct && (
          <ProductForm
            categories={categories}
            suppliers={suppliers}
            product={selectedProduct}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditModalVisible(false)}
            loading={saveLoading}
          />
        )}
      </Modal>

      <Modal open={isAdmin && stockModalVisible} title="调整规格库存" onOk={() => void handleStockSubmit()} onCancel={() => setStockModalVisible(false)}>
        <Form form={stockForm} layout="vertical">
          <Form.Item label="规格">
            <Input value={selectedSpecification ? `${selectedSpecification.color} / ${selectedSpecification.size}` : ''} disabled />
          </Form.Item>
          <Form.Item name="stock" label="库存数量" rules={[{ required: true, message: '请输入库存数量' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <ProductLabelPrintModal
        open={isAdmin && labelModalVisible}
        loading={labelLoading}
        labels={productLabels}
        onCancel={() => {
          setLabelModalVisible(false);
          setProductLabels([]);
        }}
      />
    </div>
  );
};

export default ProductList;
