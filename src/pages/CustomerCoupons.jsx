// src/pages/CustomerCoupons.jsx
//
// Public "Offers" page — shows only coupons that are live and usable right now.
// Real apps never ship the admin coupon list to customers and filter client-side;
// they hit a narrower, server-filtered endpoint. This calls GET /coupons/active.

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAlert } from "../context/AlertContext";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

function IconCopy(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M5 15V5.5A2.5 2.5 0 0 1 7.5 3H15" />
    </svg>
  );
}
function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
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
function IconTag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m20.5 12.5-8 8a2 2 0 0 1-2.8 0l-6.2-6.2a2 2 0 0 1 0-2.8l8-8A2 2 0 0 1 13 3h5.5A2.5 2.5 0 0 1 21 5.5V11a2 2 0 0 1-.5 1.5Z" />
      <circle cx="15.5" cy="8.5" r="1.5" />
    </svg>
  );
}
function IconInbox(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12h4l2 3h4l2-3h4" />
      <path d="M5.5 6h13L21 12v6a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18v-6l2.5-6Z" />
    </svg>
  );
}
function IconSparkle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5c.35 3.2 1.1 5.1 2.2 6.2 1.1 1.1 3 1.85 6.3 2.3-3.2.35-5.1 1.1-6.2 2.2-1.1 1.1-1.85 3-2.3 6.3-.35-3.2-1.1-5.1-2.2-6.2-1.1-1.1-3-1.85-6.3-2.3 3.2-.35 5.1-1.1 6.2-2.2 1.1-1.1 1.85-3 2.3-6.3Z" />
    </svg>
  );
}

const AnimStyles = () => (
  <style>{`
    @keyframes ccFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes ccShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    @keyframes ccPop {
      0% { transform: scale(1); }
      40% { transform: scale(1.16); }
      100% { transform: scale(1); }
    }
    .cc-fade-up { animation: ccFadeUp 0.45s cubic-bezier(0.16,1,0.3,1) backwards; }
    .cc-pop { animation: ccPop 0.35s cubic-bezier(0.34,1.56,0.64,1); }
    .cc-shimmer {
      background: linear-gradient(90deg, #f7f7f6 25%, #fcfcfb 37%, #f7f7f6 63%);
      background-size: 400px 100%;
      animation: ccShimmer 1.4s ease-in-out infinite;
    }
    /* Ticket notches: circular bites cut out of the card on the stub seam,
       matched to the page background so they read as a true cutout. */
    .cc-notch-top, .cc-notch-bottom {
      position: absolute;
      left: 92px;
      width: 20px;
      height: 20px;
      border-radius: 9999px;
      background: #ffffff;
      border: 1px solid #f1f0ef;
      z-index: 2;
    }
    .cc-notch-top { top: -10.5px; border-bottom: none; }
    .cc-notch-bottom { bottom: -10.5px; border-top: none; }
    @media (min-width: 480px) {
      .cc-notch-top, .cc-notch-bottom { left: 112px; }
    }
  `}</style>
);

