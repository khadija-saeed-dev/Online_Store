import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { categoryPath } from '../utils/seo.js';

export default function CategoryCard({ category }) {
  return (
    <Link className="group relative isolate block aspect-[4/5] overflow-hidden bg-[#e9e5dc] sm:aspect-[3/4]" to={categoryPath(category.name)}>
      <img alt={category.imageAlt} className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" src={category.image} />
      <span aria-hidden="true" className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white sm:p-5">
        <span><span className="block font-display text-xl font-semibold sm:text-2xl">{category.name}</span><span className="mt-1 block text-xs text-white/85 sm:text-sm">Explore the collection</span></span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/70 transition-colors group-hover:bg-white group-hover:text-[#244338]"><Icon name="arrowRight" size={17} /></span>
      </span>
    </Link>
  );
}