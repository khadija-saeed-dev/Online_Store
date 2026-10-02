import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import ProductForm from '../components/ProductForm.jsx';
import api, { getApiErrorMessage, uploadProductImages } from '../services/api.js';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError('');
    api.get(`/products/${id}`)
      .then((response) => {
        const loadedProduct = response.data?.data;
        if (!loadedProduct || typeof loadedProduct !== 'object') {
          throw new Error('The product API returned an unexpected response. Check VITE_API_URL and try again.');
        }
        if (isCurrent) setProduct(loadedProduct);
      })
      .catch((requestError) => {
        if (isCurrent) setError(getApiErrorMessage(requestError, 'Unable to load this product.'));
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => { isCurrent = false; };
  }, [id]);

  const handleSubmit = async (updatedProduct) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.put(`/products/${id}`, updatedProduct);
      setSuccess('Product updated successfully.');
      window.setTimeout(() => navigate('/products'), 700);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to update this product.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="mx-auto max-w-4xl animate-pulse space-y-4"><div className="h-6 w-32 bg-[#e5eae4]" /><div className="h-12 bg-[#e5eae4]" /><div className="h-72 bg-[#e5eae4]" /></div>;

  return (
    <div className="mx-auto max-w-4xl">
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-[#64756a] hover:text-[#244f40]" to="/products"><Icon className="rotate-180" name="chevron" size={16} />Back to products</Link>
      <div className="mb-7 mt-5"><p className="text-xs font-semibold uppercase text-[#bd684c]">Catalog</p><h2 className="admin-display mt-2 text-3xl font-semibold text-[#203a31]">Edit product</h2><p className="mt-2 text-sm text-[#718077]">Update the details and visibility for this item.</p></div>
      {error && !product ? <div className="border border-[#f1d6cf] bg-white p-6"><p className="text-sm text-[#a3422e]">{error}</p><Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#36745c]" to="/products">Return to products<Icon name="chevron" size={16} /></Link></div> : product && <ProductForm error={error} initialProduct={product} isSubmitting={isSubmitting} onCancel={() => navigate('/products')} onSubmit={handleSubmit} onUpload={uploadProductImages} submitLabel="Save changes" success={success} />}
    </div>
  );
}