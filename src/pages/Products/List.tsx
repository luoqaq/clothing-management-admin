import { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Popconfirm,
  Image,
  message,
  Modal,
  Form,
  InputNumber,
  Descriptions,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, InboxOutlined } from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import type { Product, ProductFilters, ProductStatus } from '../../types';
import ProductForm from './ProductForm';

const { Search } = Input;
const { Option } = Select;

const ProductList: React.FC = () => {
  const {
    products,
    categories,
    loading,
    pagination,
    filters,
    getProducts,
    getCategories,
    removeProduct,
    updateStock,
    addProduct,
    editProduct,
  } = useProducts();

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [selectedSize, setSelectedSize] = useState<string>();
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [addProductLoading, setAddProductLoading] = useState(false);

  // 辅助函数：根据 id 获取分类名称
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '-';
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      getProducts({ page: 1, pageSize: 10 }),
      getCategories(),
    ]);
  };

  const handleSearch = () => {
    const newFilters: ProductFilters = {};
    if (searchText) newFilters.search = searchText;
    if (selectedCategory) newFilters.categoryId = parseInt(selectedCategory);
    if (selectedStatus) newFilters.status = selectedStatus;
    if (selectedSize) newFilters.size = selectedSize;

    getProducts({ page: 1, pageSize: 10, filters: newFilters });
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedCategory(undefined);
    setSelectedStatus(undefined);
    setSelectedSize(undefined);
    getProducts({ page: 1, pageSize: 10 });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    getProducts({ page, pageSize, filters });
  };

  const handleDelete = async (id: number) => {
    const result = await removeProduct(id);
    if (result) {
      message.success('商品删除成功');
      getProducts({ page: pagination.page, pageSize: pagination.pageSize, filters });
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewModalVisible(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditModalVisible(true);
  };

  const handleEditStock = (product: Product) => {
    setSelectedProduct(product);
    form.setFieldsValue({ stock: product.stock });
    setStockModalVisible(true);
  };

  const handleStockSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedProduct) return;

      const result = await updateStock(selectedProduct.id, values.stock);
      if (result) {
        message.success('库存更新成功');
        setStockModalVisible(false);
        setSelectedProduct(null);
        getProducts({ page: pagination.page, pageSize: pagination.pageSize, filters });
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns = [
    {
      title: '商品图片',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images: string[]) => (
        images?.[0] ? (
          <Image
            src={images[0]}
            alt="商品图片"
            width={60}
            height={60}
            style={{ borderRadius: 4, objectFit: 'cover' }}
          />
        ) : (
          <InboxOutlined style={{ fontSize: 40, color: '#d9d9d9' }} />
        )
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '尺寸',
      dataIndex: 'size',
      key: 'size',
      width: 100,
    },
    {
      title: '分类',
      key: 'category',
      render: (_: any, record: Product) => getCategoryName(record.categoryId),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number, record: Product) => (
        <Tag color={stock > 50 ? 'green' : stock > 10 ? 'orange' : 'red'}>
          {stock}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProductStatus) => {
        const statusMap: Record<ProductStatus, { text: string; color: string }> = {
          active: { text: '上架中', color: 'green' },
          inactive: { text: '已下架', color: 'default' },
          out_of_stock: { text: '缺货', color: 'red' },
        };
        const statusInfo = statusMap[status];
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: Product) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} size="small" onClick={() => handleViewProduct(record)}>
            查看
          </Button>
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => handleEditProduct(record)}>
            编辑
          </Button>
          <Button type="text" size="small" onClick={() => handleEditStock(record)}>
            库存
          </Button>
          <Popconfirm
            title="确定删除此商品吗？"
            description="删除后数据将无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAddProduct = () => {
    setAddModalVisible(true);
  };

  const handleAddSubmit = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setAddProductLoading(true);
    try {
      const result = await addProduct(product);
      if (result) {
        message.success('商品创建成功');
        setAddModalVisible(false);
        getProducts({ page: pagination.page, pageSize: pagination.pageSize, filters });
      }
    } catch (error) {
      console.error('Create product error:', error);
    } finally {
      setAddProductLoading(false);
    }
  };

  const handleAddCancel = () => {
    setAddModalVisible(false);
  };

  const handleEditSubmit = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedProduct) return;
    setAddProductLoading(true);
    try {
      const result = await editProduct(selectedProduct.id, product);
      if (result) {
        message.success('商品更新成功');
        setEditModalVisible(false);
        getProducts({ page: pagination.page, pageSize: pagination.pageSize, filters });
      }
    } catch (error) {
      console.error('Update product error:', error);
    } finally {
      setAddProductLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
  };

  return (
    <div>
      <Card
        title="商品管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct}>
            新增商品
          </Button>
        }
      >
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索商品名称"
            allowClear
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
          />
          <Select
            placeholder="选择分类"
            style={{ width: 150 }}
            allowClear
            value={selectedCategory}
            onChange={setSelectedCategory}
          >
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="选择状态"
            style={{ width: 120 }}
            allowClear
            value={selectedStatus}
            onChange={setSelectedStatus}
          >
            <Option value="active">上架中</Option>
            <Option value="inactive">已下架</Option>
            <Option value="out_of_stock">缺货</Option>
          </Select>
          <Select
            placeholder="选择尺寸"
            style={{ width: 120 }}
            allowClear
            value={selectedSize}
            onChange={setSelectedSize}
          >
            <Option value="XS">XS</Option>
            <Option value="S">S</Option>
            <Option value="M">M</Option>
            <Option value="L">L</Option>
            <Option value="XL">XL</Option>
            <Option value="XXL">XXL</Option>
            <Option value="3XL">3XL</Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: handlePageChange,
          }}
        />
      </Card>

      <Modal
        title="修改库存"
        open={stockModalVisible}
        onOk={handleStockSubmit}
        onCancel={() => {
          setStockModalVisible(false);
          setSelectedProduct(null);
        }}
        destroyOnHidden
      >
        {selectedProduct && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>商品：</strong>{selectedProduct.name}
            </div>
            <Form form={form} layout="vertical">
              <Form.Item
                name="stock"
                label="库存数量"
                rules={[{ required: true, message: '请输入库存数量' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      <Modal
        title="新增商品"
        open={addModalVisible}
        onCancel={handleAddCancel}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <ProductForm
          categories={categories}
          onSubmit={handleAddSubmit}
          onCancel={handleAddCancel}
          loading={addProductLoading}
        />
      </Modal>

      {/* 查看商品模态框 */}
      <Modal
        title="商品详情"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedProduct(null);
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedProduct && (
          <div>
            <div style={{ marginBottom: 24 }}>
              {selectedProduct.images?.[0] ? (
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 8 }}
                />
              ) : (
                <div
                  style={{
                    width: 200,
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 8,
                  }}
                >
                  <InboxOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                </div>
              )}
            </div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="商品名称" span={2}>
                {selectedProduct.name}
              </Descriptions.Item>
              <Descriptions.Item label="分类">
                {getCategoryName(selectedProduct.categoryId)}
              </Descriptions.Item>
              <Descriptions.Item label="尺寸">
                {selectedProduct.size}
              </Descriptions.Item>
              <Descriptions.Item label="销售价格">
                ¥{selectedProduct.price.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="成本价格">
                ¥{selectedProduct.costPrice.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="库存">
                <Tag color={selectedProduct.stock > 50 ? 'green' : selectedProduct.stock > 10 ? 'orange' : 'red'}>
                  {selectedProduct.stock}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {(() => {
                  const statusMap: Record<ProductStatus, { text: string; color: string }> = {
                    active: { text: '上架中', color: 'green' },
                    inactive: { text: '已下架', color: 'default' },
                    out_of_stock: { text: '缺货', color: 'red' },
                  };
                  const statusInfo = statusMap[selectedProduct.status];
                  return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {new Date(selectedProduct.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 编辑商品模态框 */}
      <Modal
        title="编辑商品"
        open={editModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={800}
        destroyOnHidden
      >
        {selectedProduct && (
          <ProductForm
            categories={categories}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
            loading={addProductLoading}
            product={selectedProduct}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProductList;
