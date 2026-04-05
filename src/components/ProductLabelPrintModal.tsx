import { useEffect, useState } from 'react';
import { Button, Empty, Modal, Space, message } from 'antd';
import type { CSSProperties } from 'react';
import QRCode from 'qrcode';
import type { ProductLabelItem } from '../types';

const EXPORT_SCALE = 3;
const BORDER_COLOR = '#ccc';
const layout = {
  card: {
    width: 240,
    height: 360,
    padding: 20,
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
    titleFontSize: 17,
    subtitleFontSize: 14,
    titleLetterSpacing: 1,
    subtitleLetterSpacing: 3,
    bottomSpacing: 12,
    subtitleMarginTop: 4,
  },
  info: {
    gap: 10,
    nameFontSize: 17,
    nameLineHeight: 1.4,
    colorSizeFontSize: 14,
    colorSizeGap: 8,
    priceMarginTop: 8,
    pricePaddingY: 10,
    priceSymbolFontSize: 12,
    priceSymbolMarginRight: 4,
    priceValueFontSize: 28,
    priceLetterSpacing: -0.5,
  },
  qr: {
    dividerPaddingTop: 12,
    imageSize: 100,
    imagePadding: 4,
    borderRadius: 10,
    placeholderColor: '#eee',
  },
} as const;

const qrBoxSize = layout.qr.imageSize + layout.qr.imagePadding * 2;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片加载失败'));
    image.src = src;
  });
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function drawCenteredText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const chars = Array.from(text);
  const lines: string[] = [];
  let current = '';

  chars.forEach((char) => {
    const next = current + char;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      return;
    }

    if (current) {
      lines.push(current);
    }
    current = char;
  });

  if (current) {
    lines.push(current);
  }

  const visibleLines = lines.slice(0, maxLines);
  if (lines.length > maxLines && visibleLines.length > 0) {
    const lastIndex = visibleLines.length - 1;
    let truncated = visibleLines[lastIndex];
    while (truncated.length > 0 && ctx.measureText(`${truncated}...`).width > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    visibleLines[lastIndex] = `${truncated}...`;
  }

  visibleLines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
}

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
      fontFamily: '"Comic Sans MS", "Trebuchet MS", cursive',
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
      fontWeight: 400,
      color: '#000',
      lineHeight: layout.info.nameLineHeight,
      textAlign: 'center',
    },
    colorSize: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: layout.info.colorSizeGap,
      fontSize: layout.info.colorSizeFontSize,
      color: '#000',
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
    },
    qrArea: {
      display: 'flex',
      justifyContent: 'center',
      paddingTop: layout.qr.dividerPaddingTop,
      borderTop: `0.5px solid ${BORDER_COLOR}`,
    },
    qrImage: {
      width: layout.qr.imageSize,
      height: layout.qr.imageSize,
      objectFit: 'cover',
      borderRadius: layout.qr.borderRadius,
      border: `1px solid ${BORDER_COLOR}`,
      background: '#fff',
      padding: layout.qr.imagePadding,
      boxSizing: 'content-box',
    },
    qrPlaceholder: {
      width: layout.qr.imageSize,
      height: layout.qr.imageSize,
      background: layout.qr.placeholderColor,
      borderRadius: layout.qr.borderRadius,
      border: `1px solid ${BORDER_COLOR}`,
      padding: layout.qr.imagePadding,
      boxSizing: 'content-box',
    },
  };
}

const styles = createLabelStyles();

function measureLabelLayout() {
  const cardInnerWidth = layout.card.width - layout.card.padding * 2;
  const qrBoxX = (layout.card.width - qrBoxSize) / 2;
  const qrBoxY = layout.card.height - layout.card.padding - qrBoxSize;
  const qrImageX = qrBoxX + layout.qr.imagePadding;
  const qrImageY = qrBoxY + layout.qr.imagePadding;
  const qrDividerY = qrBoxY - layout.qr.dividerPaddingTop - 0.5;
  const brandDividerY = layout.card.padding + layout.brand.titleFontSize + layout.brand.subtitleMarginTop + layout.brand.subtitleFontSize + layout.brand.bottomSpacing + 0.5;
  const productNameY = brandDividerY + layout.brand.bottomSpacing + 11.5;
  const colorSizeY = productNameY + 58;
  const priceValueY = colorSizeY + 22;
  const priceSymbolY = priceValueY + 10;

  return {
    cardInnerWidth,
    qrBoxX,
    qrBoxY,
    qrImageX,
    qrImageY,
    qrDividerY,
    brandDividerY,
    productNameY,
    colorSizeY,
    priceValueY,
    priceSymbolY,
  };
}

