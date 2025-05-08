
import { ProductCard, Product } from "./ProductCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const ProductGrid = ({ products, loading }: ProductGridProps) => {
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="w-full text-center text-gray-500 py-10 sm:py-20">Loading products...</div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full text-center text-gray-500 py-10 sm:py-20">No products found.</div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
