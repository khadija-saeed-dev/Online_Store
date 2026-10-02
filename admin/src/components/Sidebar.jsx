import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
  { label: 'Products', to: '/products', icon: 'box' },
  { label: 'Orders', to: '/orders', icon: 'bag' },
  { label: 'Users', to: '/users', icon: 'users' },
  { label: 'Settings', to: '/settings', icon: 'settings' },
];

export default function Sidebar({ isOpen, onNavigate, onClose, onLogout, user }) {
  return (
    <>
      {isOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} type="button" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-[#183d34] text-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[82px] items-center justify-between border-b border-white/10 px-6">
          <div>
            <p className="admin-display text-xl font-semibold tracking-wide">morrow<span className="text-[#ed8b6e]">&</span>co.</p>
            <p className="mt-1 text-[10px] font-semibold uppercase text-white/45">Store administration</p>
          </div>
          <button aria-label="Close navigation" className="grid size-9 place-items-center text-white/70 hover:text-white lg:hidden" onClick={onClose} type="button"><Icon name="close" /></button>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 px-3 py-6">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase text-white/40">Workspace</p>
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink className={({ isActive }) => `flex min-h-11 items-center gap-3 px-3 text-sm transition-colors ${isActive ? 'bg-white/12 font-semibold text-white' : 'text-white/65 hover:bg-white/7 hover:text-white'}`} key={item.label} onClick={onNavigate} to={item.to}>
                <Icon name={item.icon} size={18} />
                {item.label}
                {item.label === 'Products' && <span className="ml-auto size-1.5 rounded-full bg-[#ed8b6e]" />}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <span className="grid size-9 place-items-center rounded-full bg-[#ed8b6e] text-sm font-semibold text-[#183d34]">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
            <div><p className="max-w-[150px] truncate text-sm font-medium">{user?.name || 'Store admin'}</p><p className="mt-0.5 text-xs text-white/45">{user?.email || 'Workspace'}</p></div>
          </div>
          <button className="flex min-h-10 w-full items-center gap-3 px-2 text-sm text-white/60 transition-colors hover:text-white" onClick={onLogout} type="button"><Icon name="logout" size={18} />Log out</button>
        </div>
      </aside>
    </>
  );
}