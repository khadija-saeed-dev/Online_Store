import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { getApiErrorMessage } from '../services/api.js';

const emptyProduct = {
  name: '', description: '', price: '', category: '', brand: '', stock: '0', images: [''], ratings: '0', isFeatured: false, isActive: true,
};

function toFormValues(product = {}) {
  return {
    ...emptyProduct,
    ...product,
    price: product.price ?? '',
    stock: product.stock ?? '0',
    ratings: product.ratings ?? '0',
    images: product.images?.length ? product.images : [''],
    isFeatured: product.isFeatured ?? false,
    isActive: product.isActive ?? true,
  };
}

function Field({ label, required = false, hint, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#31483d]">{label}{required && <span className="ml-1 text-[#bf5940">*</span>}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-[#87938c]">{hint}</span>}
    </label>
  );
}

const inputClass = 'min-h-11 w-full border border-[#dce3dc] bg-white px-3 text-sm text-[#294338] outline-none transition-colors placeholder:text-[#9aa59e] focus:border-[#3e7961] focus:ring-2 focus:ring-[#3e7961]/10';

export default function ProductForm({ initialProduct, submitLabel, isSubmitting, error, success, onSubmit, onUpload, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(initialProduct));
  const [existingImages, setExistingImages] = useState(() => initialProduct?.images || []);
  const [newImages, setNewImages] = useState([]);
  const [validationError, setValidationError] = useState('');
  const [imageError, setImageError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const submitLock = useRef(false);
  const previewUrls = useRef(new Set());

  useEffect(() => {
    setValues(toFormValues(initialProduct));
    setExistingImages(initialProduct?.images || []);
  }, [initialProduct]);

  useEffect(() => () => {
    previewUrls.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
  }, []);

  const updateField = (field, value) => setValues((current) => ({ ...current, [field]: value }));
  const handleImageSelection = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = '';
    setImageError('');
    setUploadSuccess('');

    const remainingSlots = 8 - existingImages.length - newImages.length;
    if (remainingSlots <= 0) {
      setImageError('You can add up to 8 images to a product.');
      return;
    }

    const validFiles = [];
    const allowedTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
    for (const file of selectedFiles) {
      const hasAllowedExtension = /\.(jpe?g|png|webp)$/i.test(file.name);
      if (!allowedTypes.has(file.type) || !hasAllowedExtension) {
        setImageError('Only JPG, JPEG, PNG, and WEBP images are allowed.');
      } else if (file.size > 5 * 1024 * 1024) {
        setImageError('Each image must be 5 MB or smaller.');
      } else {
        validFiles.push(file);
      }
    }

    if (selectedFiles.length > remainingSlots) {
      setImageError('You can add up to 8 images to a product.');
    }

    const previews = validFiles.slice(0, remainingSlots).map((file) => {
      const preview = URL.createObjectURL(file);
      previewUrls.current.add(preview);
      return { file, preview };
    });
    setNewImages((current) => [...current, ...previews]);
  };

  const removeNewImage = (preview) => {
    URL.revokeObjectURL(preview);
    previewUrls.current.delete(preview);
    setNewImages((current) => current.filter((image) => image.preview !== preview));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitLock.current || isSubmitting || isUploading) return;

    setValidationError('');
    setImageError('');

    const price = Number(values.price);
    const stock = Number(values.stock);
    const ratings = Number(values.ratings);
    if (!values.name.trim() || !values.description.trim() || !values.category.trim()) {
      setValidationError('Complete all required fields before saving.');
      return;
    }
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0 || !Number.isFinite(ratings) || ratings < 0 || ratings > 5) {
      setValidationError('Enter a valid price, non-negative whole-number stock, and rating from 0 to 5.');
      return;
    }

    submitLock.current = true;
    let finalImages = [...existingImages];

    try {
      if (newImages.length > 0) {
        setIsUploading(true);
        setUploadProgress(0);
        setUploadSuccess('');
        try {
          const uploadedImages = await onUpload(newImages.map((image) => image.file), setUploadProgress);
          const uploadedUrls = uploadedImages.map((image) => image.url).filter((url) => typeof url === 'string' && url.startsWith('https://'));
          if (uploadedUrls.length !== newImages.length) {
            throw new Error('The upload response did not include a secure URL for every image.');
          }
          finalImages = [...existingImages, ...uploadedUrls];
          setExistingImages(finalImages);
          newImages.forEach((image) => {
            URL.revokeObjectURL(image.preview);
            previewUrls.current.delete(image.preview);
          });
          setNewImages([]);
          setUploadSuccess(`${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'image was' : 'images were'} uploaded securely.`);
        } catch (uploadError) {
          setImageError(getApiErrorMessage(uploadError, 'Unable to upload images. Please try again.'));
          return;
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      }

      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim(),
        price,
        category: values.category.trim(),
        brand: values.brand.trim(),
        stock,
        images: finalImages,
        ratings,
        isFeatured: values.isFeatured,
        isActive: values.isActive,
      });
    } finally {
      submitLock.current = false;
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {(validationError || error) && <div className="flex gap-2 border border-[#f1d6cf] bg-[#fff6f3] px-4 py-3 text-sm text-[#a3422e]" role="alert"><Icon className="mt-0.5 shrink-0" name="alert" size={17} />{validationError || error}</div>}
      {imageError && <div className="flex gap-2 border border-[#f1d6cf] bg-[#fff6f3] px-4 py-3 text-sm text-[#a3422e]" role="alert"><Icon className="mt-0.5 shrink-0" name="alert" size={17} />{imageError}</div>}
      {success && <div className="flex gap-2 border border-[#c9e4d5] bg-[#f1faf4] px-4 py-3 text-sm text-[#23745a]" role="status"><Icon className="mt-0.5 shrink-0" name="check" size={17} />{success}</div>}

      <section className="border border-[#e2e8e1] bg-white p-5 sm:p-7">
        <h2 className="text-sm font-semibold text-[#284338]">Product information</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Product name" required><input className={inputClass} maxLength={120} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Everyday carry tote" required value={values.name} /></Field>
          <Field label="Category" required><input className={inputClass} onChange={(event) => updateField('category', event.target.value)} placeholder="e.g. Bags" required value={values.category} /></Field>
          <Field label="Brand"><input className={inputClass} onChange={(event) => updateField('brand', event.target.value)} placeholder="Brand name" value={values.brand} /></Field>
          <Field label="Price" required><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#87938c]">$</span><input className={`${inputClass} pl-7`} min="0" onChange={(event) => updateField('price', event.target.value)} placeholder="0.00" required step="0.01" type="number" value={values.price} /></div></Field>
          <Field label="Stock quantity" required><input className={inputClass} min="0" onChange={(event) => updateField('stock', event.target.value)} required step="1" type="number" value={values.stock} /></Field>
          <Field label="Rating" hint="Optional editorial rating, from 0 to 5"><input className={inputClass} max="5" min="0" onChange={(event) => updateField('ratings', event.target.value)} step="0.1" type="number" value={values.ratings} /></Field>
          <div className="md:col-span-2"><Field label="Description" required><textarea className={`${inputClass} min-h-32 resize-y py-3`} maxLength={2000} onChange={(event) => updateField('description', event.target.value)} placeholder="Describe the product and what makes it useful..." required value={values.description} /></Field></div>
        </div>
      </section>

      <section className="border border-[#e2e8e1] bg-white p-5 sm:p-7">
        <div><h2 className="text-sm font-semibold text-[#284338]">Product images</h2><p className="mt-1 text-xs text-[#87938c]">Choose up to 8 JPG, PNG, or WEBP images. Each file can be up to 5 MB.</p></div>
        <label className="mt-5 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-[#b9c8bd] bg-[#f8faf7] px-4 py-5 text-center transition-colors hover:border-[#478067] hover:bg-[#f2f7f2]">
          <input accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="sr-only" multiple onChange={handleImageSelection} type="file" />
          <span className="grid size-9 place-items-center bg-white text-[#36745c]"><Icon name="image" size={18} /></span>
          <span className="text-sm font-semibold text-[#31584a]">Choose images</span>
          <span className="text-xs text-[#87938c]">Images upload securely when you save the product</span>
        </label>

        {existingImages.length > 0 && <div className="mt-6"><h3 className="text-xs font-semibold uppercase text-[#718077]">Existing images</h3><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{existingImages.map((image, index) => <div className="relative aspect-square overflow-hidden bg-[#edf1ed]" key={`${image}-${index}`}><Icon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#87938c]" name="image" size={22} /><img alt={`Product image ${index + 1}`} className="absolute inset-0 size-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} src={image} /><button aria-label={`Remove existing image ${index + 1}`} className="absolute right-2 top-2 grid size-8 place-items-center bg-white/95 text-[#8c5c51] shadow-sm hover:bg-[#fff2ed]" onClick={() => setExistingImages((current) => current.filter((_, imageIndex) => imageIndex !== index))} type="button"><Icon name="close" size={16} /></button></div>)}</div></div>}

        {newImages.length > 0 && <div className="mt-6"><h3 className="text-xs font-semibold uppercase text-[#718077]">Selected images</h3><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{newImages.map((image, index) => <div className="relative aspect-square overflow-hidden bg-[#edf1ed]" key={`${image.file.name}-${image.file.lastModified}-${index}`}><img alt={`Selected preview ${index + 1}`} className="size-full object-cover" src={image.preview} /><button aria-label={`Remove selected image ${index + 1}`} className="absolute right-2 top-2 grid size-8 place-items-center bg-white/95 text-[#8c5c51] shadow-sm hover:bg-[#fff2ed]" onClick={() => removeNewImage(image.preview)} type="button"><Icon name="close" size={16} /></button></div>)}</div></div>}

        {isUploading && <div className="mt-5" role="status"><div className="mb-2 flex justify-between text-xs text-[#52645a]"><span>Uploading images securely...</span><span>{uploadProgress}%</span></div><div className="h-1.5 overflow-hidden bg-[#e7eee8]"><div className="h-full bg-[#36745c] transition-[width] duration-150" style={{ width: `${uploadProgress}%` }} /></div></div>}
        {uploadSuccess && <p className="mt-4 flex items-center gap-2 text-xs text-[#23745a]" role="status"><Icon name="check" size={15} />{uploadSuccess}</p>}
      </section>

      <section className="border border-[#e2e8e1] bg-white p-5 sm:p-7">
        <h2 className="text-sm font-semibold text-[#284338]">Visibility</h2>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:gap-8">
          <label className="flex cursor-pointer items-start gap-3"><input checked={values.isFeatured} className="mt-1 size-4 accent-[#36745c]" onChange={(event) => updateField('isFeatured', event.target.checked)} type="checkbox" /><span><span className="block text-sm font-medium text-[#31483d]">Featured product</span><span className="mt-1 block text-xs text-[#87938c]">Highlight this item in featured collections.</span></span></label>
          <label className="flex cursor-pointer items-start gap-3"><input checked={values.isActive} className="mt-1 size-4 accent-[#36745c]" onChange={(event) => updateField('isActive', event.target.checked)} type="checkbox" /><span><span className="block text-sm font-medium text-[#31483d]">Active listing</span><span className="mt-1 block text-xs text-[#87938c]">Allow this item to appear in the customer store.</span></span></label>
        </div>
      </section>

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button className="min-h-11 border border-[#dce3dc] bg-white px-5 text-sm font-semibold text-[#52645a] transition-colors hover:bg-[#f6f8f5] disabled:opacity-50" disabled={isUploading || isSubmitting} onClick={onCancel} type="button">Cancel</button>
        <button className="min-h-11 bg-[#245443] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1c4335] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting || isUploading} type="submit">{isUploading ? 'Uploading images...' : isSubmitting ? 'Saving...' : submitLabel}</button>
      </div>
    </form>
  );
}