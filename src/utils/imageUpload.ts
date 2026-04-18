import COS from 'cos-js-sdk-v5';
import type { UploadPolicy, UploadPolicyRequest } from '../types';
import { assetsApi } from '../api/assets';

const ORIGINAL_FILE_MAX_BYTES = 20 * 1024 * 1024;

const SCENE_CONFIG = {
  main: {
    maxDimension: 1600,
    targetMaxBytes: 400 * 1024,
  },
  detail: {
    maxDimension: 2000,
    targetMaxBytes: 700 * 1024,
  },
  spec: {
    maxDimension: 800,
    targetMaxBytes: 200 * 1024,
  },
} as const;

type UploadScene = keyof typeof SCENE_CONFIG;

function replaceExtension(fileName: string, nextExtension: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '');
  return `${baseName}${nextExtension}`;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('图片编码失败'));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('图片读取失败'));
    };
    image.src = objectUrl;
  });
}

function drawToCanvas(image: HTMLImageElement, width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('浏览器不支持图片压缩');
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

function normalizeDimensions(width: number, height: number, maxDimension: number) {
  const longestEdge = Math.max(width, height);
  if (longestEdge <= maxDimension) {
    return { width, height };
  }

  const ratio = maxDimension / longestEdge;
  return {
    width: Math.max(Math.round(width * ratio), 1),
    height: Math.max(Math.round(height * ratio), 1),
  };
}

function buildCompressedFile(blob: Blob, originalName: string, preferredMimeType: string) {
  const mimeType = blob.type || preferredMimeType;
  const extension = mimeType === 'image/webp' ? '.webp' : mimeType === 'image/png' ? '.png' : '.jpg';
  return new File([blob], replaceExtension(originalName, extension), { type: mimeType });
}

export async function compressImageBeforeUpload(file: File, scene: UploadScene): Promise<File> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('仅支持 JPG、PNG、WEBP 图片');
  }

  if (file.size > ORIGINAL_FILE_MAX_BYTES) {
    throw new Error('原始图片过大，请选择 20MB 以内的图片');
  }

  const image = await loadImage(file);
  const config = SCENE_CONFIG[scene];
  let { width, height } = normalizeDimensions(image.width, image.height, config.maxDimension);
  let bestBlob: Blob | null = null;
  const qualitySteps = [0.82, 0.74, 0.66, 0.58];
  const fallbackMimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

  for (let resizeAttempt = 0; resizeAttempt < 4; resizeAttempt += 1) {
    const canvas = drawToCanvas(image, width, height);

    for (const quality of qualitySteps) {
      try {
        const blob = await canvasToBlob(canvas, 'image/webp', quality);
        if (!bestBlob || blob.size < bestBlob.size) {
          bestBlob = blob;
        }
        if (blob.size <= config.targetMaxBytes) {
          return buildCompressedFile(blob, file.name, 'image/webp');
        }
      } catch {
        // Ignore and fallback below.
      }
    }

    try {
      const fallbackBlob = await canvasToBlob(canvas, fallbackMimeType, fallbackMimeType === 'image/png' ? undefined : 0.8);
      if (!bestBlob || fallbackBlob.size < bestBlob.size) {
        bestBlob = fallbackBlob;
      }
      if (fallbackBlob.size <= config.targetMaxBytes) {
        return buildCompressedFile(fallbackBlob, file.name, fallbackMimeType);
      }
    } catch {
      // Ignore and continue shrinking.
    }

    width = Math.max(Math.round(width * 0.85), 1);
    height = Math.max(Math.round(height * 0.85), 1);
  }

  if (!bestBlob) {
    throw new Error('图片压缩失败');
  }

  if (bestBlob.size > config.targetMaxBytes) {
    throw new Error('压缩后图片仍然过大，请更换图片');
  }

  return buildCompressedFile(bestBlob, file.name, bestBlob.type || 'image/webp');
}

export async function getUploadPolicy(payload: UploadPolicyRequest): Promise<UploadPolicy> {
  const response = await assetsApi.getUploadPolicy(payload);
  if (!response.success || !response.data) {
    throw new Error(response.message || '获取上传凭证失败');
  }
  return response.data;
}

export async function uploadFileToCos(
  file: File,
  policy: UploadPolicy,
  onProgress?: (percent: number) => void
): Promise<string> {
  const client = new COS({
    getAuthorization: (_options, callback) => {
      callback({
        TmpSecretId: policy.credentials.tmpSecretId,
        TmpSecretKey: policy.credentials.tmpSecretKey,
        SecurityToken: policy.credentials.sessionToken,
        StartTime: policy.startTime,
        ExpiredTime: policy.expiredTime,
      });
    },
  });

  await client.uploadFile({
    Bucket: policy.bucket,
    Region: policy.region,
    Key: policy.key,
    Body: file,
    SliceSize: 1024 * 1024,
    Headers: {
      'Content-Type': file.type,
      'Cache-Control': 'public,max-age=31536000,immutable',
    },
    onProgress(progressData) {
      onProgress?.(Math.round((progressData.percent || 0) * 100));
    },
  });

  return policy.url;
}
