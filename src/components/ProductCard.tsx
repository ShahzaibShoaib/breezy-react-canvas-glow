import { useState } from 'react';
import { Loader2, Minus, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatDisplayText } from "@/lib/utils";
import PlaceholderImage from "./PlaceholderImage";
import { useCart } from "@/contexts/CartContext";

export type Product = {
  id: string;
  Brand: string;
  ItemName: string;
  SKU: string;
  UPC: string;
  MSRP: string;
  Price: string;
  ImageLink: string;
  Size: string;
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, loading: cartLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(prev + 1, 99));
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    const cartItem = {
      item_name: product.ItemName,
      item_sku: product.SKU,
      item_qty: quantity,
      status: 'current'
    };
    await addToCart(cartItem);
    setIsAddingToCart(false);
    setQuantity(1); // Reset quantity after adding to cart
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col">
      {product.ImageLink ? (
        <img
          src={product.ImageLink}
          alt={product.ItemName}
          className="w-full h-28 sm:h-40 object-cover bg-gray-200"
        />
      ) : (
        <PlaceholderImage className="h-28 sm:h-40" />
      )}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="font-semibold text-base sm:text-lg text-gray-800 line-clamp-2">{product.ItemName}</div>
          {product.Size && (
            <div className="text-xs sm:text-sm font-semibold text-primary mt-1 sm:mt-2">Type: {formatDisplayText(product.Size)}</div>
          )}
          <div className="text-xs sm:text-sm text-gray-500 mt-1">Brand: {formatDisplayText(product.Brand)}</div>
          <div className="text-xs text-gray-400 mt-1">SKU: {product.SKU}</div>
          <div className="text-xs text-gray-400">UPC: {product.UPC}</div>
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <div className="text-gray-900 font-bold text-base sm:text-lg">{product.Price}</div>
          <div className="text-xs sm:text-sm text-gray-500">SRP: {product.MSRP}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center border rounded-md">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={handleDecrement}
                disabled={quantity <= 1 || cartLoading || isAddingToCart}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 sm:w-8 text-center text-xs sm:text-sm">{quantity}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={handleIncrement}
                disabled={quantity >= 99 || cartLoading || isAddingToCart}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Button 
              className="flex-1 text-xs sm:text-sm py-1 px-2 h-7 sm:h-auto"
              onClick={handleAddToCart}
              disabled={cartLoading || isAddingToCart}
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
                  Adding...
                </>
              ) : (
                'Add to Cart'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
