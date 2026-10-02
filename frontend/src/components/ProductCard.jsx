import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import Icon from './Icon.jsx';
import ProductImage from './ProductImage.jsx';
import { productImageAlt, productPath } from '../utils/seo.js';

const formatPrice = (price) => `$${price.toFixed(2)}`;

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null;
  const rating = Number(product.rating ?? product.ratings ?? 0);
  const productUrl = productPath(product);

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[4/4.6] overflow-hidden bg-[#f0eee9]">
        <Link aria-label={`View ${product.name}`} className="block size-full" to={productUrl}><ProductImage alt={productImageAlt(product)} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" product={product} /></Link>
        {product.badge && <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase text-[#244338] sm:left-4 sm:top-4">{product.badge}</span>}
        {discount && <span className="absolute bottom-3 left-3 bg-[#df6848] px-2.5 py-1 text-[10px] font-semibold uppercase text-white sm:bottom-4 sm:left-4">{discount}% off</span>}
        <button aria-label={`Add ${product.name} to wishlist`} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 text-[#244338] transition-colors hover:bg-[#df6848] hover:text-white sm:right-4 sm:top-4" type="button"><Icon name="heart" size={18} /></button>
      </div>
      <div className="pt-3 sm:pt-4">
        <div className="flex items-start justify-between gap-2">
            <div className="min-w-0"><p className="text-[10px] font-semibold uppercase text-stone-500 sm:text-xs">{product.category}</p><Link className="mt-1 block truncate font-medium text-[#244338] transition-colors hover:text-[#c75b3f]" to={productUrl}>{product.name}</Link></div>
          <div aria-label={`${rating} out of 5 stars`} className="mt-0.5 flex shrink-0 items-center gap-1 text-xs text-stone-600"><Icon className="fill-[#d98b42] text-[#d98b42]" name="star" size={13} />{rating.toFixed(1)}</div>
        </div>
        <div className="mt-2 flex items-baseline gap-2 text-sm"><span className="font-semibold text-[#244338]">{formatPrice(product.price)}</span>{product.oldPrice && <span className="text-xs text-stone-400 line-through">{formatPrice(product.oldPrice)}</span>}</div>
        <div className="mt-3 flex flex-col gap-2 min-[420px]:flex-row">
          <button className="min-h-10 flex-1 bg-[#244338] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#315a49]" onClick={() => addToCart(product)} type="button">Add to Cart</button>
          <Link className="inline-flex min-h-10 items-center justify-center border border-stone-300 px-3 text-xs font-semibold text-[#244338] transition-colors hover:border-[#244338]" to={productUrl}>View details</Link>
        </div>
      </div>
    </article>
  );
}