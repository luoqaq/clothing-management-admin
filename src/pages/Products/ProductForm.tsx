import { useEffect } from 'react';
import { Button, Divider, Form, Input, InputNumber, Select, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { Product, ProductBrand, ProductCategory } from '../../types';

interface ProductFormProps {
  categories: ProductCategory[];
  brands: ProductBrand[];
  onSubmit: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  product?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({
  categories,
  brands,
  onSubmit,
  onCancel,
  loading = false,
  product,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!product) {
      form.resetFields();
      form.setFieldsValue({
        status: 'draft',
        specifications: [
          {
            skuCode: '',
            color: '',
            size: '',
            salePrice: 0,
            costPrice: 0,
            stock: 0,
            status: 'active',
          },
        ],
      });
      return;
    }

    form.setFieldsValue({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      brandId: product.brandId ?? undefined,
      status: product.status,
      mainImages: product.mainImages.join('\n'),
      detailImages: product.detailImages.join('\n'),
      tags: product.tags.join(','),
      specifications: product.specifications.map((item) => ({
        skuCode: item.skuCode,
        barcode: item.barcode ?? '',
        color: item.color,
        size: item.size,
        salePrice: item.salePrice,
        costPrice: item.costPrice,
        stock: item.stock,
        reservedStock: item.reservedStock,
        status: item.status,
      })),
    });
  }, [form, product]);

  const handleFinish = async (values: any) => {
    await onSubmit({
      name: values.name,
      description: values.description,
      categoryId: values.categoryId,
      brandId: values.brandId ?? null,
      mainImages: values.mainImages
        ? String(values.mainImages)
            .split('\n')
            .map((item: string) => item.trim())
            .filter(Boolean)
        : [],
      detailImages: values.detailImages
        ? String(values.detailImages)
            .split('\n')
            .map((item: string) => item.trim())
            .filter(Boolean)
        : [],
      tags: values.tags
        ? String(values.tags)
            .split(',')
            .map((item: string) => item.trim())
            .filter(Boolean)
        : [],
      status: values.status,
      specifications: values.specifications.map((item: any, index: number) => ({
        id: product?.specifications[index]?.id ?? 0,
        productId: product?.id ?? 0,
        skuCode: item.skuCode,
        barcode: item.barcode || null,
        color: item.color,
        size: item.size,
        salePrice: item.salePrice,
        costPrice: item.costPrice,
        stock: item.stock,
        reservedStock: item.reservedStock ?? 0,
        availableStock: Math.max((item.stock ?? 0) - (item.reservedStock ?? 0), 0),
        status: item.status ?? 'active',
        createdAt: product?.specifications[index]?.createdAt ?? '',
        updatedAt: product?.specifications[index]?.updatedAt ?? '',
      })),
      specCount: product?.specCount ?? 0,
      totalStock: product?.totalStock ?? 0,
      reservedStock: product?.reservedStock ?? 0,
      availableStock: product?.availableStock ?? 0,
      minPrice: product?.minPrice ?? 0,
      maxPrice: product?.maxPrice ?? 0,
      category: product?.category,
      brand: product?.brand,
    });
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Divider>基础信息</Divider>
      <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
        <Input placeholder="例如：基础圆领T恤" />
      </Form.Item>
      <Space style={{ display: 'flex' }} align="start">
        <Form.Item
          name="categoryId"
          label="商品分类"
          rules={[{ required: true, message: '请选择商品分类' }]}
          style={{ minWidth: 200 }}
        >
          <Select placeholder="选择分类" options={categories.map((item) => ({ label: item.name, value: item.id }))} />
        </Form.Item>
        <Form.Item name="brandId" label="品牌" style={{ minWidth: 200 }}>
          <Select
            allowClear
            placeholder="选择品牌"
            options={brands.map((item) => ({ label: item.name, value: item.id }))}
          />
        </Form.Item>
        <Form.Item
          name="status"
          label="商品状态"
          rules={[{ required: true, message: '请选择商品状态' }]}
          style={{ minWidth: 200 }}
        >
          <Select
            options={[
              { label: '草稿', value: 'draft' },
              { label: '上架中', value: 'active' },
              { label: '已下架', value: 'inactive' },
            ]}
          />
        </Form.Item>
      </Space>
      <Form.Item name="description" label="商品描述">
        <Input.TextArea rows={3} placeholder="补充商品卖点、材质或适用场景" />
      </Form.Item>
      <Form.Item name="mainImages" label="主图链接">
        <Input.TextArea rows={2} placeholder="每行一个图片链接" />
      </Form.Item>
      <Form.Item name="detailImages" label="详情图链接">
        <Input.TextArea rows={2} placeholder="每行一个图片链接" />
      </Form.Item>
      <Form.Item name="tags" label="标签">
        <Input placeholder="例如：基础款, 百搭, 春夏" />
      </Form.Item>

      <Divider>规格明细</Divider>
      <Form.List name="specifications">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space
                key={key}
                align="start"
                style={{ display: 'flex', marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 8 }}
              >
                <Form.Item
                  {...restField}
                  name={[name, 'skuCode']}
                  label="规格编码"
                  rules={[{ required: true, message: '请输入规格编码' }]}
                >
                  <Input placeholder="SKU-001" />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'color']} label="颜色" rules={[{ required: true }]}>
                  <Input placeholder="白色" />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'size']} label="尺码" rules={[{ required: true }]}>
                  <Input placeholder="M" />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'salePrice']} label="售价" rules={[{ required: true }]}>
                  <InputNumber min={0} precision={2} />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'costPrice']} label="成本价" rules={[{ required: true }]}>
                  <InputNumber min={0} precision={2} />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'stock']} label="库存" rules={[{ required: true }]}>
                  <InputNumber min={0} />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'status']} label="状态" initialValue="active">
                  <Select
                    style={{ width: 120 }}
                    options={[
                      { label: '启用', value: 'active' },
                      { label: '停用', value: 'inactive' },
                    ]}
                  />
                </Form.Item>
                <Button
                  danger
                  icon={<MinusCircleOutlined />}
                  style={{ marginTop: 30 }}
                  onClick={() => remove(name)}
                  disabled={fields.length === 1}
                />
              </Space>
            ))}
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              添加规格
            </Button>
          </>
        )}
      </Form.List>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存商品
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;
