import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/products/add': 'Add product',
  '/orders': 'Orders',
  '/users': 'Users',
  '/settings': 'Settings',
};

export default function AdminNavbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const pageTitle = pathname.startsWith('/products/edit/') ? 'Edit product' : pageTitles[pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#e3e8e2] bg-white/95 px-4 backdrop-blur sm:px-7">
      <div className="flex items-center gap-3">
        <button aria-label="Open navigation" className="grid size-10 place-items-center text-[#31584a] lg:hidden" onClick={onMenuClick} type="button"><Icon name="menu" /></button>
        <div>
          <p className="text-[10px] font-semibold uppercase text-[#87938c]">Morrow &amp; Co. / Admin</p>
          <h1 className="mt-0.5 text-sm font-semibold text-[#203a31] sm:text-base">{pageTitle}</h1>
        </div>
      </div>
      <Link className="hidden items-center gap-2 border border-[#dce3dc] px-3 py-2 text-xs font-medium text-[#51665b] transition-colors hover:border-[#31584a] hover:text-[#203a31] sm:inline-flex" to="/products/add"><Icon name="plus" size={15} />New product</Link>
    </header>
  );
}