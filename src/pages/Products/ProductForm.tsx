import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Tag,
  Space,
  Button,
  message,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import type { Product, ProductCategory, ProductStatus } from '../../types';

const { Option } = Select;

interface ProductFormProps {
  categories: ProductCategory[];
  onSubmit: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  product?: Product; // 编辑时传入的商品数据
}

const ProductForm: React.FC<ProductFormProps> = ({
  categories,
  onSubmit,
  onCancel,
  loading = false,
  product,
}) => {
  const [form] = Form.useForm();
  const [uploadedImages, setUploadedImages] = useState<string[]>(product?.images || []);

  // 组件初始化时设置表单值
  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        name: product.name,
        categoryId: product.categoryId,
        price: product.price,
        costPrice: product.costPrice,
        stock: product.stock,
        size: product.size,
        status: product.status,
      });
    } else {
      // 新增时重置表单
      form.resetFields();
      setUploadedImages([]);
    }
  }, [product, form]);

  // 图片上传处理
  const handleImageUpload = (file: RcFile) => {
    // 模拟图片上传，实际项目中应该调用真实的上传接口
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setUploadedImages([...uploadedImages, imageUrl]);
    };
    reader.readAsDataURL(file);
    return false; // 阻止自动上传
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const handleFinish = async (values: any) => {
    try {
      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        ...values,
        images: uploadedImages,
      };

      await onSubmit(productData);
    } catch (error) {
      message.error('创建商品失败');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        status: 'active',
        price: 0,
        costPrice: 0,
        stock: 0,
      }}
    >
      <Form.Item
        name="name"
        label="商品名称"
        rules={[{ required: true, message: '请输入商品名称' }]}
      >
        <Input placeholder="请输入商品名称" maxLength={200} />
      </Form.Item>

      <div style={{ display: 'flex', gap: 16 }}>
        <Form.Item
          name="categoryId"
          label="商品分类"
          rules={[{ required: true, message: '请选择商品分类' }]}
          style={{ flex: 1 }}
        >
          <Select placeholder="请选择商品分类">
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <Form.Item
          name="price"
          label="销售价格"
          rules={[{ required: true, message: '请输入销售价格' }]}
          style={{ flex: 1 }}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="销售价格"
            min={0}
            precision={2}
          />
        </Form.Item>

        <Form.Item
          name="costPrice"
          label="成本价格"
          rules={[{ required: true, message: '请输入成本价格' }]}
          style={{ flex: 1 }}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="成本价格"
            min={0}
            precision={2}
          />
        </Form.Item>

        <Form.Item
          name="stock"
          label="库存数量"
          rules={[{ required: true, message: '请输入库存数量' }]}
          style={{ flex: 1 }}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="库存数量"
            min={0}
          />
        </Form.Item>
      </div>

      <Form.Item label="商品图片">
        <Upload
          listType="picture-card"
          beforeUpload={handleImageUpload}
          fileList={uploadedImages.map((url, index) => ({
            uid: index.toString(),
            name: `image-${index}`,
            status: 'done',
            url,
          }))}
          onRemove={(file) => handleRemoveImage(Number(file.uid))}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </div>
        </Upload>
      </Form.Item>


      <Form.Item
        name="size"
        label="商品尺寸"
        rules={[{ required: true, message: '请选择商品尺寸' }]}
      >
        <Select placeholder="请选择商品尺寸">
          <Option value="XS">XS</Option>
          <Option value="S">S</Option>
          <Option value="M">M</Option>
          <Option value="L">L</Option>
          <Option value="XL">XL</Option>
          <Option value="XXL">XXL</Option>
          <Option value="3XL">3XL</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="status"
        label="商品状态"
        rules={[{ required: true, message: '请选择商品状态' }]}
      >
        <Select placeholder="请选择商品状态">
          <Option value="active">上架中</Option>
          <Option value="inactive">已下架</Option>
          <Option value="out_of_stock">缺货</Option>
        </Select>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space size="middle">
          <Button onClick={onCancel} disabled={loading}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;
