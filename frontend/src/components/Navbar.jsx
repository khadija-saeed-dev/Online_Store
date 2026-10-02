import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from './Icon.jsx';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Categories', to: '/#categories' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

function SearchField({ className = '' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (query) navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <form className={`flex items-center gap-2 border-b border-stone-300 py-2 ${className}`} onSubmit={handleSubmit} role="search">
      <Icon className="shrink-0 text-stone-500" name="search" size={18} />
      <input aria-label="Search products" className="w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-500" onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search the store" type="search" value={searchTerm} />
      <button className="sr-only" type="submit">Search</button>
    </form>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#fbfaf7]">
      <div className="bg-[#244338] px-4 py-2 text-center text-[10px] font-semibold uppercase text-white sm:text-xs">Complimentary shipping on orders over $75</div>
      <div className="border-b border-stone-200">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link aria-label="Morrow and Co. home" className="flex shrink-0 items-center gap-2.5" to="/">
            <span className="grid size-9 place-items-center rounded-full bg-[#df6848] text-white"><Icon name="sparkle" size={19} /></span>
            <span className="font-display text-xl font-semibold leading-none text-[#244338] sm:text-2xl">morrow<span className="text-[#df6848]">&</span>co.</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <NavLink className={({ isActive }) => `text-[13px] font-medium transition-colors hover:text-[#df6848] ${isActive ? 'text-[#244338]' : 'text-stone-600'}`} end={link.to === '/'} key={link.label} to={link.to}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <SearchField className="hidden w-40 xl:flex" />
            <button aria-label={searchOpen ? 'Close search' : 'Open search'} className="grid size-10 place-items-center text-[#244338] transition-colors hover:text-[#df6848] xl:hidden" onClick={() => setSearchOpen((open) => !open)} type="button"><Icon name="search" /></button>
            {isAuthenticated ? (
              <>
                <Link aria-label={`Account for ${user.name}`} className="hidden items-center gap-2 text-sm font-medium text-stone-700 transition-colors hover:text-[#df6848] sm:flex" to="/orders"><Icon name="user" size={19} /><span className="hidden xl:inline">Hi, {user.name}</span></Link>
                <button className="hidden text-sm font-medium text-stone-600 transition-colors hover:text-[#df6848] xl:inline" onClick={logout} type="button">Log out</button>
              </>
            ) : (
              <>
                <Link className="hidden text-sm font-medium text-stone-700 transition-colors hover:text-[#df6848] sm:inline" to="/login">Sign in</Link>
                <Link className="hidden text-sm font-medium text-stone-700 transition-colors hover:text-[#df6848] lg:inline" to="/register">Register</Link>
              </>
            )}
            <Link aria-label={`Shopping bag, ${itemCount} items`} className="relative grid size-10 place-items-center text-[#244338] transition-colors hover:text-[#df6848]" to="/cart">
              <Icon name="bag" />
              <span className="absolute right-0 top-0 grid size-[17px] place-items-center rounded-full bg-[#df6848] text-[10px] font-semibold text-white">{itemCount > 99 ? '99+' : itemCount}</span>
            </Link>
            <button aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'} className="grid size-10 place-items-center text-[#244338] lg:hidden" onClick={() => setMenuOpen((open) => !open)} type="button"><Icon name={menuOpen ? 'close' : 'menu'} /></button>
          </div>
        </div>

        {searchOpen && <SearchField className="mx-5 mb-4 xl:hidden sm:mx-8" />}
        {menuOpen && (
          <nav aria-label="Mobile navigation" className="border-t border-stone-200 px-5 py-3 lg:hidden sm:px-8">
            {links.map((link) => <Link className="block border-b border-stone-100 py-3 text-sm font-medium text-stone-700 last:border-0" key={link.label} onClick={() => setMenuOpen(false)} to={link.to}>{link.label}</Link>)}
            {isAuthenticated ? (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-4">
                <Link className="text-sm font-medium text-[#244338]" onClick={() => setMenuOpen(false)} to="/orders">Hi, {user.name}</Link>
                <button className="text-sm font-medium text-stone-600" onClick={() => { logout(); setMenuOpen(false); }} type="button">Log out</button>
              </div>
            ) : (
              <div className="flex gap-5 pt-3">
                <Link className="text-sm font-medium text-[#244338]" onClick={() => setMenuOpen(false)} to="/login">Log in</Link>
                <Link className="text-sm font-medium text-[#244338]" onClick={() => setMenuOpen(false)} to="/register">Create account</Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}