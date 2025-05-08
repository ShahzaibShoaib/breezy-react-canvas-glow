import { ProductCard, Product } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const ProductGrid = ({ products, loading }: ProductGridProps) => {
  if (loading) {
    return (
      <div className="w-full text-center text-gray-500 py-20">Loading products...</div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full text-center text-gray-500 py-20">No products found.</div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
