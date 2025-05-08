import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { getAuthHeader } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import { LOGOUT_EVENT } from '@/lib/auth';

interface OrderHistoryItem {
  Cart_ID: number;
  User_ID: number;
  Item_Name: string;
  Item_SKU: string;
  Item_Qty: number;
  Order_Time: string;
  Processed_Time: string | null;
  Status: string;
  Price_Per_Item: number;
  Total_Price: number;
}

interface GroupedOrders {
  [key: string]: OrderHistoryItem[];
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);

  const clearOrders = () => {
    setOrders([]);
    setLoading(false);
  };

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      clearOrders();
    };

    window.addEventListener(LOGOUT_EVENT, handleLogout);
    return () => window.removeEventListener(LOGOUT_EVENT, handleLogout);
  }, []);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const headers = getAuthHeader();
        if (!headers) {
          navigate('/auth');
          return;
        }

        const response = await fetch('https://backorder.xclusivetradinginc.cloud/cart/history-A', {
          headers
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order history');
        }

        const data = await response.json();
        // Always set orders to an array (empty if no data)
        setOrders(data.data || []);
      } catch (error) {
        console.error('Error fetching order history:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load order history",
          variant: "destructive"
        });
        // Ensure we set orders to empty array on error
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [navigate]);

  // Calculate total only if there are orders
  const totalAmount = orders.length > 0 
    ? orders.reduce((sum, order) => sum + order.Total_Price, 0)
    : 0;

  // Group orders by exact time - only if we have orders
  const groupedOrders = orders.length > 0 
    ? orders.reduce<GroupedOrders>((groups, order) => {
        const timeKey = format(new Date(order.Order_Time), 'MMM d, yyyy HH:mm');
        if (!groups[timeKey]) {
          groups[timeKey] = [];
        }
        groups[timeKey].push(order);
        return groups;
      }, {})
    : {};

  return (
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            Order History
            <span className="text-sm sm:text-base font-normal text-muted-foreground">
              ({orders.length} {orders.length === 1 ? 'order' : 'orders'})
            </span>
          </h1>
          {!loading && orders.length === 0 && (
            <p className="text-muted-foreground mt-1">No order history found</p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Button>
      </div>

      {loading ? (
        <div className="rounded-md border p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-md border p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No orders found</h3>
            <p className="text-sm text-muted-foreground mb-4">When you place orders, they will appear here</p>
            <Button onClick={() => navigate('/')}>Start Shopping</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {Object.entries(groupedOrders).map(([timeKey, timeOrders]) => (
            <div key={timeKey} className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold border-b pb-2">{timeKey}</h2>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[40%] sm:w-[300px]">Item Name</TableHead>
                      <TableHead className="w-[20%] sm:w-[150px]">SKU</TableHead>
                      <TableHead className="text-right w-[10%] sm:w-[100px]">Qty</TableHead>
                      <TableHead className="text-right w-[15%] sm:w-[120px]">Price</TableHead>
                      <TableHead className="text-right w-[15%] sm:w-[120px]">Total</TableHead>
                      <TableHead className="hidden sm:table-cell w-[120px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeOrders.map((order) => (
                      <TableRow key={`${order.Cart_ID}-${order.Item_SKU}`}>
                        <TableCell className="font-medium">{order.Item_Name}</TableCell>
                        <TableCell>{order.Item_SKU}</TableCell>
                        <TableCell className="text-right">{order.Item_Qty}</TableCell>
                        <TableCell className="text-right">${order.Price_Per_Item.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${order.Total_Price.toFixed(2)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            order.Status === 'processed' 
                              ? 'bg-green-100 text-green-700' 
                              : order.Status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {order.Status.charAt(0).toUpperCase() + order.Status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="sm:hidden">
                      <TableCell colSpan={5} className="py-2">
                        {timeOrders.map((order) => (
                          <div key={`mobile-status-${order.Cart_ID}-${order.Item_SKU}`} className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">{order.Item_SKU}</span>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              order.Status === 'processed' 
                                ? 'bg-green-100 text-green-700' 
                                : order.Status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {order.Status.charAt(0).toUpperCase() + order.Status.slice(1)}
                            </span>
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end items-center gap-2 text-sm">
                <span className="text-muted-foreground">Group Total:</span>
                <span className="font-medium">${timeOrders.reduce((sum, order) => sum + order.Total_Price, 0).toFixed(2)}</span>
              </div>
            </div>
          ))}
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 sm:pt-6 mt-4 sm:mt-6 border-t">
            <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
              * All prices are in USD
            </div>
            <div className="text-right w-full sm:w-auto">
              <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
              <div className="text-xl sm:text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
