import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Card,
  Row,
  Col,
  Divider,
  Table,
  Image,
  Modal,
  message,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import type { Product, Order, OrderAddress, OrderItem } from '../../types';
import { useProducts } from '../../hooks/useProducts';

const { TextArea } = Input;
const { Option } = Select;

interface CartItem extends Partial<Product> {
  quantity: number;
  selectedSize?: string;
}

interface OrderFormProps {
  onSubmit: (order: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, onCancel, loading = false }) => {
  const [form] = Form.useForm();
  const { products, getProducts, getCategories, categories } = useProducts();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>();

  // 计算金额
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const discountAmount = Form.useWatch('discountAmount', form) || 0;
  const finalAmount = totalAmount - discountAmount;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      getProducts({ page: 1, pageSize: 100 }),
      getCategories(),
    ]);
  };

  // 商品选择
  const handleSelectProduct = (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      message.info('该商品已在购物车中');
      return;
    }

    const newItem: CartItem = {
      ...product,
      quantity: 1,
      selectedSize: product.size,
    };
    setCartItems([...cartItems, newItem]);
    setProductModalVisible(false);
  };

  // 更新购物车商品数量
  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(cartItems.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  // 移除购物车商品
  const handleRemoveItem = (productId: number) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  // 提交订单
  const handleFinish = async (values: any) => {
    if (cartItems.length === 0) {
      message.error('请至少添加一件商品');
      return;
    }

    const orderItems: OrderItem[] = cartItems.map((item, index) => ({
      id: index + 1,
      productId: item.id!,
      productName: item.name!,
      sku: `SKU-${item.id}`,
      image: item.images?.[0],
      price: item.price!,
      quantity: item.quantity,
      size: item.selectedSize,
    }));

    const address: OrderAddress = {
      name: values.addressName,
      phone: values.addressPhone,
      province: values.province,
      city: values.city,
      district: values.district,
      detail: values.addressDetail,
      postalCode: values.postalCode,
    };

    const orderData: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'> = {
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      customerEmail: values.customerEmail,
      items: orderItems,
      totalAmount,
      discountAmount: discountAmount || 0,
      finalAmount,
      status: 'pending',
      address,
      note: values.note,
      paymentMethod: values.paymentMethod,
      paymentStatus: 'unpaid',
    };

    await onSubmit(orderData);
  };

  // 商品选择表格列
  const productColumns = [
    {
      title: '商品图片',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images: string[]) => (
        images?.[0] ? (
          <Image src={images[0]} width={50} height={50} style={{ borderRadius: 4, objectFit: 'cover' }} />
        ) : '无图'
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      key: 'category',
      render: (_: any, record: Product) => {
        const category = categories.find(c => c.id === record.categoryId);
        return category?.name || '-';
      },
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
      render: (stock: number) => (
        <Tag color={stock > 50 ? 'green' : stock > 10 ? 'orange' : 'red'}>
          {stock}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Product) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleSelectProduct(record)}
          disabled={record.stock === 0}
        >
          选择
        </Button>
      ),
    },
  ];

  // 购物车表格列
  const cartColumns = [
    {
      title: '商品',
      key: 'product',
      render: (_: any, record: CartItem) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {record.images?.[0] && (
            <Image
              src={record.images[0]}
              width={50}
              height={50}
              style={{ borderRadius: 4, marginRight: 12 }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>
              分类：{categories.find((c) => c.id === record.categoryId)?.name || '-'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '规格',
      key: 'spec',
      render: (_: any, record: CartItem) => (
        <span>{record.selectedSize || '-'}</span>
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price?.toFixed(2) || '0.00'}`,
    },
    {
      title: '数量',
      key: 'quantity',
      render: (_: any, record: CartItem) => (
        <Space>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => handleUpdateQuantity(record.id!, record.quantity - 1)}
          />
          <InputNumber
            size="small"
            min={1}
            max={record.stock}
            value={record.quantity}
            onChange={(value) => value && handleUpdateQuantity(record.id!, value)}
            style={{ width: 70 }}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleUpdateQuantity(record.id!, record.quantity + 1)}
            disabled={record.quantity >= record.stock!}
          />
        </Space>
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_: any, record: CartItem) => (
        <span style={{ fontWeight: 500 }}>
          ¥{((record.price || 0) * record.quantity).toFixed(2)}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CartItem) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id!)}
        >
          删除
        </Button>
      ),
    },
  ];

  const filteredProducts = products.filter(product => {
    if (searchText && !product.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    if (selectedCategory && product.categoryId !== parseInt(selectedCategory)) {
      return false;
    }
    return true;
  });

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ discountAmount: 0 }}>
      <Card title="客户信息" size="small">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="customerName"
              label="客户姓名"
              rules={[{ required: true, message: '请输入客户姓名' }]}
            >
              <Input placeholder="请输入客户姓名" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="customerPhone"
              label="联系电话"
              rules={[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
              ]}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="customerEmail"
              label="电子邮箱"
              rules={[{ type: 'email', message: '请输入正确的邮箱格式' }]}
            >
              <Input placeholder="请输入电子邮箱" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="收货地址" size="small" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="addressName"
              label="收货人"
              rules={[{ required: true, message: '请输入收货人姓名' }]}
            >
              <Input placeholder="请输入收货人姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="addressPhone"
              label="联系电话"
              rules={[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
              ]}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="province"
              label="省份"
              rules={[{ required: true, message: '请选择/输入省份' }]}
            >
              <Input placeholder="请输入省份" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="city"
              label="城市"
              rules={[{ required: true, message: '请选择/输入城市' }]}
            >
              <Input placeholder="请输入城市" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="district"
              label="区/县"
              rules={[{ required: true, message: '请选择/输入区/县' }]}
            >
              <Input placeholder="请输入区/县" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={18}>
            <Form.Item
              name="addressDetail"
              label="详细地址"
              rules={[{ required: true, message: '请输入详细地址' }]}
            >
              <Input placeholder="请输入详细地址" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="postalCode"
              label="邮政编码"
              rules={[{ pattern: /^\d{6}$/, message: '请输入正确的邮编格式' }]}
            >
              <Input placeholder="邮政编码" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card
        title="商品信息"
        size="small"
        style={{ marginTop: 16 }}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setProductModalVisible(true)}
          >
            添加商品
          </Button>
        }
      >
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            暂无商品，请点击"添加商品"按钮添加
          </div>
        ) : (
          <Table
            columns={cartColumns}
            dataSource={cartItems}
            rowKey="id"
            pagination={false}
          />
        )}
      </Card>

      {cartItems.length > 0 && (
        <Card title="订单信息" size="small" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="discountAmount"
                label="优惠金额"
                rules={[{ type: 'number', min: 0, message: '优惠金额不能为负数' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="优惠金额"
                  min={0}
                  max={totalAmount}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="paymentMethod"
                label="支付方式"
                rules={[{ required: true, message: '请选择支付方式' }]}
              >
                <Select placeholder="请选择支付方式">
                  <Option value="cash">现金</Option>
                  <Option value="wechat">微信支付</Option>
                  <Option value="alipay">支付宝</Option>
                  <Option value="bank">银行转账</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="shippingMethod"
                label="配送方式"
                rules={[{ required: true, message: '请选择配送方式' }]}
              >
                <Select placeholder="请选择配送方式">
                  <Option value="express">快递配送</Option>
                  <Option value="self">到店自提</Option>
                  <Option value="store">门店配送</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <Space direction="vertical" size="small" style={{ width: 'auto' }}>
              <div>
                商品总额：
                <span style={{ fontSize: 16, fontWeight: 500 }}>¥{totalAmount.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ color: '#ff4d4f' }}>
                  优惠金额：
                  <span style={{ fontSize: 16, fontWeight: 500 }}>-¥{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                实付金额：
                <span style={{ color: '#1890ff' }}>¥{finalAmount.toFixed(2)}</span>
              </div>
            </Space>
          </div>

          <Form.Item name="note" label="订单备注" style={{ marginTop: 16 }}>
            <TextArea rows={3} placeholder="请输入订单备注（选填）" />
          </Form.Item>
        </Card>
      )}

      <Form.Item style={{ marginBottom: 0, marginTop: 16, textAlign: 'right' }}>
        <Space size="middle">
          <Button onClick={onCancel} disabled={loading}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} disabled={cartItems.length === 0}>
            创建订单
          </Button>
        </Space>
      </Form.Item>

      {/* 商品选择弹窗 */}
      <Modal
        title="选择商品"
        open={productModalVisible}
        onCancel={() => setProductModalVisible(false)}
        footer={null}
        width={1000}
      >
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索商品名称"
            allowClear
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
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
        </div>

        <Table
          columns={productColumns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 件商品`,
          }}
        />
      </Modal>
    </Form>
  );
};

export default OrderForm;
