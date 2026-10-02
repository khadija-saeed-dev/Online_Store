import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Seo from '../components/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getAuthErrorMessage } from '../services/auth.js';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const destination = location.state?.from?.pathname || '/';

  if (!loading && isAuthenticated) return <Navigate replace to={destination} />;

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Seo noindex title="Create an Account | Morrow & Co." description="Create a Morrow & Co. customer account." canonicalPath="/register" />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-xl border border-stone-200 bg-white px-5 py-9 sm:px-10 sm:py-11">
        <Link className="inline-flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-[#244338]" to="/"><span aria-hidden="true">&larr;</span>Back to the store</Link>
        <p className="mt-8 text-xs font-semibold uppercase text-[#c75b3f]">Make yourself at home</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-[#244338]">Create your account.</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">A simpler way to keep track of the things you love.</p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          {error && <div className="flex gap-2 border border-[#f1d6cf] bg-[#fff6f3] px-4 py-3 text-sm text-[#a3422e]" role="alert"><Icon className="mt-0.5 shrink-0" name="alert" size={17} />{error}</div>}
          <label className="block"><span className="mb-2 block text-sm font-medium text-[#31483d]">Name</span><input autoComplete="name" className="min-h-12 w-full border border-stone-300 bg-white px-4 text-sm outline-none focus:border-[#244338]" onChange={(event) => updateField('name', event.target.value)} required value={form.name} /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-[#31483d]">Email address</span><input autoComplete="email" className="min-h-12 w-full border border-stone-300 bg-white px-4 text-sm outline-none focus:border-[#244338]" onChange={(event) => updateField('email', event.target.value)} required type="email" value={form.email} /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-[#31483d]">Password</span><input autoComplete="new-password" className="min-h-12 w-full border border-stone-300 bg-white px-4 text-sm outline-none focus:border-[#244338]" minLength={8} onChange={(event) => updateField('password', event.target.value)} required type="password" value={form.password} /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-[#31483d]">Confirm password</span><input autoComplete="new-password" className="min-h-12 w-full border border-stone-300 bg-white px-4 text-sm outline-none focus:border-[#244338]" onChange={(event) => updateField('confirmPassword', event.target.value)} required type="password" value={form.confirmPassword} /></label>
          <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#244338] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#315a49] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Creating account...' : 'Create account'}{!isSubmitting && <Icon name="arrowRight" size={17} />}</button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">Already have an account? <Link className="font-semibold text-[#244338] underline decoration-[#d9a18e] underline-offset-4 hover:text-[#c75b3f]" state={location.state} to="/login">Sign in</Link></p>
      </div>
      </section>
    </>
  );
}