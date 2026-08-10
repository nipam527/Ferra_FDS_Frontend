// src/pages/VendorOrders.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import socket from "../api/socket";
import OrderChat from "../components/OrderChat";

// Semantic grouping instead of one color per status — same convention as OrderHistory.jsx
// so a vendor and a customer read order state the same way.
const STATUS_STYLES = {
  placed: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  accepted: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
  preparing: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
  ready: { dot: "bg-violet-500", text: "text-violet-700", bg: "bg-violet-50" },
  out_for_delivery: { dot: "bg-violet-500", text: "text-violet-700", bg: "bg-violet-50" },
  delivered: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  rejected: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  cancelled: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
};

// orders where a chat session is still meaningful — matches the backend's
// activeStatuses check in messageController.js's sendMessage
const ACTIVE_STATUSES = ["placed", "accepted", "preparing", "ready", "out_for_delivery"];

// what action buttons to show for each current status — amber as the primary action
// color, matching the accent used for icons/graph on the Analytics page.
const NEXT_ACTIONS = {
  placed: [
    { label: "Accept", value: "accepted", variant: "primary" },
    { label: "Reject", value: "rejected", variant: "danger" },
  ],
  accepted: [{ label: "Start Preparing", value: "preparing", variant: "primary" }],
  preparing: [{ label: "Mark Ready", value: "ready", variant: "primary" }],
};

const ACTION_STYLES = {
  primary: "bg-amber-600 text-white hover:bg-amber-700",
  danger: "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
};

function IconInbox(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12h4l2 3h4l2-3h4" />
      <path d="M5.5 5h13l2.5 7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6l2.5-7Z" />
    </svg>
  );
}
function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
  );
}
function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}
function IconCash(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.7" />
    </svg>
  );
}
function IconUpi(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12 12 4l8 8-8 8-8-8Z" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  );
}

const currency = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

const VendorOrdersAnimStyles = () => (
  <style>{`
    @keyframes voFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes voPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    @keyframes voShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    .vo-fade-up { animation: voFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
    .vo-dot-live { animation: voPulse 1.6s ease-in-out infinite; }
    .vo-shimmer {
      background: linear-gradient(90deg, #f5f5f4 25%, #fafaf9 37%, #f5f5f4 63%);
      background-size: 400px 100%;
      animation: voShimmer 1.4s ease-in-out infinite;
    }
  `}</style>
);

