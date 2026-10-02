import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, columns = 4 }) {
  const columnClasses = { 2: 'grid-cols-2', 3: 'grid-cols-2 md:grid-cols-3', 4: 'grid-cols-2 lg:grid-cols-4' };
  return <div className={`grid ${columnClasses[columns] || columnClasses[4]} gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10`}>{products.map((product) => <ProductCard key={product._id || product.id} product={product} />)}</div>;
}