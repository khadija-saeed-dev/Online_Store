import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Seo from '../components/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getAuthErrorMessage } from '../services/auth.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const destination = location.state?.from?.pathname || '/';

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
      setError(getAuthErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Seo noindex title="Sign In | Morrow & Co." description="Sign in to your Morrow & Co. customer account." canonicalPath="/login" />
      <section className="mx-auto grid min-h-[620px] max-w-7xl overflow-hidden px-5 py-10 sm:px-8 md:grid-cols-[1fr_0.9fr] md:py-14">
      <div className="flex items-center justify-center bg-white px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link className="inline-flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-[#244338]" to="/"><span aria-hidden="true">&larr;</span>Back to the store</Link>
          <p className="mt-9 text-xs font-semibold uppercase text-[#c75b3f]">Welcome back</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[#244338]">Sign in to Morrow.</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">Pick up where you left off and keep your favorite things close.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && <div className="flex gap-2 border border-[#f1d6cf] bg-[#fff6f3] px-4 py-3 text-sm text-[#a3422e]" role="alert"><Icon className="mt-0.5 shrink-0" name="alert" size={17} />{error}</div>}
            <label className="block"><span className="mb-2 block text-sm font-medium text-[#31483d]">Email address</span><input autoComplete="email" className="min-h-12 w-full border border-stone-300 bg-white px-4 text-sm outline-none transition-colors focus:border-[#244338]" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-[#31483d]">Password</span><input autoComplete="current-password" className="min-h-12 w-full border border-stone-300 bg-white px-4 text-sm outline-none transition-colors focus:border-[#244338]" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
            <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#244338] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#315a49] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Signing in...' : 'Sign in'}{!isSubmitting && <Icon name="arrowRight" size={17} />}</button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">New to Morrow? <Link className="font-semibold text-[#244338] underline decoration-[#d9a18e] underline-offset-4 hover:text-[#c75b3f]" state={location.state} to="/register">Create an account</Link></p>
        </div>
      </div>
      <div className="relative hidden min-h-[520px] flex-col justify-end overflow-hidden bg-[#244338] p-10 text-white md:flex lg:p-14">
        <img alt="Sunlight across a carefully collected home" className="absolute inset-0 size-full object-cover opacity-65" src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18362d]/90 via-[#18362d]/15 to-transparent" />
        <div className="relative"><p className="text-xs font-semibold uppercase text-[#f4b29a]">Thoughtful things, everyday</p><p className="mt-3 max-w-sm font-display text-3xl leading-tight">Keep good company with the things you bring home.</p></div>
      </div>
      </section>
    </>
  );
}