
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

export function CartTable() {
  const { items, loading, removeFromCart, updateCartStatus } = useCart();
  const isMobile = useIsMobile();

  const handleRemove = async (item: { Item_Name: string; Item_SKU: string; Item_Qty: number }) => {
    await removeFromCart({
      item_name: item.Item_Name,
      item_sku: item.Item_SKU,
      item_qty: item.Item_Qty
    });
  };

  const handleCheckout = async () => {
    await updateCartStatus('processed');
  };

  const totalAmount = items.reduce((sum, item) => sum + item.Total_Price, 0);

  if (loading) {
    return (
      <div className="rounded-md border p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground mb-4">Items added to your cart will appear here</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    // Mobile view - card-based layout
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.Cart_ID} className="border rounded-md p-4 space-y-3">
            <div className="flex justify-between">
              <h3 className="font-medium text-base">{item.Item_Name}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(item)}
                disabled={loading}
                title="Remove from cart"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">SKU:</span>
              <span>{item.Item_SKU}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity:</span>
              <span>{item.Item_Qty}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price:</span>
              <span>${item.Price_Per_Item.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm font-medium">
              <span>Total:</span>
              <span>${item.Total_Price.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Time:</span>
              <span>{format(new Date(item.Order_Time), 'MMM d, yyyy HH:mm')}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="capitalize">{item.Status}</span>
            </div>
          </div>
        ))}
        
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between font-medium text-lg mb-4">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground mb-2">
              * Prices are shown in USD
            </div>
            <Button 
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Proceed to Checkout'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view - table layout
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Order Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.Cart_ID}>
                <TableCell>{item.Item_Name}</TableCell>
                <TableCell>{item.Item_SKU}</TableCell>
                <TableCell className="text-right">{item.Item_Qty}</TableCell>
                <TableCell className="text-right">${item.Price_Per_Item.toFixed(2)}</TableCell>
                <TableCell className="text-right">${item.Total_Price.toFixed(2)}</TableCell>
                <TableCell>{format(new Date(item.Order_Time), 'MMM d, yyyy HH:mm')}</TableCell>
                <TableCell className="capitalize">{item.Status}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(item)}
                    disabled={loading}
                    title="Remove from cart"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>Total</TableCell>
              <TableCell className="text-right font-bold">${totalAmount.toFixed(2)}</TableCell>
              <TableCell colSpan={3} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          * Prices are shown in USD
        </div>
        <Button 
          onClick={handleCheckout}
          disabled={loading || items.length === 0}
          className="min-w-[200px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            'Proceed to Checkout'
          )}
        </Button>
      </div>
    </div>
  );
}
