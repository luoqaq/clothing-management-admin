import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Tabs, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import type { ProductBrand, ProductCategory } from '../../types';

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

const BrandModal: React.FC<BaseModalProps<ProductBrand>> = ({ open, title, data, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(data ?? { name: '', logo: '' });
    }
  }, [data, form, open]);

  return (
    <Modal open={open} title={title} onCancel={onCancel} onOk={() => void form.validateFields().then(onSubmit)} confirmLoading={loading} destroyOnHidden>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="品牌名称" rules={[{ required: true, message: '请输入品牌名称' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="logo" label="Logo 链接">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ConfigurationPage: React.FC = () => {
  const {
    categories,
    brands,
    getCategories,
    getBrands,
    addCategory,
    updateCategory,
    deleteCategory,
    addBrand,
    updateBrand,
    deleteBrand,
  } = useProducts();

  const [loading, setLoading] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | undefined>();
  const [editingBrand, setEditingBrand] = useState<ProductBrand | undefined>();

  useEffect(() => {
    void Promise.all([getCategories(), getBrands()]);
  }, []);

  const handleCategorySubmit = async (data: any) => {
    setLoading(true);
    try {
      const result = editingCategory
        ? await updateCategory(editingCategory.id, data)
        : await addCategory(data);

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

  const handleBrandSubmit = async (data: any) => {
    setLoading(true);
    try {
      const result = editingBrand ? await updateBrand(editingBrand.id, data) : await addBrand(data);
      if (result) {
        message.success(editingBrand ? '品牌更新成功' : '品牌创建成功');
        setBrandModalVisible(false);
        setEditingBrand(undefined);
        void getBrands();
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
          统一维护商品分类、品牌等主数据，供商品建档、规格管理和筛选使用。
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
            key: 'brands',
            label: '品牌管理',
            children: (
              <Card
                className="content-panel"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingBrand(undefined);
                      setBrandModalVisible(true);
                    }}
                  >
                    新增品牌
                  </Button>
                }
              >
                <Table
                  className="content-table"
                  rowKey="id"
                  dataSource={brands}
                  columns={[
                    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
                    { title: '品牌名称', dataIndex: 'name', key: 'name' },
                    { title: 'Logo', dataIndex: 'logo', key: 'logo', render: (value: string) => value || '-' },
                    {
                      title: '操作',
                      key: 'actions',
                      render: (_, record: ProductBrand) => (
                        <Space>
                          <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingBrand(record); setBrandModalVisible(true); }}>
                            编辑
                          </Button>
                          <Popconfirm title="确定删除该品牌？" onConfirm={() => void deleteBrand(record.id).then(() => getBrands())}>
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

      <BrandModal
        open={brandModalVisible}
        title={editingBrand ? '编辑品牌' : '新增品牌'}
        data={editingBrand}
        onCancel={() => {
          setBrandModalVisible(false);
          setEditingBrand(undefined);
        }}
        onSubmit={handleBrandSubmit}
        loading={loading}
      />
    </div>
  );
};

export default ConfigurationPage;
