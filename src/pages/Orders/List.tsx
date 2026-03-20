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
  message,
  Modal,
  Descriptions,
  Image,
  Timeline,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useOrders } from '../../hooks/useOrders';
import type { Order, OrderFilters, OrderStatus } from '../../types';
import dayjs from 'dayjs';
import OrderForm from './OrderForm';

const { Search } = Input;
const { Option } = Select;

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
    clearCurrentOrder,
    addOrder,
  } = useOrders();

  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState<'ship' | 'cancel' | 'refund'>();
  const [addOrderLoading, setAddOrderLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await getOrders({ page: 1, pageSize: 10 });
  };

  const handleSearch = () => {
    const newFilters: OrderFilters = {};
    if (searchText) newFilters.search = searchText;
    if (selectedStatus) newFilters.status = selectedStatus as OrderStatus;
    if (selectedPaymentStatus) newFilters.paymentStatus = selectedPaymentStatus;

    getOrders({ page: 1, pageSize: 10, filters: newFilters });
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedStatus(undefined);
    setSelectedPaymentStatus(undefined);
    getOrders({ page: 1, pageSize: 10 });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    getOrders({ page, pageSize, filters });
  };

  const handleViewDetail = async (id: number) => {
    const result = await getOrderById(id);
    if (result) {
      setDetailModalVisible(true);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    setCurrentAction('cancel');
    setActionModalVisible(true);
    const result = await cancelOrder(order.id);
    if (result) {
      message.success('订单已取消');
      setActionModalVisible(false);
      getOrders({ page: pagination.page, pageSize: pagination.pageSize, filters });
    }
  };

  const handleShipOrder = async (order: Order) => {
    setCurrentAction('ship');
    setActionModalVisible(true);
    const result = await shipOrder(order.id, {});
    if (result) {
      message.success('订单已发货');
      setActionModalVisible(false);
      getOrders({ page: pagination.page, pageSize: pagination.pageSize, filters });
    }
  };

  const handleRefundOrder = async (order: Order) => {
    setCurrentAction('refund');
    setActionModalVisible(true);
    const result = await refundOrder(order.id, { amount: order.finalAmount });
    if (result) {
      message.success('退款已处理');
      setActionModalVisible(false);
      getOrders({ page: pagination.page, pageSize: pagination.pageSize, filters });
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colorMap: Record<OrderStatus, string> = {
      pending: 'orange',
      confirmed: 'blue',
      shipped: 'cyan',
      delivered: 'green',
      cancelled: 'default',
      refunded: 'red',
    };
    return colorMap[status];
  };

  const getStatusText = (status: OrderStatus) => {
    const textMap: Record<OrderStatus, string> = {
      pending: '待处理',
      confirmed: '已确认',
      shipped: '已发货',
      delivered: '已送达',
      cancelled: '已取消',
      refunded: '已退款',
    };
    return textMap[status];
  };

  const getPaymentStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      unpaid: 'orange',
      paid: 'green',
      refunded: 'red',
    };
    return colorMap[status] || 'default';
  };

  const getPaymentStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      unpaid: '待支付',
      paid: '已支付',
      refunded: '已退款',
    };
    return textMap[status] || status;
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '客户信息',
      dataIndex: 'customerName',
      key: 'customer',
      render: (text: string, record: Order) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.customerPhone}</div>
        </div>
      ),
    },
    {
      title: '商品信息',
      dataIndex: 'items',
      key: 'items',
      render: (items: Order['items']) => (
        <div>
          <div>{items.length} 件商品</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {items.slice(0, 2).map((item, index) => (
              <span key={item.id}>
                {index > 0 && ', '}
                {item.productName}
              </span>
            ))}
            {items.length > 2 && '...'}
          </div>
        </div>
      ),
    },
    {
      title: '金额',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount: number, record: Order) => (
        <div>
          <div style={{ fontWeight: 500 }}>¥{amount.toFixed(2)}</div>
          {record.discountAmount > 0 && (
            <div style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>
              ¥{record.totalAmount.toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => (
        <Tag color={getPaymentStatusColor(status)}>{getPaymentStatusText(status)}</Tag>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: Order) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.id)}
          >
            查看
          </Button>

          {record.status === 'pending' && (
            <Button
              type="text"
              icon={<CheckOutlined />}
              size="small"
              onClick={() => updateOrderStatus(record.id, 'confirmed')}
            >
              确认
            </Button>
          )}

          {record.status === 'confirmed' && (
            <Button
              type="text"
              icon={<CheckOutlined />}
              size="small"
              onClick={() => handleShipOrder(record)}
            >
              发货
            </Button>
          )}

          {(record.status === 'pending' || record.status === 'confirmed') && (
            <Popconfirm
              title="确定取消此订单吗？"
              onConfirm={() => handleCancelOrder(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger icon={<CloseOutlined />} size="small">
                取消
              </Button>
            </Popconfirm>
          )}

          {record.status === 'delivered' && record.paymentStatus === 'paid' && (
            <Button
              type="text"
              danger
              icon={<DollarOutlined />}
              size="small"
              onClick={() => handleRefundOrder(record)}
            >
              退款
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleAddOrder = () => {
    setAddModalVisible(true);
  };

  const handleAddOrderSubmit = async (order: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>) => {
    setAddOrderLoading(true);
    try {
      const result = await addOrder(order);
      if (result) {
        message.success('订单创建成功');
        setAddModalVisible(false);
        getOrders({ page: pagination.page, pageSize: pagination.pageSize, filters });
      }
    } catch (error) {
      console.error('Create order error:', error);
    } finally {
      setAddOrderLoading(false);
    }
  };

  const handleAddOrderCancel = () => {
    setAddModalVisible(false);
  };

  return (
    <div>
      <Card
        title="订单管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddOrder}>
            新建订单
          </Button>
        }
      >
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索订单号、客户名、电话"
            allowClear
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
          />
          <Select
            placeholder="订单状态"
            style={{ width: 150 }}
            allowClear
            value={selectedStatus}
            onChange={setSelectedStatus}
          >
            <Option value="pending">待处理</Option>
            <Option value="confirmed">已确认</Option>
            <Option value="shipped">已发货</Option>
            <Option value="delivered">已送达</Option>
            <Option value="cancelled">已取消</Option>
            <Option value="refunded">已退款</Option>
          </Select>
          <Select
            placeholder="支付状态"
            style={{ width: 120 }}
            allowClear
            value={selectedPaymentStatus}
            onChange={setSelectedPaymentStatus}
          >
            <Option value="unpaid">待支付</Option>
            <Option value="paid">已支付</Option>
            <Option value="refunded">已退款</Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
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
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          clearCurrentOrder();
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
        destroyOnHidden
      >
        {currentOrder && (
          <div>
            <Descriptions title="订单信息" bordered column={2}>
              <Descriptions.Item label="订单号" span={1}>
                {currentOrder.orderNo}
              </Descriptions.Item>
              <Descriptions.Item label="订单状态" span={1}>
                <Tag color={getStatusColor(currentOrder.status)}>
                  {getStatusText(currentOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="客户姓名" span={1}>
                {currentOrder.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话" span={1}>
                {currentOrder.customerPhone}
              </Descriptions.Item>
              <Descriptions.Item label="支付状态" span={1}>
                <Tag color={getPaymentStatusColor(currentOrder.paymentStatus)}>
                  {getPaymentStatusText(currentOrder.paymentStatus)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="支付方式" span={1}>
                {currentOrder.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="下单时间" span={1}>
                {dayjs(currentOrder.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              {currentOrder.shippedAt && (
                <Descriptions.Item label="发货时间" span={1}>
                  {dayjs(currentOrder.shippedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              )}
              {currentOrder.deliveredAt && (
                <Descriptions.Item label="送达时间" span={1}>
                  {dayjs(currentOrder.deliveredAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Descriptions title="收货地址" bordered column={1} style={{ marginTop: 16 }}>
              <Descriptions.Item label="收货人">
                {currentOrder.address.name} {currentOrder.address.phone}
              </Descriptions.Item>
              <Descriptions.Item label="收货地址">
                {currentOrder.address.province}
                {currentOrder.address.city}
                {currentOrder.address.district}
                {currentOrder.address.detail}
                {currentOrder.address.postalCode && ` (${currentOrder.address.postalCode})`}
              </Descriptions.Item>
            </Descriptions>

            <Card title="商品列表" style={{ marginTop: 16 }}>
              {currentOrder.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      width={60}
                      height={60}
                      style={{ borderRadius: 4, marginRight: 12 }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{item.productName}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {item.sku}
                      {item.color && ` · ${item.color}`}
                      {item.size && ` · ${item.size}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>¥{item.price.toFixed(2)}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>x{item.quantity}</div>
                  </div>
                  <div style={{ width: 100, textAlign: 'right', fontWeight: 500 }}>
                    ¥{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </Card>

            <Descriptions bordered column={2} style={{ marginTop: 16 }}>
              <Descriptions.Item label="商品总额" span={1}>
                ¥{currentOrder.totalAmount.toFixed(2)}
              </Descriptions.Item>
              {currentOrder.discountAmount > 0 && (
                <Descriptions.Item label="优惠金额" span={1} style={{ color: '#ff4d4f' }}>
                  -¥{currentOrder.discountAmount.toFixed(2)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="实付金额" span={2} style={{ fontSize: 18, fontWeight: 600 }}>
                ¥{currentOrder.finalAmount.toFixed(2)}
              </Descriptions.Item>
            </Descriptions>

            {currentOrder.note && (
              <Descriptions title="备注" bordered column={1} style={{ marginTop: 16 }}>
                <Descriptions.Item>{currentOrder.note}</Descriptions.Item>
              </Descriptions>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={currentAction === 'ship' ? '发货确认' : currentAction === 'cancel' ? '取消订单' : '退款处理'}
        open={actionModalVisible}
        onCancel={() => setActionModalVisible(false)}
        onOk={() => setActionModalVisible(false)}
        destroyOnHidden
      >
        <p>
          {currentAction === 'ship'
            ? '订单已标记为发货状态'
            : currentAction === 'cancel'
            ? '订单已取消'
            : '退款已处理完成'}
        </p>
      </Modal>

      <Modal
        title="新建订单"
        open={addModalVisible}
        onCancel={handleAddOrderCancel}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <OrderForm
          onSubmit={handleAddOrderSubmit}
          onCancel={handleAddOrderCancel}
          loading={addOrderLoading}
        />
      </Modal>
    </div>
  );
};

export default OrderList;
