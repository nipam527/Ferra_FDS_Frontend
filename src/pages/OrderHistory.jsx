// src/pages/OrderHistory.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAlert } from "../context/AlertContext";

const STATUS_LABELS = {
  placed: "Order placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const CANCELLABLE_STATUSES = ["placed", "accepted"];

// Same window as OrderDetail.jsx — keep these two in sync (or better, move to a shared
// constants file so there's only one place to change it).
// NOTE: this is a UX convenience only — the backend's /orders/:id/cancel route must
// enforce the same window server-side, or someone can cancel late by hitting the API directly.
const CANCEL_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Semantic grouping instead of one color per status — keeps meaning legible.
const STATUS_STYLES = {
  placed: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  accepted: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
  preparing: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
  ready: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
  out_for_delivery: { dot: "bg-violet-500", text: "text-violet-700", bg: "bg-violet-50" },
  delivered: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  rejected: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  cancelled: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
};

function IconBag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20.5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function IconChevronRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 6 6 6-6 6" />
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
function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

const currency = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const OrderHistoryAnimStyles = () => (
  <style>{`
    @keyframes ohFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes ohShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    @keyframes ohDotPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .oh-fade-up { animation: ohFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
    .oh-shimmer {
      background: linear-gradient(90deg, #f5f5f4 25%, #fafaf9 37%, #f5f5f4 63%);
      background-size: 400px 100%;
      animation: ohShimmer 1.4s ease-in-out infinite;
    }
    .oh-dot-live { animation: ohDotPulse 1.6s ease-in-out infinite; }
  `}</style>
);

function OrderHistorySkeleton() {
  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <OrderHistoryAnimStyles />
      <div className="max-w-2xl mx-auto">
        <div className="mb-1.5 h-7 w-32 rounded oh-shimmer" />
        <div className="w-48 h-4 mb-8 rounded oh-shimmer" />
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="p-5 border rounded-2xl border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 rounded w-36 oh-shimmer" />
                <div className="w-20 h-5 rounded-full oh-shimmer" />
              </div>
              <div className="h-3.5 w-24 rounded oh-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  // ticks every 30s so a card's cancel eligibility re-evaluates itself as the
  // window closes, without needing a per-row countdown timer
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get("/orders/my-orders");
        setOrders(res.data.data.orders);
      } catch (err) {
        setError(err.response?.data?.message || "Couldn't load your orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const { toast, confirm } = useAlert();

  const handleCancel = async (e, orderId) => {
    e.preventDefault();
    e.stopPropagation();

    const ok = await confirm({
      title: "Cancel this order?",
      confirmText: "Yes, cancel",
      cancelText: "Keep order",
      variant: "danger",
    });
    if (!ok) return;

    setCancellingId(orderId);
    try {
      await axiosInstance.patch(`/orders/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: "cancelled" } : o))
      );
      toast.success("Order cancelled");
    } catch (err) {
      // covers the case where the window closed server-side since the page loaded
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <OrderHistorySkeleton />;

  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <OrderHistoryAnimStyles />
      <div className="max-w-2xl mx-auto">
        <div className="oh-fade-up mb-7">
          <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">My orders</h1>
          <p className="mt-1 text-[13.5px] text-stone-500">
            {orders.length > 0
              ? `${orders.length} order${orders.length === 1 ? "" : "s"} placed so far`
              : "Track and revisit your past orders"}
          </p>
        </div>

        {error && (
          <div className="oh-fade-up mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="p-8 text-center bg-white border oh-fade-up rounded-2xl border-stone-200" style={{ animationDelay: "60ms" }}>
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-stone-50">
              <IconBag className="w-6 h-6 text-stone-400" />
            </div>
            <h2 className="text-[15px] font-semibold text-stone-900">No orders yet</h2>
            <p className="mt-1.5 text-[13.5px] text-stone-500">
              Once you place an order, it'll show up here.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-2.5 text-[13.5px] font-medium text-white transition-all duration-200 hover:bg-stone-800 hover:scale-[1.03] active:scale-[0.97]"
            >
              Browse restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, idx) => {
              const style = STATUS_STYLES[order.orderStatus] || {
                dot: "bg-stone-400",
                text: "text-stone-600",
                bg: "bg-stone-50",
              };
              const isLive = !["delivered", "rejected", "cancelled"].includes(order.orderStatus);

              // must still be in an early status AND still inside the 15-minute window
              const withinCancelWindow =
                order.createdAt && now - new Date(order.createdAt).getTime() < CANCEL_WINDOW_MS;
              const canCancel = CANCELLABLE_STATUSES.includes(order.orderStatus) && withinCancelWindow;

              return (
                <div key={order._id} className="relative">
                  <Link
                    to={`/orders/${order._id}`}
                    className="block p-5 transition-all duration-200 bg-white border oh-fade-up group rounded-2xl border-stone-200 hover:border-stone-300 hover:shadow-sm"
                    style={{ animationDelay: `${Math.min(idx, 6) * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-stone-900">
                        {order.restaurant?.name}
                      </h2>

                      {/* Status badge + cancel action share one row, side by side — never overlapping */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${style.bg} ${style.text}`}
                        >
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot} ${isLive ? "oh-dot-live" : ""}`} />
                          {STATUS_LABELS[order.orderStatus] || order.orderStatus.replace(/_/g, " ")}
                        </span>

                        {canCancel && (
                          <button
                            onClick={(e) => handleCancel(e, order._id)}
                            disabled={cancellingId === order._id}
                            className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-red-200 bg-white px-2.5 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            {cancellingId === order._id ? (
                              "Cancelling…"
                            ) : (
                              <>
                                <IconX className="w-3 h-3" />
                                Cancel
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[13px] text-stone-500">
                        {order.items.length} item{order.items.length === 1 ? "" : "s"}
                        <span className="mx-1.5 text-stone-300">·</span>
                        <span className="font-medium text-stone-700 tabular-nums">₹{currency(order.grandTotal)}</span>
                      </p>
                      <span className="flex items-center gap-0.5 text-[12px] text-stone-400">
                        <IconClock className="w-3 h-3" />
                        {timeAgo(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
                      <p className="truncate pr-4 text-[12px] text-stone-400">
                        {order.items.slice(0, 3).map((i) => i.name).join(", ")}
                        {order.items.length > 3 ? "…" : ""}
                      </p>
                      <IconChevronRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-stone-500" />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;