import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid.jsx';
import Seo from '../components/Seo.jsx';
import { categories, products as demoProducts } from '../data/products.js';
import api from '../services/api.js';
import { categoryPath, getPublicOrigin, productPath, slugify } from '../utils/seo.js';

function titleFromSlug(slug = '') {
  return slug.split('-').filter(Boolean).map((word) => `${word[0].toUpperCase()}${word.slice(1)}`).join(' ');
}

export default function Shop() {
  const { slug } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = (searchParams.get('search') || searchParams.get('q') || '').trim();
  const legacyCategory = searchParams.get('category') || '';
  const category = slug
    ? categories.find((item) => slugify(item.name) === slug)?.name || titleFromSlug(slug)
    : legacyCategory;
  const categoryDetails = categories.find((item) => item.name.toLowerCase() === category.toLowerCase());
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const localMatches = useMemo(() => demoProducts.filter((product) => {
    const matchesCategory = !category || product.category.toLowerCase() === category.toLowerCase();
    const searchableText = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return matchesCategory && (!searchTerm || searchableText.includes(searchTerm.toLowerCase()));
  }), [category, searchTerm]);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    api.get('/products', {
      params: {
        limit: 100,
        ...(category ? { category } : {}),
        ...(searchTerm ? { search: searchTerm } : {}),
      },
    })
      .then((response) => {
        if (!isCurrent) return;
        const apiProducts = Array.isArray(response.data?.data) ? response.data.data : [];
        setItems(apiProducts.length ? apiProducts : localMatches);
      })
      .catch(() => {
        if (isCurrent) setItems(localMatches);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => { isCurrent = false; };
  }, [category, localMatches, searchTerm]);

  const title = searchTerm
    ? `Search results for “${searchTerm}” | Morrow & Co.`
    : category
      ? `${category} | Morrow & Co.`
      : 'Shop Home Goods & Everyday Essentials | Morrow & Co.';
  const description = categoryDetails?.description
    || 'Browse thoughtful home goods, everyday carry, audio and tech, and useful essentials for daily life.';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category || (searchTerm ? `Search results for ${searchTerm}` : 'Shop Morrow & Co.'),
    description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: new URL(productPath(item), getPublicOrigin()).href,
        name: item.name,
      })),
    },
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Seo
        title={title}
        description={searchTerm ? `Search Morrow & Co. for ${searchTerm}. Browse matching products and everyday essentials.` : description}
        canonicalPath={category ? categoryPath(category) : '/shop'}
        noindex={Boolean(searchTerm)}
        structuredData={schema}
      />
      <header className="border-b border-stone-200 pb-7">
        <p className="text-xs font-semibold uppercase text-[#c75b3f]">Morrow & Co. collection</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-[#244338]">
          {searchTerm ? `Search: ${searchTerm}` : category || 'Shop thoughtful everyday essentials'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
          {categoryDetails?.description || 'Browse considered home goods, everyday carry, audio and tech, and useful pieces chosen for daily life.'}
        </p>
        {!category && !searchTerm && <nav aria-label="Product categories" className="mt-5 flex flex-wrap gap-x-5 gap-y-2">{categories.map((item) => <Link className="text-sm font-medium text-[#31584a] underline decoration-[#d9a18e] underline-offset-4 hover:text-[#c75b3f]" key={item.name} to={categoryPath(item.name)}>{item.name}</Link>)}</nav>}
      </header>

      {isLoading ? (
        <p className="py-12 text-sm text-stone-500" role="status">Loading products...</p>
      ) : items.length ? (
        <div className="pt-8"><ProductGrid products={items} /></div>
      ) : (
        <p className="py-12 text-sm text-stone-600" role="status">No products match this selection. Browse all <Link className="font-semibold text-[#244338] underline" to="/shop">store collections</Link>.</p>
      )}
    </section>
  );
}