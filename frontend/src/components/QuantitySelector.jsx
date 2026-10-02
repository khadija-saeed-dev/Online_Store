export default function QuantitySelector({ label = 'Quantity', value, onChange }) {
  const decrease = () => onChange(Math.max(1, value - 1));
  const increase = () => onChange(value + 1);

  const handleChange = (event) => {
    const nextValue = Number(event.target.value);
    if (Number.isInteger(nextValue) && nextValue > 0) {
      onChange(Math.min(99, nextValue));
    }
  };

  return (
    <div className="inline-flex h-11 items-center border border-stone-300 text-[#244338]">
      <button aria-label={`Decrease ${label}`} className="grid size-10 place-items-center text-lg transition-colors hover:bg-stone-100 disabled:opacity-40" disabled={value <= 1} onClick={decrease} type="button">-</button>
      <input aria-label={label} className="h-full w-10 border-x border-stone-300 bg-transparent text-center text-sm outline-none" max={99} min={1} onChange={handleChange} type="number" value={value} />
      <button aria-label={`Increase ${label}`} className="grid size-10 place-items-center text-lg transition-colors hover:bg-stone-100" disabled={value >= 99} onClick={increase} type="button">+</button>
    </div>
  );
}