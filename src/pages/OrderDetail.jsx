// src/pages/OrderDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import socket from "../api/socket";
import TrackingMap from "../components/TrackingMap";
import { useAlert } from "../context/AlertContext";
import ReviewForm from "../components/ReviewForm";
import OrderChat from "../components/OrderChat";
import EditOrderForm from "../components/EditOrderForm";


const STATUS_LABELS = {
  placed: "Order Placed",
  accepted: "Accepted by Restaurant",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const FLOW_STEPS = ["placed", "accepted", "preparing", "out_for_delivery", "delivered"];
const TERMINAL_NEGATIVE = ["rejected", "cancelled"];

// How long after placing an order the customer is allowed to cancel it.
// NOTE: this is a UX convenience only — the backend's /orders/:id/cancel route must
// enforce the same window server-side, or someone can cancel late by hitting the API directly.
const CANCEL_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
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
function IconPin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
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
function IconArrowRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

// mm:ss formatter for the cancel countdown
const formatCountdown = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const OrderAnimStyles = () => (
  <style>{`
    @keyframes odFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes odCheckPop {
      0% { opacity: 0; transform: scale(0.4); }
      60% { opacity: 1; transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    @keyframes odDotPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(217,119,6,0.35); }
      50% { box-shadow: 0 0 0 6px rgba(217,119,6,0); }
    }
    @keyframes odShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    .od-fade-up { animation: odFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
    .od-check-pop { animation: odCheckPop 0.55s cubic-bezier(0.34,1.56,0.64,1); }
    .od-dot-pulse { animation: odDotPulse 1.8s ease-out infinite; }
    .od-shimmer {
      background: linear-gradient(90deg, #f5f5f4 25%, #fafaf9 37%, #f5f5f4 63%);
      background-size: 400px 100%;
      animation: odShimmer 1.4s ease-in-out infinite;
    }
  `}</style>
);

function OrderDetailSkeleton() {
  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <OrderAnimStyles />
      <div className="max-w-xl p-8 mx-auto border rounded-2xl border-stone-200">
        <div className="mx-auto mb-3 rounded-full h-14 w-14 od-shimmer" />
        <div className="w-48 h-5 mx-auto mb-2 rounded od-shimmer" />
        <div className="mx-auto mb-6 h-3.5 w-32 rounded od-shimmer" />
        <div className="h-16 mb-6 rounded-xl od-shimmer" />
        <div className="space-y-2.5">
          <div className="w-full h-4 rounded od-shimmer" />
          <div className="w-5/6 h-4 rounded od-shimmer" />
          <div className="w-4/6 h-4 rounded od-shimmer" />
        </div>
      </div>
    </div>
  );
}

