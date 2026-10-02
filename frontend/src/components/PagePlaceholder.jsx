import { useLocation } from 'react-router-dom';
import Seo from './Seo.jsx';

export default function PagePlaceholder({ title, description, noindex = false }) {
  const { pathname } = useLocation();

  return (
    <>
      <Seo title={`${title} | Morrow & Co.`} description={description} canonicalPath={pathname} noindex={noindex} />
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <p className="mb-3 text-sm font-medium text-emerald-800">Morrow &amp; Co.</p>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-900">{title}</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">{description}</p>
      </section>
    </>
  );
}