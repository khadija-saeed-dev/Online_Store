import { useState } from 'react';
import Icon from './Icon.jsx';

export default function ProductImage({ product, alt, className = '', loading = 'lazy' }) {
  const apiImage = Array.isArray(product?.images)
    ? product.images.find((image) => typeof image === 'string' && image.trim())
    : null;
  const imageSource = apiImage || product?.image;
  const [failedSource, setFailedSource] = useState('');

  if (!imageSource || failedSource === imageSource) {
    return (
      <span aria-label={alt || product?.name || 'Product image unavailable'} className={`grid place-items-center bg-[#eceee9] text-[#9aa59e] ${className}`} role="img">
        <Icon name="image" size={28} />
      </span>
    );
  }

  return (
    <img
      alt={alt || product?.name || 'Product'}
      className={className}
      decoding="async"
      loading={loading}
      onError={() => setFailedSource(imageSource)}
      src={imageSource}
    />
  );
}