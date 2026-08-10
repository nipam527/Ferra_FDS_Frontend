// src/pages/RiderDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import socket from "../api/socket";

function RiderDashboard() {
  const { user, fetchUser } = useAuth();
  const [isOnline, setIsOnline] = useState(user?.riderInfo?.isOnline || false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchAvailableOrders = async () => {
    try {
      const res = await axiosInstance.get("/riders/available-orders");
      setOrders(res.data.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableOrders();

    const handleReady = (order) => {
      // only react if we're online — offline riders shouldn't see new pickups appear
      setIsOnline((currentOnline) => {
        if (currentOnline) {
          setOrders((prev) => {
            const alreadyThere = prev.some((o) => o._id === order._id);
            return alreadyThere ? prev : [...prev, order];
          });
        }
        return currentOnline;
      });
    };

    socket.on("orderReadyForPickup", handleReady);
    return () => socket.off("orderReadyForPickup", handleReady);
  }, []);

  const handleToggleOnline = async () => {
    setTogglingOnline(true);
    setError("");
    try {
      const res = await axiosInstance.patch("/riders/toggle-online");
      setIsOnline(res.data.data.isOnline);
      if (res.data.data.isOnline) {
        fetchAvailableOrders();
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle status");
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleAccept = async (orderId) => {
    setAcceptingId(orderId);
    setError("");
    try {
      await axiosInstance.patch(`/riders/${orderId}/accept`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept delivery");
      fetchAvailableOrders(); // someone else may have already taken it — refresh the real list
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-orange-600">Delivery Dashboard</h1>
          <Link to="/rider/deliveries" className="text-sm text-gray-500 hover:text-gray-700">
            My Deliveries →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Availability</p>
            <p className="text-sm text-gray-500">
              {isOnline ? "You're online and can see new orders" : "You're offline"}
            </p>
          </div>
          <button
            onClick={handleToggleOnline}
            disabled={togglingOnline}
            className={`px-5 py-2 rounded-full font-medium text-sm transition disabled:opacity-50 ${
              isOnline
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            {togglingOnline ? "..." : isOnline ? "Online" : "Offline"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-md mb-4">{error}</div>
        )}

        {!isOnline ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            Go online to see available deliveries.
          </div>
        ) : loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            No deliveries available right now. New ones will appear here automatically.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800">
                    Order #{order._id.slice(-6)}
                  </p>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                    Ready for pickup
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Pickup: {order.restaurant?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {order.restaurant?.address?.street}, {order.restaurant?.address?.city}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Deliver to: {order.deliveryAddress.street}, {order.deliveryAddress.city}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {order.items.length} item(s) · ₹{order.grandTotal}
                </p>

                <button
                  onClick={() => handleAccept(order._id)}
                  disabled={acceptingId === order._id}
                  className="w-full mt-3 bg-orange-600 text-white text-sm font-medium py-2 rounded-md hover:bg-orange-700 transition disabled:opacity-50"
                >
                  {acceptingId === order._id ? "Accepting..." : "Accept Delivery"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RiderDashboard;