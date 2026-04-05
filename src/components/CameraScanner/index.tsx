import { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Radio, Space, Alert, Spin, Typography } from 'antd';
import { CameraOutlined, ReloadOutlined, PauseOutlined, EditOutlined } from '@ant-design/icons';
import { Html5Qrcode } from 'html5-qrcode';
import './index.css';

const { Text } = Typography;

interface CameraScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

interface CameraDevice {
  id: string;
  label: string;
}

const SCANNER_ELEMENT_ID = 'html5-qrcode-scanner';

const CameraScanner: React.FC<CameraScannerProps> = ({ onScan, onError, disabled = false }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  // 检查摄像头权限状态
  const checkPermission = useCallback(async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionState(result.state as 'prompt' | 'granted' | 'denied');
        
        result.addEventListener('change', () => {
          setPermissionState(result.state as 'prompt' | 'granted' | 'denied');
        });
      }
    } catch {
      // 某些浏览器不支持查询摄像头权限，忽略错误
    }
  }, []);

  // 获取可用摄像头列表
  const getCameras = useCallback(async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const cameraList = devices.map((device) => ({
          id: device.id,
          label: device.label || `摄像头 ${device.id.slice(0, 8)}...`,
        }));
        setCameras(cameraList);
        
        // 优先选择后置摄像头
        const backCamera = devices.find(
          (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('后置')
        );
        setSelectedCamera(backCamera?.id || devices[0].id);
        return true;
      }
      return false;
    } catch (err) {
      console.error('获取摄像头列表失败:', err);
      setError('无法获取摄像头列表，请确保设备有可用摄像头');
      return false;
    }
  }, []);

  // 记录上次扫码的码值和时间，用于去重
  const lastScanRef = useRef<{ code: string; time: number } | null>(null);

  // 扫码成功回调
  const onScanSuccess = useCallback(
    (decodedText: string) => {
      if (isProcessingRef.current) return;
      
      // 去重检查：2 秒内相同条码不重复处理
      const now = Date.now();
      if (lastScanRef.current) {
        const { code, time } = lastScanRef.current;
        if (code === decodedText && now - time < 2000) {
          return; // 重复条码，忽略
        }
      }
      
      isProcessingRef.current = true;
      lastScanRef.current = { code: decodedText, time: now };
      onScan(decodedText);
      
      // 短暂延迟后继续扫描（给用户时间移开镜头，避免重复识别）
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1500);
    },
    [onScan]
  );

  // 扫码失败回调（可以忽略大部分错误，保持扫描）
  const onScanFailure = useCallback((errorMessage: string) => {
    // 忽略"No MultiFormat Readers"错误（这是正常的，没有识别到条码时会产生）
    if (errorMessage.includes('No MultiFormat Readers')) {
      return;
    }
    // 其他错误可以记录但不显示，保持扫描流畅
    console.debug('扫描中...', errorMessage);
  }, []);

  // 启动扫描
  const startScanning = useCallback(async () => {
    if (!scannerRef.current || !selectedCamera) return;
    
    setLoading(true);
    setError('');
    
    try {
      await scannerRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.333,
          disableFlip: false,
        },
        onScanSuccess,
        onScanFailure
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error('启动摄像头失败:', err);
      const errorMsg = err?.message || '启动摄像头失败';
      setError(errorMsg);
      onError?.(errorMsg);
      
      // 如果是权限错误，更新权限状态
      if (errorMsg.includes('Permission') || errorMsg.includes('permission')) {
        setPermissionState('denied');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCamera, onScanSuccess, onScanFailure, onError]);

  // 暂停扫描
  const pauseScanning = useCallback(async () => {
    if (!scannerRef.current) return;
    try {
      await scannerRef.current.pause();
      setIsScanning(false);
    } catch (err) {
      console.error('暂停扫描失败:', err);
    }
  }, []);

  // 恢复扫描
  const resumeScanning = useCallback(async () => {
    if (!scannerRef.current) return;
    try {
      await scannerRef.current.resume();
      setIsScanning(true);
    } catch (err) {
      console.error('恢复扫描失败:', err);
      // 如果恢复失败，尝试重新启动
      await startScanning();
    }
  }, [startScanning]);

  // 停止扫描
  const stopScanning = useCallback(async () => {
    if (!scannerRef.current) return;
    try {
      await scannerRef.current.stop();
      setIsScanning(false);
    } catch (err) {
      console.error('停止扫描失败:', err);
    }
  }, []);

  // 切换摄像头
  const handleCameraChange = useCallback(
    async (cameraId: string) => {
      setSelectedCamera(cameraId);
      if (isScanning) {
        await stopScanning();
        // 短暂延迟后使用新摄像头启动
        setTimeout(() => {
          startScanning();
        }, 300);
      }
    },
    [isScanning, stopScanning, startScanning]
  );

  // 初始化扫描器
  const initScanner = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // 检查是否有摄像头
      const hasCameras = await getCameras();
      if (!hasCameras) {
        setError('未检测到可用的摄像头');
        setLoading(false);
        return;
      }
      
      // 检查权限
      await checkPermission();
      
      // 创建扫描器实例
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(SCANNER_ELEMENT_ID);
      }
      
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [getCameras, checkPermission]);

  // 使用 ref 跟踪扫描器运行状态（用于 cleanup）
  const isRunningRef = useRef(false);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (scannerRef.current && isRunningRef.current) {
        scannerRef.current.stop().catch(() => {
          // 忽略停止错误
        });
      }
      scannerRef.current = null;
    };
  }, []);

  // 同步 isScanning 到 ref
  useEffect(() => {
    isRunningRef.current = isScanning;
  }, [isScanning]);

  // 禁用状态变化时处理
  useEffect(() => {
    if (disabled && isScanning) {
      stopScanning();
    }
  }, [disabled, isScanning, stopScanning]);

  // 权限被拒绝时的提示
  if (permissionState === 'denied') {
    return (
      <Alert
        type="warning"
        showIcon
        message="摄像头权限被拒绝"
        description={
          <div>
            <p>请在 iPad 设置中允许本网站使用摄像头：</p>
            <ol style={{ paddingLeft: 20 }}>
              <li>打开"设置" &gt; "Safari"</li>
              <li>找到"摄像头"设置</li>
              <li>允许当前网站访问摄像头</li>
            </ol>
            <p>或者使用手动输入模式</p>
          </div>
        }
      />
    );
  }

  return (
    <div className="camera-scanner">
      {/* 错误提示 */}
      {error && (
        <Alert
          type="error"
          showIcon
          closable
          message={error}
          onClose={() => setError('')}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 摄像头选择器 */}
      {cameras.length > 0 && (
        <div className="camera-scanner__selector" style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ marginRight: 12 }}>选择摄像头:</Text>
          <Radio.Group
            value={selectedCamera}
            onChange={(e) => handleCameraChange(e.target.value)}
            disabled={isScanning || loading}
          >
            {cameras.map((camera) => (
              <Radio.Button key={camera.id} value={camera.id}>
                {camera.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
      )}

      {/* 扫描区域 */}
      <div className="camera-scanner__container" style={{ position: 'relative' }}>
        {/* 扫描器元素 */}
        <div
          id={SCANNER_ELEMENT_ID}
          className="camera-scanner__video"
          style={{
            width: '100%',
            maxWidth: 400,
            height: 300,
            margin: '0 auto',
            background: '#f0f0f0',
            borderRadius: 8,
            overflow: 'hidden',
            display: isInitialized ? 'block' : 'none',
          }}
        />

        {/* 未初始化时的占位 */}
        {!isInitialized && (
          <div
            className="camera-scanner__placeholder"
            style={{
              width: '100%',
              maxWidth: 400,
              height: 200,
              margin: '0 auto',
              background: '#f5f5f5',
              border: '2px dashed #d9d9d9',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <CameraOutlined style={{ fontSize: 36, color: '#bfbfbf' }} />
            <Text type="secondary">摄像头未启动</Text>
            <Button
              type="primary"
              size="large"
              icon={<CameraOutlined />}
              onClick={initScanner}
              loading={loading}
            >
              启动摄像头
            </Button>
          </div>
        )}

        {/* 扫描线动画（仅在扫描中时显示） */}
        {isScanning && (
          <div className="camera-scanner__overlay">
            <div className="scanner-frame">
              <div className="scanner-frame__corner scanner-frame__corner--tl" />
              <div className="scanner-frame__corner scanner-frame__corner--tr" />
              <div className="scanner-frame__corner scanner-frame__corner--bl" />
              <div className="scanner-frame__corner scanner-frame__corner--br" />
              <div className="scanner-line" />
            </div>
            <Text className="scanner-hint" type="secondary">
              将条码对准框内自动扫描
            </Text>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255,255,255,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <Spin tip="正在启动摄像头..." />
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      {isInitialized && (
        <div className="camera-scanner__controls" style={{ marginTop: 16, textAlign: 'center' }}>
          <Space>
            {!isScanning ? (
              <Button
                type="primary"
                icon={<CameraOutlined />}
                onClick={startScanning}
                loading={loading}
                disabled={disabled}
              >
                开始扫描
              </Button>
            ) : (
              <>
                <Button
                  icon={<PauseOutlined />}
                  onClick={pauseScanning}
                  disabled={disabled}
                >
                  暂停扫描
                </Button>
                <Button
                  danger
                  onClick={stopScanning}
                  disabled={disabled}
                >
                  停止扫描
                </Button>
              </>
            )}
            
            {!isScanning && (
              <Button
                icon={<ReloadOutlined />}
                onClick={resumeScanning}
                disabled={disabled || loading}
              >
                继续扫描
              </Button>
            )}
          </Space>
        </div>
      )}

      {/* 提示信息 */}
      <div style={{ marginTop: 16 }}>
        <Alert
          type="info"
          showIcon
          icon={<EditOutlined />}
          message="使用提示"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>首次使用需要允许浏览器访问摄像头权限</li>
              <li>建议在光线充足的环境下使用</li>
              <li>将条码对准扫描框中央，保持稳定</li>
              <li>识别成功后会自动暂停，点击"继续扫描"识别下一件</li>
            </ul>
          }
        />
      </div>
    </div>
  );
};

export default CameraScanner;
