export function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function productPath(product) {
  const slug = slugify(product?.slug || product?.name || product?.id || product?._id);
  const id = product?._id;
  return `/products/${id ? `${slug}-${id}` : slug}`;
}

export function categoryPath(category) {
  return `/category/${slugify(category)}`;
}

export function productImageAlt(product) {
  if (product?.imageAlt) return product.imageAlt;
  const name = String(product?.name || 'Product image');
  return product?.category ? `${name} in ${product.category}` : name;
}

export function getPublicOrigin() {
  return (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, '');
}