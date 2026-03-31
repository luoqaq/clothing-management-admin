import { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Typography, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { Product, ProductCategory, Supplier } from '../../types';
import ImageUploadField from '../../components/ImageUploadField';

const { Title, Text } = Typography;
const SIZE_OPTIONS = [
  { label: 'XS', value: 'XS' },
  { label: 'S', value: 'S' },
  { label: 'M', value: 'M' },
  { label: 'L', value: 'L' },
  { label: 'XL', value: 'XL' },
  { label: 'XXL', value: 'XXL' },
  { label: 'F / 均码', value: 'F' },
];

interface ProductFormProps {
  categories: ProductCategory[];
  suppliers: Supplier[];
  onSubmit: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  product?: Product;
}

function buildSkuCode(productCode?: string, size?: string, color?: string): string {
  const parts = [productCode, size, color].map((item) => String(item ?? '').trim()).filter(Boolean);
  return parts.join('-');
}

function formatDecimalInput(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const nextValue = String(value);
  return nextValue.replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
}

const ProductForm: React.FC<ProductFormProps> = ({
  categories,
  suppliers,
  onSubmit,
  onCancel,
  loading = false,
  product,
}) => {
  const [form] = Form.useForm();
  const [isMainImagesUploading, setIsMainImagesUploading] = useState(false);
  const [isDetailImagesUploading, setIsDetailImagesUploading] = useState(false);

  useEffect(() => {
    if (!product) {
      form.resetFields();
      form.setFieldsValue({
        productCode: '',
        status: 'active',
        specifications: [
          {
            color: '',
            size: 'F',
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
      productCode: product.productCode,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      supplierId: product.supplierId ?? undefined,
      status: product.status,
      mainImages: product.mainImages.slice(0, 1),
      detailImages: product.detailImages,
      tags: product.tags.join(','),
      specifications: product.specifications.map((item) => ({
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
    if (isMainImagesUploading || isDetailImagesUploading) {
      message.error('图片上传中，请等待上传完成后再保存商品');
      return;
    }

    await onSubmit({
      productCode: String(values.productCode).trim(),
      name: values.name,
      description: values.description,
      categoryId: values.categoryId,
      supplierId: values.supplierId ?? null,
      mainImages: Array.isArray(values.mainImages) ? values.mainImages.slice(0, 1) : [],
      detailImages: Array.isArray(values.detailImages) ? values.detailImages : [],
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
        skuCode: buildSkuCode(values.productCode, item.size, item.color),
        barcode: item.barcode ? String(item.barcode).trim() : undefined,
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
      supplier: product?.supplier,
    });
  };

  const handleAddSpecification = (add: (defaultValue?: any, insertIndex?: number) => void) => {
    const specifications = form.getFieldValue('specifications');
    const previousSpec = Array.isArray(specifications) ? specifications[specifications.length - 1] : undefined;

    add({
      barcode: previousSpec?.barcode ?? '',
      color: previousSpec?.color ?? '',
      size: previousSpec?.size ?? 'F',
      salePrice: previousSpec?.salePrice ?? 0,
      costPrice: previousSpec?.costPrice ?? 0,
      stock: 0,
      reservedStock: 0,
      status: previousSpec?.status ?? 'active',
    });
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} className="editor-form">
      <div className="editor-form__toolbar">
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={isMainImagesUploading || isDetailImagesUploading}
          >
            保存商品
          </Button>
        </Space>
      </div>

      <Card className="form-panel">
        <div className="form-panel__header">
          <div>
            <Text className="form-panel__eyebrow">Product editor</Text>
            <Title level={4} className="form-panel__title">
              基础信息
            </Title>
          </div>
        </div>
        <div className="product-form__hero">
          <div className="product-form__hero-main">
            <Row gutter={[16, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="productCode"
                  label="款号"
                  rules={[{ required: true, message: '请输入款号' }]}
                >
                  <Input placeholder="例如：TOP001" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
                  <Input placeholder="例如：基础圆领T恤" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="categoryId"
                  label="商品分类"
                  rules={[{ required: true, message: '请选择商品分类' }]}
                >
                  <Select className="product-form__select" placeholder="选择分类" options={categories.map((item) => ({ label: item.name, value: item.id }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="supplierId" label="供应商">
                  <Select
                    className="product-form__select"
                    allowClear
                    placeholder="选择供应商"
                    options={suppliers.map((item) => ({ label: item.name, value: item.id }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="status"
                  label="商品状态"
                  rules={[{ required: true, message: '请选择商品状态' }]}
                >
                  <Select
                    className="product-form__select"
                    options={[
                      { label: '草稿', value: 'draft' },
                      { label: '上架中', value: 'active' },
                      { label: '已下架', value: 'inactive' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="description" label="商品描述">
                  <Input.TextArea rows={4} placeholder="补充商品卖点、材质或适用场景" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="tags" label="标签">
                  <Input placeholder="例如：基础款, 百搭, 春夏" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="product-form__hero-side">
            <div className="product-form__media-panel">
              <div className="product-form__media-header">
                <Text className="form-panel__eyebrow">Assets</Text>
                <Title level={5} className="product-form__media-title">
                  主图
                </Title>
              </div>
              <Form.Item name="mainImages" label="商品主图（仅 1 张）" className="form-panel__field-last product-form__media-field">
                <ImageUploadField scene="main" maxCount={1} onUploadingChange={setIsMainImagesUploading} />
              </Form.Item>
            </div>
          </div>
        </div>
      </Card>

      <Card className="form-panel">
        <div className="form-panel__header">
          <div>
            <Text className="form-panel__eyebrow">Specifications</Text>
            <Title level={4} className="form-panel__title">
              规格明细
            </Title>
          </div>
        </div>
        <Form.List name="specifications">
          {(fields, { add, remove }) => (
            <>
              <div className="spec-grid">
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card key={key} className="spec-card">
                    <div className="spec-card__header">
                      <div>
                        <Text className="spec-card__index">规格 {index + 1}</Text>
                      </div>
                      <Button
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                        disabled={fields.length === 1}
                      >
                        删除
                      </Button>
                    </div>
                    <Row gutter={[16, 0]}>
                      <Col xs={24} md={8}>
                        <Form.Item {...restField} name={[name, 'color']} label="颜色" rules={[{ required: true }]}>
                          <Input placeholder="白色" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item {...restField} name={[name, 'size']} label="尺码" rules={[{ required: true }]}>
                          <Select className="product-form__select" placeholder="选择尺码" options={SIZE_OPTIONS} />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item label="规格编码">
                          <Form.Item noStyle shouldUpdate>
                            {() => {
                              const productCode = form.getFieldValue('productCode');
                              const specification = form.getFieldValue(['specifications', name]) || {};
                              return (
                                <Input
                                  value={buildSkuCode(productCode, specification.size, specification.color)}
                                  placeholder="保存后自动按 款号-尺码-颜色 生成"
                                  disabled
                                />
                              );
                            }}
                          </Form.Item>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item {...restField} name={[name, 'salePrice']} label="售价" rules={[{ required: true }]}>
                          <InputNumber min={0} precision={2} formatter={formatDecimalInput} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item {...restField} name={[name, 'costPrice']} label="成本价" rules={[{ required: true }]}>
                          <InputNumber min={0} precision={2} formatter={formatDecimalInput} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item {...restField} name={[name, 'stock']} label="库存" rules={[{ required: true }]}>
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item {...restField} name={[name, 'status']} label="状态" initialValue="active">
                          <Select
                            className="product-form__select"
                            options={[
                              { label: '启用', value: 'active' },
                              { label: '停用', value: 'inactive' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
              <Button
                type="dashed"
                onClick={() => handleAddSpecification(add)}
                block
                icon={<PlusOutlined />}
              >
                添加规格
              </Button>
            </>
          )}
        </Form.List>
      </Card>

      <Card className="form-panel">
        <div className="form-panel__header">
          <div>
            <Text className="form-panel__eyebrow">Assets</Text>
            <Title level={4} className="form-panel__title">
              详情图
            </Title>
          </div>
        </div>
        <Form.Item name="detailImages" label="详情展示图" className="form-panel__field-last">
          <ImageUploadField scene="detail" maxCount={20} onUploadingChange={setIsDetailImagesUploading} />
        </Form.Item>
      </Card>
    </Form>
  );
};

export default ProductForm;
