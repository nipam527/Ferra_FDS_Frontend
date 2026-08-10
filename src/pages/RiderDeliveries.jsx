// src/pages/RiderDeliveries.jsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function RiderDeliveries() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deliveringId, setDeliveringId] = useState(null);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const watchIdRef = useRef(null);

  const fetchDeliveries = async () => {
    try {
      const res = await axiosInstance.get("/riders/my-deliveries");
      setOrders(res.data.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    return () => stopTracking();
  }, []);

  const startTracking = (orderId) => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser");
      return;
    }

    setTrackingOrderId(orderId);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await axiosInstance.patch("/riders/location", {
            lat: latitude,
            lng: longitude,
          });
        } catch (err) {
          // silent fail on individual location pings — not worth interrupting the rider over
        }
      },
      (err) => {
        setError("Could not access location: " + err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTrackingOrderId(null);
  };

  const handleMarkDelivered = async (orderId) => {
    setDeliveringId(orderId);
    setError("");
    try {
      await axiosInstance.patch(`/riders/${orderId}/deliver`);
      stopTracking();
      fetchDeliveries();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark delivered");
    } finally {
      setDeliveringId(null);
    }
  };

  const activeOrders = orders.filter((o) => o.orderStatus === "out_for_delivery");
  const pastOrders = orders.filter((o) => o.orderStatus === "delivered");

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-orange-600">My Deliveries</h1>
          <Link to="/rider/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-md mb-4">{error}</div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <>
            {activeOrders.length > 0 && (
              <div className="mb-8">
                <h2 className="font-semibold text-gray-700 mb-3">Active</h2>
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div key={order._id} className="bg-white rounded-xl shadow-md p-5">
                      <p className="font-semibold text-gray-800 mb-1">
                        {order.restaurant?.name} → {order.deliveryAddress.city}
                      </p>
                      <p className="text-sm text-gray-500 mb-3">
                        {order.deliveryAddress.street}, {order.deliveryAddress.pincode}
                      </p>

                      {trackingOrderId === order._id ? (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-md p-2 mb-3">
                          <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                          Sharing live location
                        </div>
                      ) : (
                        <button
                          onClick={() => startTracking(order._id)}
                          className="w-full mb-2 bg-gray-800 text-white text-sm font-medium py-2 rounded-md hover:bg-gray-900 transition"
                        >
                          Start Sharing Location
                        </button>
                      )}

                      <button
                        onClick={() => handleMarkDelivered(order._id)}
                        disabled={deliveringId === order._id}
                        className="w-full bg-orange-600 text-white text-sm font-medium py-2 rounded-md hover:bg-orange-700 transition disabled:opacity-50"
                      >
                        {deliveringId === order._id ? "Updating..." : "Mark as Delivered"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="font-semibold text-gray-700 mb-3">Completed</h2>
              {pastOrders.length === 0 ? (
                <p className="text-gray-400 text-sm">No completed deliveries yet.</p>
              ) : (
                <div className="space-y-3">
                  {pastOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {order.restaurant?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Delivered
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RiderDeliveries;