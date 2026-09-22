import React, { useState, useEffect, useRef } from 'react';
import { Coffee } from 'lucide-react';
import { preloadImage } from '../../utils/imagePreloader';

export default function FastImage({
  src,
  alt = 'Image',
  style = {},
  className = '',
  fallbackIcon: FallbackIcon = Coffee,
  fallbackColor = '#D97706',
  fallbackBg = '#FEF3C7',
  onLoad,
  onError,
  ...props
}) {
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setHasError(false);
    if (!src) {
      setIsReady(true);
      return;
    }

    // Preload image using memory cache / async decode
    let isMounted = true;
    preloadImage(src).then((validSrc) => {
      if (!isMounted) return;
      if (!validSrc && src) {
        // Retry image load directly in case decode fails
      }
      setIsReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, [src]);

  const combinedStyle = {
    objectFit: 'cover',
    display: 'block',
    transition: 'opacity 0.15s ease-in-out',
    opacity: isReady ? 1 : 0.85,
    backgroundColor: '#F3F4F6',
    ...style
  };

  if (!src || hasError) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: fallbackBg,
          color: fallbackColor,
          borderRadius: style.borderRadius || '10px',
          width: style.width || '100%',
          height: style.height || '100%',
          flexShrink: style.flexShrink ?? 0,
          ...style
        }}
        {...props}
      >
        <FallbackIcon size={typeof style.width === 'number' ? Math.min(style.width * 0.4, 28) : 24} />
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading="eager"
      decoding="async"
      style={combinedStyle}
      className={className}
      onLoad={(e) => {
        setIsReady(true);
        if (onLoad) onLoad(e);
      }}
      onError={(e) => {
        setHasError(true);
        if (onError) onError(e);
      }}
      {...props}
    />
  );
}
