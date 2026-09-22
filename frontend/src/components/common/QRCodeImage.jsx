import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import FastImage from './FastImage';

export default function QRCodeImage({
  value,
  size = 150,
  alt = 'QR Code',
  className = '',
  style = {},
  colorDark = '#2D1A10',
  colorLight = '#FFFFFF'
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (!value) return;

    let isMounted = true;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: colorDark,
        light: colorLight
      }
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Gagal generate QR Code lokal:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, colorDark, colorLight]);

  if (!qrDataUrl) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: '#F4ECE1',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        <span style={{ fontSize: '11px', color: '#7C4012', fontWeight: 700 }}>QR Code...</span>
      </div>
    );
  }

  return (
    <FastImage
      src={qrDataUrl}
      alt={alt}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        borderRadius: '8px',
        ...style
      }}
    />
  );
}
