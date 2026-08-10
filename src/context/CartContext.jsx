// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user || user.role !== "customer") {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.get("/cart");
      setCart(res.data.data.cart);
    } catch (err) {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (menuItemId, quantity = 1) => {
    const res = await axiosInstance.post("/cart/add", { menuItemId, quantity });
    setCart(res.data.data.cart);
    return res.data;
  };

  const updateCartItem = async (menuItemId, quantity) => {
    const res = await axiosInstance.put("/cart/update", { menuItemId, quantity });
    setCart(res.data.data.cart);
    return res.data;
  };

  const removeCartItem = async (menuItemId) => {
    const res = await axiosInstance.delete(`/cart/remove/${menuItemId}`);
    setCart(res.data.data.cart);
    return res.data;
  };

  const clearCart = async () => {
    const res = await axiosInstance.delete("/cart/clear");
    setCart(res.data.data.cart);
    return res.data;
  };

  return (
    <CartContext.Provider
      value={{ cart, loading, fetchCart, addToCart, updateCartItem, removeCartItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);