export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10" role="status">
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-stone-300 border-t-[#244338]"
      />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  );
}