import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Descriptions, Form, Grid, Input, Modal, Select, Space, Table, Tag, Typography, message } from 'antd';
import { CaretDownOutlined, CaretUpOutlined, CloseOutlined, EyeOutlined, PlusOutlined, BarcodeOutlined } from '@ant-design/icons';
import type { TablePaginationConfig, TableProps } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Order, OrderFilters, OrderStatus } from '../../types';
import { useOrders } from '../../hooks/useOrders';
import OrderForm from './OrderForm';
import { getErrorMessage } from '../../utils/error';
import { touchFriendlySelectProps } from '../../utils/touchSelect';

const { Title, Text } = Typography;

const orderStatusMap: Record<OrderStatus, { text: string; color: string }> = {
  pending: { text: '已确认', color: 'blue' },
  confirmed: { text: '已确认', color: 'blue' },
  shipped: { text: '已确认', color: 'blue' },
  delivered: { text: '已确认', color: 'blue' },
  cancelled: { text: '已取消', color: 'default' },
  refunded: { text: '已取消', color: 'default' },
};

const defaultFilters: OrderFilters = {
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const {
    orders,
    currentOrder,
    loading,
    pagination,
    getOrders,
    getOrderById,
    cancelOrder,
    addOrder,
  } = useOrders();

  const [searchText, setSearchText] = useState('');
  const [queryFilters, setQueryFilters] = useState<OrderFilters>(defaultFilters);
  const [detailVisible, setDetailVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [cancelForm] = Form.useForm();
  const addModalWidth = screens.lg ? 1100 : screens.md ? 'calc(100vw - 32px)' : 'calc(100vw - 16px)';
  const detailModalWidth = screens.lg ? 960 : screens.md ? 'calc(100vw - 32px)' : 'calc(100vw - 16px)';

  useEffect(() => {
    void getOrders({ page: 1, pageSize: 10, filters: defaultFilters });
  }, []);

  const reload = (params?: { page?: number; pageSize?: number; filters?: OrderFilters }) =>
    getOrders(params ?? { page: pagination.page, pageSize: pagination.pageSize, filters: queryFilters });

  const handleSearch = () => {
    const nextFilters = {
      ...queryFilters,
      search: searchText || undefined,
    };
    setQueryFilters(nextFilters);
    void reload({
      page: 1,
      pageSize: 10,
      filters: nextFilters,
    });
  };

  const handleReset = () => {
    setSearchText('');
    setQueryFilters(defaultFilters);
    void reload({ page: 1, pageSize: 10, filters: defaultFilters });
  };

  const handleViewDetail = async (id: number) => {
    try {
      const result = await getOrderById(id);
      if (result) {
        setDetailVisible(true);
      }
    } catch (err) {
      message.error(getErrorMessage(err, '获取订单详情失败'));
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
    } catch (err) {
      message.error(getErrorMessage(err, '创建订单失败'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const openCancelModal = (order: Order) => {
    setSelectedOrder(order);
    cancelForm.setFieldsValue({ reason: order.cancelReason });
    setCancelVisible(true);
  };

  const submitCancel = async () => {
    if (!selectedOrder) return;
    try {
      const values = await cancelForm.validateFields();
      const result = await cancelOrder(selectedOrder.id, values.reason);
      if (result) {
        message.success('订单已取消');
        setCancelVisible(false);
        void reload();
      }
    } catch (err) {
      message.error(getErrorMessage(err, '取消订单失败'));
    }
  };

  const toggleCreatedAtSort = () => {
    const nextSortOrder: OrderFilters['sortOrder'] = queryFilters.sortOrder === 'asc' ? 'desc' : 'asc';
    const nextFilters = {
      ...queryFilters,
      sortBy: 'createdAt' as const,
      sortOrder: nextSortOrder,
    };
    setQueryFilters(nextFilters);
    void reload({
      page: 1,
      pageSize: pagination.pageSize,
      filters: nextFilters,
    });
  };

  const handleTableChange: TableProps<Order>['onChange'] = (nextPagination: TablePaginationConfig) => {
    void reload({
      page: nextPagination.current ?? 1,
      pageSize: nextPagination.pageSize ?? pagination.pageSize,
      filters: queryFilters,
    });
  };

  const columns: TableProps<Order>['columns'] = [
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
          <div>{record.customerName || '-'}</div>
          <div style={{ color: '#8c8c8c' }}>{record.customerPhone || '-'}</div>
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
          <div style={{ color: '#8c8c8c', display: 'grid', gap: 4 }}>
            {items.map((item) => (
              <div key={item.id}>
                {item.productName} ({item.color || '-'} / {item.size || '-'}) x {item.quantity}
              </div>
            ))}
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
        const meta = orderStatusMap[status];
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: (
        <button
          type="button"
          onClick={toggleCreatedAtSort}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: 'inherit',
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          <span>下单时间</span>
          {queryFilters.sortOrder === 'asc' ? <CaretUpOutlined /> : <CaretDownOutlined />}
        </button>
      ),
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
          {record.status !== 'cancelled' && record.status !== 'refunded' && (
            <Button type="text" danger icon={<CloseOutlined />} onClick={() => openCancelModal(record)}>
              取消
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
            <Text className="content-panel__eyebrow">Store orders</Text>
            <Title level={4} className="content-panel__title">
              订单管理
            </Title>
          </div>
          <Space>
            <Button icon={<BarcodeOutlined />} onClick={() => navigate('/orders/scan')}>
              扫码录单
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVisible(true)}>
              新建订单
            </Button>
          </Space>
        </div>

        <div className="filter-toolbar">
          <Input
            placeholder="搜索订单号、客户名、电话"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            className="filter-toolbar__search"
          />
          <Select
            placeholder="订单状态"
            value={queryFilters.status || ''}
            onChange={(value) => {
              const nextFilters = {
                ...queryFilters,
                status: (value || undefined) as OrderStatus | undefined,
              };
              setQueryFilters(nextFilters);
              void reload({
                page: 1,
                pageSize: 10,
                filters: nextFilters,
              });
            }}
            className="filter-toolbar__select"
            options={[
              { label: '全部', value: '' },
              { label: '已确认', value: 'confirmed' },
              { label: '已取消', value: 'cancelled' },
            ]}
            allowClear
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
          dataSource={orders}
          scroll={{ x: 1380 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal open={addVisible} title="新建订单" footer={null} width={addModalWidth} onCancel={() => setAddVisible(false)} destroyOnHidden>
        <OrderForm onSubmit={handleCreateOrder} onCancel={() => setAddVisible(false)} loading={submitLoading} />
      </Modal>

      <Modal open={detailVisible} title="订单详情" footer={null} onCancel={() => setDetailVisible(false)} width={detailModalWidth}>
        {currentOrder && (
          <div className="detail-sheet">
            <Descriptions bordered column={2} className="detail-sheet__descriptions">
              <Descriptions.Item label="订单号">{currentOrder.orderNo}</Descriptions.Item>
              <Descriptions.Item label="客户姓名">{currentOrder.customerName || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentOrder.customerPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="支付方式">{currentOrder.paymentMethod || '-'}</Descriptions.Item>
              <Descriptions.Item label="下单时间">{dayjs(currentOrder.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{currentOrder.note || '-'}</Descriptions.Item>
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
                { title: '原价', dataIndex: 'price', key: 'price', minWidth: 100, render: (value: number) => `¥${value.toFixed(2)}` },
                { title: '售出价', dataIndex: 'soldPrice', key: 'soldPrice', minWidth: 100, render: (value: number) => `¥${(value || 0).toFixed(2)}` },
                { title: '数量', dataIndex: 'quantity', key: 'quantity', minWidth: 90 },
                { title: '小计', key: 'subtotal', minWidth: 110, render: (_, item) => `¥${((item.soldPrice || item.price) * item.quantity).toFixed(2)}` },
              ]}
            />
          </div>
        )}
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
