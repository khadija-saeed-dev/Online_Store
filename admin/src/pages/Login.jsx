import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { getApiErrorMessage } from '../services/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const destination = location.state?.from?.pathname || '/dashboard';

  if (!loading && isAuthenticated) return <Navigate replace to={destination} />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      await login({ email, password });
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to sign in. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#f4f6f3] lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link className="inline-flex items-center gap-2 admin-display text-xl font-semibold text-[#183d34]" to="/login">morrow<span className="text-[#bd684c]">&</span>co.</Link>
          <p className="mt-12 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#bd684c]">Store administration</p>
          <h1 className="admin-display mt-2 text-3xl font-semibold text-[#203a31] sm:text-4xl">Welcome back.</h1>
          <p className="mt-3 text-sm leading-6 text-[#718077]">Sign in with your administrator account to manage the store catalog.</p>

          <form className="mt-8 space-y-5 border border-[#e2e8e1] bg-white p-5 sm:p-7" onSubmit={handleSubmit}>
            {(location.state?.message || error) && <div className="flex gap-2 border border-[#f1d6cf] bg-[#fff6f3] px-4 py-3 text-sm text-[#a3422e]" role="alert"><Icon className="mt-0.5 shrink-0" name="alert" size={17} />{error || location.state.message}</div>}
            <label className="block"><span className="mb-2 block text-sm font-medium text-[#31483d]">Email address</span><input autoComplete="username" className="min-h-11 w-full border border-[#dce3dc] px-3 text-sm outline-none focus:border-[#3e7961]" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-[#31483d]">Password</span><input autoComplete="current-password" className="min-h-11 w-full border border-[#dce3dc] px-3 text-sm outline-none focus:border-[#3e7961]" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
            <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-[#245443] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1c4335] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Signing in...' : 'Sign in to admin'}{!isSubmitting && <Icon name="chevron" size={16} />}</button>
          </form>
          <Link className="mt-6 inline-flex text-sm text-[#718077] transition-colors hover:text-[#31584a]" to="/">Return to the customer store</Link>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-[#183d34] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_15%,rgba(237,139,110,0.2),transparent_35%)]" />
        <div className="relative flex items-center gap-2 text-xs font-semibold uppercase text-white/65"><span className="size-2 rounded-full bg-[#ed8b6e]" />Morrow &amp; Co. workspace</div>
        <div className="relative max-w-lg"><p className="text-xs font-semibold uppercase text-[#f0a88f]">A considered collection</p><h2 className="admin-display mt-4 text-5xl font-semibold leading-tight">Good things,<br />well looked after.</h2><p className="mt-5 max-w-md text-sm leading-7 text-white/65">Keep the catalog thoughtful, current, and ready for the people who shop with us.</p></div>
        <p className="relative text-xs text-white/40">Private store administration</p>
      </aside>
    </main>
  );
}