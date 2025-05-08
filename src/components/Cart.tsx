
import React from 'react';
import { ShoppingCart, Loader2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export function Cart() {
  const { items, removeFromCart, loading, updateCartStatus } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const totalItems = items.reduce((sum, item) => sum + item.Item_Qty, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.Total_Price, 0);

  const handleCheckout = async () => {
    await updateCartStatus('processed');
    setIsOpen(false); // Close sheet after successful checkout
  };

  const handleRemoveFromCart = async (item: typeof items[0]) => {
    await removeFromCart({
      item_name: item.Item_Name,
      item_sku: item.Item_SKU,
      item_qty: item.Item_Qty
    });
  };

  const navigateToOrderHistory = () => {
    setIsOpen(false);
    navigate('/order-history');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg p-3 sm:p-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Shopping Cart
            <span className="text-sm text-muted-foreground">
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <ShoppingCart className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-muted-foreground mb-1">Your cart is empty</span>
              <span className="text-xs text-muted-foreground mb-4">Add items from the marketplace to get started</span>
              <Button 
                variant="secondary"
                className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm" 
                onClick={navigateToOrderHistory}
              >
                <History className="h-3 w-3 sm:h-4 sm:w-4" />
                View Order History
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.Item_SKU}
                  className="flex items-center justify-between space-x-4 border-b border-border pb-4"
                >
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-semibold line-clamp-2">{item.Item_Name}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">SKU: {item.Item_SKU}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm text-muted-foreground">Qty: {item.Item_Qty}</p>
                      <span className="text-xs sm:text-sm text-muted-foreground">•</span>
                      <p className="text-xs sm:text-sm text-muted-foreground">${item.Price_Per_Item.toFixed(2)} each</p>
                    </div>
                    <p className="text-xs sm:text-sm font-medium">Total: ${item.Total_Price.toFixed(2)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromCart(item)}
                    disabled={loading}
                    className="shrink-0 h-8 text-xs sm:text-sm"
                  >
                    {loading ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : 'Remove'}
                  </Button>
                </div>
              ))}
              <div className="pt-4 sticky bottom-0 bg-background border-t border-border">
                <div className="flex justify-between items-center mb-4 text-xs sm:text-sm">
                  <span className="font-medium">Cart Total:</span>
                  <span className="font-bold">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <Button 
                    className="w-full text-xs sm:text-sm py-1 h-8 sm:h-10" 
                    onClick={handleCheckout}
                    disabled={loading || items.length === 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Checkout'
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full text-xs sm:text-sm py-1 h-8 sm:h-10" 
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/cart');
                    }}
                    disabled={loading}
                  >
                    View Cart
                  </Button>
                  <Button 
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-1 h-8 sm:h-10" 
                    onClick={navigateToOrderHistory}
                  >
                    <History className="h-3 w-3 sm:h-4 sm:w-4" />
                    Order History
                  </Button>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
