import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getAuthHeader } from '@/lib/auth';
import { toast } from '@/components/ui/use-toast';
import { LOGOUT_EVENT } from '@/lib/auth';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

export interface CartItem {
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

export interface AddToCartItem {
  item_name: string;
  item_sku: string;
  item_qty: number;
  status: string;
}

interface CartItemRemove {
  item_name: string;
  item_sku: string;
  item_qty: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: AddToCartItem) => Promise<void>;
  removeFromCart: (item: CartItemRemove) => Promise<void>;
  getCartItems: () => Promise<void>;
  updateCartStatus: (status: string) => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  const clearCart = useCallback(() => {
    setItems([]);
    setLoading(false);
  }, []);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      clearCart();
    };

    window.addEventListener(LOGOUT_EVENT, handleLogout);
    return () => window.removeEventListener(LOGOUT_EVENT, handleLogout);
  }, [clearCart]);

  const getCartItems = useCallback(async () => {
    try {
      setLoading(true);
      const headers = getAuthHeader();
      if (!headers) {
        console.log('Not authenticated, skipping cart fetch');
        setItems([]);
        return;
      }

      const response = await fetch('https://backorder.xclusivetradinginc.cloud/cart/items-A', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          status: 'current'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to fetch cart items');
      }
      
      const data = await response.json();
      if (!data.data) {
        console.log('No cart data in response:', data);
        setItems([]);
        return;
      }
      
      setItems(data.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load cart items",
        variant: "destructive",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Watch for auth state changes
  useEffect(() => {
    if (isAuthenticated && token) {
      getCartItems();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, token, getCartItems]);

  const addToCart = useCallback(async (item: AddToCartItem) => {
    try {
      setLoading(true);
      const headers = getAuthHeader();
      if (!headers) {
        throw new Error('Please log in to add items to cart');
      }

      const response = await fetch('https://backorder.xclusivetradinginc.cloud/cart/add-A', {
        method: 'POST',
        headers,
        body: JSON.stringify(item),
      });

      const data = await response.json();
      
      if (response.status === 308) {
        throw new Error(data.message || 'Failed to add item to cart');
      }
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to add item to cart');
      }

      toast({
        title: "Success",
        description: data.message || 'Item added to cart',
      });
      
      await getCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [getCartItems]);

  const removeFromCart = useCallback(async (item: CartItemRemove) => {
    try {
      setLoading(true);
      const headers = getAuthHeader();
      if (!headers) {
        throw new Error('Please log in to remove items from cart');
      }

      const response = await fetch('https://backorder.xclusivetradinginc.cloud/cart/remove-A', {
        method: 'POST',
        headers,
        body: JSON.stringify(item),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to remove item from cart');
      }

      toast({
        title: "Success",
        description: data.message || 'Item removed from cart',
      });
      
      await getCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove item from cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [getCartItems]);

  const updateCartStatus = useCallback(async (status: string) => {
    try {
      setLoading(true);
      const headers = getAuthHeader();
      if (!headers) {
        throw new Error('Please log in to update cart');
      }

      const response = await fetch('https://backorder.xclusivetradinginc.cloud/cart/order-A', {
        method: 'POST',
        headers,
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update cart status');
      }

      toast({
        title: "Success",
        description: data.message || 'Cart updated successfully',
      });
      
      await getCartItems();
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update cart status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [getCartItems]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, getCartItems, updateCartStatus, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}