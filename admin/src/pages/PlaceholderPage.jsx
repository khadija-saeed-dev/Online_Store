import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

export default function PlaceholderPage({ title, description }) {
  return (
    <section className="border border-[#e2e8e1] bg-white px-5 py-14 text-center sm:px-8 sm:py-20">
      <span className="mx-auto grid size-11 place-items-center bg-[#edf3ed] text-[#39785e]"><Icon name="settings" /></span>
      <p className="mt-5 text-xs font-semibold uppercase text-[#bd684c]">Workspace</p>
      <h2 className="admin-display mt-2 text-2xl font-semibold text-[#203a31]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#718077]">{description}</p>
      <Link className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#36745c] hover:text-[#244f40]" to="/dashboard">Back to dashboard<Icon className="rotate-180" name="chevron" size={16} /></Link>
    </section>
  );
}