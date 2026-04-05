import { useEffect, useRef, useState } from 'react';
import { Button, Empty, Modal, Space } from 'antd';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import type { ProductLabelItem } from '../types';

const LABEL_WIDTH = 240;
const LABEL_HEIGHT = 360;

interface ProductLabelPrintModalProps {
  open: boolean;
  loading?: boolean;
  labels: ProductLabelItem[];
  onCancel: () => void;
}

export default function ProductLabelPrintModal({
  open,
  loading = false,
  labels,
  onCancel,
}: ProductLabelPrintModalProps) {
  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});
  const [downloading, setDownloading] = useState(false);
  const labelRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!open || labels.length === 0) {
      return;
    }

    let active = true;

    void Promise.all(
      labels.map(async (label) => {
        const dataUrl = await QRCode.toDataURL(label.barcode, {
          width: 400,
          margin: 1,
        });
        return [label.barcode, dataUrl] as const;
      })
    ).then((entries) => {
      if (!active) {
        return;
      }

      setQrCodeMap(
        entries.reduce<Record<string, string>>((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {})
      );
    });

    return () => {
      active = false;
    };
  }, [labels, open]);

  const handleDownload = async () => {
    if (labels.length === 0) {
      return;
    }

    setDownloading(true);
    try {
      for (const label of labels) {
        const target = labelRefs.current[label.skuId];
        if (!target) {
          continue;
        }

        const dataUrl = await toPng(target, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          width: LABEL_WIDTH,
          height: LABEL_HEIGHT,
        });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${label.productCode}-${label.color}-${label.size}-${label.barcode}.png`;
        link.click();
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      width={1080}
      title='SKU 标签预览'
      footer={
        <Space>
          <Button onClick={onCancel}>关闭</Button>
          <Button type='primary' onClick={() => void handleDownload()} disabled={labels.length === 0 || loading} loading={downloading}>
            下载标签图片
          </Button>
        </Space>
      }
    >
      <div>
        {labels.length === 0 && !loading ? (
          <Empty description='当前商品暂无可打印标签' />
        ) : (
          <div className='label-grid' style={{ display: 'flex', flexDirection: 'row', gap: 20, overflowX: 'auto', paddingBottom: 8 }}>
            {labels.map((label) => (
              <div
                key={label.skuId}
                ref={(node) => {
                  labelRefs.current[label.skuId] = node;
                }}
                className='label-card'
                style={{
                  background: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: 16,
                  padding: 20,
                  width: LABEL_WIDTH,
                  height: LABEL_HEIGHT,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* 品牌区域 */}
                <div
                  className='label-brand'
                  style={{
                    textAlign: 'center',
                    paddingBottom: 12,
                    borderBottom: '0.5px solid #ccc',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 400,
                      color: '#000',
                      letterSpacing: 1,
                      fontFamily: "'Comic Sans MS', cursive",
                    }}
                  >
                    ChuChuNight
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: '#000',
                      marginTop: 4,
                      letterSpacing: 3,
                      fontWeight: 400,
                    }}
                  >
                    棉眠小铺 면면샵
                  </div>
                </div>

                {/* 商品信息区域 */}
                <div
                  className='label-info'
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {/* 商品名 */}
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 400,
                      color: '#000',
                      lineHeight: 1.4,
                      textAlign: 'center',
                    }}
                  >
                    {label.productName}
                  </div>

                  {/* 颜色尺码 */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 14,
                      color: '#000',
                    }}
                  >
                    <span style={{ fontWeight: 400 }}>{label.color}</span>
                    <span style={{ color: '#666' }}>|</span>
                    <span style={{ fontWeight: 400 }}>{label.size}</span>
                  </div>

                  {/* 价格 */}
                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: 8,
                      padding: '10px 0',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: '#000',
                        marginRight: 4,
                      }}
                    >
                      ¥
                    </span>
                    <span
                      style={{
                        fontSize: 28,
                        fontWeight: 400,
                        color: '#000',
                        letterSpacing: -0.5,
                      }}
                    >
                      {label.salePrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 二维码区域 */}
                <div
                  className='label-qr-area'
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: 12,
                    borderTop: '0.5px solid #ccc',
                  }}
                >
                  {qrCodeMap[label.barcode] ? (
                    <img
                      className='label-qr'
                      src={qrCodeMap[label.barcode]}
                      alt={label.barcode}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 10,
                        border: '1px solid #ccc',
                        background: '#fff',
                        padding: 4,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 100,
                        height: 100,
                        background: '#eee',
                        borderRadius: 10,
                        border: '1px solid #ccc',
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
