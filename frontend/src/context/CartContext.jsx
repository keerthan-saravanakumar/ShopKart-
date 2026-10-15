import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [mutationLoading, setMutationLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    setCartLoading(true);
    setCartError("");
    try {
      const response = await api.get("/cart");
      setCartItems(response.data.cart || []);
      return response.data.cart || [];
    } catch (error) {
      setCartError(error.response?.status === 401 ? "Please sign in to view your cart." : (error.response?.data?.message || "Unable to load your cart."));
      setCartItems([]);
      throw error;
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => { refreshCart().catch(() => {}); }, [refreshCart]);

  const runCartMutation = useCallback(async (request) => {
    setMutationLoading(true);
    setCartError("");
    setMutationError("");
    try {
      const response = await request();
      setCartItems(response.data.cart || []);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Unable to update your cart. Please try again.";
      setMutationError(message);
      throw error;
    } finally {
      setMutationLoading(false);
    }
  }, []);

  const addToCart = useCallback((productId) => runCartMutation(() => api.post(`/cart/${productId}`)), [runCartMutation]);
  const updateQuantity = useCallback((productId, quantity) => runCartMutation(() => api.patch(`/cart/${productId}`, { quantity })), [runCartMutation]);
  const removeFromCart = useCallback((productId) => runCartMutation(() => api.delete(`/cart/${productId}`)), [runCartMutation]);
  const clearCartState = useCallback(() => { setCartItems([]); setCartError(""); setMutationError(""); }, []);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0), [cartItems]);

  const value = useMemo(() => ({
    cartItems, cartLoading, cartError, mutationError, mutationLoading, cartCount, subtotal,
    refreshCart, addToCart, updateQuantity, removeFromCart, clearCartState, setCartError
  }), [cartItems, cartLoading, cartError, mutationError, mutationLoading, cartCount, subtotal, refreshCart, addToCart, updateQuantity, removeFromCart, clearCartState]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
