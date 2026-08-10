// src/pages/Checkout.jsx
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useCart } from "../context/CartContext";
import { useLocation } from "../context/LocationContext";
import { useState, useEffect } from "react";
function IconCash(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.7" />
      <path d="M6 9v.01M18 15v.01" />
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
function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
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
function IconBag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20.5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const CheckoutAnimStyles = () => (
  <style>{`
    @keyframes chkFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes chkModalIn {
      from { opacity: 0; transform: scale(0.94) translateY(6px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes chkOverlayIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes chkCheckPop {
      0% { opacity: 0; transform: scale(0.4); }
      60% { opacity: 1; transform: scale(1.12); }
      100% { transform: scale(1); }
    }
    @keyframes chkRingGrow {
      from { stroke-dashoffset: 63; }
      to { stroke-dashoffset: 0; }
    }
    .chk-fade-up { animation: chkFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) backwards; }
    .chk-overlay-in { animation: chkOverlayIn 0.2s ease-out; }
    .chk-modal-in { animation: chkModalIn 0.3s cubic-bezier(0.16,1,0.3,1); }
    .chk-check-pop { animation: chkCheckPop 0.5s cubic-bezier(0.34,1.56,0.64,1); }
    .chk-ring-grow { animation: chkRingGrow 0.6s ease-out forwards; }
  `}</style>
);

function Checkout() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({ street: "", city: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [upiStage, setUpiStage] = useState("input"); // input | processing | success
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lng: null });
const [locError, setLocError] = useState("");
const [couponCode, setCouponCode] = useState("");
const [couponResult, setCouponResult] = useState(null); // { discount, code } | null
const [couponError, setCouponError] = useState("");
const [applyingCoupon, setApplyingCoupon] = useState(false);
const { location: savedLocation } = useLocation();

// Prefill address + coords from the location the user set in the Navbar
useEffect(() => {
  if (!savedLocation) return;
  setAddress((prev) => ({
    street: prev.street || savedLocation.street || "",
    city: prev.city || savedLocation.city || "",
    pincode: prev.pincode || savedLocation.pincode || "",
  }));
  if (savedLocation.lat && savedLocation.lng) {
    setCoords({ lat: savedLocation.lat, lng: savedLocation.lng });
  }
}, [savedLocation]);


  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };
  const handleApplyCoupon = async () => {
  setCouponError("");
  setApplyingCoupon(true);
  try {
    const res = await axiosInstance.post("/coupons/validate", {
      code: couponCode,
      itemsTotal,
    });
    setCouponResult(res.data.data);
  } catch (err) {
    setCouponResult(null);
    setCouponError(err.response?.data?.message || "Invalid coupon");
  } finally {
    setApplyingCoupon(false);
  }
};

const handleRemoveCoupon = () => {
  setCouponResult(null);
  setCouponCode("");
  setCouponError("");
};

  

  const itemsTotal = cart?.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;
  const deliveryFee = 30;
  const discount = couponResult?.discount || 0;
