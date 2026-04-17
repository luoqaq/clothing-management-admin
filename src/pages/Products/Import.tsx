import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Divider,
  Empty,
  Input,
  InputNumber,
  Result,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useProducts } from '../../hooks/useProducts';
import { SIZE_OPTIONS } from '../../constants/productOptions';
import type {
  BulkImportResult,
  ExcelImportPayload,
  ImportDraftProduct,
  ImportDraftSpecification,
  ImportIssue,
  ProductCategory,
  ProductStatus,
  Supplier,
} from '../../types';

const { Title, Text } = Typography;
const { Dragger } = Upload;

function normalizeLookup(value: unknown): string {
  return String(value ?? '').trim().replace(/\s+/g, '').toLowerCase();
}

function buildSkuCode(productCode: string, size: string, color: string): string {
  return [productCode, size, color].map((item) => String(item ?? '').trim()).filter(Boolean).join('-');
}

function splitTags(value: string): string[] {
  return String(value ?? '')
    .split(/[，,、/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createEmptySpecification(productRowKey: string, index: number): ImportDraftSpecification {
  return {
    rowKey: `${productRowKey}-spec-${index + 1}`,
    barcode: '',
    color: '',
    size: 'F',
    salePrice: 0,
    costPrice: 0,
    stock: 0,
    status: 'active',
  };
}

function createEmptyDraft(index: number): ImportDraftProduct {
  const rowKey = `manual-${Date.now()}-${index}`;

  return {
    rowKey,
    source: 'excel',
    productCode: '',
    name: '',
    description: '',
    categoryId: null,
    categoryName: null,
    supplierId: null,
    supplierName: null,
    tags: [],
    status: 'active',
    specifications: [createEmptySpecification(rowKey, 0)],
  };
}

function validateDrafts(
  drafts: ImportDraftProduct[],
  categories: ProductCategory[],
  suppliers: Supplier[]
): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const categoryIds = new Set(categories.map((item) => Number(item.id)));
  const supplierIds = new Set(suppliers.map((item) => Number(item.id)));

  drafts.forEach((draft) => {
    if (!draft.productCode.trim()) {
      issues.push({ level: 'error', rowKey: draft.rowKey, field: 'productCode', message: '款号不能为空' });
    }

    if (!draft.name.trim()) {
      issues.push({ level: 'error', rowKey: draft.rowKey, field: 'name', message: '商品名称不能为空' });
    }

    if (!draft.categoryId || !categoryIds.has(Number(draft.categoryId))) {
      issues.push({ level: 'error', rowKey: draft.rowKey, field: 'categoryId', message: '请为商品选择有效分类' });
    }

    if (draft.supplierId && !supplierIds.has(Number(draft.supplierId))) {
      issues.push({ level: 'warning', rowKey: draft.rowKey, field: 'supplierId', message: '供应商未匹配，请重新选择' });
    }

    if (draft.supplierName && !draft.supplierId) {
      issues.push({ level: 'warning', rowKey: draft.rowKey, field: 'supplierId', message: '供应商未匹配，可在提交时自动创建' });
    }

    if (!draft.specifications.length) {
      issues.push({ level: 'error', rowKey: draft.rowKey, field: 'specifications', message: '至少需要一个规格' });
    }

    const specDedupeMap = new Map<string, string[]>();

    draft.specifications.forEach((spec) => {
      if (!spec.color.trim()) {
        issues.push({ level: 'error', rowKey: draft.rowKey, specRowKey: spec.rowKey, field: 'color', message: '颜色不能为空' });
      }
      if (!spec.size.trim()) {
        issues.push({ level: 'error', rowKey: draft.rowKey, specRowKey: spec.rowKey, field: 'size', message: '尺码不能为空' });
      }
      if (spec.salePrice < 0) {
        issues.push({ level: 'error', rowKey: draft.rowKey, specRowKey: spec.rowKey, field: 'salePrice', message: '售价不能为负数' });
      }
      if (spec.costPrice < 0) {
        issues.push({ level: 'error', rowKey: draft.rowKey, specRowKey: spec.rowKey, field: 'costPrice', message: '成本价不能为负数' });
      }
      if (spec.stock < 0) {
        issues.push({ level: 'error', rowKey: draft.rowKey, specRowKey: spec.rowKey, field: 'stock', message: '库存不能为负数' });
      }

      const specKey = `${normalizeLookup(spec.color)}-${normalizeLookup(spec.size)}`;
      if (specKey !== '-') {
        specDedupeMap.set(specKey, [...(specDedupeMap.get(specKey) ?? []), spec.rowKey]);
      }
    });

    for (const [, specRowKeys] of specDedupeMap.entries()) {
      if (specRowKeys.length > 1) {
        specRowKeys.forEach((specRowKey) => {
          issues.push({ level: 'error', rowKey: draft.rowKey, specRowKey, field: 'specifications', message: '同一商品内颜色和尺码组合不能重复' });
        });
      }
    }
  });

  return issues;
}

function parseDuplicateProductCodesFromError(messageText: string): string[] {
  const patterns = ['存在重复款号：', '以下款号已存在：'];

  for (const pattern of patterns) {
    const index = messageText.indexOf(pattern);
    if (index === -1) {
      continue;
    }

    return messageText
      .slice(index + pattern.length)
      .split(/[、,，]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function buildDuplicateProductCodeIssues(drafts: ImportDraftProduct[], productCodes: string[]): ImportIssue[] {
  if (!productCodes.length) {
    return [];
  }

  const duplicateCodeSet = new Set(productCodes);

  return drafts
    .filter((draft) => duplicateCodeSet.has(String(draft.productCode ?? '').trim()))
    .map((draft) => ({
      level: 'error' as const,
      rowKey: draft.rowKey,
      field: 'productCode',
      message: `款号 ${draft.productCode} 已存在，请修改后重试`,
    }));
}

const ProductImportPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    categories,
    suppliers,
    loading,
    getCategories,
    getSuppliers,
    getProducts,
    parseExcelImport,
    parseExcelFileImport,
    parseImageImport,
    bulkCreateProducts,
  } = useProducts();
  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState<ImportDraftProduct[]>([]);
  const [serverIssues, setServerIssues] = useState<ImportIssue[]>([]);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [createMissingSuppliers, setCreateMissingSuppliers] = useState(true);
  const [defaultCategoryId, setDefaultCategoryId] = useState<number | undefined>();
  const [defaultSupplierId, setDefaultSupplierId] = useState<number | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<ProductStatus>('active');
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingText, setProcessingText] = useState('');
  const [expandedDraftKeys, setExpandedDraftKeys] = useState<string[]>([]);

  useEffect(() => {
    void Promise.all([getCategories(), getSuppliers()]);
  }, []);

  const clientIssues = useMemo(() => validateDrafts(drafts, categories, suppliers), [drafts, categories, suppliers]);
  const mergedIssues = useMemo(() => [...serverIssues, ...clientIssues], [clientIssues, serverIssues]);
  const errorCount = mergedIssues.filter((item) => item.level === 'error').length;
  const warningCount = mergedIssues.filter((item) => item.level === 'warning').length;

  const issueMap = useMemo(() => {
    const map = new Map<string, ImportIssue[]>();
    mergedIssues.forEach((issue) => {
      const key = `${issue.rowKey}:${issue.specRowKey ?? 'product'}:${issue.field}`;
      map.set(key, [...(map.get(key) ?? []), issue]);
    });
    return map;
  }, [mergedIssues]);

  const updateDraft = (rowKey: string, updater: (draft: ImportDraftProduct) => ImportDraftProduct) => {
    setDrafts((current) => current.map((item) => (item.rowKey === rowKey ? updater(item) : item)));
    setServerIssues((current) => current.filter((item) => item.rowKey !== rowKey));
  };

  const addManualDraft = () => {
    const nextDraft = createEmptyDraft(drafts.length + 1);
    setDrafts((current) => [...current, nextDraft]);
    setExpandedDraftKeys((current) => [...current, nextDraft.rowKey]);
    setServerIssues([]);
    setImportResult(null);
    setStep(1);
    message.success('已新增一条空白商品草稿');
  };

  const readExcelAndParse = async (file: File) => {
    try {
      setIsParsing(true);
      setProcessingText('正在读取 Excel 并整理表格数据...');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        message.error('Excel 中没有可读取的工作表');
        return false;
      }

      const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(workbook.Sheets[sheetName], {
        header: 1,
        raw: true,
        defval: '',
      });
      const [headerRow, ...dataRows] = rows;
      const headers = (headerRow ?? []).map((item) => String(item ?? '').trim()).filter(Boolean);

      if (!headers.length) {
        message.error('Excel 表头不能为空');
        return false;
      }

      const payload: ExcelImportPayload = {
        fileName: file.name,
        headers,
        rows: dataRows
          .filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''))
          .map((row) =>
            headers.reduce<Record<string, string | number | boolean | null>>((acc, header, index) => {
              acc[header] = row[index] ?? '';
              return acc;
            }, {})
          ),
      };

      if (!payload.rows.length) {
        message.error('Excel 没有可导入的数据行');
        return false;
      }

      setProcessingText('正在调用 AI 分析 Excel 中的商品信息...');
      const result = await parseExcelImport(payload);
      if (!result) {
        return false;
      }

      setDrafts(result.drafts);
      setExpandedDraftKeys(result.drafts.slice(0, 1).map((item) => item.rowKey));
      setServerIssues(result.issues);
      setImportResult(null);
      setStep(1);
      message.success(`已识别 ${result.drafts.length} 条商品草稿`);
    } catch (error) {
      const fallback = '浏览器读取 Excel 失败，请检查文件格式或改用 Pad 导入 Excel';
      message.error(error instanceof Error && error.message ? error.message : fallback);
    } finally {
      setIsParsing(false);
      setProcessingText('');
    }

    return false;
  };

  const uploadExcelAndParseOnServer = async (file: File) => {
    try {
      setIsParsing(true);
      setProcessingText('正在上传 Excel 并由服务器解析...');
      const result = await parseExcelFileImport(file);
      if (!result) {
        return false;
      }

      setDrafts(result.drafts);
      setExpandedDraftKeys(result.drafts.slice(0, 1).map((item) => item.rowKey));
      setServerIssues(result.issues);
      setImportResult(null);
      setStep(1);
      message.success(`服务器已识别 ${result.drafts.length} 条商品草稿`);
    } catch (error) {
      const fallback = 'Pad 导入 Excel 失败，请稍后重试或检查网络后重试';
      message.error(error instanceof Error && error.message ? error.message : fallback);
    } finally {
      setIsParsing(false);
      setProcessingText('');
    }

    return false;
  };

  const uploadImageAndParse = async (file: File) => {
    try {
      setIsParsing(true);
      setProcessingText('正在上传截图并调用 AI 识别...');
      const result = await parseImageImport(file);
      if (!result) {
        return false;
      }

      setDrafts(result.drafts);
      setExpandedDraftKeys(result.drafts.slice(0, 1).map((item) => item.rowKey));
      setServerIssues(result.issues);
      setImportResult(null);
      setStep(1);
      message.success(`AI 已识别 ${result.drafts.length} 条商品草稿`);
    } finally {
      setIsParsing(false);
      setProcessingText('');
    }
    return false;
  };

  const applyDefaults = () => {
    setDrafts((current) =>
      current.map((draft) => ({
        ...draft,
        categoryId: defaultCategoryId ?? draft.categoryId ?? null,
        categoryName: defaultCategoryId
          ? categories.find((item) => item.id === defaultCategoryId)?.name ?? draft.categoryName
          : draft.categoryName,
        supplierId: defaultSupplierId ?? draft.supplierId ?? null,
        supplierName: defaultSupplierId
          ? suppliers.find((item) => item.id === defaultSupplierId)?.name ?? draft.supplierName
          : draft.supplierName,
        status: defaultStatus,
      }))
    );
    message.success('分类、供应商和状态已批量应用');
  };

  const submitImport = async () => {
    if (!drafts.length) {
      message.warning('当前没有可导入的商品');
      return;
    }

    if (errorCount > 0) {
      message.error('请先修正错误项后再提交');
      return;
    }

    try {
      setIsSubmitting(true);
      setProcessingText('正在批量创建商品，请不要关闭页面...');
      setServerIssues([]);
      const result = await bulkCreateProducts(drafts, createMissingSuppliers);

      setImportResult(result);
      setStep(2);
      void Promise.all([getProducts({ page: 1, pageSize: 10 }), getSuppliers()]);
      message.success(`导入完成，成功 ${result.successCount} 条`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '批量导入失败';
      const duplicateCodes = parseDuplicateProductCodesFromError(errorMessage);

      if (duplicateCodes.length > 0) {
        const duplicateIssues = buildDuplicateProductCodeIssues(drafts, duplicateCodes);
        setServerIssues(duplicateIssues);
        setExpandedDraftKeys((current) => {
          const nextKeys = new Set(current);
          duplicateIssues.forEach((item) => nextKeys.add(item.rowKey));
          return Array.from(nextKeys);
        });
      }
    } finally {
      setIsSubmitting(false);
      setProcessingText('');
    }
  };

  const isProcessing = isParsing || isSubmitting;

  const renderFieldIssues = (rowKey: string, field: string, specRowKey?: string) => {
    const items = issueMap.get(`${rowKey}:${specRowKey ?? 'product'}:${field}`) ?? [];
    if (!items.length) {
      return null;
    }

    return (
      <Space direction="vertical" size={2} style={{ width: '100%', marginTop: 6 }}>
        {items.map((item, index) => (
          <Text key={`${field}-${index}`} type={item.level === 'error' ? 'danger' : 'secondary'}>
            {item.message}
          </Text>
        ))}
      </Space>
    );
  };

  const getDraftIssues = (rowKey: string) =>
    mergedIssues.filter((item) => item.rowKey === rowKey);

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      {isProcessing ? (
        <Card className="page-card import-processing-card">
          <Space align="center" size={16}>
            <Spin size="large" />
            <Space direction="vertical" size={2}>
              <Text strong>{isParsing ? '正在分析导入资料' : '正在执行批量导入'}</Text>
              <Text type="secondary">{processingText}</Text>
            </Space>
          </Space>
        </Card>
      ) : null}

      <Card className="page-card">
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
            <Space direction="vertical" size={4}>
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>
                返回商品管理
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                商品批量导入
              </Title>
              <Text type="secondary">上传 Excel 或截图，审核后批量创建商品。</Text>
            </Space>

            {step === 1 ? (
              <Space wrap>
                <Button icon={<PlusOutlined />} disabled={isProcessing} onClick={addManualDraft}>
                  新增商品
                </Button>
                <Select
                  allowClear
                  placeholder="默认分类"
                  style={{ width: 180 }}
                  value={defaultCategoryId}
                  onChange={(value) => setDefaultCategoryId(value)}
                  options={categories.map((item) => ({ label: item.name, value: item.id }))}
                />
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="默认供应商"
                  style={{ width: 180 }}
                  value={defaultSupplierId}
                  onChange={(value) => setDefaultSupplierId(value)}
                  options={suppliers.map((item) => ({ label: item.name, value: item.id }))}
                />
                <Select
                  style={{ width: 150 }}
                  value={defaultStatus}
                  onChange={(value) => setDefaultStatus(value)}
                  options={[
                    { label: '上架中', value: 'active' },
                    { label: '草稿', value: 'draft' },
                    { label: '已下架', value: 'inactive' },
                  ]}
                />
                <Button onClick={applyDefaults}>应用默认值</Button>
                <Checkbox checked={createMissingSuppliers} disabled={isProcessing} onChange={(e) => setCreateMissingSuppliers(e.target.checked)}>
                  自动创建缺失供应商
                </Checkbox>
                <Button type="primary" onClick={submitImport} loading={isSubmitting} disabled={isProcessing || loading}>
                  {isSubmitting ? '正在导入...' : '开始导入'}
                </Button>
              </Space>
            ) : null}
          </Space>

          <Steps
            current={step}
            items={[
              { title: '上传资料', description: 'Excel / 截图' },
              { title: '审核编辑', description: '修正后提交' },
              { title: '导入结果', description: '查看成功失败明细' },
            ]}
          />
        </Space>
      </Card>

      {step === 0 ? (
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={8}>
            <Card className="page-card import-entry-card" title="导入 Excel">
              <Space direction="vertical" size={12} className="import-entry-card__content">
                <Text type="secondary">适合桌面浏览器：先在本地读取 Excel，再调用 AI 分析商品信息。</Text>
                <Dragger beforeUpload={(file) => readExcelAndParse(file as File)} showUploadList={false} disabled={isProcessing} accept=".xlsx,.xls">
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">{isParsing ? 'Excel 分析中，请稍候...' : '拖拽 Excel 到这里，或点击选择文件'}</p>
                </Dragger>
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="page-card import-entry-card" title="Pad 导入 Excel">
              <Space direction="vertical" size={12} className="import-entry-card__content">
                <Text type="secondary">Pad 推荐使用：直接上传 Excel 到服务器解析，避免浏览器本地解析失败。</Text>
                <Dragger beforeUpload={(file) => uploadExcelAndParseOnServer(file as File)} showUploadList={false} disabled={isProcessing} accept=".xlsx,.xls">
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">{isParsing ? '服务器正在解析 Excel，请稍候...' : '拖拽 Excel 到这里，或点击选择文件'}</p>
                </Dragger>
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="page-card import-entry-card" title="导入截图">
              <Space direction="vertical" size={12} className="import-entry-card__content">
                <Text type="secondary">适合货单截图或聊天图片：上传图片后由 AI 识别商品与规格信息。</Text>
                <Dragger beforeUpload={(file) => uploadImageAndParse(file as File)} showUploadList={false} disabled={isProcessing} accept="image/*">
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">{isParsing ? '截图识别中，请稍候...' : '拖拽截图到这里，或点击选择图片'}</p>
                </Dragger>
              </Space>
            </Card>
          </Col>
          <Col xs={24}>
            <Card className="page-card" title="手动新增">
              <Space direction="vertical" size={12}>
                <Text type="secondary">如果这次有商品不在 Excel 或截图里，可以先新增一条空白草稿，再在审核页补完整信息。</Text>
                <Button type="primary" icon={<PlusOutlined />} disabled={isProcessing} onClick={addManualDraft}>
                  新增一个商品
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      ) : null}

      {step === 1 ? (
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          {mergedIssues.length > 0 ? (
            <Alert
              type={errorCount > 0 ? 'error' : 'warning'}
              showIcon
              message={`当前有 ${errorCount} 个错误、${warningCount} 个提醒`}
              description="错误项必须修正后才能提交；供应商提醒可通过“自动创建缺失供应商”继续导入。"
            />
          ) : null}

          {!drafts.length ? (
            <Card className="page-card">
              <Empty description="没有可审核的商品草稿" />
            </Card>
          ) : null}

          {drafts.length > 0 ? (
            <Card className="page-card">
              <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }} wrap>
                <Space wrap>
                  <Text strong>商品草稿列表</Text>
                  <Tag>{`共 ${drafts.length} 条`}</Tag>
                  <Tag color={errorCount > 0 ? 'error' : 'processing'}>{`错误 ${errorCount}`}</Tag>
                  <Tag color={warningCount > 0 ? 'warning' : 'default'}>{`提醒 ${warningCount}`}</Tag>
                </Space>
                <Space wrap>
                  <Button disabled={!drafts.length} onClick={() => setExpandedDraftKeys(drafts.map((item) => item.rowKey))}>
                    全部展开
                  </Button>
                  <Button disabled={!drafts.length} onClick={() => setExpandedDraftKeys([])}>
                    全部收起
                  </Button>
                </Space>
              </Space>

              <Collapse
                accordion
                activeKey={expandedDraftKeys}
                onChange={(keys) => setExpandedDraftKeys(Array.isArray(keys) ? keys.map(String) : [String(keys)])}
                className="import-draft-collapse"
                items={drafts.map((draft, index) => {
                  const draftIssues = getDraftIssues(draft.rowKey);
                  const draftErrorCount = draftIssues.filter((item) => item.level === 'error').length;
                  const draftWarningCount = draftIssues.filter((item) => item.level === 'warning').length;

                  return {
                    key: draft.rowKey,
                    label: (
                      <div className="import-draft-summary">
                        <div className="import-draft-summary__main">
                          <Text strong>{draft.name || `未命名商品 ${index + 1}`}</Text>
                          <Text type="secondary">{draft.productCode || '未填写款号'}</Text>
                        </div>
                        <div className="import-draft-summary__meta">
                          <Tag>{draft.categoryName || '未选分类'}</Tag>
                          <Tag>{draft.supplierName || '未选供应商'}</Tag>
                          <Tag>{`${draft.specifications.length} 个规格`}</Tag>
                          {draftErrorCount > 0 ? <Tag color="error">{`${draftErrorCount} 错误`}</Tag> : null}
                          {draftWarningCount > 0 ? <Tag color="warning">{`${draftWarningCount} 提醒`}</Tag> : null}
                        </div>
                      </div>
                    ),
                    extra: (
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={(event) => {
                          event.stopPropagation();
                          setDrafts((current) => current.filter((item) => item.rowKey !== draft.rowKey));
                          setExpandedDraftKeys((current) => current.filter((item) => item !== draft.rowKey));
                        }}
                      >
                        删除
                      </Button>
                    ),
                    children: (
                      <>
                        <div className="import-draft-editor">
                          <div className="import-field-grid">
                            <div className="import-field">
                              <Text type="secondary">款号</Text>
                              <Input
                                size="small"
                                value={draft.productCode}
                                onChange={(e) => updateDraft(draft.rowKey, (current) => ({ ...current, productCode: e.target.value }))}
                                disabled={isProcessing}
                              />
                              {renderFieldIssues(draft.rowKey, 'productCode')}
                            </div>

                            <div className="import-field">
                              <Text type="secondary">商品名称</Text>
                              <Input
                                size="small"
                                value={draft.name}
                                onChange={(e) => updateDraft(draft.rowKey, (current) => ({ ...current, name: e.target.value }))}
                                disabled={isProcessing}
                              />
                              {renderFieldIssues(draft.rowKey, 'name')}
                            </div>

                            <div className="import-field">
                              <Text type="secondary">状态</Text>
                              <Select
                                size="small"
                                style={{ width: '100%' }}
                                value={draft.status}
                                disabled={isProcessing}
                                onChange={(value) => updateDraft(draft.rowKey, (current) => ({ ...current, status: value }))}
                                options={[
                                  { label: '上架中', value: 'active' },
                                  { label: '草稿', value: 'draft' },
                                  { label: '已下架', value: 'inactive' },
                                ]}
                              />
                            </div>

                            <div className="import-field">
                              <Text type="secondary">分类</Text>
                              <Select
                                size="small"
                                allowClear
                                style={{ width: '100%' }}
                                value={draft.categoryId ?? undefined}
                                disabled={isProcessing}
                                placeholder={draft.categoryName || '请选择分类'}
                                onChange={(value) =>
                                  updateDraft(draft.rowKey, (current) => ({
                                    ...current,
                                    categoryId: value ?? null,
                                    categoryName: categories.find((item) => item.id === value)?.name ?? current.categoryName,
                                  }))
                                }
                                options={categories.map((item) => ({ label: item.name, value: item.id }))}
                              />
                              {renderFieldIssues(draft.rowKey, 'categoryId')}
                            </div>

                            <div className="import-field">
                              <Text type="secondary">供应商</Text>
                              <Select
                                size="small"
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                style={{ width: '100%' }}
                                value={draft.supplierId ?? undefined}
                                disabled={isProcessing}
                                placeholder={draft.supplierName || '请选择供应商'}
                                onChange={(value) =>
                                  updateDraft(draft.rowKey, (current) => ({
                                    ...current,
                                    supplierId: value ?? null,
                                    supplierName: suppliers.find((item) => item.id === value)?.name ?? current.supplierName,
                                  }))
                                }
                                options={suppliers.map((item) => ({ label: item.name, value: item.id }))}
                              />
                              {renderFieldIssues(draft.rowKey, 'supplierId')}
                            </div>

                            <div className="import-field">
                              <Text type="secondary">标签</Text>
                              <Input
                                size="small"
                                value={draft.tags.join(', ')}
                                disabled={isProcessing}
                                onChange={(e) => updateDraft(draft.rowKey, (current) => ({ ...current, tags: splitTags(e.target.value) }))}
                              />
                            </div>

                            <div className="import-field import-field--wide">
                              <Text type="secondary">描述</Text>
                              <Input.TextArea
                                rows={1}
                                autoSize={{ minRows: 1, maxRows: 2 }}
                                value={draft.description ?? ''}
                                disabled={isProcessing}
                                onChange={(e) => updateDraft(draft.rowKey, (current) => ({ ...current, description: e.target.value }))}
                              />
                            </div>
                          </div>
                        </div>

                        <Divider />

                        <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
                          <Title level={5} style={{ margin: 0 }}>
                            规格明细
                          </Title>
                          <Button
                            icon={<PlusOutlined />}
                            disabled={isProcessing}
                            onClick={() =>
                              updateDraft(draft.rowKey, (current) => ({
                                ...current,
                                specifications: [
                                  ...current.specifications,
                                  createEmptySpecification(current.rowKey, current.specifications.length),
                                ],
                              }))
                            }
                          >
                            新增规格
                          </Button>
                        </Space>

                        <div className="import-spec-table" style={{ marginTop: 12 }}>
                          <div className="import-spec-table__head">
                            <div>颜色</div>
                            <div>尺码</div>
                            <div>售价</div>
                            <div>成本价</div>
                            <div>库存</div>
                            <div>状态</div>
                            <div>规格编码</div>
                            <div>操作</div>
                          </div>
                          {draft.specifications.map((spec) => (
                            <div key={spec.rowKey} className="import-spec-table__row">
                              <div className="import-spec-table__cell">
                                <Input
                                  size="small"
                                  value={spec.color}
                                  disabled={isProcessing}
                                  onChange={(e) =>
                                    updateDraft(draft.rowKey, (current) => ({
                                      ...current,
                                      specifications: current.specifications.map((item) =>
                                        item.rowKey === spec.rowKey ? { ...item, color: e.target.value } : item
                                      ),
                                    }))
                                  }
                                />
                                {renderFieldIssues(draft.rowKey, 'color', spec.rowKey)}
                              </div>

                              <div className="import-spec-table__cell">
                                <Select
                                  size="small"
                                  className="product-form__select"
                                  value={spec.size || 'F'}
                                  disabled={isProcessing}
                                  options={SIZE_OPTIONS}
                                  onChange={(value) =>
                                    updateDraft(draft.rowKey, (current) => ({
                                      ...current,
                                      specifications: current.specifications.map((item) =>
                                        item.rowKey === spec.rowKey ? { ...item, size: value } : item
                                      ),
                                    }))
                                  }
                                />
                                {renderFieldIssues(draft.rowKey, 'size', spec.rowKey)}
                              </div>

                              <div className="import-spec-table__cell">
                                <InputNumber
                                  size="small"
                                  min={0}
                                  style={{ width: '100%' }}
                                  value={spec.salePrice}
                                  disabled={isProcessing}
                                  onChange={(value) =>
                                    updateDraft(draft.rowKey, (current) => ({
                                      ...current,
                                      specifications: current.specifications.map((item) =>
                                        item.rowKey === spec.rowKey ? { ...item, salePrice: Number(value ?? 0) } : item
                                      ),
                                    }))
                                  }
                                />
                                {renderFieldIssues(draft.rowKey, 'salePrice', spec.rowKey)}
                              </div>

                              <div className="import-spec-table__cell">
                                <InputNumber
                                  size="small"
                                  min={0}
                                  style={{ width: '100%' }}
                                  value={spec.costPrice}
                                  disabled={isProcessing}
                                  onChange={(value) =>
                                    updateDraft(draft.rowKey, (current) => ({
                                      ...current,
                                      specifications: current.specifications.map((item) =>
                                        item.rowKey === spec.rowKey ? { ...item, costPrice: Number(value ?? 0) } : item
                                      ),
                                    }))
                                  }
                                />
                                {renderFieldIssues(draft.rowKey, 'costPrice', spec.rowKey)}
                              </div>

                              <div className="import-spec-table__cell">
                                <InputNumber
                                  size="small"
                                  min={0}
                                  precision={0}
                                  style={{ width: '100%' }}
                                  value={spec.stock}
                                  disabled={isProcessing}
                                  onChange={(value) =>
                                    updateDraft(draft.rowKey, (current) => ({
                                      ...current,
                                      specifications: current.specifications.map((item) =>
                                        item.rowKey === spec.rowKey ? { ...item, stock: Number(value ?? 0) } : item
                                      ),
                                    }))
                                  }
                                />
                                {renderFieldIssues(draft.rowKey, 'stock', spec.rowKey)}
                              </div>

                              <div className="import-spec-table__cell">
                                <Select
                                  size="small"
                                  className="product-form__select"
                                  value={spec.status}
                                  disabled={isProcessing}
                                  options={[
                                    { label: '启用', value: 'active' },
                                    { label: '停用', value: 'inactive' },
                                  ]}
                                  onChange={(value) =>
                                    updateDraft(draft.rowKey, (current) => ({
                                      ...current,
                                      specifications: current.specifications.map((item) =>
                                        item.rowKey === spec.rowKey ? { ...item, status: value } : item
                                      ),
                                    }))
                                  }
                                />
                              </div>

                              <div className="import-spec-table__cell import-spec-table__cell--code">
                                <Tag>{buildSkuCode(draft.productCode, spec.size, spec.color) || '待生成'}</Tag>
                              </div>

                              <div className="import-spec-table__cell import-spec-table__cell--action">
                                <Button
                                  type="text"
                                  danger
                                  disabled={draft.specifications.length === 1}
                                  onClick={() =>
                                    updateDraft(draft.rowKey, (current) => ({
                                      ...current,
                                      specifications: current.specifications.filter((item) => item.rowKey !== spec.rowKey),
                                    }))
                                  }
                                >
                                  删除
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ),
                  };
                })}
              />
            </Card>
          ) : null}
        </Space>
      ) : null}

      {step === 2 && importResult ? (
        <Card className="page-card">
          <Result
            status={importResult.failureCount > 0 ? 'warning' : 'success'}
            title={`成功 ${importResult.successCount} 条，失败 ${importResult.failureCount} 条`}
            subTitle="失败项不会影响已经成功导入的商品。"
            extra={[
              <Button key="back" onClick={() => navigate('/products')}>
                返回商品列表
              </Button>,
              <Button
                key="again"
                type="primary"
                onClick={() => {
                  setStep(0);
                  setDrafts([]);
                  setServerIssues([]);
                  setImportResult(null);
                }}
              >
                再导一次
              </Button>,
            ]}
          />
          <Divider />
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {importResult.results.map((item) => (
              <Alert
                key={`${item.rowKey}-${item.productCode}`}
                type={item.status === 'success' ? 'success' : 'error'}
                showIcon
                message={`${item.productCode || '未填写款号'} · ${item.status === 'success' ? '导入成功' : '导入失败'}`}
                description={item.message}
              />
            ))}
          </Space>
        </Card>
      ) : null}
    </Space>
  );
};

export default ProductImportPage;
