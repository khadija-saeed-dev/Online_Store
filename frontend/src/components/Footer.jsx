import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

const quickLinks = [
  { label: 'Shop all', to: '/shop' },
  { label: 'About us', to: '/about' },
  { label: 'Our journal', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const serviceLinks = [
  { label: 'Shipping & returns', to: '/contact' },
  { label: 'FAQs', to: '/contact' },
  { label: 'Order status', to: '/orders' },
  { label: 'Your account', to: '/login' },
];

export default function Footer() {
  return (
    <footer className="bg-[#203a31] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-12 lg:py-16">
        <div>
          <Link className="font-display text-2xl font-semibold" to="/">morrow<span className="text-[#ec886a]">&</span>co.</Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">Thoughtful things for everyday living. Made to be used, loved, and kept.</p>
          <div aria-label="Social media" className="mt-6 flex gap-2">
            <span aria-label="Instagram" className="grid size-9 place-items-center rounded-full border border-white/25 text-white/85" role="img"><Icon name="instagram" size={17} /></span>
            <span aria-label="Facebook" className="grid size-9 place-items-center rounded-full border border-white/25 text-white/85" role="img"><Icon name="facebook" size={17} /></span>
            <span aria-label="Pinterest" className="grid size-9 place-items-center rounded-full border border-white/25 text-white/85" role="img"><Icon name="pinterest" size={17} /></span>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-[#f1a48c]">Explore</h2>
          <ul className="mt-4 space-y-3">{quickLinks.map((link) => <li key={link.label}><Link className="text-sm text-white/70 transition-colors hover:text-white" to={link.to}>{link.label}</Link></li>)}</ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-[#f1a48c]">Customer care</h2>
          <ul className="mt-4 space-y-3">{serviceLinks.map((link) => <li key={link.label}><Link className="text-sm text-white/70 transition-colors hover:text-white" to={link.to}>{link.label}</Link></li>)}</ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-[#f1a48c]">Say hello</h2>
          <address className="mt-4 space-y-3 text-sm not-italic leading-6 text-white/70"><p>hello@morrowandco.example</p><p>+1 (555) 010-2048</p><p>Portland, Oregon</p></address>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/55 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>Copyright {new Date().getFullYear()} Morrow & Co. All rights reserved.</p>
          <p>Made for the moments in between.</p>
        </div>
      </div>
    </footer>
  );
}