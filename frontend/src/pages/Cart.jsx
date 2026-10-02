import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import ProductImage from '../components/ProductImage.jsx';
import QuantitySelector from '../components/QuantitySelector.jsx';
import Seo from '../components/Seo.jsx';
import { useCart } from '../context/CartContext.jsx';

const formatPrice = (price) => `$${price.toFixed(2)}`;

export default function Cart() {
  const { items, removeFromCart, updateQuantity, calculateSubtotal, calculateTotal } = useCart();

  if (items.length === 0) {
    return (
      <>
        <Seo noindex title="Your Shopping Cart | Morrow & Co." description="Review the items in your Morrow & Co. shopping cart." canonicalPath="/cart" />
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e9eee6] text-[#244338]"><Icon name="bag" size={27} /></span>
            <p className="mt-6 text-xs font-semibold uppercase text-[#c75b3f]">Your next favorite is out there</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-[#244338]">Your cart is waiting.</h1>
            <p className="mt-4 text-sm leading-6 text-stone-600">It looks like you haven't added anything yet. Take a look around and find something you'll love.</p>
            <Link className="mt-7 inline-flex min-h-12 items-center gap-3 bg-[#244338] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#315a49]" to="/shop">Continue shopping<Icon name="arrowRight" size={17} /></Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo noindex title="Your Shopping Cart | Morrow & Co." description="Review the items in your Morrow & Co. shopping cart." canonicalPath="/cart" />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-col gap-3 border-b border-stone-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[#c75b3f]">Good choices</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[#244338]">Your cart</h1>
        </div>
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-[#244338]" to="/shop">Continue shopping<Icon name="arrowRight" size={16} /></Link>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-14">
        <div>
          <div className="hidden grid-cols-[1fr_120px_100px] gap-4 border-b border-stone-200 pb-3 text-xs font-semibold uppercase text-stone-500 sm:grid">
            <span>Item</span><span>Quantity</span><span className="text-right">Subtotal</span>
          </div>
          <div>
            {items.map((item) => (
              <article className="grid grid-cols-[88px_1fr] gap-4 border-b border-stone-200 py-5 sm:grid-cols-[100px_1fr_120px_100px] sm:items-center sm:gap-5" key={item.id}>
                <ProductImage alt={item.imageAlt || item.name} className="aspect-square size-[88px] object-cover sm:size-[100px]" product={item} />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase text-stone-500">{item.category}</p>
                  <h2 className="mt-1 truncate font-medium text-[#244338]">{item.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-[#244338]">{formatPrice(item.price)}</p>
                  <button className="mt-2 inline-flex items-center gap-1.5 text-xs text-stone-500 transition-colors hover:text-[#c75b3f] sm:hidden" onClick={() => removeFromCart(item.id)} type="button"><Icon name="close" size={14} />Remove</button>
                </div>
                <div className="col-start-2 row-start-2 sm:col-start-auto sm:row-start-auto">
                  <QuantitySelector label={`Quantity for ${item.name}`} onChange={(quantity) => updateQuantity(item.id, quantity)} value={item.quantity} />
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-[#244338]">{formatPrice(item.price * item.quantity)}</p>
                  <button className="mt-2 text-xs text-stone-500 transition-colors hover:text-[#c75b3f]" onClick={() => removeFromCart(item.id)} type="button">Remove</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="h-fit border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="font-display text-2xl font-semibold text-[#244338]">Order summary</h2>
          <div className="mt-6 flex justify-between border-b border-stone-200 pb-4 text-sm">
            <span className="text-stone-600">Subtotal</span><span className="font-medium text-[#244338]">{formatPrice(calculateSubtotal())}</span>
          </div>
          <div className="flex justify-between py-4 text-base font-semibold text-[#244338]">
            <span>Total</span><span>{formatPrice(calculateTotal())}</span>
          </div>
          <p className="text-xs leading-5 text-stone-500">Shipping and taxes are calculated at checkout.</p>
          <Link className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#244338] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#315a49]" to="/checkout">Proceed to Checkout<Icon name="arrowRight" size={17} /></Link>
        </aside>
      </div>
      </section>
    </>
  );
}