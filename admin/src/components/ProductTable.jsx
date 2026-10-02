import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

function Status({ active }) {
  return <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${active ? 'text-[#23745a]' : 'text-[#818a84]'}`}><span className={`size-1.5 rounded-full ${active ? 'bg-[#36a77e]' : 'bg-[#aab2ad]'}`} />{active ? 'Active' : 'Inactive'}</span>;
}

function ProductImage({ product }) {
  return (
    <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden bg-[#edf1ed] text-[#759083]">
      <Icon name="image" size={18} />
      {product.images?.[0] && <img alt="" className="absolute inset-0 size-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} src={product.images[0]} />}
    </span>
  );
}

export default function ProductTable({ products, onDelete }) {
  return (
    <div className="overflow-hidden border border-[#e2e8e1] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-[#f8faf7]">
            <tr className="border-b border-[#e7ebe6] text-[10px] font-semibold uppercase text-[#849188]">
              <th className="px-5 py-3.5">Product</th><th className="px-4 py-3.5">Category</th><th className="px-4 py-3.5">Price</th><th className="px-4 py-3.5">Stock</th><th className="px-4 py-3.5">Featured</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf0ec]">
            {products.map((product) => (
              <tr className="transition-colors hover:bg-[#fbfcfa]" key={product._id || product.id}>
                <td className="px-5 py-3.5"><div className="flex items-center gap-3"><ProductImage product={product} /><div className="min-w-0"><p className="max-w-[240px] truncate text-sm font-semibold text-[#284338]">{product.name}</p><p className="mt-1 max-w-[240px] truncate text-xs text-[#87938c]">{product.brand || 'No brand'}</p></div></div></td>
                <td className="px-4 py-3.5 text-sm text-[#53645b]">{product.category}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-[#284338]">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(product.price)}</td>
                <td className="px-4 py-3.5 text-sm text-[#53645b]">{product.stock ?? 0}</td>
                <td className="px-4 py-3.5">{product.isFeatured ? <span className="text-xs font-medium text-[#bd684c]">Featured</span> : <span className="text-xs text-[#87938c]">—</span>}</td>
                <td className="px-4 py-3.5"><Status active={product.isActive !== false} /></td>
                <td className="px-4 py-3.5"><div className="flex justify-end gap-1"><Link aria-label={`Edit ${product.name}`} className="grid size-9 place-items-center text-[#61776b] transition-colors hover:bg-[#edf3ed] hover:text-[#244f40]" to={`/products/edit/${product._id}`}><Icon name="edit" size={17} /></Link><button aria-label={`Delete ${product.name}`} className="grid size-9 place-items-center text-[#a0695b] transition-colors hover:bg-[#fbefec] hover:text-[#b3422d]" onClick={() => onDelete(product)} type="button"><Icon name="trash" size={17} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-1 border-t border-[#edf0ec] px-5 py-3 text-xs text-[#87938c] sm:flex-row sm:items-center sm:justify-between"><span>{products.length} {products.length === 1 ? 'product' : 'products'}</span><span>Inventory managed through the product API</span></div>
    </div>
  );
}