function StatusTimeline({ status }) {
  if (TERMINAL_NEGATIVE.includes(status)) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
        <span className="flex items-center justify-center w-8 h-8 text-red-600 bg-red-100 rounded-full shrink-0">
          <IconX className="w-4 h-4" />
        </span>
        <div>
          <p className="text-[13.5px] font-medium text-red-700">
            {STATUS_LABELS[status] || status}
          </p>
          <p className="text-[12px] text-red-500">This order will not be delivered.</p>
        </div>
      </div>
    );
  }

  const currentIdx = FLOW_STEPS.indexOf(status);

  return (
    <div className="flex items-start">
      {FLOW_STEPS.map((step, idx) => {
        const isDone = currentIdx > idx || (currentIdx === FLOW_STEPS.length - 1 && idx === currentIdx);
        const isCurrent = idx === currentIdx && idx !== FLOW_STEPS.length - 1;
        const isLast = idx === FLOW_STEPS.length - 1;

        return (
          <div key={step} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center">
              <span
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
                  isDone || (isLast && currentIdx === idx)
                    ? "bg-amber-600 text-white"
                    : isCurrent
                    ? "bg-white text-amber-600 ring-2 ring-amber-500"
                    : "bg-stone-100 text-stone-300",
                ].join(" ")}
              >
                {isDone ? (
                  <IconCheck className="w-3 h-3" />
                ) : (
                  <span className={`h-1.5 w-1.5 rounded-full bg-current ${isCurrent ? "od-dot-pulse" : ""}`} />
                )}
              </span>
              <span
                className={[
                  "mt-2 hidden w-16 text-center text-[10.5px] font-medium leading-tight sm:block",
                  isDone || isCurrent ? "text-stone-700" : "text-stone-300",
                ].join(" ")}
              >
                {STATUS_LABELS[step].replace(" by restaurant", "")}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mx-1 h-[2px] flex-1 rounded-full transition-colors duration-500 ${
                  currentIdx > idx ? "bg-amber-600" : "bg-stone-100"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [riderPosition, setRiderPosition] = useState(null);
  const [reviewStatus, setReviewStatus] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [cancelSecondsLeft, setCancelSecondsLeft] = useState(null);
const [showEditForm, setShowEditForm] = useState(false); // add this
  

const canEdit =
  ["placed", "accepted"].includes(order?.orderStatus) &&
  order?.paymentStatus !== "paid" && // block editing paid UPI orders
  cancelSecondsLeft !== null &&
  cancelSecondsLeft > 0;

  
  // initial fetch
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axiosInstance.get(`/orders/${id}`);
        setOrder(res.data.data.order);
      } catch (err) {
        setError(err.response?.data?.message || "Couldn't load this order.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // seed the map's rider marker from the order's last-known location, once the order loads
  useEffect(() => {
    if (order?.rider?.riderInfo?.currentLocation?.lat) {
      setRiderPosition(order.rider.riderInfo.currentLocation);
    }
  }, [order?.rider]);

  // check review status once the order is delivered — its own top-level effect
  useEffect(() => {
    const checkReview = async () => {
      if (order?.orderStatus === "delivered") {
        try {
          const res = await axiosInstance.get(`/reviews/order/${id}/status`);
          setReviewStatus(res.data.data);
        } catch (err) {
          // non-critical — just won't show the review prompt
        }
      }
    };
    checkReview();
  }, [order?.orderStatus, id]);

  // live updates via Socket.IO — status changes + rider location pings
  useEffect(() => {
    socket.emit("joinOrderRoom", id);

    const handleStatusUpdate = (data) => {
      if (data.orderId !== id) return;
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              orderStatus: data.orderStatus,
              paymentStatus: data.paymentStatus,
              rejectionReason: data.rejectionReason,
            }
          : prev
      );
    };

    const handleRiderLocation = (data) => {
      if (data.orderId !== id) return;
      setRiderPosition({ lat: data.lat, lng: data.lng });
    };

    socket.on("orderStatusUpdated", handleStatusUpdate);
    socket.on("riderLocationUpdated", handleRiderLocation);

    return () => {
      socket.off("orderStatusUpdated", handleStatusUpdate);
      socket.off("riderLocationUpdated", handleRiderLocation);
    };
  }, [id]);

  // countdown for the cancel window — ticks every second while cancellation is still possible
  useEffect(() => {
    if (!order?.createdAt || !["placed", "accepted"].includes(order?.orderStatus)) {
      setCancelSecondsLeft(null);
      return;
    }

    const deadline = new Date(order.createdAt).getTime() + CANCEL_WINDOW_MS;

    const tick = () => {
      const secondsLeft = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setCancelSecondsLeft(secondsLeft);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order?.createdAt, order?.orderStatus]);

  const { toast, confirm } = useAlert();

  const handleCancel = async () => {
    const ok = await confirm({
      title: "Cancel this order?",
      message: "This action can't be undone.",
      confirmText: "Yes, cancel",
      cancelText: "Keep order",
      variant: "danger",
    });
    if (!ok) return;

    setCancelling(true);
    setCancelError("");
    try {
      const res = await axiosInstance.patch(`/orders/${id}/cancel`);
      setOrder(res.data.data.order);
      toast.success("Order cancelled");
    } catch (err) {
      // if the window closed server-side between page load and click, surface that clearly
      setCancelError(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleEditSubmit = async (updatedItems) => {
  try {
    const res = await axiosInstance.patch(`/orders/${id}/edit`, {
      items: updatedItems.map(i => ({ menuItem: i.menuItem, quantity: i.quantity })),
    });
    setOrder(res.data.data.order);
    setShowEditForm(false);
    toast.success("Order updated");
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to update order");
  }
};

  // order must still be in an early stage AND still within the cancel window
  const canCancel =
    ["placed", "accepted"].includes(order?.orderStatus) &&
    cancelSecondsLeft !== null &&
    cancelSecondsLeft > 0;

  // window has run out, but status hasn't moved past placed/accepted yet
  const cancelWindowExpired =
    ["placed", "accepted"].includes(order?.orderStatus) && cancelSecondsLeft === 0;

  if (loading) return <OrderDetailSkeleton />;

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-white">
        <OrderAnimStyles />
        <div className="w-full max-w-sm p-8 text-center bg-white border shadow-sm od-fade-up rounded-2xl border-stone-200">
          <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-red-50">
            <IconX className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-[15px] font-semibold text-stone-900">
            {error || "Order not found"}
          </h1>
          <Link
            to="/orders"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-stone-800"
          >
            View all orders
          </Link>
        </div>
      </div>
    );
  }

  const isRejectedOrCancelled = TERMINAL_NEGATIVE.includes(order.orderStatus);

  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <OrderAnimStyles />
      <div className="max-w-xl mx-auto">
        <div className="overflow-hidden bg-white border od-fade-up rounded-2xl border-stone-200">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div
              className={`od-check-pop mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
                isRejectedOrCancelled ? "bg-red-50" : "bg-green-50"
              }`}
            >
              {isRejectedOrCancelled ? (
                <IconX className="w-6 h-6 text-red-500" />
              ) : (
                <IconCheck className="w-6 h-6 text-green-600" />
              )}
            </div>
            <h1 className="text-[17px] font-semibold text-stone-900">
              {isRejectedOrCancelled ? "Order not fulfilled" : "Order placed successfully"}
            </h1>
            <p className="mt-1 font-mono text-[12px] text-stone-400">#{order._id}</p>
              {!["rejected", "cancelled"].includes(order.orderStatus) && (
    <div className="flex justify-center mt-4">
      <OrderChat
        orderId={order._id}
        isActive={["placed", "accepted", "preparing", "ready", "out_for_delivery"].includes(order.orderStatus)}
      />
    </div>
  )}
          </div>

          {/* Status timeline */}
          <div className="px-8 py-6 border-t border-stone-100">
            <StatusTimeline status={order.orderStatus} />
          </div>

          {isRejectedOrCancelled && order.rejectionReason && (
            <div className="px-8 py-4 border-t border-stone-100">
              <p className="text-[13px] text-red-600">Reason: {order.rejectionReason}</p>
            </div>
          )}

          {/* Live tracking map */}
          {order.orderStatus === "out_for_delivery" && (
            <div className="px-8 py-6 border-t border-stone-100">
              <p className="mb-3 text-[12.5px] font-medium text-stone-600">Live tracking</p>
              <TrackingMap
                restaurantCoords={order.restaurant?.address}
                deliveryCoords={order.deliveryAddress}
                riderCoords={riderPosition}
              />
            </div>
          )}

          {/* Items */}
          <div className="px-8 py-6 border-t border-stone-100">
            <h2 className="mb-3 text-[13.5px] font-semibold text-stone-900">{order.restaurant?.name}</h2>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[13.5px]">
                  <span className="text-stone-600">
                    {item.name} <span className="text-stone-400">× {item.quantity}</span>
                  </span>
                  <span className="tabular-nums text-stone-800">₹{currency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="px-8 py-6 border-t border-stone-100">
            <div className="space-y-1.5 text-[13.5px]">
              <div className="flex justify-between text-stone-500">
                <span>Items total</span>
                <span className="tabular-nums">₹{currency(order.itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Delivery fee</span>
                <span className="tabular-nums">₹{currency(order.deliveryFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponApplied && `(${order.couponApplied})`}</span>
                  <span className="tabular-nums">-₹{currency(order.discount)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-stone-100 pt-2.5 text-[15px] font-semibold text-stone-900">
                <span>Grand total</span>
                <span className="tabular-nums">₹{currency(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="px-8 py-6 border-t border-stone-100">
            <div className="mb-1.5 flex items-center gap-1.5">
              <IconPin className="h-3.5 w-3.5 text-amber-600" />
              <p className="text-[12.5px] font-medium text-stone-600">Delivery address</p>
            </div>
            <p className="text-[13.5px] leading-relaxed text-stone-800">
              {order.deliveryAddress.street}, {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
            </p>
          </div>

          {/* Payment */}
          <div className="flex items-center justify-between px-8 py-6 border-t border-stone-100">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 text-stone-500">
                {order.paymentMethod === "upi" ? (
                  <IconUpi className="w-4 h-4" />
                ) : (
                  <IconCash className="w-4 h-4" />
                )}
              </span>
              <span className="text-[13.5px] font-medium text-stone-700">
                {order.paymentMethod === "upi" ? "UPI" : "Cash on delivery"}
              </span>
            </div>
            {order.paymentMethod === "upi" && (
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700">
                {order.paymentStatus}
              </span>
            )}
          </div>

          {/* Review */}
          {order.orderStatus === "delivered" && reviewStatus && (
            <div className="px-8 py-6 border-t border-stone-100">
              {reviewStatus.alreadyReviewed ? (
                <div className="flex items-center gap-2 text-[13.5px] text-green-700">
                  <IconCheck className="w-4 h-4" />
                  <span>Thanks for your review!</span>
                </div>
              ) : showReviewForm ? (
                <ReviewForm
                  order={order}
                  onSubmitted={() => {
                    setShowReviewForm(false);
                    setReviewStatus({ alreadyReviewed: true });
                  }}
                />
              ) : (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full rounded-full border border-stone-200 py-2.5 text-[13.5px] font-medium text-stone-700 transition-colors hover:bg-stone-50"
                >
                  Rate your order
                </button>
              )}
            </div>
          )}

          {/* Cancel */}
          {cancelError && (
            <div className="px-8 py-4 border-t border-stone-100">
              <p className="text-[13px] text-red-600">{cancelError}</p>
            </div>
          )}

{canEdit && !showEditForm && (
  <div className="px-8 py-6 border-t border-stone-100">
    <button
      onClick={() => setShowEditForm(true)}
      className="w-full rounded-full border border-stone-200 py-2.5 text-[13.5px] font-medium text-stone-700 transition-colors hover:bg-stone-50"
    >
      Edit Order
    </button>
  </div>
)}
{canEdit && showEditForm && (
  <div className="px-8 py-6 border-t border-stone-100">
    <EditOrderForm
      order={order}
      onCancel={() => setShowEditForm(false)}
      onSubmit={handleEditSubmit}
    />
  </div>
)}

          {canCancel && (
            <div className="px-8 py-6 border-t border-stone-100">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full rounded-full border border-red-200 bg-red-50 py-2.5 text-[13.5px] font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11.5px] text-stone-400">
                <IconClock className="h-3.5 w-3.5" />
                You can cancel within {formatCountdown(cancelSecondsLeft)}
              </p>
            </div>
          )}
{canEdit && (
  <button
    onClick={() => setShowEditForm(true)}
    className="w-full rounded-full border border-stone-200 py-2.5 text-[13.5px] font-medium text-stone-700 transition-colors hover:bg-stone-50"
  >
    Edit Order
  </button>
)}  
          {!canCancel && cancelWindowExpired && (
            <div className="px-8 py-6 border-t border-stone-100">
              <div className="flex items-center justify-center gap-2 py-3 text-center rounded-xl bg-stone-50">
                <IconClock className="w-4 h-4 shrink-0 text-stone-400" />
                <p className="text-[12.5px] text-stone-500">
                  Cancellation window has passed — the restaurant is now processing your order.
                </p>
              </div>
            </div>
          )}
        </div>

        <Link
          to="/orders"
          className="od-fade-up mt-5 flex items-center justify-center gap-1.5 text-[13.5px] font-medium text-stone-600 transition-colors hover:text-stone-900"
          style={{ animationDelay: "100ms" }}
        >
          View all orders
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default OrderDetail;