const grandTotal = itemsTotal + deliveryFee - discount;
  
  const finalizeOrder = async (paymentData = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/orders", {
        ...address,
        lat:coords.lat,
        lng : coords.lng,
        paymentMethod,
        couponCode: couponResult?.code || undefined,
        ...paymentData,
      });
      const order = res.data.data.order;
      await fetchCart();
      navigate(`/orders/${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't place your order. Try again.");
      setShowUpiModal(false);
      setUpiStage("input");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (paymentMethod === "upi") {
      setShowUpiModal(true);
      setUpiStage("input");
      return;
    }

    finalizeOrder(); // COD — place immediately
  };


  const handleUseLocation = () => {
  setLocError("");
  if (!navigator.geolocation) {
    setLocError("Geolocation not supported in this browser");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
    },
    (err) => setLocError("Could not get location: " + err.message)
  );
};


  const handleUpiPay = async () => {
    if (!upiId.trim()) {
      setError("Enter a UPI ID to continue.");
      return;
    }
    setError("");
    setUpiStage("processing");

    try {
      const initRes = await axiosInstance.post("/payments/initiate", {
        amount: grandTotal,
      });
      const { transactionId } = initRes.data.data;

      await axiosInstance.post("/payments/confirm", {
        transactionId,
        upiId,
      });

      setUpiStage("success");

      setTimeout(() => {
        finalizeOrder({ transactionId });
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Try again.");
      setUpiStage("input");
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-white">
        <CheckoutAnimStyles />
        <div className="w-full max-w-sm p-8 text-center bg-white border shadow-sm chk-fade-up rounded-2xl border-stone-200">
          <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-stone-50">
            <IconBag className="w-6 h-6 text-stone-400" />
          </div>
          <h1 className="text-[17px] font-semibold text-stone-900">Your cart is empty</h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-stone-500">
            Add items to your cart before checking out.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-white sm:px-6">
      <CheckoutAnimStyles />
      <div className="max-w-3xl mx-auto">
        <div className="chk-fade-up mb-7">
          <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">Checkout</h1>
          <p className="mt-1 text-[13.5px] text-stone-500">Review your order and complete payment.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_340px]">
          {/* Delivery + Payment form */}
          <div
            className="p-6 bg-white border chk-fade-up rounded-2xl border-stone-200"
            style={{ animationDelay: "60ms" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <IconPin className="w-4 h-4 text-amber-600" />
              <h2 className="text-[15px] font-semibold text-stone-900">Delivery address</h2>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">Street address</label>
                <input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={handleChange}
                  required
                  placeholder="Flat, house no., building, street"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-[14px] text-stone-900 transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">City</label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-[14px] text-stone-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-medium text-stone-600">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-[14px] text-stone-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <button
  type="button"
  onClick={handleUseLocation}
  className="text-sm font-medium text-orange-600 hover:underline"
>
  📍 Use my current location
</button>
{coords.lat && (
  <p className="mt-1 text-xs text-green-600">Location captured for live tracking</p>
)}
{locError && <p className="mt-1 text-xs text-red-600">{locError}</p>}

              </div>

              <div>
                <label className="mb-2 block text-[12.5px] font-medium text-stone-600">Payment method</label>
                <div className="space-y-2">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all duration-150 ${
                      paymentMethod === "cod"
                        ? "border-amber-500 bg-amber-50/60 ring-1 ring-amber-500"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        paymentMethod === "cod" ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      <IconCash className="h-4.5 w-4.5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[13.5px] font-medium text-stone-900">Cash on delivery</span>
                      <span className="block text-[12px] text-stone-400">Pay when your order arrives</span>
                    </span>
                    {paymentMethod === "cod" && (
                      <span className="flex items-center justify-center w-5 h-5 text-white rounded-full bg-amber-600">
                        <IconCheck className="w-3 h-3" />
                      </span>
                    )}
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all duration-150 ${
                      paymentMethod === "upi"
                        ? "border-amber-500 bg-amber-50/60 ring-1 ring-amber-500"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        paymentMethod === "upi" ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      <IconUpi className="h-4.5 w-4.5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[13.5px] font-medium text-stone-900">UPI</span>
                      <span className="block text-[12px] text-stone-400">Simulated — no real transaction</span>
                    </span>
                    {paymentMethod === "upi" && (
                      <span className="flex items-center justify-center w-5 h-5 text-white rounded-full bg-amber-600">
                        <IconCheck className="w-3 h-3" />
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-stone-900 py-3 text-[13.5px] font-medium text-white shadow-sm transition-all duration-200 hover:bg-stone-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Placing order…"
                  : paymentMethod === "upi"
                  ? `Pay ₹${currency(grandTotal)} via UPI`
                  : `Place order — ₹${currency(grandTotal)}`}
              </button>
            </form>
          </div>

          {/* Order summary */}
          <div
            className="p-6 bg-white border chk-fade-up h-fit rounded-2xl border-stone-200"
            style={{ animationDelay: "120ms" }}
          >
            <h2 className="text-[15px] font-semibold text-stone-900">Order summary</h2>
            <p className="mt-1 text-[12.5px] text-stone-400">{cart.restaurant?.name}</p>

            <div className="mt-4 space-y-2.5 border-t border-stone-100 pt-4">
              {cart.items.map((item) => (
                <div key={item.menuItem} className="flex justify-between text-[13px]">
                  <span className="text-stone-600">
                    {item.name} <span className="text-stone-400">× {item.quantity}</span>
                  </span>
                  <span className="tabular-nums text-stone-800">₹{currency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200">
  {!couponResult ? (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={handleApplyCoupon}
          disabled={applyingCoupon || !couponCode}
          className="px-4 py-2 text-sm font-medium text-white transition bg-gray-800 rounded-md hover:bg-gray-900 disabled:opacity-50"
        >
          {applyingCoupon ? "..." : "Apply"}
        </button>
      </div>
      {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
    </div>
  ) : (
    <div className="flex items-center justify-between px-3 py-2 text-sm text-green-700 rounded-md bg-green-50">
      <span>
        <strong>{couponResult.code}</strong> applied
      </span>
      <button onClick={handleRemoveCoupon} className="text-xs underline">
        Remove
      </button>
    </div>
  )}
</div>

            <div className="pt-4 mt-4 space-y-1 text-sm border-t border-gray-200">
  <div className="flex justify-between text-gray-600">
    <span>Items Total</span>
    <span>₹{itemsTotal}</span>
  </div>
  <div className="flex justify-between text-gray-600">
    <span>Delivery Fee</span>
    <span>₹{deliveryFee}</span>
  </div>
  {discount > 0 && (
    <div className="flex justify-between text-green-600">
      <span>Discount</span>
      <span>-₹{discount}</span>
    </div>
  )}
  <div className="flex justify-between pt-1 text-base font-bold text-gray-800">
    <span>Grand Total</span>
    <span>₹{grandTotal}</span>
  </div>
</div>
          </div>
          
        </div>
      </div>

      {/* UPI modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 chk-overlay-in bg-stone-900/40">
          <div className="w-full max-w-sm p-6 text-center bg-white border shadow-xl chk-modal-in rounded-2xl border-stone-200">
            {upiStage === "input" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-stone-900">Pay via UPI</h3>
                  <button
                    onClick={() => setShowUpiModal(false)}
                    aria-label="Close"
                    className="flex items-center justify-center transition-colors rounded-full h-7 w-7 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                </div>
                <p className="mb-4 text-[12px] text-stone-400">Simulated payment — no real transaction</p>
                <p className="mb-5 text-[26px] font-semibold tabular-nums text-stone-900">₹{currency(grandTotal)}</p>

                {error && (
                  <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-[12.5px] text-red-700">
                    {error}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="mb-4 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-center text-[14px] text-stone-900 transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />

                <button
                  onClick={handleUpiPay}
                  className="mb-2 w-full rounded-full bg-stone-900 py-2.5 text-[13.5px] font-medium text-white transition-all duration-200 hover:bg-stone-800 active:scale-[0.98]"
                >
                  Pay now
                </button>
                <button
                  onClick={() => setShowUpiModal(false)}
                  className="w-full py-1 text-[13px] font-medium text-stone-400 transition-colors hover:text-stone-700"
                >
                  Cancel
                </button>
              </>
            )}

            {upiStage === "processing" && (
              <div className="py-8">
                <svg className="mx-auto mb-4 h-11 w-11 animate-spin text-amber-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <p className="text-[13.5px] font-medium text-stone-700">Processing payment…</p>
                <p className="mt-1 text-[12px] text-stone-400">This will just take a moment</p>
              </div>
            )}

            {upiStage === "success" && (
              <div className="py-8">
                <div className="flex items-center justify-center mx-auto mb-4 rounded-full chk-check-pop h-14 w-14 bg-green-50">
                  <IconCheck className="text-green-600 h-7 w-7" />
                </div>
                <p className="text-[14.5px] font-semibold text-stone-900">Payment successful</p>
                <p className="mt-1 text-[12px] text-stone-400">Redirecting to your order…</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;