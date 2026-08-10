// src/pages/Cart.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function IconMinus(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}
function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconTrash(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.7 12.1a2 2 0 0 1-2 1.9H8.7a2 2 0 0 1-2-1.9L6 7h12Z" />
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
function IconArrowRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

// Scoped keyframes — no extra deps, plain CSS.
const CartAnimStyles = () => (
  <style>{`
    @keyframes cartItemIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes cartFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes cartPop {
      0% { transform: scale(1); }
      35% { transform: scale(1.18); }
      100% { transform: scale(1); }
    }
    @keyframes cartBounceIn {
      0% { opacity: 0; transform: scale(0.7); }
      60% { opacity: 1; transform: scale(1.06); }
      100% { transform: scale(1); }
    }
    @keyframes cartShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    .cart-item-enter { animation: cartItemIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
    .cart-fade-up { animation: cartFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
    .cart-qty-pop { animation: cartPop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .cart-bounce-in { animation: cartBounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
    .cart-shimmer {
      background: linear-gradient(90deg, #f5f5f4 25%, #fafaf9 37%, #f5f5f4 63%);
      background-size: 400px 100%;
      animation: cartShimmer 1.4s ease-in-out infinite;
    }
  `}</style>
);

function CartSkeleton() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <CartAnimStyles />
      <div className="mx-auto max-w-2xl">
        <div className="mb-2 h-7 w-40 rounded cart-shimmer" />
        <div className="mb-8 h-4 w-56 rounded cart-shimmer" />
        <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="space-y-2">
                <div className="h-4 w-32 rounded cart-shimmer" />
                <div className="h-3 w-16 rounded cart-shimmer" />
              </div>
              <div className="h-8 w-28 rounded-full cart-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Cart() {
  const { cart, loading, updateCartItem, removeCartItem, clearCart } = useCart();
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [poppedId, setPoppedId] = useState(null);
  const navigate = useNavigate();

  const bumpQty = (menuItemId) => {
    setPoppedId(menuItemId);
    window.setTimeout(() => setPoppedId((cur) => (cur === menuItemId ? null : cur)), 280);
  };

  const handleQuantityChange = async (menuItemId, newQty) => {
    setError("");
    setPendingId(menuItemId);
    bumpQty(menuItemId);
    try {
      if (newQty < 1) {
        await removeCartItem(menuItemId);
      } else {
        await updateCartItem(menuItemId, newQty);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update your cart. Try again.");
    } finally {
      setPendingId(null);
    }
  };

  const handleRemove = async (menuItemId) => {
    setError("");
    setPendingId(menuItemId);
    try {
      await removeCartItem(menuItemId);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't remove that item. Try again.");
    } finally {
      setPendingId(null);
    }
  };

  if (loading) return <CartSkeleton />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <CartAnimStyles />
        <div className="cart-bounce-in w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-50">
            <IconBag className="h-6 w-6 text-stone-400" />
          </div>
          <h1 className="text-[17px] font-semibold text-stone-900">Your cart is empty</h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-stone-500">
            Find something good nearby and it'll show up here.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-2.5 text-[13.5px] font-medium text-white transition-all duration-200 hover:bg-stone-800 hover:scale-[1.03] active:scale-[0.97]"
          >
            Browse restaurants
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <CartAnimStyles />
      <div className="mx-auto max-w-2xl">
        <div className="cart-fade-up mb-7">
          <h1 className="text-[22px] font-semibold tracking-tight text-stone-900">Your cart</h1>
          <p className="mt-1 text-[13.5px] text-stone-500">
            Ordering from <span className="font-medium text-stone-700">{cart.restaurant?.name}</span>
          </p>
        </div>

        {error && (
          <div className="cart-fade-up mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        <div
          className="cart-fade-up overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow duration-300 hover:shadow-sm"
          style={{ animationDelay: "60ms" }}
        >
          <div className="divide-y divide-stone-100">
            {cart.items.map((item, idx) => {
              const isPending = pendingId === item.menuItem;
              const isPopped = poppedId === item.menuItem;
              return (
                <div
                  key={item.menuItem}
                  className="cart-item-enter flex items-center justify-between gap-4 p-4 transition-all duration-300"
                  style={{
                    animationDelay: `${idx * 60}ms`,
                    opacity: isPending ? 0.5 : 1,
                    transform: isPending ? "scale(0.99)" : "scale(1)",
                  }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-medium text-stone-900">{item.name}</p>
                    <p className="mt-0.5 text-[12.5px] text-stone-400">₹{currency(item.price)} each</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <div className="flex items-center gap-2.5 rounded-full border border-stone-200 px-1 py-1 transition-colors duration-200 focus-within:border-stone-300">
                      <button
                        onClick={() => handleQuantityChange(item.menuItem, item.quantity - 1)}
                        disabled={isPending}
                        aria-label="Decrease quantity"
                        className="flex h-6.5 w-6.5 items-center justify-center rounded-full text-stone-500 transition-all duration-150 hover:bg-stone-100 hover:text-stone-900 active:scale-90 disabled:opacity-50"
                      >
                        <IconMinus className="h-3.5 w-3.5" />
                      </button>
                      <span
                        className={`w-4 text-center text-[13px] font-medium text-stone-900 tabular-nums ${isPopped ? "cart-qty-pop" : ""}`}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.menuItem, item.quantity + 1)}
                        disabled={isPending}
                        aria-label="Increase quantity"
                        className="flex h-6.5 w-6.5 items-center justify-center rounded-full text-stone-500 transition-all duration-150 hover:bg-stone-100 hover:text-stone-900 active:scale-90 disabled:opacity-50"
                      >
                        <IconPlus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p
                      className={`w-16 text-right text-[14px] font-semibold text-stone-900 tabular-nums transition-transform duration-200 ${isPopped ? "cart-qty-pop" : ""}`}
                    >
                      ₹{currency(item.price * item.quantity)}
                    </p>

                    <button
                      onClick={() => handleRemove(item.menuItem)}
                      disabled={isPending}
                      aria-label={`Remove ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-stone-300 transition-all duration-150 hover:scale-110 hover:bg-red-50 hover:text-red-500 active:scale-90 disabled:opacity-50"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cart-fade-up mt-4 rounded-2xl border border-stone-200 bg-white p-4" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center justify-between text-[13.5px] text-stone-500">
            <span>Subtotal</span>
            <span className="tabular-nums">₹{currency(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[13.5px] text-stone-500">
            <span>Delivery fee</span>
            <span className="tabular-nums">
              {deliveryFee === 0 ? (
                <span className="font-medium text-amber-600">Free</span>
              ) : (
                `₹${currency(deliveryFee)}`
              )}
            </span>
          </div>
          {deliveryFee > 0 && (
            <p className="mt-1.5 text-[12px] text-stone-400">
              Add ₹{currency(499 - subtotal)} more for free delivery
            </p>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
            <span className="text-[14.5px] font-semibold text-stone-900">Total</span>
            <span className="text-[17px] font-semibold text-stone-900 tabular-nums transition-all duration-300">
              ₹{currency(total)}
            </span>
          </div>
        </div>

        <div
          className="cart-fade-up mt-5 flex items-center justify-between"
          style={{ animationDelay: "180ms" }}
        >
          <button
            onClick={() => clearCart()}
            className="text-[13px] font-medium text-stone-400 transition-colors duration-150 hover:text-red-600"
          >
            Clear cart
          </button>
          <button
            onClick={() => navigate("/checkout")}
            className="group flex items-center gap-1.5 rounded-full bg-stone-900 px-7 py-3 text-[13.5px] font-medium text-white shadow-sm transition-all duration-200 hover:bg-stone-800 hover:shadow-md hover:shadow-stone-900/10 active:scale-[0.97]"
          >
            Proceed to checkout
            <IconArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;