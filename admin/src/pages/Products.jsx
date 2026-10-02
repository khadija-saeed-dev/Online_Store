import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Icon from '../components/Icon.jsx';
import ProductTable from '../components/ProductTable.jsx';
import api, { getApiErrorMessage } from '../services/api.js';

function getErrorMessage(error) {
  return getApiErrorMessage(error);
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [activeResponse, inactiveResponse] = await Promise.all([
        api.get('/products', { params: { page: 1, limit: 100, active: true } }),
        api.get('/products', { params: { page: 1, limit: 100, active: false } }),
      ]);
      const activeProducts = activeResponse.data?.data;
      const inactiveProducts = inactiveResponse.data?.data;
      if (!Array.isArray(activeProducts) || !Array.isArray(inactiveProducts)) {
        throw new Error('The product API returned an unexpected response.');
      }
      const allProducts = [...activeProducts, ...inactiveProducts];
      allProducts.sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));
      setProducts(allProducts);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const categories = useMemo(() => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(), [products]);
  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.name} ${product.category} ${product.brand || ''}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesCategory = category === 'all' || product.category === category;
    return matchesSearch && matchesCategory;
  }), [products, search, category]);

  const handleDelete = async () => {
    if (!selectedProduct?._id) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await api.delete(`/products/${selectedProduct._id}`);
      setSelectedProduct(null);
      setNotice(`${selectedProduct.name} was deleted.`);
      await loadProducts();
    } catch (requestError) {
      setDeleteError(getErrorMessage(requestError));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold uppercase text-[#bd684c]">Catalog</p><h2 className="admin-display mt-2 text-3xl font-semibold text-[#203a31]">Products</h2><p className="mt-2 text-sm text-[#718077]">Manage the products shown in your customer store.</p></div>
        <Link className="inline-flex min-h-11 w-fit items-center gap-2 bg-[#245443] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1c4335]" to="/products/add"><Icon name="plus" size={17} />Add product</Link>
      </div>

      {notice && <div className="mt-6 flex items-center justify-between border border-[#c9e4d5] bg-[#f1faf4] px-4 py-3 text-sm text-[#23745a]" role="status"><span>{notice}</span><button aria-label="Dismiss notification" className="p-1" onClick={() => setNotice('')} type="button"><Icon name="close" size={16} /></button></div>}

      <section className="mt-7 border border-[#e2e8e1] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e7ebe6] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <label className="flex min-h-10 min-w-0 items-center gap-2 border border-[#dce3dc] px-3 sm:w-[320px]"><span className="sr-only">Search products</span><Icon className="shrink-0 text-[#87938c]" name="search" size={17} /><input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aa59e]" onChange={(event) => setSearch(event.target.value)} placeholder="Search products" value={search} /></label>
          <div className="flex items-center gap-3"><label className="text-xs font-medium text-[#718077]" htmlFor="category-filter">Category</label><select className="min-h-10 max-w-[190px] border border-[#dce3dc] bg-white px-3 text-sm text-[#31483d] outline-none focus:border-[#3e7961]" id="category-filter" onChange={(event) => setCategory(event.target.value)} value={category}><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select><button className="grid size-10 place-items-center border border-[#dce3dc] text-[#607469] transition-colors hover:bg-[#f6f8f5]" onClick={loadProducts} title="Refresh products" type="button"><Icon name="grid" size={17} /></button></div>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-5" role="status"><span className="sr-only">Loading products</span>{Array.from({ length: 5 }, (_, index) => <div className="h-14 animate-pulse bg-[#f0f3ef]" key={index} />)}</div>
        ) : error ? (
          <div className="px-5 py-14 text-center"><span className="mx-auto grid size-11 place-items-center bg-[#fff2ed] text-[#b45b43]"><Icon name="alert" /></span><h3 className="mt-4 text-base font-semibold text-[#284338]">We couldn't load products</h3><p className="mx-auto mt-2 max-w-lg text-sm text-[#718077]">{error}</p><button className="mt-5 min-h-10 bg-[#245443] px-4 text-sm font-semibold text-white hover:bg-[#1c4335]" onClick={loadProducts} type="button">Try again</button></div>
        ) : filteredProducts.length === 0 ? (
          <div className="px-5 py-14 text-center"><span className="mx-auto grid size-11 place-items-center bg-[#edf3ed] text-[#39785e]"><Icon name="box" /></span><h3 className="mt-4 text-base font-semibold text-[#284338]">{products.length ? 'No matching products' : 'Your catalog is empty'}</h3><p className="mx-auto mt-2 max-w-md text-sm text-[#718077]">{products.length ? 'Try a different search or category.' : 'Add a product to begin building the catalog managed by this store.'}</p>{!products.length && <Link className="mt-5 inline-flex min-h-10 items-center gap-2 bg-[#245443] px-4 text-sm font-semibold text-white hover:bg-[#1c4335]" to="/products/add"><Icon name="plus" size={16} />Add first product</Link>}</div>
        ) : <ProductTable onDelete={(product) => { setDeleteError(''); setSelectedProduct(product); }} products={filteredProducts} />}
      </section>

      <ConfirmModal error={deleteError} isDeleting={isDeleting} onCancel={() => setSelectedProduct(null)} onConfirm={handleDelete} product={selectedProduct} />
    </div>
  );
}