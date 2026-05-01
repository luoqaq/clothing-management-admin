import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
  Badge,
  Divider,
  Statistic,
} from 'antd';
import {
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  BarcodeOutlined,
  ArrowLeftOutlined,
  ClearOutlined,
  CameraOutlined,
  EditOutlined,
  UsbOutlined,
} from '@ant-design/icons';
import type { CustomerAgeBucket, ScannedSkuProduct, Order, OrderItem } from '../../types';
import { productsApi } from '../../api/products';
import { customersApi } from '../../api/customers';
import { ordersApi } from '../../api/orders';
import { getErrorMessage } from '../../utils/error';
import CameraScanner from '../../components/CameraScanner';

const { Title, Text } = Typography;

interface CartItem extends ScannedSkuProduct {
  quantity: number;
  soldPrice: number;
}

type ScanMode = 'camera' | 'input';

const paymentMethodOptions = [
  { label: '现金', value: 'cash' },
  { label: '支付宝', value: 'alipay' },
  { label: '微信支付', value: 'wechat' },
  { label: '银行卡', value: 'card' },
];

const ScanOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const inputRef = useRef<any>(null);
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [scanCode, setScanCode] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [ageBuckets, setAgeBuckets] = useState<CustomerAgeBucket[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [lastScanned, setLastScanned] = useState<{ name: string; action: 'added' | 'updated' } | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>('camera');

  // 保持输入框焦点（仅在输入模式下）
  const keepFocus = () => {
    if (scanMode === 'input') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  useEffect(() => {
    keepFocus();
    const loadAgeBuckets = async () => {
      try {
        const result = await customersApi.getAgeBuckets();
        if (result.success && result.data) {
          setAgeBuckets(result.data);
        }
      } catch (err) {
        message.error(getErrorMessage(err, '获取年龄段失败'));
      }
    };
    void loadAgeBuckets();
  }, []);

  // 切换模式时处理焦点
  useEffect(() => {
    if (scanMode === 'input') {
      keepFocus();
    }
  }, [scanMode]);

  const addCartItem = (product: ScannedSkuProduct): 'added' | 'updated' => {
    const existing = cartItems.find((item) => item.skuId === product.skuId);
    
    if (existing) {
      setCartItems((current) =>
        current.map((item) =>
          item.skuId === product.skuId
            ? { ...item, quantity: Math.min(item.quantity + 1, item.availableStock) }
            : item
        )
      );
      return 'updated';
    }
    
    setCartItems((current) => [...current, { ...product, quantity: 1, soldPrice: product.salePrice }]);
    return 'added';
  };

  const handleUpdateSoldPrice = (skuId: number, soldPrice: number) => {
    if (soldPrice < 0) return;
    setCartItems((current) =>
      current.map((item) => (item.skuId === skuId ? { ...item, soldPrice } : item))
    );
    keepFocus();
  };

  const handleScan = async (code: string) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    try {
      setScanLoading(true);
      const response = await productsApi.getProductByCode(trimmedCode);
      
      if (!response.success || !response.data) {
        message.error(response.message || '未找到对应标签商品');
        return;
      }

      const product = response.data;
      
      if (product.productStatus !== 'active') {
        message.warning('该商品已下架，暂不可销售');
        return;
      }
      
      if (product.status !== 'active') {
        message.warning('该规格已停用，暂不可销售');
        return;
      }
      
      if (product.availableStock <= 0) {
        message.warning('该规格当前无可售库存');
        return;
      }

      const action = addCartItem(product);
      setLastScanned({ name: product.productName, action });
      setScanCode('');
      message.success(
        action === 'added' 
          ? `已添加: ${product.productName}` 
          : `已累计数量: ${product.productName}`
      );
    } catch (err) {
      message.error(getErrorMessage(err, '扫码识别失败'));
    } finally {
      setScanLoading(false);
      keepFocus();
    }
  };

  const handleCameraScan = async (code: string) => {
    // 摄像头扫码回调，复用相同的处理逻辑
    await handleScan(code);
  };

  const handleCameraError = (error: string) => {
    message.error(error);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setScanCode(value);
    
    // 检测是否包含回车（扫码枪通常会在末尾发送回车）
    if (value.includes('\n') || value.includes('\r')) {
      const cleanCode = value.replace(/[\r\n]/g, '');
      handleScan(cleanCode);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScan(scanCode);
    }
  };

  const handleUpdateQuantity = (skuId: number, quantity: number) => {
    if (quantity < 1) return;
    setCartItems((current) =>
      current.map((item) =>
        item.skuId === skuId ? { ...item, quantity: Math.min(quantity, item.availableStock) } : item
      )
    );
    keepFocus();
  };

  const handleRemove = (skuId: number) => {
    setCartItems((current) => current.filter((item) => item.skuId !== skuId));
    keepFocus();
  };

  const handleClearAll = () => {
    if (cartItems.length === 0) return;
    
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有已扫码商品吗？',
      okText: '清空',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setCartItems([]);
        setLastScanned(null);
        message.success('已清空商品列表');
        keepFocus();
      },
    });
  };

  const handleSubmit = async () => {
    if (submittingRef.current) {
      return;
    }

    if (cartItems.length === 0) {
      message.error('请至少添加一个商品');
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const values = await form.validateFields();

      const totalAmount = cartItems.reduce((sum, item) => sum + item.soldPrice * item.quantity, 0);
      const finalAmount = totalAmount;

      const orderItems: OrderItem[] = cartItems.map((item) => ({
        id: 0,
        productId: item.productId,
        skuId: item.skuId,
        productName: item.productName,
        skuCode: item.skuCode,
        image: item.image ?? null,
        price: item.salePrice,
        soldPrice: item.soldPrice,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      }));

      const response = await ordersApi.createOrder({
        customerName: values.customerName?.trim() || '',
        customerPhone: values.customerPhone?.trim() || '',
        customerEmail: values.customerEmail?.trim() || undefined,
        ageBucketId: values.ageBucketId || null,
        items: orderItems,
        totalAmount,
        finalAmount,
        status: 'confirmed',
        paymentMethod: values.paymentMethod,
        paymentStatus: 'paid',
        note: values.note,
        address: {},
      } as Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>);

      if (response.success && response.data) {
        message.success('订单创建成功');
        navigate('/orders');
      } else {
        throw new Error(response.message || '创建订单失败');
      }
    } catch (err) {
      message.error(getErrorMessage(err, '下单失败'));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.soldPrice * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const columns = [
    {
      title: '商品',
      key: 'product',
      render: (_: any, item: CartItem) => (
        <Space>
          {item.image ? (
            <img src={item.image} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
          ) : (
            <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarcodeOutlined />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{item.productName}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{item.skuCode}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '规格',
      key: 'spec',
      width: 120,
      render: (_: any, item: CartItem) => `${item.color} / ${item.size}`,
    },
    {
      title: '原价',
      key: 'price',
      width: 100,
      render: (_: any, item: CartItem) => `¥${item.salePrice.toFixed(2)}`,
    },
    {
      title: '售出价',
      key: 'soldPrice',
      width: 120,
      render: (_: any, item: CartItem) => (
        <InputNumber
          min={0}
          precision={2}
          value={item.soldPrice}
          onChange={(value) => value !== null && handleUpdateSoldPrice(item.skuId, Number(value))}
          style={{ width: 90 }}
        />
      ),
    },
    {
      title: '数量',
      key: 'quantity',
      width: 160,
      render: (_: any, item: CartItem) => (
        <Space>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => handleUpdateQuantity(item.skuId, item.quantity - 1)}
            disabled={item.quantity <= 1}
          />
          <InputNumber
            min={1}
            max={item.availableStock}
            value={item.quantity}
            onChange={(value) => value && handleUpdateQuantity(item.skuId, Number(value))}
            style={{ width: 60 }}
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
      title: '库存',
      key: 'stock',
      width: 80,
      render: (_: any, item: CartItem) => (
        <Tag color={item.availableStock > 10 ? 'green' : item.availableStock > 0 ? 'orange' : 'red'}>
          {item.availableStock}
        </Tag>
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      width: 100,
      render: (_: any, item: CartItem) => (
        <Text strong>¥{(item.soldPrice * item.quantity).toFixed(2)}</Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, item: CartItem) => (
        <Button
          danger
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(item.skuId)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <Spin spinning={submitting} tip="正在创建订单..." size="large">
      <div className="scan-order-page" style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* 头部 */}
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')}>
          返回订单列表
        </Button>
      </div>

      <Title level={3} style={{ marginBottom: 24 }}>
        <BarcodeOutlined style={{ marginRight: 8 }} />
        扫码录单
      </Title>

      {/* 扫码输入区 */}
      <Card style={{ marginBottom: 24 }}>
        {/* 模式切换 */}
        <div style={{ marginBottom: 24 }}>
          <Radio.Group
            value={scanMode}
            onChange={(e) => setScanMode(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="large"
          >
            <Radio.Button value="camera">
              <CameraOutlined style={{ marginRight: 4 }} />
              摄像头扫码
            </Radio.Button>
            <Radio.Button value="input">
              <UsbOutlined style={{ marginRight: 4 }} />
              扫码枪/手动输入
            </Radio.Button>
          </Radio.Group>
        </div>

        {/* 摄像头模式 */}
        {scanMode === 'camera' && (
          <CameraScanner
            onScan={handleCameraScan}
            onError={handleCameraError}
            disabled={submitting}
          />
        )}

        {/* 输入模式 */}
        {scanMode === 'input' && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                <EditOutlined style={{ marginRight: 4 }} />
                扫码枪/手动输入
              </Text>
              <Input
                ref={inputRef}
                size="large"
                placeholder="请使用扫码枪扫描条码，或手动输入后按回车"
                value={scanCode}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                prefix={<BarcodeOutlined />}
                suffix={scanLoading ? <Tag color="processing">识别中...</Tag> : null}
                style={{ fontSize: 16 }}
                autoFocus
              />
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                提示：使用扫码枪时，光标保持在输入框内，扫描后会自动识别；同款商品会自动累加数量
              </Text>
            </div>

            {lastScanned && (
              <Alert
                message={lastScanned.action === 'added' ? '商品已添加' : '数量已更新'}
                description={`${lastScanned.name} ${lastScanned.action === 'updated' ? '数量 +1' : ''}`}
                type="success"
                showIcon
                closable
                onClose={() => setLastScanned(null)}
              />
            )}
          </Space>
        )}
      </Card>

      {/* 商品列表 */}
      <Card
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>商品清单</span>
            <Badge count={totalQuantity} showZero style={{ backgroundColor: '#8bb8d9' }} />
          </Space>
        }
        extra={
          <Button danger type="text" icon={<ClearOutlined />} onClick={handleClearAll} disabled={cartItems.length === 0}>
            清空全部
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Table
          rowKey="skuId"
          columns={columns}
          dataSource={cartItems}
          pagination={false}
          locale={{ emptyText: '暂无商品，请扫码添加' }}
          scroll={{ x: 'max-content' }}
        />
        
        {cartItems.length > 0 && (
          <>
            <Divider />
            <div style={{ textAlign: 'right' }}>
              <Statistic
                title="合计金额"
                value={totalAmount}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#cf1322', fontSize: 24, fontWeight: 'bold' }}
              />
            </div>
          </>
        )}
      </Card>

      {/* 订单信息 */}
      {cartItems.length > 0 && (
        <Card title="订单信息" style={{ marginBottom: 24 }}>
          <Form
            form={form}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="customerName" label="客户姓名">
                  <Input placeholder="选填" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="customerPhone"
                  label="联系电话"
                  rules={[{ pattern: /^$|^1[3-9]\d{9}$/, message: '手机号格式不正确' }]}
                >
                  <Input placeholder="选填" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="customerEmail"
                  label="电子邮箱"
                  rules={[{ type: 'email', message: '邮箱格式不正确' }]}
                >
                  <Input placeholder="选填" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="ageBucketId" label="年龄段">
                  <Select
                    placeholder="选填"
                    allowClear
                    options={ageBuckets.map((b) => ({ label: b.name, value: b.id }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="paymentMethod" label="支付方式">
                  <Select placeholder="请选择" options={paymentMethodOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={18}>
                <Form.Item name="note" label="备注">
                  <Input.TextArea rows={1} placeholder="订单备注信息" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      {/* 底部操作栏 */}
      {cartItems.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">
            共 <strong>{cartItems.length}</strong> 款商品，<strong>{totalQuantity}</strong> 件
          </Text>
          <Space size="large">
            <Statistic
              title="应收金额"
              value={totalAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#cf1322' }}
            />
            <Button
              type="primary"
              size="large"
              loading={submitting}
              disabled={submitting}
              onClick={handleSubmit}
              style={{ minWidth: 160, height: 48, fontSize: 16 }}
            >
              确认下单
            </Button>
          </Space>
        </div>
      )}
      </div>
    </Spin>
  );
};

export default ScanOrderPage;
