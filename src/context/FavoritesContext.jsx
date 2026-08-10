// src/context/FavoritesContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user || user.role !== "customer") {
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.get("/favorites");
      const ids = res.data.data.restaurants.map((r) => r._id);
      setFavoriteIds(new Set(ids));
    } catch (err) {
      setFavoriteIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (restaurantId) => {
    const res = await axiosInstance.patch(`/favorites/${restaurantId}/toggle`);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (res.data.data.isFavorited) {
        next.add(restaurantId);
      } else {
        next.delete(restaurantId);
      }
      return next;
    });
    return res.data.data.isFavorited;
  };

  const isFavorited = (restaurantId) => favoriteIds.has(restaurantId);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, loading, toggleFavorite, isFavorited, fetchFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);