function CouponsSkeleton() {
  return (
    <div className="min-h-screen px-4 py-12 bg-white sm:px-6">
      <AnimStyles />
      <div className="max-w-2xl mx-auto">
        <div className="w-44 mb-2.5 rounded-md h-7 cc-shimmer" />
        <div className="w-64 h-4 rounded-md mb-9 cc-shimmer" />
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border h-[104px] rounded-2xl border-stone-200 cc-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

function daysLeft(expiryDate) {
  const ms = new Date(expiryDate).setHours(23, 59, 59, 999) - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

function CouponTicket({ c, copiedCode, onCopy, delay }) {
  const remaining = daysLeft(c.expiryDate);
  const urgent = remaining <= 2;
  const isCopied = copiedCode === c.code;

  const headline =
    c.discountType === "flat"
      ? `₹${currency(c.discountValue)}`
      : `${c.discountValue}%`;

  return (
    <div
      className="cc-fade-up group relative flex overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_16px_36px_-18px_rgba(217,119,6,0.28)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="cc-notch-top" />
      <div className="cc-notch-bottom" />

      {/* Stub — the headline discount */}
      <div className="relative flex w-[92px] shrink-0 flex-col items-center justify-center gap-1 overflow-hidden bg-gradient-to-b from-amber-500 to-amber-600 px-2 py-5 text-white sm:w-28">
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-white/15 to-transparent group-hover:opacity-100" />
        <IconTag className="relative z-10 w-4 h-4 opacity-85" />
        <p className="relative z-10 text-[19px] font-bold leading-none tracking-tight sm:text-[22px]">
          {headline}
        </p>
        <p className="relative z-10 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-amber-100">
          off
        </p>
      </div>

      {/* Perforation seam */}
      <div
        className="self-stretch w-px shrink-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, #e7e5e4 0, #e7e5e4 5px, transparent 5px, transparent 11px)",
        }}
      />

      {/* Details */}
      <div className="flex flex-1 flex-col justify-center gap-1.5 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-mono text-[14.5px] font-bold tracking-wide text-stone-900">{c.code}</p>
          {urgent && (
            <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] font-medium text-rose-600">
              <IconClock className="h-2.5 w-2.5" />
              {remaining === 0 ? "Ends today" : `${remaining}d left`}
            </span>
          )}
        </div>

        <p className="text-[12.5px] text-stone-500">
          {c.minOrderValue > 0
            ? `On orders above ₹${currency(c.minOrderValue)}`
            : "No minimum order value"}
          {c.discountType === "percent" && c.maxDiscount ? ` · up to ₹${currency(c.maxDiscount)} off` : ""}
        </p>

        <p className="text-[11.5px] text-stone-400">
          Valid till {new Date(c.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>

      {/* Copy action */}
      <div className="flex items-center pr-4 sm:pr-6">
        <button
          onClick={() => onCopy(c.code)}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-all duration-200 ${
            isCopied
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-stone-200 bg-white text-stone-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
          }`}
        >
          <span className={isCopied ? "cc-pop flex items-center gap-1.5" : "flex items-center gap-1.5"}>
            {isCopied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
            {isCopied ? "Copied" : "Copy"}
          </span>
        </button>
      </div>
    </div>
  );
}

function CustomerCoupons() {
  const { toast } = useAlert();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axiosInstance.get("/coupons/active");
        setCoupons(res.data.data.coupons ?? res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Couldn't load offers.");
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Code copied", `Apply ${code} at checkout`);
      setTimeout(() => setCopiedCode((cur) => (cur === code ? null : cur)), 1800);
    } catch {
      toast.error("Couldn't copy the code — select and copy it manually");
    }
  };

  // Best-value-first: bigger effective discount surfaces first, expiring-soon
  // codes are flagged inline rather than reshuffled, so the order stays stable.
  const sortedCoupons = useMemo(() => {
    const effectiveValue = (c) =>
      c.discountType === "flat" ? c.discountValue : c.maxDiscount || c.discountValue * 3;
    return [...coupons].sort((a, b) => effectiveValue(b) - effectiveValue(a));
  }, [coupons]);

  if (loading) return <CouponsSkeleton />;

  return (
    <div className="min-h-screen px-4 py-12 bg-white sm:px-6">
      <AnimStyles />
      <div className="max-w-2xl mx-auto">
        <div className="cc-fade-up mb-9">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
            <IconSparkle className="w-3 h-3" />
            Offers
          </span>
          <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-stone-900">
            Offers for you
          </h1>
          <p className="mt-1.5 text-[13.5px] text-stone-500">
            {sortedCoupons.length > 0
              ? `${sortedCoupons.length} code${sortedCoupons.length === 1 ? "" : "s"} live right now — copy one and apply it at checkout`
              : "Nothing live right now — check back soon"}
          </p>
        </div>

        {error && (
          <div className="cc-fade-up mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {!error && sortedCoupons.length === 0 ? (
          <div className="p-12 text-center border cc-fade-up rounded-2xl border-stone-200" style={{ animationDelay: "80ms" }}>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-stone-50">
              <IconInbox className="w-5 h-5 text-stone-400" />
            </div>
            <p className="text-[13.5px] font-medium text-stone-700">No active offers at the moment</p>
            <p className="mt-1 text-[12.5px] text-stone-400">New codes show up here as soon as they go live</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCoupons.map((c, i) => (
              <CouponTicket
                key={c._id}
                c={c}
                copiedCode={copiedCode}
                onCopy={handleCopy}
                delay={i * 40}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerCoupons;