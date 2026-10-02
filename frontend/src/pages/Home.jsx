import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard.jsx';
import Hero from '../components/Hero.jsx';
import Icon from '../components/Icon.jsx';
import Newsletter from '../components/Newsletter.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ReviewCard from '../components/ReviewCard.jsx';
import Seo from '../components/Seo.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import api from '../services/api.js';
import { categories, products, reviews } from '../data/products.js';
import { getPublicOrigin } from '../utils/seo.js';

const featuredProducts = products.filter((product) => product.isFeatured);
const bestSellers = products.filter((product) => product.isBestSeller);
const newArrivals = products.filter((product) => product.isNewArrival);

export default function Home() {
  const [catalogFeaturedProducts, setCatalogFeaturedProducts] = useState([]);

  useEffect(() => {
    let isCurrent = true;
    api.get('/products?featured=true&limit=8')
      .then((response) => {
        if (isCurrent && Array.isArray(response.data?.data)) {
          setCatalogFeaturedProducts(response.data.data);
        }
      })
      .catch(() => {});

    return () => { isCurrent = false; };
  }, []);

  const displayedFeaturedProducts = catalogFeaturedProducts.length ? catalogFeaturedProducts : featuredProducts;
  const siteOrigin = getPublicOrigin();

  return (
    <>
      <Seo
        title="Thoughtful Home Goods & Everyday Essentials | Morrow & Co."
        description="Shop thoughtful home goods, everyday carry, audio, and useful essentials chosen for daily life. Explore lamps, bags, headphones, sneakers, and more."
        canonicalPath="/"
        image="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85"
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'Organization', name: 'Morrow & Co.', url: siteOrigin },
            {
              '@type': 'WebSite',
              name: 'Morrow & Co.',
              url: siteOrigin,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${siteOrigin}/shop?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            },
          ],
        }}
      />
      <Hero />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20" id="categories">
        <SectionTitle description="A few well-made favorites for wherever the day takes you." eyebrow="Find your thing" title="Shop by category" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{categories.map((category) => <CategoryCard category={category} key={category.name} />)}</div>
      </section>
      <section className="bg-[#f4f2ed] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionTitle description="A considered edit of things we use and love, made to earn their place at home." eyebrow="A good place to start" linkLabel="Shop everything" linkTo="/shop" title="The Morrow edit" />
          <ProductGrid products={displayedFeaturedProducts} />
        </div>
      </section>
      <section className="bg-[#dce6dc]">
        <div className="mx-auto grid max-w-7xl md:min-h-[430px] md:grid-cols-2">
          <div className="flex flex-col justify-center px-5 py-14 sm:px-8 md:py-16 lg:px-16">
            <p className="text-xs font-semibold uppercase text-[#c75b3f]">A slower kind of upgrade</p>
            <h2 className="mt-4 max-w-lg font-display text-4xl font-semibold leading-tight text-[#244338] sm:text-5xl">The everyday deserves a little extra.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-stone-700">Meet the small-batch pieces designed to make ordinary routines feel like something worth looking forward to.</p>
            <Link className="mt-7 inline-flex w-fit items-center gap-3 border-b border-[#244338] pb-2 text-sm font-semibold text-[#244338] transition-colors hover:border-[#c75b3f] hover:text-[#c75b3f]" to="/shop">Find your new favorite<Icon name="arrowRight" size={17} /></Link>
          </div>
          <div className="min-h-[280px] overflow-hidden md:min-h-full">
            <img alt="A carefully made leather bag ready for the day" className="size-full object-cover" loading="lazy" src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1400&q=85" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionTitle description="The pieces our customers come back for, chosen for everyday use." eyebrow="Loved for a reason" linkLabel="See best sellers" linkTo="/shop" title="Good things, often chosen" />
        <ProductGrid products={bestSellers} />
      </section>
      <section className="bg-[#f4f2ed] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionTitle description="Just landed and already feeling right at home." eyebrow="Fresh from the studio" linkLabel="Shop new arrivals" linkTo="/shop" title="New, but not for long" />
          <ProductGrid products={newArrivals} />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionTitle description="A few kind words from the people who brought Morrow home." eyebrow="Notes from our customers" title="The things they keep" />
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">{reviews.map((review) => <ReviewCard key={review.name} review={review} />)}</div>
      </section>
      <Newsletter />
    </>
  );
}