import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Empty, Modal, Space, message } from 'antd';
import type { CSSProperties } from 'react';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import type { ProductLabelItem } from '../types';

const BORDER_COLOR = '#ccc';
const layout = {
  card: {
    width: 240,
    height: 360,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  previewGrid: {
    gap: 20,
    paddingBottom: 8,
  },
  brand: {
    title: 'ChuChuNight',
    subtitle: '棉眠小铺 면면샵',
    titleFontSize: 20,
    subtitleFontSize: 16,
    titleLetterSpacing: 1,
    subtitleLetterSpacing: 2,
    bottomSpacing: 10,
    subtitleMarginTop: 4,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  info: {
    gap: 8,
    nameFontSize: 22,
    nameLineHeight: 1.3,
    nameMinHeight: 52,
    colorSizeFontSize: 17,
    colorSizeGap: 10,
    priceMarginTop: 2,
    pricePaddingY: 2,
    priceSymbolFontSize: 15,
    priceSymbolMarginRight: 4,
    priceValueFontSize: 36,
    priceLetterSpacing: -0.5,
  },
  qr: {
    dividerPaddingTop: 6,
    canvasSize: 98,
    innerSize: 90,
    innerPadding: 4,
    borderRadius: 10,
    placeholderColor: '#eee',
  },
} as const;

function createLabelStyles(): Record<string, CSSProperties> {
  return {
    card: {
      background: layout.card.backgroundColor,
      border: `1px solid ${BORDER_COLOR}`,
      borderRadius: layout.card.borderRadius,
      padding: layout.card.padding,
      width: layout.card.width,
      height: layout.card.height,
      boxSizing: 'border-box',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    },
    brand: {
      textAlign: 'center',
      paddingBottom: layout.brand.bottomSpacing,
      borderBottom: `0.5px solid ${BORDER_COLOR}`,
      marginBottom: layout.brand.bottomSpacing,
    },
    brandTitle: {
      fontSize: layout.brand.titleFontSize,
      fontWeight: 400,
      color: '#000',
      letterSpacing: layout.brand.titleLetterSpacing,
      fontFamily: layout.brand.fontFamily,
    },
    brandSubtitle: {
      fontSize: layout.brand.subtitleFontSize,
      color: '#000',
      marginTop: layout.brand.subtitleMarginTop,
      letterSpacing: layout.brand.subtitleLetterSpacing,
      fontWeight: 400,
    },
    info: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: layout.info.gap,
    },
    productName: {
      fontSize: layout.info.nameFontSize,
      fontWeight: 500,
      color: '#000',
      lineHeight: layout.info.nameLineHeight,
      textAlign: 'center',
      minHeight: layout.info.nameMinHeight,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      wordBreak: 'break-word',
    },
    colorSize: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: layout.info.colorSizeGap,
      fontSize: layout.info.colorSizeFontSize,
      color: '#000',
      fontWeight: 500,
    },
    colorSizeDivider: {
      color: '#666',
    },
    priceWrap: {
      textAlign: 'center',
      marginTop: layout.info.priceMarginTop,
      padding: `${layout.info.pricePaddingY}px 0`,
    },
    priceSymbol: {
      fontSize: layout.info.priceSymbolFontSize,
      color: '#000',
      marginRight: layout.info.priceSymbolMarginRight,
    },
    priceValue: {
      fontSize: layout.info.priceValueFontSize,
      fontWeight: 400,
      color: '#000',
      letterSpacing: layout.info.priceLetterSpacing,
      lineHeight: 1,
    },
    qrArea: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      paddingTop: layout.qr.dividerPaddingTop,
      borderTop: `0.5px solid ${BORDER_COLOR}`,
    },
    qrCanvas: {
      width: layout.qr.canvasSize,
      height: layout.qr.canvasSize,
      borderRadius: layout.qr.borderRadius,
      border: `1px solid ${BORDER_COLOR}`,
      background: '#fff',
      boxSizing: 'border-box',
      display: 'block',
    },
    qrPlaceholder: {
      width: layout.qr.canvasSize,
      height: layout.qr.canvasSize,
      background: layout.qr.placeholderColor,
      borderRadius: layout.qr.borderRadius,
      border: `1px solid ${BORDER_COLOR}`,
      boxSizing: 'border-box',
    },
  };
}

const styles = createLabelStyles();

