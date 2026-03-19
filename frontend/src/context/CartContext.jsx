import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [loading, setLoading] = useState(true); // true until first fetch completes

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      setCartCount(0);
      setCartSubtotal(0);
      return;
    }
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      if (response.data.success) {
        const { items, itemCount, subtotal } = response.data.cart;
        setCartItems(items);
        setCartCount(itemCount);
        setCartSubtotal(subtotal);
      }
    } catch (error) {
      console.error('fetchCart error:', error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Fetch cart when login state changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isLoggedIn) return { success: false, requiresLogin: true };
    try {
      const response = await cartAPI.addToCart(productId, quantity);
      if (response.data.success) {
        await fetchCart();
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to cart',
      };
    }
  }, [isLoggedIn, fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      const response = await cartAPI.updateQuantity(productId, quantity);
      if (response.data.success) await fetchCart();
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (productId) => {
    try {
      const response = await cartAPI.removeItem(productId);
      if (response.data.success) await fetchCart();
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to remove item' };
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      const response = await cartAPI.clearCart();
      if (response.data.success) {
        setCartItems([]);
        setCartCount(0);
        setCartSubtotal(0);
      }
      return response.data;
    } catch (error) {
      return { success: false };
    }
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartSubtotal,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;