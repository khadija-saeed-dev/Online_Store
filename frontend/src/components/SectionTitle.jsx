import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

export default function SectionTitle({ eyebrow, title, description, linkTo, linkLabel }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase text-[#c75b3f]">{eyebrow}</p>}
        <h2 className="font-display text-3xl font-semibold text-[#244338] sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">{description}</p>}
      </div>
      {linkTo && linkLabel && <Link className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#244338] transition-colors hover:text-[#c75b3f]" to={linkTo}>{linkLabel}<Icon name="arrowRight" size={17} /></Link>}
    </div>
  );
}