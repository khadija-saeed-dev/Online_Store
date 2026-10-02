import Icon from './Icon.jsx';

export default function ConfirmModal({ product, isDeleting, error, onCancel, onConfirm }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#132b24]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !isDeleting) onCancel(); }}>
      <section aria-labelledby="delete-title" aria-modal="true" className="w-full max-w-md border border-[#e2e8e1] bg-white p-6 shadow-xl sm:p-7" role="dialog">
        <span className="grid size-11 place-items-center bg-[#fbefec] text-[#b3422d]"><Icon name="trash" size={20} /></span>
        <h2 className="mt-5 text-lg font-semibold text-[#203a31]" id="delete-title">Delete this product?</h2>
        <p className="mt-2 text-sm leading-6 text-[#69786f]">This will permanently remove <span className="font-semibold text-[#284338]">{product.name}</span> from the catalog.</p>
        {error && <p className="mt-4 border border-[#f1d6cf] bg-[#fff6f3] px-3 py-2 text-sm text-[#a3422e]">{error}</p>}
        <div className="mt-7 flex justify-end gap-3">
          <button className="min-h-10 border border-[#dce3dc] px-4 text-sm font-medium text-[#52645a] hover:bg-[#f6f8f5] disabled:opacity-50" disabled={isDeleting} onClick={onCancel} type="button">Cancel</button>
          <button className="min-h-10 bg-[#b34430] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#953a2a] disabled:opacity-60" disabled={isDeleting} onClick={onConfirm} type="button">{isDeleting ? 'Deleting...' : 'Delete product'}</button>
        </div>
      </section>
    </div>
  );
}