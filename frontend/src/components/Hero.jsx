import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[570px] items-center overflow-hidden bg-[#344139] sm:min-h-[630px]">
      <img alt="A sunlit, thoughtfully furnished living room" className="absolute inset-0 size-full object-cover object-center" fetchPriority="high" src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=88" />
      <div aria-hidden="true" className="absolute inset-0 bg-[#14251f]/45" />
      <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="max-w-2xl animate-fade-up text-white">
          <p className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase text-[#f5b39b] sm:text-sm"><span className="h-px w-8 bg-[#f5b39b]" />A little more considered</p>
          <h1 className="font-display text-5xl font-medium leading-[1.05] sm:text-6xl lg:text-7xl">Thoughtful home goods<br className="hidden sm:block" /> for everyday living.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/85 sm:text-lg sm:leading-8">Useful, beautiful objects for the everyday. Find pieces that feel like they have always belonged.</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link className="inline-flex min-h-12 items-center gap-3 bg-[#df6848] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#c75235]" to="/shop">Shop the collection<Icon name="arrowRight" size={18} /></Link>
            <Link className="inline-flex items-center gap-2 border-b border-white/60 pb-1 text-sm font-semibold text-white transition-colors hover:border-white" to="/#categories">Explore categories</Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 right-5 hidden items-center gap-3 text-xs text-white/80 sm:flex sm:right-8"><span className="h-px w-10 bg-white/70" />Considered living, since 2018</div>
    </section>
  );
}