async function renderLabelToDataUrl(label: ProductLabelItem, qrCodeDataUrl: string) {
  const metrics = measureLabelLayout();
  const canvas = document.createElement('canvas');
  canvas.width = layout.card.width * EXPORT_SCALE;
  canvas.height = layout.card.height * EXPORT_SCALE;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建标签画布');
  }

  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);
  ctx.fillStyle = layout.card.backgroundColor;
  ctx.fillRect(0, 0, layout.card.width, layout.card.height);

  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 1;
  roundRectPath(ctx, 0.5, 0.5, layout.card.width - 1, layout.card.height - 1, layout.card.borderRadius);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#000000';

  ctx.font = `400 ${layout.brand.titleFontSize}px "Comic Sans MS", "Trebuchet MS", cursive`;
  ctx.fillText(layout.brand.title, layout.card.width / 2, layout.card.padding);

  ctx.font = `400 ${layout.brand.subtitleFontSize}px sans-serif`;
  ctx.fillText(
    layout.brand.subtitle,
    layout.card.width / 2,
    layout.card.padding + layout.brand.titleFontSize + layout.brand.subtitleMarginTop
  );

  ctx.beginPath();
  ctx.moveTo(layout.card.padding, metrics.brandDividerY);
  ctx.lineTo(layout.card.width - layout.card.padding, metrics.brandDividerY);
  ctx.stroke();

  ctx.font = `400 ${layout.info.nameFontSize}px sans-serif`;
  drawCenteredText(
    ctx,
    label.productName,
    layout.card.width / 2,
    metrics.productNameY,
    metrics.cardInnerWidth,
    layout.info.nameFontSize * layout.info.nameLineHeight,
    2
  );

  ctx.font = `400 ${layout.info.colorSizeFontSize}px sans-serif`;
  ctx.fillText(`${label.color} | ${label.size}`, layout.card.width / 2, metrics.colorSizeY);

  ctx.font = `400 ${layout.info.priceSymbolFontSize}px sans-serif`;
  ctx.fillText('¥', layout.card.width / 2 - 38, metrics.priceSymbolY);

  ctx.font = `400 ${layout.info.priceValueFontSize}px sans-serif`;
  ctx.fillText(label.salePrice.toFixed(2), layout.card.width / 2 + 8, metrics.priceValueY);

  ctx.beginPath();
  ctx.moveTo(layout.card.padding, metrics.qrDividerY);
  ctx.lineTo(layout.card.width - layout.card.padding, metrics.qrDividerY);
  ctx.stroke();

  const qrImage = await loadImage(qrCodeDataUrl);
  roundRectPath(ctx, metrics.qrBoxX, metrics.qrBoxY, qrBoxSize, qrBoxSize, layout.qr.borderRadius);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = BORDER_COLOR;
  ctx.stroke();
  ctx.drawImage(qrImage, metrics.qrImageX, metrics.qrImageY, layout.qr.imageSize, layout.qr.imageSize);

  return canvas.toDataURL('image/png');
}

function triggerDownload(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});
  const [downloading, setDownloading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const allQrCodesReady = labels.length > 0 && labels.every((label) => Boolean(qrCodeMap[label.barcode]));

  useEffect(() => {
    if (!open || labels.length === 0) {
      setQrCodeMap({});
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
    )
      .then((entries) => {
        if (!active) {
          return;
        }

        setQrCodeMap(
          entries.reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {})
        );
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setQrCodeMap({});
        void messageApi.error('二维码生成失败，请稍后重试');
      });

    return () => {
      active = false;
    };
  }, [labels, messageApi, open]);

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
        const qrCodeDataUrl = qrCodeMap[label.barcode];
        if (!qrCodeDataUrl) {
          continue;
        }

        const dataUrl = await renderLabelToDataUrl(label, qrCodeDataUrl);
        triggerDownload(dataUrl, `${label.productCode}-${label.color}-${label.size}-${label.barcode}.png`);
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
              <div key={label.skuId} className='label-card' style={styles.card}>
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
                  {qrCodeMap[label.barcode] ? (
                    <img className='label-qr' src={qrCodeMap[label.barcode]} alt={label.barcode} style={styles.qrImage} />
                  ) : (
                    <div style={styles.qrPlaceholder} />
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
