// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";
import socket from "../api/socket";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.get("/notifications");
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      // silent — notifications are non-critical to app function
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // join this user's personal socket room and listen for live pushes
  useEffect(() => {
    if (!user) return;

    socket.emit("joinUserRoom", user.id || user._id);

    const handleNew = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("newNotification", handleNew);
    return () => socket.off("newNotification", handleNew);
  }, [user]);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
    } catch (err) {
      // non-critical, no rollback needed for a read-status miss
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await axiosInstance.patch("/notifications/read-all");
    } catch (err) {
      // non-critical
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);