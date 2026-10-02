import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import ProductForm from '../components/ProductForm.jsx';
import api, { getApiErrorMessage, uploadProductImages } from '../services/api.js';

export default function AddProduct() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (product) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/products', product);
      setSuccess('Product created successfully.');
      window.setTimeout(() => navigate('/products'), 700);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to create this product.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-[#64756a] hover:text-[#244f40]" to="/products"><Icon className="rotate-180" name="chevron" size={16} />Back to products</Link>
      <div className="mb-7 mt-5"><p className="text-xs font-semibold uppercase text-[#bd684c]">Catalog</p><h2 className="admin-display mt-2 text-3xl font-semibold text-[#203a31]">Add product</h2><p className="mt-2 text-sm text-[#718077]">Add an item to your customer-facing catalog.</p></div>
      <ProductForm error={error} isSubmitting={isSubmitting} onCancel={() => navigate('/products')} onSubmit={handleSubmit} onUpload={uploadProductImages} submitLabel="Create product" success={success} />
    </div>
  );
}