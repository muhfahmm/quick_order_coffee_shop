import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Upload, AlertCircle, Sparkles } from 'lucide-react';
import jsQR from 'jsqr';

export default function MobileCameraScannerModal({ isOpen, onClose, onScanSuccess }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      handleCameraAccessBlocked('Kamera live dibatasi pada HTTP. Silakan gunakan tombol Ambil Foto Kamera di bawah.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().then(() => {
          scanFrame();
        }).catch(() => {
          handleCameraAccessBlocked('Akses kamera live diblokir oleh browser. Gunakan Kamera HP di bawah.');
        });
      }
    } catch (err) {
      console.warn('Live camera stream not allowed (HTTP context):', err);
      handleCameraAccessBlocked('Browser HP memblokir kamera live (HTTP). Gunakan Kamera HP di bawah.');
    }
  };

  const handleCameraAccessBlocked = (message) => {
    setCameraError(message);
    setIsScanning(false);
    // Auto trigger native file camera picker if available
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 300);
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        handleQRDetected(code.data);
        return;
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const handleQRDetected = (qrText) => {
    stopCamera();

    let extractedTable = '';
    try {
      const urlObj = new URL(qrText.startsWith('http') ? qrText : `http://dummy.com/${qrText}`);
      const params = urlObj.searchParams;
      extractedTable = params.get('table') || params.get('table_number') || params.get('meja') || '';
    } catch {
      extractedTable = qrText;
    }

    if (onScanSuccess) {
      onScanSuccess({ rawUrl: qrText, tableNumber: extractedTable });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleQRDetected(code.data);
        } else {
          alert('QR Code tidak terdeteksi pada foto ini. Silakan ambil foto QR Code yang lebih jelas dan fokus.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '400px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #2D1A10, #7C4012)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} style={{ color: '#FDE68A' }} />
            <span style={{ fontSize: '15px', fontWeight: 800 }}>Scan QR Code Meja</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Camera Scanner Container */}
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '240px',
              background: '#18181B',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <video
              ref={videoRef}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: isScanning ? 'block' : 'none' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Viewfinder Overlay Frame */}
            {isScanning && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}
              >
                <div
                  style={{
                    width: '170px',
                    height: '170px',
                    border: '3px solid #D97706',
                    borderRadius: '16px',
                    boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.45)',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, #EF4444, transparent)',
                      boxShadow: '0 0 8px #EF4444'
                    }}
                  />
                </div>
              </div>
            )}

            {cameraError && (
              <div style={{ padding: '20px 16px', color: '#FEF3C7', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Camera size={36} style={{ color: '#F59E0B' }} />
                <p style={{ margin: 0, fontWeight: 700, color: '#FFFFFF' }}>Kamera HP Siap Digunakan</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#D1D5DB' }}>
                  Aplikasi Kamera HP Anda akan terbuka untuk mengambil foto QR Code Meja.
                </p>
              </div>
            )}
          </div>

          <p style={{ fontSize: '13px', color: '#7C4012', fontWeight: 700, margin: '0 0 16px 0' }}>
            Jepret foto QR Code yang ada di meja resto Anda
          </p>

          {/* Primary Action Button (Triggers Native Camera App) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label
              style={{
                background: 'linear-gradient(135deg, #EA580C, #D97706)',
                color: '#FFFFFF',
                padding: '14px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
              }}
            >
              <Camera size={20} /> Jepret Foto QR Code (Kamera HP)
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>

            {cameraError && (
              <button
                type="button"
                onClick={startCamera}
                style={{
                  background: '#FAF6F0',
                  border: '1px solid #E8DFD5',
                  color: '#7C4012',
                  padding: '10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} /> Coba Ulang Kamera Live
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
