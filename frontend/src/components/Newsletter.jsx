import Icon from './Icon.jsx';

export default function Newsletter() {
  const handleSubmit = (event) => event.preventDefault();
  return (
    <section className="bg-[#e9eee6]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1fr_1.1fr] md:items-center md:py-16">
        <div>
          <p className="text-xs font-semibold uppercase text-[#c75b3f]">A good note, now and then</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-[#244338] sm:text-4xl">Stay in the know.</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-stone-600">New finds, thoughtful ideas, and a little something for your next order.</p>
        </div>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <label className="min-w-0 flex-1"><span className="sr-only">Email address</span><input className="min-h-12 w-full border border-stone-300 bg-white px-4 text-sm text-stone-800 outline-none placeholder:text-stone-500 focus:border-[#244338]" placeholder="Your email address" required type="email" /></label>
          <button className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#244338] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#315a49]" type="submit">Subscribe<Icon name="arrowRight" size={17} /></button>
        </form>
      </div>
    </section>
  );
}