
import { CartTable } from "@/components/CartTable";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

export default function Cart() {
  const navigate = useNavigate();
  const { items, loading } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.Item_Qty, 0);

  return (
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            Shopping Cart
            <span className="text-sm sm:text-base font-normal text-muted-foreground">
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          </h1>
          {!loading && items.length === 0 && (
            <p className="text-muted-foreground mt-1">Your cart is empty</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs sm:text-sm"
            size="sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Continue Shopping
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/order-history')}
            className="flex items-center gap-2 text-xs sm:text-sm"
            size="sm"
          >
            <History className="h-3 w-3 sm:h-4 sm:w-4" />
            Order History
          </Button>
        </div>
      </div>
      {!loading && items.length === 0 ? (
        <div className="rounded-md border p-8 mt-4">
          <div className="flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-4">Add items from the marketplace to get started</p>
            <Button onClick={() => navigate('/')}>Start Shopping</Button>
          </div>
        </div>
      ) : (
        <CartTable />
      )}
    </div>
  );
}