async function exportLabelNode(target: HTMLDivElement) {
  const exportRoot = target.cloneNode(true) as HTMLDivElement;
  const sourceCanvases = Array.from(target.querySelectorAll('canvas'));
  const clonedCanvases = Array.from(exportRoot.querySelectorAll('canvas'));

  clonedCanvases.forEach((canvas, index) => {
    const sourceCanvas = sourceCanvases[index];
    if (!sourceCanvas) {
      canvas.remove();
      return;
    }

    const image = document.createElement('img');
    image.src = sourceCanvas.toDataURL('image/png');
    image.alt = 'qr-code';
    image.width = sourceCanvas.width;
    image.height = sourceCanvas.height;
    image.style.width = canvas.style.width || `${sourceCanvas.width}px`;
    image.style.height = canvas.style.height || `${sourceCanvas.height}px`;
    image.style.borderRadius = canvas.style.borderRadius;
    image.style.border = canvas.style.border;
    image.style.background = canvas.style.background;
    image.style.boxSizing = canvas.style.boxSizing;
    image.style.display = 'block';
    canvas.replaceWith(image);
  });

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.zIndex = '-1';
  wrapper.style.pointerEvents = 'none';
  wrapper.appendChild(exportRoot);
  document.body.appendChild(wrapper);

  try {
    return await toPng(exportRoot, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width: layout.card.width,
      height: layout.card.height,
    });
  } finally {
    wrapper.remove();
  }
}

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
  const [downloading, setDownloading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [readyMap, setReadyMap] = useState<Record<string, boolean>>({});
  const labelRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const qrCanvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  useEffect(() => {
    if (!open || labels.length === 0) {
      setReadyMap({});
      return;
    }

    let cancelled = false;
    setReadyMap({});

    void Promise.all(
      labels.map(async (label) => {
        const canvas = qrCanvasRefs.current[label.barcode];
        if (!canvas) {
          return [label.barcode, false] as const;
        }

        await QRCode.toCanvas(canvas, label.barcode, {
          width: layout.qr.innerSize,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });

        return [label.barcode, true] as const;
      })
    )
      .then((entries) => {
        if (cancelled) {
          return;
        }

        setReadyMap(
          entries.reduce<Record<string, boolean>>((acc, [barcode, ready]) => {
            acc[barcode] = ready;
            return acc;
          }, {})
        );
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setReadyMap({});
        void messageApi.error('二维码生成失败，请稍后重试');
      });

    return () => {
      cancelled = true;
    };
  }, [labels, messageApi, open]);

  const allQrCodesReady = useMemo(
    () => labels.length > 0 && labels.every((label) => readyMap[label.barcode]),
    [labels, readyMap]
  );

  const handleDownload = async () => {
    if (labels.length === 0) {
      return;
    }

    if (!allQrCodesReady) {
      void messageApi.warning('二维码仍在准备中，请稍后再试');
      return;
    }

    setDownloading(true);
    try {
      for (const label of labels) {
        const target = labelRefs.current[label.skuId];
        if (!target) {
          continue;
        }

        const dataUrl = await exportLabelNode(target);

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${label.productCode}-${label.color}-${label.size}-${label.barcode}.png`;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error(error);
      void messageApi.error('导出标签图片失败，请重试');
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
          <Button type='primary' onClick={() => void handleDownload()} disabled={labels.length === 0 || loading || !allQrCodesReady} loading={downloading}>
            下载标签图片
          </Button>
        </Space>
      }
    >
      {contextHolder}
      <div>
        {labels.length === 0 && !loading ? (
          <Empty description='当前商品暂无可打印标签' />
        ) : (
          <div
            className='label-grid'
            style={{ display: 'flex', flexDirection: 'row', gap: layout.previewGrid.gap, overflowX: 'auto', paddingBottom: layout.previewGrid.paddingBottom }}
          >
            {labels.map((label) => (
              <div
                key={label.skuId}
                className='label-card'
                ref={(node) => {
                  labelRefs.current[label.skuId] = node;
                }}
                style={styles.card}
              >
                <div className='label-brand' style={styles.brand}>
                  <div style={styles.brandTitle}>{layout.brand.title}</div>
                  <div style={styles.brandSubtitle}>{layout.brand.subtitle}</div>
                </div>

                <div className='label-info' style={styles.info}>
                  <div style={styles.productName}>{label.productName}</div>

                  <div style={styles.colorSize}>
                    <span style={{ fontWeight: 400 }}>{label.color}</span>
                    <span style={styles.colorSizeDivider}>|</span>
                    <span style={{ fontWeight: 400 }}>{label.size}</span>
                  </div>

                  <div style={styles.priceWrap}>
                    <span style={styles.priceSymbol}>¥</span>
                    <span style={styles.priceValue}>{label.salePrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className='label-qr-area' style={styles.qrArea}>
                  <canvas
                    ref={(node) => {
                      qrCanvasRefs.current[label.barcode] = node;
                    }}
                    width={layout.qr.innerSize}
                    height={layout.qr.innerSize}
                    style={readyMap[label.barcode] ? styles.qrCanvas : { ...styles.qrCanvas, visibility: 'hidden' }}
                  />
                  {!readyMap[label.barcode] ? <div style={{ ...styles.qrPlaceholder, position: 'absolute', pointerEvents: 'none' }} /> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
