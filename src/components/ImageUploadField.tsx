import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Flex, Image, Space, Typography, Upload, message } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import type { UploadRequestOption as RcCustomRequestOptions } from '@rc-component/upload/lib/interface';
import { compressImageBeforeUpload, getUploadPolicy, uploadFileToCos } from '../utils/imageUpload';

interface ImageUploadFieldProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount: number;
  scene: 'main' | 'detail';
  onUploadingChange?: (uploading: boolean) => void;
}

type PendingFile = UploadFile & { originalFile?: RcFile };

const MIME_TYPE_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function inferMimeType(file: File) {
  if (file.type) return file.type;
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  return MIME_TYPE_MAP[extension] || 'image/webp';
}

function createDoneFile(url: string, index: number): UploadFile {
  return {
    uid: `remote-${index}-${url}`,
    name: url.split('/').pop() || `image-${index + 1}`,
    status: 'done',
    url,
  };
}

export default function ImageUploadField({
  value = [],
  onChange,
  maxCount,
  scene,
  onUploadingChange,
}: ImageUploadFieldProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const uploadedUrlsRef = useRef(value);

  useEffect(() => {
    uploadedUrlsRef.current = value;
  }, [value]);

  useEffect(() => {
    const uploading = pendingFiles.some((file) => file.status === 'uploading');
    onUploadingChange?.(uploading);
  }, [onUploadingChange, pendingFiles]);

  const uploadedFiles = useMemo(() => value.map((url, index) => createDoneFile(url, index)), [value]);
  const fileList = useMemo(() => [...uploadedFiles, ...pendingFiles], [pendingFiles, uploadedFiles]);

  const removePending = (uid: string) => {
    setPendingFiles((current) => current.filter((item) => item.uid !== uid));
  };

  const updatePending = (uid: string, updater: (file: PendingFile) => PendingFile) => {
    setPendingFiles((current) => current.map((item) => (item.uid === uid ? updater(item) : item)));
  };

  const moveUploadedImage = (url: string, direction: 'left' | 'right') => {
    const currentIndex = value.findIndex((item) => item === url);
    if (currentIndex < 0) return;

    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= value.length) return;

    const next = [...value];
    [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
    onChange?.(next);
  };

  const handleCustomRequest = async (options: RcCustomRequestOptions) => {
    const file = options.file as RcFile;
    const uid = file.uid;

    setPendingFiles((current) => [
      ...current,
      {
        uid,
        name: file.name,
        status: 'uploading',
        percent: 0,
        originFileObj: file,
        originalFile: file,
      },
    ]);

    try {
      const compressedFile = await compressImageBeforeUpload(file, scene);
      const contentType = inferMimeType(compressedFile);
      const policy = await getUploadPolicy({
        biz: 'product',
        scene,
        fileName: compressedFile.name,
        contentType,
        size: compressedFile.size,
      });

      const url = await uploadFileToCos(compressedFile, policy, (percent) => {
        updatePending(uid, (current) => ({
          ...current,
          percent,
        }));
        options.onProgress?.({ percent });
      });

      removePending(uid);
      onChange?.([...uploadedUrlsRef.current, url]);
      options.onSuccess?.({ url });
    } catch (err: any) {
      updatePending(uid, (current) => ({
        ...current,
        status: 'error',
      }));
      message.error(err.message || '图片上传失败');
      options.onError?.(err);
    }
  };

  const handleRemove: UploadProps['onRemove'] = (file) => {
    if (file.status === 'done' && file.url) {
      onChange?.(value.filter((item) => item !== file.url));
      return true;
    }

    removePending(file.uid);
    return true;
  };

  const handlePreview: UploadProps['onPreview'] = async (file) => {
    if (file.url) {
      setPreviewUrl(file.url);
      return;
    }

    if (file.originFileObj) {
      const objectUrl = URL.createObjectURL(file.originFileObj);
      setPreviewUrl(objectUrl);
    }
  };

  const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (fileList.length >= maxCount) {
      message.error(`最多上传 ${maxCount} 张图片`);
      return Upload.LIST_IGNORE;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      message.error('仅支持 JPG、PNG、WEBP 图片');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  return (
    <>
      <Upload
        className="brand-upload"
        accept="image/jpeg,image/png,image/webp"
        listType="picture-card"
        fileList={fileList}
        customRequest={handleCustomRequest}
        beforeUpload={handleBeforeUpload}
        onRemove={handleRemove}
        onPreview={handlePreview}
        multiple
      >
        {fileList.length >= maxCount ? null : (
          <div className="brand-upload__trigger">
            <Typography.Text className="brand-upload__trigger-title">上传图片</Typography.Text>
            <Typography.Text className="brand-upload__trigger-note">
              最多 {maxCount} 张
            </Typography.Text>
          </div>
        )}
      </Upload>
      {value.length > 0 ? (
        <div className="brand-upload__gallery">
          <Typography.Text className="brand-upload__gallery-title">已上传图片顺序</Typography.Text>
          <Flex wrap gap={12} style={{ marginTop: 8 }}>
            {value.map((url, index) => (
              <Card
                key={url}
                size="small"
                className="brand-upload__card"
                styles={{ body: { padding: 8, width: 148 } }}
              >
                <div className="brand-upload__preview" onClick={() => setPreviewUrl(url)}>
                  <img
                    src={url}
                    alt={`uploaded-${index + 1}`}
                    className="brand-upload__preview-image"
                  />
                </div>
                <Typography.Text className="brand-upload__order-label">
                  第 {index + 1} 张
                </Typography.Text>
                <Space size={4}>
                  <Button
                    size="small"
                    icon={<ArrowLeftOutlined />}
                    disabled={index === 0}
                    onClick={() => moveUploadedImage(url, 'left')}
                  />
                  <Button
                    size="small"
                    icon={<ArrowRightOutlined />}
                    disabled={index === value.length - 1}
                    onClick={() => moveUploadedImage(url, 'right')}
                  />
                </Space>
              </Card>
            ))}
          </Flex>
        </div>
      ) : null}
      {previewUrl ? (
        <Image
          style={{ display: 'none' }}
          src={previewUrl}
          preview={{
            visible: true,
            src: previewUrl,
            onVisibleChange: (visible) => {
              if (!visible) {
                setPreviewUrl(null);
              }
            },
          }}
        />
      ) : null}
    </>
  );
}
