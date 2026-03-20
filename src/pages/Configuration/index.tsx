import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Form,
  Input,
  Modal,
  Popconfirm,
  message,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import type { ProductCategory } from '../../types';

interface EditModalProps<T> {
  visible: boolean;
  title: string;
  data?: T;
  onCancel: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

// 分类编辑弹窗
const CategoryEditModal: React.FC<EditModalProps<ProductCategory>> = ({
  visible,
  title,
  data,
  onCancel,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (data) {
        form.setFieldsValue(data);
      } else {
        form.resetFields();
      }
    }
  }, [visible, data, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="分类名称"
          rules={[{ required: true, message: '请输入分类名称' }]}
        >
          <Input placeholder="请输入分类名称" />
        </Form.Item>
        <Form.Item
          name="code"
          label="分类编码"
          rules={[{ required: true, message: '请输入分类编码' }]}
        >
          <Input placeholder="请输入分类编码" />
        </Form.Item>
        <Form.Item
          name="parentId"
          label="父级分类"
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请选择父级分类（可选）"
            min={1}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ConfigurationPage: React.FC = () => {
  const { categories, getCategories, addCategory, updateCategory, deleteCategory } = useProducts();

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await getCategories();
  };

  // 分类相关操作
  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setCategoryModalVisible(true);
  };

  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category);
    setCategoryModalVisible(true);
  };

  const handleCategorySubmit = async (data: any) => {
    setLoading(true);
    try {
      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, data);
      } else {
        result = await addCategory(data);
      }

      if (result) {
        message.success(editingCategory ? '分类更新成功' : '分类创建成功');
        setCategoryModalVisible(false);
        setEditingCategory(undefined);
        getCategories();
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const result = await deleteCategory(id);
      if (result) {
        message.success('分类删除成功');
        getCategories();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 分类表格列
  const categoryColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '父级分类ID',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId: number) => parentId || '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: ProductCategory) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditCategory(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此分类吗？"
            description="删除后相关商品将无法使用此分类"
            onConfirm={() => handleDeleteCategory(record.id)}
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

  return (
    <div>
      <Card title="系统配置" style={{ marginBottom: 16 }}>
        <p style={{ color: '#666' }}>
          管理商品分类等基础筛选信息。这些信息将在商品管理和订单管理中使用。
        </p>
      </Card>

      <Card
        title="分类列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
            新增分类
          </Button>
        }
      >
        <Table
          columns={categoryColumns}
          dataSource={categories}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个分类`,
          }}
        />
      </Card>

      {/* 分类编辑弹窗 */}
      <CategoryEditModal
        visible={categoryModalVisible}
        title={editingCategory ? '编辑分类' : '新增分类'}
        data={editingCategory}
        onCancel={() => {
          setCategoryModalVisible(false);
          setEditingCategory(undefined);
        }}
        onSubmit={handleCategorySubmit}
        loading={loading}
      />
    </div>
  );
};

export default ConfigurationPage;
