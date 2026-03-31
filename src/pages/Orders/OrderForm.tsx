import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import type { Order, Product, ProductSpecification } from '../../types';
import { useProducts } from '../../hooks/useProducts';

const { Title, Text } = Typography;

type DraftOrder = Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>;

interface CartItem {
  productId: number;
  skuId: number;
  productName: string;
  productCode: string;
  skuCode: string;
  image?: string | null;
  color: string;
  size: string;
  price: number;
  availableStock: number;
  quantity: number;
}

interface OrderFormProps {
  onSubmit: (order: DraftOrder) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, onCancel, loading = false }) => {
  const [form] = Form.useForm();
  const { products, categories, getProducts, getCategories } = useProducts();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();

  useEffect(() => {
    void Promise.all([getProducts({ page: 1, pageSize: 100 }), getCategories()]);
  }, []);

  const specificationRows = useMemo(() => {
    const rows: Array<CartItem & { categoryId: number; categoryName: string }> = [];

    products.forEach((product: Product) => {
      const normalizedSearchText = searchText.trim().toLowerCase();
      if (
        normalizedSearchText &&
        !product.name.toLowerCase().includes(normalizedSearchText) &&
        !product.productCode.toLowerCase().includes(normalizedSearchText)
      ) {
        return;
      }
      if (categoryId && product.categoryId !== categoryId) {
        return;
      }

      product.specifications.forEach((specification: ProductSpecification) => {
        rows.push({
          productId: product.id,
          skuId: specification.id,
          productName: product.name,
          productCode: product.productCode,
          skuCode: specification.skuCode,
          image: product.mainImages[0] ?? null,
          color: specification.color,
          size: specification.size,
          price: specification.salePrice,
          availableStock: specification.availableStock,
          quantity: 1,
          categoryId: product.categoryId,
          categoryName: product.category?.name || '-',
        });
      });
    });

    return rows;
  }, [categoryId, products, searchText]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Form.useWatch('discountAmount', form) || 0;
  const finalAmount = Math.max(totalAmount - discountAmount, 0);

  const handleSelectSpecification = (row: CartItem) => {
    if (cartItems.some((item) => item.skuId === row.skuId)) {
      message.info('该规格已加入订单');
      return;
    }
    setCartItems((current) => [...current, row]);
    setSelectorVisible(false);
  };

  const handleUpdateQuantity = (skuId: number, quantity: number) => {
    if (quantity < 1) return;
    setCartItems((current) =>
      current.map((item) =>
        item.skuId === skuId ? { ...item, quantity: Math.min(quantity, item.availableStock) } : item
      )
    );
  };

  const handleRemove = (skuId: number) => {
    setCartItems((current) => current.filter((item) => item.skuId !== skuId));
  };

  const handleFinish = async (values: any) => {
    if (cartItems.length === 0) {
      message.error('请至少选择一个规格');
      return;
    }

    await onSubmit({
      customerName: values.customerName ? String(values.customerName).trim() : '',
      customerPhone: values.customerPhone ? String(values.customerPhone).trim() : '',
      customerEmail: values.customerEmail ? String(values.customerEmail).trim() : undefined,
      items: cartItems.map((item) => ({
        id: 0,
        productId: item.productId,
        skuId: item.skuId,
        productName: item.productName,
        skuCode: item.skuCode,
        image: item.image ?? null,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      })),
      totalAmount,
      discountAmount,
      finalAmount,
      status: 'confirmed',
      address: {},
      note: values.note,
      paymentMethod: values.paymentMethod,
      paymentStatus: 'paid',
    });
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ discountAmount: 0 }} className="editor-form">
      <div className="editor-form__toolbar">
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            创建订单
          </Button>
        </Space>
      </div>

      <Card className="form-panel">
        <div className="form-panel__header">
          <div>
            <Text className="form-panel__eyebrow">Order items</Text>
            <Title level={4} className="form-panel__title">
              商品规格
            </Title>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setSelectorVisible(true)}>
            选择规格
          </Button>
        </div>
        <Table
          className="content-table"
          rowKey="skuId"
          pagination={false}
          dataSource={cartItems}
          columns={[
            {
              title: '商品',
              key: 'product',
              render: (_, item: CartItem) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {item.image ? <Image src={item.image} width={48} height={48} /> : null}
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.productName}</div>
                    <div style={{ color: '#8c8c8c' }}>{item.skuCode}</div>
                  </div>
                </div>
              ),
            },
            {
              title: '规格',
              key: 'specification',
              render: (_, item: CartItem) => `${item.color} / ${item.size}`,
            },
            {
              title: '单价',
              dataIndex: 'price',
              key: 'price',
              render: (value: number) => `¥${value.toFixed(2)}`,
            },
            {
              title: '数量',
              key: 'quantity',
              render: (_, item: CartItem) => (
                <Space>
                  <Button
                    size="small"
                    icon={<MinusOutlined />}
                    onClick={() => handleUpdateQuantity(item.skuId, item.quantity - 1)}
                  />
                  <InputNumber
                    min={1}
                    max={item.availableStock}
                    value={item.quantity}
                    onChange={(value) => value && handleUpdateQuantity(item.skuId, Number(value))}
                  />
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleUpdateQuantity(item.skuId, item.quantity + 1)}
                    disabled={item.quantity >= item.availableStock}
                  />
                </Space>
              ),
            },
            {
              title: '可售库存',
              dataIndex: 'availableStock',
              key: 'availableStock',
            },
            {
              title: '小计',
              key: 'subtotal',
              render: (_, item: CartItem) => `¥${(item.price * item.quantity).toFixed(2)}`,
            },
            {
              title: '操作',
              key: 'action',
              render: (_, item: CartItem) => (
                <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemove(item.skuId)}>
                  删除
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Card className="form-panel">
        <div className="form-panel__header">
          <div>
            <Text className="form-panel__eyebrow">Payment</Text>
            <Title level={4} className="form-panel__title">
              支付信息
            </Title>
          </div>
        </div>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="paymentMethod" label="支付方式">
              <Select
                className="order-form__select"
                allowClear
                options={[
                  { label: '支付宝', value: 'alipay' },
                  { label: '微信支付', value: 'wechat' },
                  { label: '银行卡', value: 'card' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="discountAmount" label="优惠金额">
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="note" label="备注">
          <Input.TextArea rows={3} placeholder="记录门店订单说明、到店时间、售后备注等" />
        </Form.Item>
        <div className="order-summary">
          <Text className="order-summary__label">应收金额</Text>
          <Text className="order-summary__value">¥{finalAmount.toFixed(2)}</Text>
        </div>
      </Card>

      <Card className="form-panel">
        <div className="form-panel__header">
          <div>
            <Text className="form-panel__eyebrow">Customer</Text>
            <Title level={4} className="form-panel__title">
              客户信息
            </Title>
          </div>
        </div>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="customerName" label="客户姓名">
              <Input placeholder="选填" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="customerPhone"
              label="联系电话"
              rules={[
                {
                  pattern: /^$|^1[3-9]\d{9}$/,
                  message: '请输入正确的手机号',
                },
              ]}
            >
              <Input placeholder="选填" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="customerEmail" label="电子邮箱" rules={[{ type: 'email', message: '请输入正确邮箱格式' }]}>
              <Input placeholder="选填" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Modal
        open={selectorVisible}
        title="选择规格"
        footer={null}
        width={980}
        onCancel={() => setSelectorVisible(false)}
        destroyOnHidden
      >
        <div className="filter-toolbar">
          <Input
            placeholder="搜索商品名称/款号"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="filter-toolbar__search"
          />
          <Select
            allowClear
            placeholder="分类"
            className="filter-toolbar__select"
            value={categoryId}
            options={categories.map((item) => ({ label: item.name, value: item.id }))}
            onChange={setCategoryId}
          />
        </div>
        <Table
          className="content-table"
          rowKey="skuId"
          pagination={{ pageSize: 8 }}
          dataSource={specificationRows}
          columns={[
            {
              title: '商品',
              key: 'productName',
              render: (_, item: CartItem & { categoryName: string }) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{item.productName}</div>
                  <div style={{ color: '#8c8c8c' }}>{item.productCode} · {item.categoryName}</div>
                </div>
              ),
            },
            {
              title: '规格',
              key: 'specification',
              render: (_, item: CartItem) => `${item.color} / ${item.size}`,
            },
            { title: '规格编码', dataIndex: 'skuCode', key: 'skuCode' },
            { title: '售价', dataIndex: 'price', key: 'price', render: (value: number) => `¥${value.toFixed(2)}` },
            {
              title: '可售库存',
              dataIndex: 'availableStock',
              key: 'availableStock',
              render: (value: number) => (
                <Tag color={value > 10 ? 'green' : value > 0 ? 'orange' : 'red'}>{value}</Tag>
              ),
            },
            {
              title: '操作',
              key: 'action',
              render: (_, item: CartItem) => (
                <Button type="primary" size="small" onClick={() => handleSelectSpecification(item)} disabled={item.availableStock === 0}>
                  选择
                </Button>
              ),
            },
          ]}
        />
      </Modal>
    </Form>
  );
};

export default OrderForm;
