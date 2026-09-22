// Utility for instant image preloading, memory caching, and Base64 conversion

const imageMemoryCache = new Map();

/**
 * Preload a single image into browser GPU/memory cache using async decoding.
 * @param {string} src - The image URL or Base64 string
 * @returns {Promise<string>} - Resolves when loaded or decoded
 */
export const preloadImage = (src) => {
  if (!src || typeof src !== 'string') return Promise.resolve(null);
  
  // Return immediately if already cached in memory
  if (imageMemoryCache.has(src)) {
    return Promise.resolve(src);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;

    const onComplete = () => {
      imageMemoryCache.set(src, true);
      resolve(src);
    };

    if (img.complete) {
      onComplete();
    } else {
      img.onload = () => {
        if (img.decode) {
          img.decode().then(onComplete).catch(onComplete);
        } else {
          onComplete();
        }
      };
      img.onerror = () => {
        // Resolve anyway so flow is not blocked
        resolve(null);
      };
    }
  });
};

/**
 * Preload an array of image URLs concurrently in background.
 * @param {Array<string>} urls - Array of image URLs or data URIs
 */
export const preloadImages = (urls = []) => {
  if (!Array.isArray(urls)) return;
  const uniqueUrls = Array.from(new Set(urls.filter(url => url && typeof url === 'string')));
  uniqueUrls.forEach(url => preloadImage(url));
};

/**
 * Preload all images from a product array (main image, hot_image, ice_image).
 * @param {Array<Object>} products - List of product objects
 */
export const preloadProductImages = (products = []) => {
  if (!Array.isArray(products)) return;
  const urls = [];
  products.forEach(p => {
    if (p?.image) urls.push(p.image);
    if (p?.hot_image) urls.push(p.hot_image);
    if (p?.ice_image) urls.push(p.ice_image);
  });
  preloadImages(urls);
};

/**
 * Convert a File object to an optimized Base64 Data URL using HTML5 Canvas.
 * @param {File} file - File object
 * @param {number} maxWidth - Max width for compression
 * @param {number} maxHeight - Max height for compression
 * @param {number} quality - Compression quality (0 to 1)
 * @returns {Promise<string>} Base64 Data URL
 */
export const fileToBase64 = (file, maxWidth = 800, maxHeight = 800, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File || file instanceof Blob)) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(file.type || 'image/jpeg', quality);
        preloadImage(dataUrl);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
