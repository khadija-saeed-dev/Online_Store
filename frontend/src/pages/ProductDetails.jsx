import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import ProductImage from '../components/ProductImage.jsx';
import QuantitySelector from '../components/QuantitySelector.jsx';
import Seo from '../components/Seo.jsx';
import { useCart } from '../context/CartContext.jsx';
import { products } from '../data/products.js';
import api from '../services/api.js';
import { categoryPath, getPublicOrigin, productImageAlt, productPath, slugify } from '../utils/seo.js';

const formatPrice = (price) => `$${price.toFixed(2)}`;

export default function ProductDetails() {
  const { id, slug } = useParams();
  const routeKey = id || slug || '';
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(() => products.find((item) => item.id === routeKey || slugify(item.name) === routeKey) || null);
  const [isLoading, setIsLoading] = useState(() => !products.some((item) => item.id === routeKey || slugify(item.name) === routeKey));

  useEffect(() => {
    const demoProduct = products.find((item) => item.id === routeKey || slugify(item.name) === routeKey);
    if (demoProduct) {
      setProduct(demoProduct);
      setIsLoading(false);
      return undefined;
    }

    let isCurrent = true;
    const idFromSlug = routeKey.match(/-([\da-f]{24})$/i)?.[1];
    const productId = idFromSlug || routeKey;
    setProduct(null);
    setIsLoading(true);
    api.get(`/products/${productId}`)
      .then((response) => {
        if (isCurrent) setProduct(response.data?.data || null);
      })
      .catch(() => {
        if (isCurrent) setProduct(null);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => { isCurrent = false; };
  }, [routeKey]);

  if (isLoading) {
    return <section className="mx-auto max-w-7xl px-5 py-20 text-center text-sm text-stone-500 sm:px-8">Loading product...</section>;
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8">
        <h1 className="font-display text-3xl font-semibold text-[#244338]">We couldn't find that product.</h1>
        <Link className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#244338] hover:text-[#c75b3f]" to="/shop">Back to shop<Icon name="arrowRight" size={17} /></Link>
      </section>
    );
  }

  const rating = Number(product.rating ?? product.ratings ?? 0);
  const reviewCount = Number(product.reviewCount ?? product.numReviews ?? 0);
  const productUrl = productPath(product);
  const imageUrls = Array.isArray(product.images) && product.images.length
    ? product.images
    : product.image ? [product.image] : [];
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    ...(imageUrls.length ? { image: imageUrls } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    offers: {
      '@type': 'Offer',
      url: new URL(productUrl, getPublicOrigin()).href,
      price: Number(product.price).toFixed(2),
      priceCurrency: 'USD',
      ...(Number.isFinite(Number(product.stock)) ? {
        availability: Number(product.stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      } : {}),
    },
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      <Seo
        title={`${product.name} | ${product.category} | Morrow & Co.`}
        description={`${product.name}: ${product.description}`}
        canonicalPath={productUrl}
        image={imageUrls[0]}
        type="product"
        structuredData={productSchema}
      />
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-[#244338]" to="/shop">
        <span aria-hidden="true">&larr;</span> Back to shop
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
        <div className="aspect-square overflow-hidden bg-[#f0eee9]">
          <ProductImage alt={productImageAlt(product)} className="size-full object-cover" loading="eager" product={product} />
        </div>
        <div className="flex flex-col justify-center py-2">
          <Link className="w-fit text-xs font-semibold uppercase tracking-[0.08em] text-[#c75b3f] hover:underline" to={categoryPath(product.category)}>{product.category}</Link>
          <h1 className="mt-3 font-display text-4xl font-semibold text-[#244338] sm:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-stone-600">
            <span aria-label={`${rating} out of 5 stars`} className="flex items-center gap-1 text-[#d98b42]"><Icon className="fill-current" name="star" size={16} />{rating.toFixed(1)}</span>
            <span aria-hidden="true" className="text-stone-400">|</span>
            <span>{reviewCount} reviews</span>
          </div>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-xl font-semibold text-[#244338]">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="text-sm text-stone-400 line-through">{formatPrice(product.oldPrice)}</span>}
          </div>
          <p className="mt-6 max-w-xl text-base leading-7 text-stone-600">{product.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <QuantitySelector label="Quantity" onChange={setQuantity} value={quantity} />
            <button className="inline-flex min-h-12 flex-1 items-center justify-center gap-3 bg-[#244338] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#315a49] sm:flex-none" onClick={() => addToCart(product, quantity)} type="button">
              Add to Cart
              <Icon name="arrowRight" size={17} />
            </button>
          </div>
          <p className="mt-5 text-xs text-stone-500">A considered favorite, selected by Morrow &amp; Co.</p>
        </div>
      </div>
    </section>
  );
}