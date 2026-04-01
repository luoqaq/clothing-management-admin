import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tabs, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { authApi } from '../../api/auth';
import { customersApi } from '../../api/customers';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/error';
import { formatRoleLabel, isAdminUser } from '../../utils/role';
import type { CustomerAgeBucket, ProductCategory, SalesUser, Supplier } from '../../types';

const { Title, Text } = Typography;

interface BaseModalProps<T> {
  open: boolean;
  title: string;
  data?: T;
  onCancel: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

const CategoryModal: React.FC<BaseModalProps<ProductCategory>> = ({ open, title, data, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(data ?? { name: '', code: '', parentId: undefined });
    }
  }, [data, form, open]);

  return (
    <Modal open={open} title={title} onCancel={onCancel} onOk={() => void form.validateFields().then(onSubmit)} confirmLoading={loading} destroyOnHidden>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="code" label="分类编码" rules={[{ required: true, message: '请输入分类编码' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="parentId" label="父级分类">
          <InputNumber style={{ width: '100%' }} min={1} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const SupplierModal: React.FC<BaseModalProps<Supplier>> = ({ open, title, data, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(data ?? { name: '' });
    }
  }, [data, form, open]);

  return (
    <Modal open={open} title={title} onCancel={onCancel} onOk={() => void form.validateFields().then(onSubmit)} confirmLoading={loading} destroyOnHidden>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="供应商名称" rules={[{ required: true, message: '请输入供应商名称' }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const SalesUserModal: React.FC<BaseModalProps<SalesUser>> = ({ open, title, data, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        username: data?.username ?? '',
        name: data?.name ?? '',
        password: '',
      });
    }
  }, [data, form, open]);

  return (
    <Modal open={open} title={title} onCancel={onCancel} onOk={() => void form.validateFields().then(onSubmit)} confirmLoading={loading} destroyOnHidden>
      <Form form={form} layout="vertical">
        <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="name" label="姓名">
          <Input placeholder="不填默认使用用户名" />
        </Form.Item>
        <Form.Item
          name="password"
          label={data ? '重置密码' : '登录密码'}
          rules={data ? [{ min: 6, message: '密码至少需要6个字符' }] : [{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少需要6个字符' }]}
        >
          <Input.Password placeholder={data ? '留空表示不修改密码' : '请输入密码'} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const CustomerAgeBucketModal: React.FC<BaseModalProps<CustomerAgeBucket>> = ({ open, title, data, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(data ?? { name: '', sortOrder: 0 });
    }
  }, [data, form, open]);

  return (
    <Modal open={open} title={title} onCancel={onCancel} onOk={() => void form.validateFields().then(onSubmit)} confirmLoading={loading} destroyOnHidden>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="年龄段名称" rules={[{ required: true, message: '请输入年龄段名称' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="sortOrder" label="排序" initialValue={0}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ConfigurationPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = isAdminUser(user);
  const {
    categories,
    suppliers,
    getCategories,
    getSuppliers,
    addCategory,
    updateCategory,
    deleteCategory,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  } = useProducts();

  const [loading, setLoading] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [supplierModalVisible, setSupplierModalVisible] = useState(false);
  const [salesUserModalVisible, setSalesUserModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | undefined>();
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const [editingSalesUser, setEditingSalesUser] = useState<SalesUser | undefined>();
  const [editingAgeBucket, setEditingAgeBucket] = useState<CustomerAgeBucket | undefined>();
  const [salesUsers, setSalesUsers] = useState<SalesUser[]>([]);
  const [ageBuckets, setAgeBuckets] = useState<CustomerAgeBucket[]>([]);
  const [salesUserLoading, setSalesUserLoading] = useState(false);
  const [ageBucketLoading, setAgeBucketLoading] = useState(false);
  const [ageBucketModalVisible, setAgeBucketModalVisible] = useState(false);

  const loadSalesUsers = async () => {
    if (!isAdmin) {
      return;
    }

    try {
      setSalesUserLoading(true);
      const result = await authApi.getSalesUsers();
      if (result.success && result.data) {
        setSalesUsers(result.data);
      }
    } catch (err: any) {
      message.error(getErrorMessage(err, '获取销售账号失败'));
    } finally {
      setSalesUserLoading(false);
    }
  };

  const loadAgeBuckets = async () => {
    if (!isAdmin) return;
    try {
      setAgeBucketLoading(true);
      const result = await customersApi.getAgeBuckets();
      if (result.success && result.data) {
        setAgeBuckets(result.data);
      }
    } catch (err: any) {
      message.error(getErrorMessage(err, '获取年龄段失败'));
    } finally {
      setAgeBucketLoading(false);
    }
  };

  useEffect(() => {
    void getCategories();
    if (isAdmin) {
      void Promise.all([getSuppliers(), loadSalesUsers(), loadAgeBuckets()]);
    }
  }, [isAdmin]);

  const handleCategorySubmit = async (data: any) => {
    setLoading(true);
    try {
      const result = editingCategory ? await updateCategory(editingCategory.id, data) : await addCategory(data);

      if (result) {
        message.success(editingCategory ? '分类更新成功' : '分类创建成功');
        setCategoryModalVisible(false);
        setEditingCategory(undefined);
        void getCategories();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSubmit = async (data: any) => {
    setLoading(true);
    try {
      const result = editingSupplier ? await updateSupplier(editingSupplier.id, data) : await addSupplier(data);
      if (result) {
        message.success(editingSupplier ? '供应商更新成功' : '供应商创建成功');
        setSupplierModalVisible(false);
        setEditingSupplier(undefined);
        void getSuppliers();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSalesUserSubmit = async (data: { username: string; password?: string; name?: string }) => {
    setLoading(true);
    try {
      const payload = {
        username: data.username,
        name: data.name || undefined,
        ...(data.password ? { password: data.password } : {}),
      };

      const result = editingSalesUser
        ? await authApi.updateSalesUser(editingSalesUser.id, payload)
        : await authApi.createSalesUser(payload as { username: string; password: string; name?: string });

      if (result.success) {
        message.success(editingSalesUser ? '销售账号更新成功' : '销售账号创建成功');
        setSalesUserModalVisible(false);
        setEditingSalesUser(undefined);
        void loadSalesUsers();
      }
    } catch (err: any) {
      message.error(getErrorMessage(err, '保存销售账号失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleAgeBucketSubmit = async (data: { name: string; sortOrder: number }) => {
    setLoading(true);
    try {
      const result = editingAgeBucket
        ? await customersApi.updateAgeBucket(editingAgeBucket.id, data)
        : await customersApi.createAgeBucket(data);
      if (result.success) {
        message.success(editingAgeBucket ? '年龄段更新成功' : '年龄段创建成功');
        setAgeBucketModalVisible(false);
        setEditingAgeBucket(undefined);
        void loadAgeBuckets();
      }
    } catch (err) {
      message.error(getErrorMessage(err, editingAgeBucket ? '年龄段更新失败' : '年龄段创建失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-page">
      <Card className="content-panel">
        <div className="content-panel__header">
          <div>
            <Text className="content-panel__eyebrow">Master data</Text>
            <Title level={4} className="content-panel__title">
              系统配置
            </Title>
          </div>
        </div>
        <Text className="content-panel__intro">
          {isAdmin
            ? '统一维护商品分类、供应商和销售账号，确保主数据和权限入口保持一致。'
            : '当前账号为销售角色，不提供系统配置管理能力。'}
        </Text>
      </Card>

      {isAdmin ? (
        <Tabs
          className="content-tabs"
          items={[
            {
              key: 'categories',
              label: '分类管理',
              children: (
                <Card
                  className="content-panel"
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingCategory(undefined);
                        setCategoryModalVisible(true);
                      }}
                    >
                      新增分类
                    </Button>
                  }
                >
                  <Table
                    className="content-table"
                    rowKey="id"
                    dataSource={categories}
                    scroll={{ x: 720 }}
                    columns={[
                      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
                      { title: '分类名称', dataIndex: 'name', key: 'name' },
                      { title: '分类编码', dataIndex: 'code', key: 'code' },
                      { title: '父级分类ID', dataIndex: 'parentId', key: 'parentId', render: (value: number) => value || '-' },
                      {
                        title: '操作',
                        key: 'actions',
                        render: (_, record: ProductCategory) => (
                          <Space>
                            <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingCategory(record); setCategoryModalVisible(true); }}>
                              编辑
                            </Button>
                            <Popconfirm title="确定删除该分类？" onConfirm={() => void deleteCategory(record.id).then(() => getCategories())}>
                              <Button type="text" danger icon={<DeleteOutlined />}>
                                删除
                              </Button>
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </Card>
              ),
            },
            {
              key: 'suppliers',
              label: '供应商管理',
              children: (
                <Card
                  className="content-panel"
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingSupplier(undefined);
                        setSupplierModalVisible(true);
                      }}
                    >
                      新增供应商
                    </Button>
                  }
                >
                  <Table
                    className="content-table"
                    rowKey="id"
                    dataSource={suppliers}
                    scroll={{ x: 520 }}
                    columns={[
                      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
                      { title: '供应商名称', dataIndex: 'name', key: 'name' },
                      {
                        title: '操作',
                        key: 'actions',
                        render: (_, record: Supplier) => (
                          <Space>
                            <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingSupplier(record); setSupplierModalVisible(true); }}>
                              编辑
                            </Button>
                            <Popconfirm title="确定删除该供应商？" onConfirm={() => void deleteSupplier(record.id).then(() => getSuppliers())}>
                              <Button type="text" danger icon={<DeleteOutlined />}>
                                删除
                              </Button>
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </Card>
              ),
            },
            {
              key: 'sales-users',
              label: '销售账号',
              children: (
                <Card
                  className="content-panel"
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingSalesUser(undefined);
                        setSalesUserModalVisible(true);
                      }}
                    >
                      新增销售
                    </Button>
                  }
                >
                  <Table
                    className="content-table"
                    rowKey="id"
                    loading={salesUserLoading}
                    dataSource={salesUsers}
                    scroll={{ x: 720 }}
                    columns={[
                      { title: '用户名', dataIndex: 'username', key: 'username' },
                      { title: '姓名', dataIndex: 'name', key: 'name', render: (value: string) => value || '-' },
                      { title: '角色', dataIndex: 'role', key: 'role', render: (value: SalesUser['role']) => formatRoleLabel(value) },
                      {
                        title: '创建时间',
                        dataIndex: 'createdAt',
                        key: 'createdAt',
                        width: 220,
                        render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
                      },
                      {
                        title: '操作',
                        key: 'actions',
                        render: (_, record: SalesUser) => (
                          <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingSalesUser(record); setSalesUserModalVisible(true); }}>
                            编辑账号
                          </Button>
                        ),
                      },
                    ]}
                  />
                </Card>
              ),
            },
            {
              key: 'customer-age-buckets',
              label: '客户年龄段',
              children: (
                <Card
                  className="content-panel"
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingAgeBucket(undefined);
                        setAgeBucketModalVisible(true);
                      }}
                    >
                      新增年龄段
                    </Button>
                  }
                >
                  <Table
                    className="content-table"
                    rowKey="id"
                    loading={ageBucketLoading}
                    dataSource={ageBuckets}
                    scroll={{ x: 560 }}
                    columns={[
                      { title: '名称', dataIndex: 'name', key: 'name' },
                      { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 120 },
                      {
                        title: '操作',
                        key: 'actions',
                        render: (_, record: CustomerAgeBucket) => (
                          <Space>
                            <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingAgeBucket(record); setAgeBucketModalVisible(true); }}>
                              编辑
                            </Button>
                            <Popconfirm title="确定删除该年龄段？" onConfirm={() => void customersApi.deleteAgeBucket(record.id).then(() => { void loadAgeBuckets(); })}>
                              <Button type="text" danger icon={<DeleteOutlined />}>
                                删除
                              </Button>
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </Card>
              ),
            },
          ]}
        />
      ) : (
        <Card className="content-panel">
          <Text>销售角色不开放系统配置、供应商维护和账号管理。</Text>
        </Card>
      )}

      <CategoryModal
        open={categoryModalVisible}
        title={editingCategory ? '编辑分类' : '新增分类'}
        data={editingCategory}
        onCancel={() => {
          setCategoryModalVisible(false);
          setEditingCategory(undefined);
        }}
        onSubmit={handleCategorySubmit}
        loading={loading}
      />

      <SupplierModal
        open={supplierModalVisible}
        title={editingSupplier ? '编辑供应商' : '新增供应商'}
        data={editingSupplier}
        onCancel={() => {
          setSupplierModalVisible(false);
          setEditingSupplier(undefined);
        }}
        onSubmit={handleSupplierSubmit}
        loading={loading}
      />

      <SalesUserModal
        open={salesUserModalVisible}
        title={editingSalesUser ? '编辑销售账号' : '新增销售账号'}
        data={editingSalesUser}
        onCancel={() => {
          setSalesUserModalVisible(false);
          setEditingSalesUser(undefined);
        }}
        onSubmit={handleSalesUserSubmit}
        loading={loading}
      />

      <CustomerAgeBucketModal
        open={ageBucketModalVisible}
        title={editingAgeBucket ? '编辑年龄段' : '新增年龄段'}
        data={editingAgeBucket}
        onCancel={() => {
          setAgeBucketModalVisible(false);
          setEditingAgeBucket(undefined);
        }}
        onSubmit={handleAgeBucketSubmit}
        loading={loading}
      />
    </div>
  );
};

export default ConfigurationPage;
