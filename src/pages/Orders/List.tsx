import { useEffect, useState } from 'react';
import { Button, Card, Descriptions, Form, Input, Modal, Select, Space, Table, Tag, Typography, message } from 'antd';
import { CheckOutlined, CloseOutlined, DollarOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Order, OrderFilters, OrderStatus } from '../../types';
import { useOrders } from '../../hooks/useOrders';
import OrderForm from './OrderForm';

const { Title, Text } = Typography;

const OrderList: React.FC = () => {
  const {
    orders,
    currentOrder,
    loading,
    pagination,
    filters,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    shipOrder,
    refundOrder,
    addOrder,
  } = useOrders();

  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>();
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [shipVisible, setShipVisible] = useState(false);
  const [refundVisible, setRefundVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [shipForm] = Form.useForm();
  const [refundForm] = Form.useForm();
  const [cancelForm] = Form.useForm();

  useEffect(() => {
    void getOrders({ page: 1, pageSize: 10 });
  }, []);

  const reload = (params?: { page?: number; pageSize?: number; filters?: OrderFilters }) =>
    getOrders(params ?? { page: pagination.page, pageSize: pagination.pageSize, filters });

  const handleSearch = () => {
    void reload({
      page: 1,
      pageSize: 10,
      filters: {
        search: searchText || undefined,
        status: selectedStatus,
        paymentStatus: selectedPaymentStatus,
      },
    });
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedStatus(undefined);
    setSelectedPaymentStatus(undefined);
    void reload({ page: 1, pageSize: 10, filters: {} });
  };

  const handleViewDetail = async (id: number) => {
    const result = await getOrderById(id);
    if (result) {
      setDetailVisible(true);
    }
  };

  const handleCreateOrder = async (order: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>) => {
    setSubmitLoading(true);
    try {
      const result = await addOrder(order);
      if (result) {
        message.success('订单创建成功');
        setAddVisible(false);
        void reload();
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const openShipModal = (order: Order) => {
    setSelectedOrder(order);
    shipForm.setFieldsValue({ shippingCompany: order.shippingCompany, trackingNumber: order.trackingNumber });
    setShipVisible(true);
  };

  const openRefundModal = (order: Order) => {
    setSelectedOrder(order);
    refundForm.setFieldsValue({ amount: order.finalAmount, reason: order.refundReason });
    setRefundVisible(true);
  };

  const openCancelModal = (order: Order) => {
    setSelectedOrder(order);
    cancelForm.setFieldsValue({ reason: order.cancelReason });
    setCancelVisible(true);
  };

  const submitShip = async () => {
    if (!selectedOrder) return;
    const values = await shipForm.validateFields();
    const result = await shipOrder(selectedOrder.id, values);
    if (result) {
      message.success('订单已发货');
      setShipVisible(false);
      void reload();
    }
  };

  const submitRefund = async () => {
    if (!selectedOrder) return;
    const values = await refundForm.validateFields();
    const result = await refundOrder(selectedOrder.id, values);
    if (result) {
      message.success('退款已处理');
      setRefundVisible(false);
      void reload();
    }
  };

  const submitCancel = async () => {
    if (!selectedOrder) return;
    const values = await cancelForm.validateFields();
    const result = await cancelOrder(selectedOrder.id, values.reason);
    if (result) {
      message.success('订单已取消');
      setCancelVisible(false);
      void reload();
    }
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      minWidth: 180,
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '客户信息',
      key: 'customer',
      minWidth: 160,
      render: (_: unknown, record: Order) => (
        <div>
          <div>{record.customerName}</div>
          <div style={{ color: '#8c8c8c' }}>{record.customerPhone}</div>
        </div>
      ),
    },
    {
      title: '商品规格',
      dataIndex: 'items',
      key: 'items',
      minWidth: 260,
      render: (items: Order['items']) => (
        <div>
          <div>{items.length} 个规格</div>
          <div style={{ color: '#8c8c8c' }}>
            {items.slice(0, 2).map((item) => `${item.productName} (${item.color} / ${item.size})`).join('，')}
          </div>
        </div>
      ),
    },
    {
      title: '订单金额',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      minWidth: 120,
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      minWidth: 120,
      render: (status: OrderStatus) => {
        const mapping: Record<OrderStatus, { text: string; color: string }> = {
          pending: { text: '待处理', color: 'orange' },
          confirmed: { text: '已确认', color: 'blue' },
          shipped: { text: '已发货', color: 'cyan' },
          delivered: { text: '已送达', color: 'green' },
          cancelled: { text: '已取消', color: 'default' },
          refunded: { text: '已退款', color: 'red' },
        };
        return <Tag color={mapping[status].color}>{mapping[status].text}</Tag>;
      },
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      minWidth: 120,
      render: (status: string) => <Tag color={status === 'paid' ? 'green' : status === 'refunded' ? 'red' : 'orange'}>{status === 'paid' ? '已支付' : status === 'refunded' ? '已退款' : '待支付'}</Tag>,
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      minWidth: 160,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right' as const,
      width: 180,
      minWidth: 180,
      render: (_: unknown, record: Order) => (
        <div className="table-actions-grid">
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)}>
            查看
          </Button>
          {record.status === 'pending' && (
            <Button type="text" icon={<CheckOutlined />} onClick={() => void updateOrderStatus(record.id, 'confirmed')}>
              确认
            </Button>
          )}
          {record.status === 'confirmed' && (
            <Button type="text" icon={<CheckOutlined />} onClick={() => openShipModal(record)}>
              发货
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'confirmed') && (
            <Button type="text" danger icon={<CloseOutlined />} onClick={() => openCancelModal(record)}>
              取消
            </Button>
          )}
          {(record.status === 'shipped' || record.status === 'delivered') && record.paymentStatus === 'paid' && (
            <Button type="text" danger icon={<DollarOutlined />} onClick={() => openRefundModal(record)}>
              退款
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="content-page">
      <Card className="content-panel">
        <div className="content-panel__header">
          <div>
            <Text className="content-panel__eyebrow">Fulfillment</Text>
            <Title level={4} className="content-panel__title">
              订单管理
            </Title>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVisible(true)}>
            新建订单
          </Button>
        </div>

        <div className="filter-toolbar">
          <Input.Search
            placeholder="搜索订单号、客户名、电话"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            className="filter-toolbar__search"
          />
          <Select
            allowClear
            placeholder="订单状态"
            className="filter-toolbar__select"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { label: '待处理', value: 'pending' },
              { label: '已确认', value: 'confirmed' },
              { label: '已发货', value: 'shipped' },
              { label: '已送达', value: 'delivered' },
              { label: '已取消', value: 'cancelled' },
              { label: '已退款', value: 'refunded' },
            ]}
          />
          <Select
            allowClear
            placeholder="支付状态"
            className="filter-toolbar__select"
            value={selectedPaymentStatus}
            onChange={setSelectedPaymentStatus}
            options={[
              { label: '待支付', value: 'unpaid' },
              { label: '已支付', value: 'paid' },
              { label: '已退款', value: 'refunded' },
            ]}
          />
          <Button onClick={handleSearch}>筛选</Button>
          <Button onClick={handleReset}>重置</Button>
        </div>

        <Table
          className="content-table"
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={orders}
          scroll={{ x: 1380 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => void reload({ page, pageSize, filters }),
          }}
        />
      </Card>

      <Modal open={addVisible} title="新建订单" footer={null} width={1100} onCancel={() => setAddVisible(false)} destroyOnHidden>
        <OrderForm onSubmit={handleCreateOrder} onCancel={() => setAddVisible(false)} loading={submitLoading} />
      </Modal>

      <Modal open={detailVisible} title="订单详情" footer={null} onCancel={() => setDetailVisible(false)} width={960}>
        {currentOrder && (
          <div className="detail-sheet">
            <Descriptions bordered column={2} className="detail-sheet__descriptions">
              <Descriptions.Item label="订单号">{currentOrder.orderNo}</Descriptions.Item>
              <Descriptions.Item label="订单状态">{currentOrder.status}</Descriptions.Item>
              <Descriptions.Item label="客户姓名">{currentOrder.customerName}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentOrder.customerPhone}</Descriptions.Item>
              <Descriptions.Item label="支付方式">{currentOrder.paymentMethod || '-'}</Descriptions.Item>
              <Descriptions.Item label="支付状态">{currentOrder.paymentStatus}</Descriptions.Item>
              <Descriptions.Item label="物流公司">{currentOrder.shippingCompany || '-'}</Descriptions.Item>
              <Descriptions.Item label="运单号">{currentOrder.trackingNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>
                {`${currentOrder.address.province}${currentOrder.address.city}${currentOrder.address.district}${currentOrder.address.detail}`}
              </Descriptions.Item>
            </Descriptions>
            <Table
              className="content-table"
              rowKey="id"
              pagination={false}
              scroll={{ x: 840 }}
              dataSource={currentOrder.items}
              columns={[
                { title: '商品', dataIndex: 'productName', key: 'productName', minWidth: 180 },
                { title: '规格', key: 'specification', minWidth: 130, render: (_, item) => `${item.color || '-'} / ${item.size || '-'}` },
                { title: '规格编码', dataIndex: 'skuCode', key: 'skuCode', minWidth: 150 },
                { title: '单价', dataIndex: 'price', key: 'price', minWidth: 100, render: (value: number) => `¥${value.toFixed(2)}` },
                { title: '数量', dataIndex: 'quantity', key: 'quantity', minWidth: 90 },
                { title: '小计', key: 'subtotal', minWidth: 110, render: (_, item) => `¥${(item.price * item.quantity).toFixed(2)}` },
              ]}
            />
          </div>
        )}
      </Modal>

      <Modal open={shipVisible} title="订单发货" onOk={() => void submitShip()} onCancel={() => setShipVisible(false)}>
        <Form form={shipForm} layout="vertical">
          <Form.Item name="shippingCompany" label="物流公司" rules={[{ required: true, message: '请输入物流公司' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="trackingNumber" label="运单号" rules={[{ required: true, message: '请输入运单号' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={refundVisible} title="订单退款" onOk={() => void submitRefund()} onCancel={() => setRefundVisible(false)}>
        <Form form={refundForm} layout="vertical">
          <Form.Item name="amount" label="退款金额" rules={[{ required: true, message: '请输入退款金额' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="reason" label="退款原因" rules={[{ required: true, message: '请输入退款原因' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={cancelVisible} title="取消订单" onOk={() => void submitCancel()} onCancel={() => setCancelVisible(false)}>
        <Form form={cancelForm} layout="vertical">
          <Form.Item name="reason" label="取消原因" rules={[{ required: true, message: '请输入取消原因' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderList;
