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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Shopping Cart
            <span className="text-base font-normal text-muted-foreground">
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          </h1>
          {!loading && items.length === 0 && (
            <p className="text-muted-foreground mt-1">Your cart is empty</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/order-history')}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Order History
          </Button>
        </div>
      </div>
      <CartTable />
    </div>
  );
}