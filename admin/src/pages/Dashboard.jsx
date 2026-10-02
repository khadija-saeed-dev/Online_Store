import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

const metrics = [
  { label: 'Total products', value: '--', note: 'Connect the product API to load totals', icon: 'box', accent: 'bg-[#e8f2eb] text-[#39785e]' },
  { label: 'Total orders', value: '--', note: 'Order data is not connected yet', icon: 'bag', accent: 'bg-[#f8eee8] text-[#bd684c]' },
  { label: 'Total users', value: '--', note: 'User data is not connected yet', icon: 'users', accent: 'bg-[#eaf0f5] text-[#58758d]' },
  { label: 'Revenue', value: '--', note: 'Revenue data is not connected yet', icon: 'grid', accent: 'bg-[#f3efe4] text-[#927742]' },
];

export default function Dashboard() {
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold uppercase text-[#bd684c]">Store overview</p><h2 className="admin-display mt-2 text-3xl font-semibold text-[#203a31]">Good morning.</h2><p className="mt-2 text-sm text-[#718077]">A clear view of your store operations.</p></div>
        <Link className="inline-flex min-h-10 w-fit items-center gap-2 bg-[#245443] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1c4335]" to="/products/add"><Icon name="plus" size={17} />Add a product</Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article className="border border-[#e2e8e1] bg-white p-5" key={metric.label}>
            <div className="flex items-start justify-between"><p className="text-sm font-medium text-[#63746a]">{metric.label}</p><span className={`grid size-9 place-items-center ${metric.accent}`}><Icon name={metric.icon} size={18} /></span></div>
            <p className="admin-display mt-5 text-3xl font-semibold text-[#203a31]">{metric.value}</p>
            <p className="mt-2 text-xs text-[#87938c]">{metric.note}</p>
          </article>
        ))}
      </div>

      <section className="mt-7 border border-[#e2e8e1] bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="text-sm font-semibold text-[#284338]">Catalog management</h3><p className="mt-1 text-sm text-[#718077]">Create, update, and review products connected to your API.</p></div>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#36745c] hover:text-[#244f40]" to="/products">Open product catalog<Icon name="chevron" size={16} /></Link>
        </div>
      </section>
    </div>
  );
}