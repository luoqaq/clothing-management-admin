import { useState } from 'react';
import { Button, Image, Upload, message } from 'antd';
import { CameraOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import type { UploadRequestOption as RcCustomRequestOptions } from '@rc-component/upload/lib/interface';
import { compressImageBeforeUpload, getUploadPolicy, uploadFileToCos } from '../utils/imageUpload';

interface SpecImageUploadProps {
  value?: string | null;
  onChange?: (url: string | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

export default function SpecImageUpload({ value, onChange, onUploadingChange }: SpecImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handleCustomRequest = async (options: RcCustomRequestOptions) => {
    const file = options.file as RcFile;
    setUploading(true);
    onUploadingChange?.(true);

    try {
      const compressedFile = await compressImageBeforeUpload(file, 'spec');
      const policy = await getUploadPolicy({
        biz: 'product',
        scene: 'spec',
        fileName: compressedFile.name,
        contentType: compressedFile.type || 'image/jpeg',
        size: compressedFile.size,
      });

      const url = await uploadFileToCos(compressedFile, policy, (percent) => {
        options.onProgress?.({ percent });
      });

      onChange?.(url);
      options.onSuccess?.({ url });
    } catch (err: any) {
      message.error(err.message || '图片上传失败');
      options.onError?.(err);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      message.error('仅支持 JPG、PNG、WEBP 图片');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleRemove = () => {
    onChange?.(null);
  };

  if (value) {
    return (
      <div className="spec-image-upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Image
          src={value}
          width={100}
          height={100}
          style={{ objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
          preview={{ visible: previewVisible, onVisibleChange: setPreviewVisible }}
          onClick={() => setPreviewVisible(true)}
        />
        <Button
          type="text"
          size="small"
          danger
          icon={<CloseCircleOutlined />}
          onClick={handleRemove}
          style={{ padding: 0, height: 'auto' }}
        />
      </div>
    );
  }

  return (
    <Upload
      accept="image/jpeg,image/png,image/webp"
      showUploadList={false}
      customRequest={handleCustomRequest}
      beforeUpload={handleBeforeUpload}
    >
      <Button
        type="link"
        size="small"
        icon={<CameraOutlined />}
        loading={uploading}
        style={{ padding: 0 }}
      >
        上传图片
      </Button>
    </Upload>
  );
}
