import Icon from './Icon.jsx';

export default function ReviewCard({ review }) {
  return (
    <article className="border-t border-stone-300 pt-5">
      <div aria-label={`${review.rating} out of 5 stars`} className="flex gap-1 text-[#d98b42]">{Array.from({ length: 5 }, (_, index) => <Icon className="fill-current" key={index} name="star" size={15} />)}</div>
      <blockquote className="mt-4 font-display text-lg leading-7 text-[#244338]">&quot;{review.text}&quot;</blockquote>
      <p className="mt-5 text-xs font-semibold uppercase text-stone-500">{review.name} <span className="px-1 text-[#df6848]">/</span> Verified customer</p>
    </article>
  );
}