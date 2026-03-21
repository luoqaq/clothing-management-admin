import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Form,
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
import ProductForm from './ProductForm';
import type { Product, ProductFilters, ProductStatus, ProductSpecification } from '../../types';

const { Title, Text } = Typography;

const ProductList: React.FC = () => {
  const {
    products,
    categories,
    brands,
    loading,
    pagination,
    filters,
    getProducts,
    getCategories,
    getBrands,
    removeProduct,
    updateStock,
    addProduct,
    editProduct,
  } = useProducts();

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | undefined>();
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSpecification, setSelectedSpecification] = useState<ProductSpecification | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [stockForm] = Form.useForm();

  useEffect(() => {
    void Promise.all([getProducts({ page: 1, pageSize: 10 }), getCategories(), getBrands()]);
  }, []);

  const loadProducts = (params?: { page?: number; pageSize?: number; filters?: ProductFilters }) =>
    getProducts(params ?? { page: pagination.page, pageSize: pagination.pageSize, filters });

  const handleSearch = () => {
    const nextFilters: ProductFilters = {
      search: searchText || undefined,
      categoryId: selectedCategory,
      brandId: selectedBrand,
      status: selectedStatus,
    };
    void loadProducts({ page: 1, pageSize: 10, filters: nextFilters });
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedCategory(undefined);
    setSelectedBrand(undefined);
    setSelectedStatus(undefined);
    void loadProducts({ page: 1, pageSize: 10, filters: {} });
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
      title: '商品',
      key: 'product',
      minWidth: 220,
      render: (_: unknown, record: Product) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.name}</div>
          <div style={{ color: '#8c8c8c' }}>{record.brand?.name || '未设置品牌'}</div>
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
      title: '规格数',
      dataIndex: 'specCount',
      key: 'specCount',
      minWidth: 110,
      render: (value: number) => `${value} 个规格`,
    },
    {
      title: '总库存',
      dataIndex: 'totalStock',
      key: 'totalStock',
      minWidth: 100,
    },
    {
      title: '售价范围',
      key: 'priceRange',
      minWidth: 160,
      render: (_: unknown, record: Product) => `¥${record.minPrice.toFixed(2)} - ¥${record.maxPrice.toFixed(2)}`,
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
          <Button type="text" icon={<EditOutlined />} onClick={() => { setSelectedProduct(record); setEditModalVisible(true); }}>
            编辑
          </Button>
          <Popconfirm title="确定删除这款商品吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
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
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
            新建商品
          </Button>
        </div>

        <div className="filter-toolbar">
          <Input
            placeholder="搜索商品名称"
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
            onChange={setSelectedCategory}
          />
          <Select
            allowClear
            placeholder="品牌"
            className="filter-toolbar__select"
            value={selectedBrand}
            options={brands.map((item) => ({ label: item.name, value: item.id }))}
            onChange={setSelectedBrand}
          />
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
            onChange={setSelectedStatus}
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
            onChange: (page, pageSize) => void loadProducts({ page, pageSize, filters }),
          }}
        />
      </Card>

      <Modal open={viewModalVisible} title="商品详情" footer={null} onCancel={() => setViewModalVisible(false)} width={960}>
        {selectedProduct && (
          <div className="detail-sheet">
            <Descriptions bordered column={2} className="detail-sheet__descriptions">
              <Descriptions.Item label="商品名称">{selectedProduct.name}</Descriptions.Item>
              <Descriptions.Item label="商品状态">
                {selectedProduct.status === 'active' ? '上架中' : selectedProduct.status === 'inactive' ? '已下架' : '草稿'}
              </Descriptions.Item>
              <Descriptions.Item label="分类">{selectedProduct.category?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="品牌">{selectedProduct.brand?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="规格数">{selectedProduct.specCount}</Descriptions.Item>
              <Descriptions.Item label="总库存">{selectedProduct.totalStock}</Descriptions.Item>
              <Descriptions.Item label="售价范围">{`¥${selectedProduct.minPrice.toFixed(2)} - ¥${selectedProduct.maxPrice.toFixed(2)}`}</Descriptions.Item>
              <Descriptions.Item label="标签">{selectedProduct.tags.join('，') || '-'}</Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>{selectedProduct.description || '-'}</Descriptions.Item>
            </Descriptions>
            <div className="detail-sheet__section">
              <Text className="detail-sheet__section-title">主图</Text>
              <Space wrap size={12}>
                {selectedProduct.mainImages.length > 0 ? (
                  selectedProduct.mainImages.map((url, index) => (
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
                  <Text className="detail-sheet__empty-text">暂无主图</Text>
                )}
              </Space>
            </div>
            <div className="detail-sheet__section">
              <Text className="detail-sheet__section-title">详情图</Text>
              <Space wrap size={12}>
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
              </Space>
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
                { title: '成本价', dataIndex: 'costPrice', key: 'costPrice', minWidth: 100, render: (value: number) => `¥${value.toFixed(2)}` },
                { title: '库存', dataIndex: 'stock', key: 'stock', minWidth: 90 },
                { title: '占用', dataIndex: 'reservedStock', key: 'reservedStock', minWidth: 90 },
                { title: '可售', dataIndex: 'availableStock', key: 'availableStock', minWidth: 90 },
                {
                  title: '操作',
                  key: 'actions',
                  minWidth: 120,
                  render: (_, specification: ProductSpecification) => (
                    <Button type="link" onClick={() => handleEditStock(selectedProduct, specification)}>
                      调整库存
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      <Modal open={addModalVisible} title="新建商品" footer={null} onCancel={() => setAddModalVisible(false)} width={1100} destroyOnHidden>
        <ProductForm categories={categories} brands={brands} onSubmit={handleAddSubmit} onCancel={() => setAddModalVisible(false)} loading={saveLoading} />
      </Modal>

      <Modal open={editModalVisible} title="编辑商品" footer={null} onCancel={() => setEditModalVisible(false)} width={1100} destroyOnHidden>
        {selectedProduct && (
          <ProductForm
            categories={categories}
            brands={brands}
            product={selectedProduct}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditModalVisible(false)}
            loading={saveLoading}
          />
        )}
      </Modal>

      <Modal open={stockModalVisible} title="调整规格库存" onOk={() => void handleStockSubmit()} onCancel={() => setStockModalVisible(false)}>
        <Form form={stockForm} layout="vertical">
          <Form.Item label="规格">
            <Input value={selectedSpecification ? `${selectedSpecification.color} / ${selectedSpecification.size}` : ''} disabled />
          </Form.Item>
          <Form.Item name="stock" label="库存数量" rules={[{ required: true, message: '请输入库存数量' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductList;