function VendorOrdersSkeleton() {
  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <VendorOrdersAnimStyles />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="h-8 mb-2 rounded w-44 vo-shimmer" />
            <div className="w-56 h-4 rounded vo-shimmer" />
          </div>
          <div className="w-16 h-4 rounded vo-shimmer" />
        </div>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-6 bg-white border shadow-sm rounded-2xl border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-32 h-4 rounded vo-shimmer" />
                <div className="w-20 h-5 rounded-full vo-shimmer" />
              </div>
              <div className="h-3.5 w-48 rounded vo-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VendorOrders() {
  const { restaurantId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [justArrivedIds, setJustArrivedIds] = useState(new Set());

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get(`/orders/restaurant/${restaurantId}`);
      setOrders(res.data.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    socket.emit("joinRestaurantRoom", restaurantId);

    const handleNewOrder = (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      // flag it so it gets a brief highlight, then clear the flag after the highlight plays
      setJustArrivedIds((prev) => new Set(prev).add(newOrder._id));
      setTimeout(() => {
        setJustArrivedIds((prev) => {
          const next = new Set(prev);
          next.delete(newOrder._id);
          return next;
        });
      }, 2500);
    };

    socket.on("newOrder", handleNewOrder);

    return () => {
      socket.off("newOrder", handleNewOrder);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const handleStatusUpdate = async (orderId, status, reason = "") => {
    setError("");
    setUpdatingId(orderId);
    try {
      await axiosInstance.patch(`/orders/${orderId}/status`, {
        status,
        rejectionReason: reason,
      });
      await fetchOrders();
      setRejectingId(null);
      setRejectionReason("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <VendorOrdersSkeleton />;

  const activeCount = orders.filter((o) =>
    ["placed", "accepted", "preparing"].includes(o.orderStatus)
  ).length;

  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <VendorOrdersAnimStyles />
      <div className="max-w-3xl mx-auto">
        {/* Header — title + subtitle left, "← Back" link top-right, matching the
            Analytics page's header layout exactly. */}
        <div className="flex items-start justify-between mb-8 vo-fade-up">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-stone-900">Incoming orders</h1>
            <p className="mt-1 text-[14px] text-stone-500">
              {orders.length > 0
                ? `${activeCount} awaiting action · ${orders.length} total`
                : "New orders will appear here in real time"}
            </p>
          </div>
          <Link
            to="/vendor/dashboard"
            className="shrink-0 text-[14px] text-stone-500 transition-colors hover:text-stone-800"
          >
            ← Back
          </Link>
        </div>

        {error && (
          <div className="vo-fade-up mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="p-10 text-center bg-white border shadow-sm vo-fade-up rounded-2xl border-stone-200" style={{ animationDelay: "60ms" }}>
            <div className="flex items-center justify-center mx-auto mb-4 h-14 w-14 rounded-2xl bg-amber-50">
              <IconInbox className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-[15px] font-semibold text-stone-900">No orders yet</h2>
            <p className="mt-1.5 text-[13.5px] text-stone-500">
              You'll get a live notification the moment one comes in.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => {
              const style = STATUS_STYLES[order.orderStatus] || {
                dot: "bg-stone-400",
                text: "text-stone-600",
                bg: "bg-stone-50",
              };
              const isLive = !["delivered", "rejected", "cancelled"].includes(order.orderStatus);
              const isNew = justArrivedIds.has(order._id);
              const isChatActive = ACTIVE_STATUSES.includes(order.orderStatus);

              return (
                <div
                  key={order._id}
                  className={[
                    "vo-fade-up rounded-2xl border bg-white p-6 shadow-sm transition-all duration-500",
                    isNew ? "border-amber-300 shadow-md shadow-amber-900/[0.08]" : "border-stone-200",
                  ].join(" ")}
                  style={{ animationDelay: `${Math.min(idx, 6) * 40}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[15px] font-semibold text-stone-900">
                          Order #{order._id.slice(-6)}
                        </p>
                        {isNew && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-[12px] text-stone-400">
                        <IconClock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <span
                      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${style.bg} ${style.text}`}
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot} ${isLive ? "vo-dot-live" : ""}`} />
                      {order.orderStatus.replace(/_/g, " ")}
                    </span>
                  </div>

                  <p className="mt-3 flex items-center gap-1.5 text-[13px] text-stone-500">
                    <IconUser className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                    {order.customer?.name || "Customer"}
                    {order.customer?.phone && (
                      <>
                        <span className="text-stone-300">·</span>
                        {order.customer.phone}
                      </>
                    )}
                  </p>

                  <div className="mt-3 space-y-1.5 border-t border-stone-100 pt-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-[13px] text-stone-600">
                        <span>
                          {item.name} <span className="text-stone-400">× {item.quantity}</span>
                        </span>
                        <span className="tabular-nums text-stone-800">₹{currency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-stone-100 pt-2.5 text-[14px] font-semibold text-stone-900">
                    <span>Total</span>
                    <span className="tabular-nums">₹{currency(order.grandTotal)}</span>
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-[12px] text-stone-400">
                    {order.paymentMethod === "upi" ? (
                      <IconUpi className="h-3.5 w-3.5" />
                    ) : (
                      <IconCash className="h-3.5 w-3.5" />
                    )}
                    {order.paymentMethod === "upi" ? "UPI" : "Cash on delivery"}
                    <span className="text-stone-300">·</span>
                    <span className="capitalize">{order.paymentStatus}</span>
                  </p>

                  {/* chat + action buttons */}
                  <div className="flex items-center justify-between gap-2 mt-4">
                    <OrderChat orderId={order._id} isActive={isChatActive} />
                  </div>

                  {NEXT_ACTIONS[order.orderStatus] && rejectingId !== order._id && (
                    <div className="flex gap-2 mt-3">
                      {NEXT_ACTIONS[order.orderStatus].map((action) => (
                        <button
                          key={action.value}
                          disabled={updatingId === order._id}
                          onClick={() => {
                            if (action.value === "rejected") {
                              setRejectingId(order._id);
                            } else {
                              handleStatusUpdate(order._id, action.value);
                            }
                          }}
                          className={`flex-1 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors disabled:opacity-50 ${ACTION_STYLES[action.variant]}`}
                        >
                          {updatingId === order._id ? "Updating…" : action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* rejection reason input */}
                  {rejectingId === order._id && (
                    <div className="mt-3 space-y-2.5 rounded-xl border border-red-100 bg-red-50/50 p-3.5">
                      <input
                        type="text"
                        placeholder="Reason for rejection (optional)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(order._id, "rejected", rejectionReason)}
                          disabled={updatingId === order._id}
                          className="flex-1 rounded-full bg-red-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                        >
                          {updatingId === order._id ? "Rejecting…" : "Confirm reject"}
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason("");
                          }}
                          className="rounded-full px-4 py-2 text-[13px] font-medium text-stone-500 transition-colors hover:bg-white hover:text-stone-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorOrders;