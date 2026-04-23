import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Empty, Modal, Space, message } from 'antd';
import type { CSSProperties } from 'react';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import type { ProductLabelItem } from '../types';

const BORDER_COLOR = '#ccc';
const layout = {
  card: {
    width: 472,
    height: 709,
    padding: 35,
    borderRadius: 31,
    backgroundColor: '#fff',
  },
  previewGrid: {
    gap: 20,
    paddingBottom: 8,
  },
  brand: {
    title: 'ChuChuNight',
    subtitle: '棉眠小铺 면면샵',
    titleFontSize: 39,
    subtitleFontSize: 31,
    titleLetterSpacing: 1,
    subtitleLetterSpacing: 2,
    bottomSpacing: 20,
    subtitleMarginTop: 8,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  info: {
    gap: 4,
    nameFontSize: 43,
    nameLineHeight: 1.3,
    nameMinHeight: 51,
    colorSizeFontSize: 33,
    colorSizeGap: 20,
    priceMarginTop: 20,
    pricePaddingY: 4,
    priceSymbolFontSize: 29,
    priceSymbolMarginRight: 8,
    priceValueFontSize: 71,
    priceLetterSpacing: -0.5,
  },
  qr: {
    dividerPaddingTop: 12,
    canvasSize: 192,
    innerSize: 176,
    innerPadding: 8,
    borderRadius: 19,
    placeholderColor: '#eee',
  },
} as const;

const smallLayout = {
  card: {
    width: 591,
    height: 354,
    paddingX: 32,
    paddingY: 28,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  info: {
    gap: 18,
    productCodeFontSize: 56,
    productNameFontSize: 38,
    productNameLineHeight: 1.16,
    metaFontSize: 36,
    metaGap: 18,
    qrCanvasSize: 216,
    qrInnerSize: 198,
  },
} as const;

function createLabelStyles(): Record<string, CSSProperties> {
  return {
    card: {
      background: layout.card.backgroundColor,
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
      paddingTop: 30,
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
    productCode: {
      fontSize: layout.info.colorSizeFontSize,
      fontWeight: 400,
      color: '#000',
      lineHeight: 1.2,
      textAlign: 'center',
      marginTop: -8,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
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
    },
    qrCanvas: {
      width: layout.qr.canvasSize,
      height: layout.qr.canvasSize,
      borderRadius: layout.qr.borderRadius,
      background: '#fff',
      boxSizing: 'border-box',
      display: 'block',
    },
    qrPlaceholder: {
      width: layout.qr.canvasSize,
      height: layout.qr.canvasSize,
      background: layout.qr.placeholderColor,
      borderRadius: layout.qr.borderRadius,
      boxSizing: 'border-box',
    },
    smallCard: {
      background: smallLayout.card.backgroundColor,
      borderRadius: smallLayout.card.borderRadius,
      padding: `${smallLayout.card.paddingY}px ${smallLayout.card.paddingX}px`,
      width: smallLayout.card.width,
      height: smallLayout.card.height,
      boxSizing: 'border-box',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      gap: 22,
      flexShrink: 0,
      fontFamily: layout.brand.fontFamily,
      color: '#000',
    },
    smallInfo: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: smallLayout.info.gap,
    },
    smallProductCode: {
      fontSize: smallLayout.info.productCodeFontSize,
      fontWeight: 500,
      lineHeight: 1.1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    smallProductName: {
      fontSize: smallLayout.info.productNameFontSize,
      fontWeight: 500,
      lineHeight: smallLayout.info.productNameLineHeight,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      wordBreak: 'break-word',
    },
    smallMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: smallLayout.info.metaGap,
      fontSize: smallLayout.info.metaFontSize,
      fontWeight: 500,
      lineHeight: 1.1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
    smallMetaText: {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    smallQrCanvas: {
      width: smallLayout.info.qrCanvasSize,
      height: smallLayout.info.qrCanvasSize,
      background: '#fff',
      boxSizing: 'border-box',
      display: 'block',
      flexShrink: 0,
    },
    smallQrPlaceholder: {
      width: smallLayout.info.qrCanvasSize,
      height: smallLayout.info.qrCanvasSize,
      background: layout.qr.placeholderColor,
      boxSizing: 'border-box',
      flexShrink: 0,
    },
  };
}

const styles = createLabelStyles();

async function exportLabelNode(target: HTMLDivElement, size: { width: number; height: number }) {
  const exportRoot = target.cloneNode(true) as HTMLDivElement;
  exportRoot.style.transform = 'none';
  exportRoot.style.transformOrigin = 'unset';
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
      width: size.width,
      height: size.height,
    });
  } finally {
    wrapper.remove();
  }
}

function dataUrlToUint8Array(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] ?? '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
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
  const smallLabelRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const qrCanvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const smallQrCanvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

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
        const smallCanvas = smallQrCanvasRefs.current[label.barcode];
        if (!canvas || !smallCanvas) {
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

        await QRCode.toCanvas(smallCanvas, label.barcode, {
          width: smallLayout.info.qrInnerSize,
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

  const handleDownload = async (labelType: 'large' | 'small') => {
    if (labels.length === 0) {
      return;
    }

    if (!allQrCodesReady) {
      void messageApi.warning('二维码仍在准备中，请稍后再试');
      return;
    }

    setDownloading(true);
    try {
      const zip = new JSZip();

      for (const label of labels) {
        const target = labelType === 'large' ? labelRefs.current[label.skuId] : smallLabelRefs.current[label.skuId];
        if (!target) {
          continue;
        }

        const size = labelType === 'large'
          ? { width: layout.card.width, height: layout.card.height }
          : { width: smallLayout.card.width, height: smallLayout.card.height };
        const dataUrl = await exportLabelNode(target, size);
        const suffix = labelType === 'large' ? 'label' : 'small-label';
        zip.file(
          `${label.productCode}-${label.color}-${label.size}-${label.barcode}-${suffix}.png`,
          dataUrlToUint8Array(dataUrl)
        );
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `${labelType === 'large' ? 'product-labels' : 'product-small-labels'}-${Date.now()}.zip`;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error(error);
      void messageApi.error(labelType === 'large' ? '导出标签 ZIP 失败，请重试' : '导出小标签 ZIP 失败，请重试');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSingle = async (label: ProductLabelItem, labelType: 'large' | 'small') => {
    const target = labelType === 'large' ? labelRefs.current[label.skuId] : smallLabelRefs.current[label.skuId];
    if (!target) {
      void messageApi.warning('当前标签尚未准备好，请稍后再试');
      return;
    }

    if (!readyMap[label.barcode]) {
      void messageApi.warning('二维码仍在准备中，请稍后再试');
      return;
    }

    setDownloading(true);
    try {
      const size = labelType === 'large'
        ? { width: layout.card.width, height: layout.card.height }
        : { width: smallLayout.card.width, height: smallLayout.card.height };
      const dataUrl = await exportLabelNode(target, size);

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${label.productCode}-${label.color}-${label.size}-${label.barcode}-${labelType === 'large' ? 'label' : 'small-label'}.png`;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      void messageApi.error(labelType === 'large' ? '导出标签图片失败，请重试' : '导出小标签图片失败，请重试');
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
          <Button onClick={() => void handleDownload('small')} disabled={labels.length === 0 || loading || !allQrCodesReady} loading={downloading}>
            下载小标签 ZIP
          </Button>
          <Button type='primary' onClick={() => void handleDownload('large')} disabled={labels.length === 0 || loading || !allQrCodesReady} loading={downloading}>
            下载标签 ZIP
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
              <div key={label.skuId} style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: layout.card.width / 2,
                      height: layout.card.height / 2,
                      overflow: 'hidden',
                      borderRadius: layout.card.borderRadius,
                      background: layout.card.backgroundColor,
                    }}
                  >
                    <div
                      className='label-card'
                      ref={(node) => {
                        labelRefs.current[label.skuId] = node;
                      }}
                      style={{ ...styles.card, transform: 'scale(0.5)', transformOrigin: 'top left' }}
                    >
                      <div className='label-brand' style={styles.brand}>
                        <div style={styles.brandTitle}>{layout.brand.title}</div>
                        <div style={styles.brandSubtitle}>{layout.brand.subtitle}</div>
                      </div>

                      <div className='label-info' style={styles.info}>
                        <div style={styles.productCode}>{label.productCode}</div>
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
                  </div>
                  <div
                    style={{
                      width: smallLayout.card.width / 2,
                      height: smallLayout.card.height / 2,
                      overflow: 'hidden',
                      borderRadius: smallLayout.card.borderRadius,
                      background: smallLayout.card.backgroundColor,
                    }}
                  >
                    <div
                      className='small-label-card'
                      ref={(node) => {
                        smallLabelRefs.current[label.skuId] = node;
                      }}
                      style={{ ...styles.smallCard, transform: 'scale(0.5)', transformOrigin: 'top left' }}
                    >
                      <div style={styles.smallInfo}>
                        <div style={styles.smallProductCode}>{label.productCode}</div>
                        <div style={styles.smallProductName}>{label.productName}</div>
                        <div style={styles.smallMeta}>
                          <span style={styles.smallMetaText}>{label.color}</span>
                          <span style={styles.colorSizeDivider}>|</span>
                          <span style={styles.smallMetaText}>{label.size}</span>
                        </div>
                      </div>
                      <canvas
                        ref={(node) => {
                          smallQrCanvasRefs.current[label.barcode] = node;
                        }}
                        width={smallLayout.info.qrInnerSize}
                        height={smallLayout.info.qrInnerSize}
                        style={readyMap[label.barcode] ? styles.smallQrCanvas : { ...styles.smallQrCanvas, visibility: 'hidden' }}
                      />
                      {!readyMap[label.barcode] ? <div style={styles.smallQrPlaceholder} /> : null}
                    </div>
                  </div>
                </div>
                <Space.Compact block>
                  <Button
                    onClick={() => void handleDownloadSingle(label, 'large')}
                    disabled={loading || downloading || !readyMap[label.barcode]}
                  >
                    下载当前标签
                  </Button>
                  <Button
                    onClick={() => void handleDownloadSingle(label, 'small')}
                    disabled={loading || downloading || !readyMap[label.barcode]}
                  >
                    下载小标签
                  </Button>
                </Space.Compact>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
