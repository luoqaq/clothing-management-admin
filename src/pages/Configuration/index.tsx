import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Tabs, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import type { ProductCategory, Supplier } from '../../types';

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

const ConfigurationPage: React.FC = () => {
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
  const [editingCategory, setEditingCategory] = useState<ProductCategory | undefined>();
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();

  useEffect(() => {
    void Promise.all([getCategories(), getSuppliers()]);
  }, []);

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

  return (
    <div className="content-page">
      <Card className="content-panel">
        <div className="content-panel__header">
          <div>
            <Text className="content-panel__eyebrow">Master data</Text>
            <Title level={4} className="content-panel__title">
              基础资料
            </Title>
          </div>
        </div>
        <Text className="content-panel__intro">
          统一维护商品分类、供应商等主数据，供商品建档、规格管理和筛选使用。
        </Text>
      </Card>

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
        ]}
      />

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
    </div>
  );
};

export default ConfigurationPage;
